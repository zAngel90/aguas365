const XLSX = require('xlsx');
const { Sequelize, Op } = require('sequelize');
const { Mantenimiento, Cliente, Sucursal, Dispensador } = require('../models');
const moment = require('moment');

// Función para convertir fecha de Excel a JavaScript
function convertExcelDate(excelDate) {
  try {
    // Si la fecha ya está en formato string (ej: "16/04/2025" o "1/9/24")
    if (typeof excelDate === 'string' && excelDate.includes('/')) {
      const parts = excelDate.split('/');
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = parts[2];

      // Crear la fecha (los meses en JavaScript son 0-based)
      const date = new Date(year.length === 2 ? `20${year}` : year, month - 1, day);
      
      // Log para debug
      console.log(`Convirtiendo fecha: ${excelDate} -> ${date.toISOString()}`);
      
      return date;
    }

    // Si es un número serial de Excel
    const serialDate = parseInt(excelDate);
    if (isNaN(serialDate)) {
      throw new Error(`Fecha inválida: ${excelDate}`);
    }

    // Excel usa 1900 como año base, y el día 0 es el 1 de enero de 1900
    const offsetDays = serialDate - 2; // Ajuste por el error del año bisiesto
    const msPerDay = 24 * 60 * 60 * 1000;
    const baseDate = new Date(Date.UTC(1900, 0, 1));
    const resultDate = new Date(baseDate.getTime() + (offsetDays * msPerDay));

    return resultDate;
  } catch (error) {
    console.error('Error al convertir fecha:', excelDate, error);
    throw error;
  }
}

async function importarMantenimientos(filePath) {
  try {
    console.log('Iniciando importación de mantenimientos...');
    console.log('Archivo Excel:', filePath);

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['SABANA'];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
      blankrows: false
    });

    console.log(`Se encontraron ${data.length} filas en el archivo Excel`);
    
    // Mostrar los encabezados para verificar
    if (data.length > 0) {
      console.log('Encabezados encontrados:', Object.keys(data[0]));
    }

    // Variables para mantener el último valor no vacío
    let ultimaFecha = null;

    for (const row of data) {
      try {
        // Obtener el nombre del cliente del Excel
        const nombreCliente = row['CLIENTE'] || '';
        if (!nombreCliente) {
          console.log('Fila sin nombre de cliente, saltando...');
          continue;
        }

        // Heredar valores de filas anteriores si están vacíos
        const fechaStr = row['FECHA'] || ultimaFecha;
        
        // Actualizar el último valor de fecha si no está vacío
        if (row['FECHA']) ultimaFecha = row['FECHA'];

        // Convertir la fecha de Excel a formato MySQL
        const fecha = convertExcelDate(fechaStr);
        console.log(`Procesando cliente: ${nombreCliente}, Fecha original: ${fechaStr}, Fecha convertida: ${fecha.toISOString()}`);

        // Buscar el cliente por nombre
        const cliente = await Cliente.findOne({
          where: {
            nombre: {
              [Op.like]: `%${nombreCliente}%`
            }
          }
        });

        if (!cliente) {
          console.log(`Cliente no encontrado: ${nombreCliente}, saltando registro...`);
          continue;
        }

        // Buscar o crear sucursal
        let sucursal;
        if (!row.DIRECCION) {
          [sucursal] = await Sucursal.findOrCreate({
            where: { 
              nombre: 'Sucursal principal',
              cliente_id: cliente.id
            },
            defaults: {
              nombre: 'Sucursal principal',
              direccion: 'No especificada',
              telefono: 'No especificado',
              email: `sucursal.${cliente.id}@importacion.temp`,
              nif: `NO-SPEC-${cliente.id}`,
              cliente_id: cliente.id
            }
          });
        } else {
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

        // Verificar si el mantenimiento ya existe
        const mantenimientoExistente = await Mantenimiento.findOne({
          where: {
            fechaProgramada: fecha,
            cliente_id: cliente.id,
            sucursal_id: sucursal.id,
            descripcion: row.COMENTARIOS || 'Sin comentarios'
          }
        });

        if (mantenimientoExistente) {
          console.log(`Mantenimiento ya existe para ${nombreCliente} - Cliente: ${cliente.id}, Sucursal: ${sucursal.id}, Fecha: ${fecha.toISOString()}`);
        } else {
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

          // Crear el mantenimiento como completado
          const mantenimiento = await Mantenimiento.create({
            fechaProgramada: fecha,
            fechaRealizada: fecha,
            estado: 'completado',
            tipo: 'correctivo',
            descripcion: row.COMENTARIOS || 'Sin comentarios',
            observaciones: row.SOLUCION || 'Sin observaciones',
            cliente_id: cliente.id,
            sucursal_id: sucursal.id,
            dispensador_id: dispensador.id,
            tecnico_id: 1
          });

          console.log(`Nuevo mantenimiento creado para ${nombreCliente} - ID: ${mantenimiento.id}, Fecha: ${fecha.toISOString()}`);
        }
      } catch (error) {
        console.error('Error procesando registro:', error);
        console.error('Datos del registro:', row);
      }
    }

    console.log('Procesamiento de registros completado');
  } catch (error) {
    console.error('Error general:', error);
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