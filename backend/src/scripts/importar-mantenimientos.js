const XLSX = require('xlsx');
const { Sequelize, Op } = require('sequelize');
const { Mantenimiento, Cliente, Sucursal, Dispensador } = require('../models');
const moment = require('moment');

// Función para convertir fecha de Excel a JavaScript
function convertExcelDate(excelDate) {
  // Asegurarse de que la fecha sea un número
  const serialDate = parseInt(excelDate);
  if (isNaN(serialDate)) {
    throw new Error(`Fecha inválida: ${excelDate}`);
  }

  // Excel usa 1900 como año base, y el día 0 es el 1 de enero de 1900
  // Pero hay un error en Excel que considera 1900 como año bisiesto
  // Por lo tanto, restamos 2 días (1 por el offset y 1 por el error del año bisiesto)
  const offsetDays = serialDate - 2;
  const msPerDay = 24 * 60 * 60 * 1000;
  const baseDate = new Date(Date.UTC(1900, 0, 1)); // 1 de enero de 1900
  const resultDate = new Date(baseDate.getTime() + (offsetDays * msPerDay));

  return resultDate;
}

async function importarMantenimientos(filePath) {
  try {
    console.log('Iniciando importación de mantenimientos...');

    // Leer el archivo Excel con las mismas opciones que el frontend
    const workbook = XLSX.readFile(filePath, {
      cellDates: false,
      cellNF: false,
      cellText: false
    });
    
    const worksheet = workbook.Sheets['SABANA'];
    if (!worksheet) {
      throw new Error('No se encontró la hoja "SABANA" en el archivo Excel');
    }

    // Convertir a JSON usando las mismas opciones que el frontend
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
      header: 1,
      blankrows: false
    });

    if (jsonData.length < 2) {
      throw new Error('El archivo no contiene suficientes datos');
    }

    // Obtener encabezados
    const headers = jsonData[0].map(header => header?.trim() || '');
    console.log('Encabezados detectados:', headers);

    // Procesar las filas de datos
    const rows = jsonData.slice(1).map(row => {
      const processedRow = {};
      headers.forEach((header, index) => {
        let value = row[index];
        processedRow[header] = value?.toString() || '';
      });
      return processedRow;
    });

    console.log(`Se encontraron ${rows.length} registros para importar`);

    // Contadores para el resumen
    let importados = 0;
    let errores = 0;

    for (const row of rows) {
      try {
        // Convertir y validar la fecha
        console.log('Procesando fecha:', row.FECHA);
        const fecha = convertExcelDate(row.FECHA);
        console.log('Fecha convertida:', fecha.toISOString());

        // Buscar el cliente por su número
        let cliente = await Cliente.findOne({
          where: { id: row['Nro. CLIENTE'] }
        });

        if (!cliente) {
          console.log(`Cliente con número ${row['Nro. CLIENTE']} no encontrado, creando nuevo cliente...`);
          // Si no existe el cliente, crearlo
          cliente = await Cliente.create({
            id: row['Nro. CLIENTE'],
            nombre: row.CLIENTE || 'Cliente no especificado',
            direccion: row.DIRECCION || 'No especificada',
            telefono: 'No especificado',
            email: `cliente${row['Nro. CLIENTE']}@importacion.temp`
          });
        }

        // Buscar o crear sucursal (incluso si no hay dirección)
        let sucursal;
        if (!row.DIRECCION) {
          // Si no hay dirección, crear o usar una sucursal genérica para este cliente
          [sucursal] = await Sucursal.findOrCreate({
            where: { 
              nombre: 'Sucursal no especificada',
              cliente_id: cliente.id
            },
            defaults: {
              nombre: 'Sucursal no especificada',
              direccion: 'No especificada',
              telefono: 'No especificado',
              email: `sucursal.${cliente.id}@importacion.temp`,
              nif: `NO-SPEC-${cliente.id}`,
              cliente_id: cliente.id
            }
          });
        } else {
          // Si hay dirección, crear o buscar la sucursal normalmente
          [sucursal] = await Sucursal.findOrCreate({
            where: { 
              direccion: row.DIRECCION,
              cliente_id: cliente.id
            },
            defaults: {
              nombre: row.SUCURSAL || `Sucursal ${row.DIRECCION}`,
              direccion: row.DIRECCION,
              telefono: 'No especificado',
              email: `sucursal.${cliente.id}.${Date.now()}@importacion.temp`,
              nif: `AUTO-${Date.now()}`,
              cliente_id: cliente.id
            }
          });
        }

        // Buscar o crear dispensador
        const [dispensador] = await Dispensador.findOrCreate({
          where: {
            sucursal_id: sucursal.id,
            numero_serie: `IMP-${cliente.id}-${sucursal.id}`
          },
          defaults: {
            modelo: 'Importado',
            fecha_instalacion: fecha,
            estado: 'activo',
            sector: row.SUCURSAL || 'No especificado',
            sucursal_id: sucursal.id,
            cliente_id: cliente.id
          }
        });

        // Crear el mantenimiento con todos los campos requeridos
        console.log('Creando mantenimiento con fecha:', fecha.toISOString());
        
        // Crear el objeto de mantenimiento
        const datosMantenimiento = {
          fechaProgramada: fecha,
          fechaRealizada: fecha,
          estado: 'completado',
          tipo: 'correctivo',
          descripcion: row.COMENTARIOS || 'Sin comentarios',
          observaciones: row.SOLUCION || 'Sin observaciones',
          cliente_id: cliente.id,
          sucursal_id: sucursal.id,
          dispensador_id: dispensador.id,
          tecnico_id: 1 // ID del técnico por defecto (Juan Técnico)
        };

        console.log('Datos del mantenimiento:', datosMantenimiento);
        const mantenimiento = await Mantenimiento.create(datosMantenimiento);

        console.log('Mantenimiento creado:', mantenimiento.id);
        importados++;
        console.log(`Importado mantenimiento ${importados} de ${rows.length}`);
      } catch (error) {
        errores++;
        console.error(`Error al importar fila ${importados + errores}:`, error);
        console.error('Datos de la fila:', row);
        if (error.name === 'SequelizeValidationError') {
          console.error('Detalles de validación:', error.errors);
        }
      }
    }

    console.log('\nResumen de importación:');
    console.log(`Total de registros: ${rows.length}`);
    console.log(`Importados exitosamente: ${importados}`);
    console.log(`Errores: ${errores}`);

  } catch (error) {
    console.error('Error durante la importación:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Por favor proporciona la ruta al archivo Excel');
    process.exit(1);
  }

  importarMantenimientos(filePath)
    .then(() => {
      console.log('Importación completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error en la importación:', error);
      process.exit(1);
    });
}

module.exports = importarMantenimientos; 