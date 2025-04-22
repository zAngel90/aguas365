const XLSX = require('xlsx');
const { Sequelize } = require('sequelize');
const { Mantenimiento, Cliente, Sucursal, Dispensador } = require('../models');
const moment = require('moment');

// Función para convertir fecha de Excel
function convertExcelDate(excelDate) {
  try {
    // Si la fecha ya está en formato string (ej: "1/9/24")
    if (typeof excelDate === 'string' && excelDate.includes('/')) {
      const [day, month, year] = excelDate.split('/');
      // Ajustar el año a formato completo (2024 en lugar de 24)
      const fullYear = parseInt(year) + 2000;
      // Crear la fecha (los meses en JavaScript son 0-based)
      const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
      return date;
    }

    // Si es un número serial de Excel
    const serialDate = parseInt(excelDate);
    if (isNaN(serialDate)) {
      throw new Error(`Fecha inválida: ${excelDate}`);
    }

    const offsetDays = serialDate - 2;
    const msPerDay = 24 * 60 * 60 * 1000;
    const baseDate = new Date(Date.UTC(1900, 0, 1));
    const resultDate = new Date(baseDate.getTime() + (offsetDays * msPerDay));

    return resultDate;
  } catch (error) {
    console.error('Error al convertir fecha:', excelDate, error);
    throw error;
  }
}

async function importarMantenimientosJhon(filePath) {
  try {
    console.log('Iniciando importación de mantenimientos de JHON MACHADO...');
    console.log('Archivo Excel:', filePath);

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['SABANA'];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
      blankrows: false
    });

    console.log(`Se encontraron ${data.length} filas en el archivo Excel`);
    
    // Filtrar solo los registros de JHON MACHADO
    const jhonData = data.filter(row => {
      const cliente = row['CLIENTE'] || '';
      return cliente.toUpperCase().trim() === 'JHON MACHADO';
    });

    console.log(`Se encontraron ${jhonData.length} registros de JHON MACHADO`);

    // Variables para mantener el último valor no vacío
    let ultimaFecha = null;

    // Buscar o crear el cliente JHON MACHADO una sola vez
    const [clienteJhon] = await Cliente.findOrCreate({
      where: { 
        nombre: 'JHON MACHADO'
      },
      defaults: {
        nombre: 'JHON MACHADO',
        email: 'jhon.machado@default.com',
        telefono: 'No especificado',
        direccion: 'No especificada'
      }
    });

    console.log('Cliente JHON MACHADO encontrado/creado con ID:', clienteJhon.id);

    let importados = 0;
    let errores = 0;

    for (const row of jhonData) {
      try {
        const fechaStr = row['FECHA'] || ultimaFecha;
        if (row['FECHA']) ultimaFecha = row['FECHA'];

        const fecha = convertExcelDate(fechaStr);
        console.log(`Procesando registro - Fecha: ${fechaStr} -> ${fecha.toISOString()}`);

        // Buscar o crear sucursal
        let sucursal;
        if (!row.DIRECCION) {
          [sucursal] = await Sucursal.findOrCreate({
            where: { 
              nombre: 'Sucursal no especificada',
              cliente_id: clienteJhon.id
            },
            defaults: {
              nombre: 'Sucursal no especificada',
              direccion: 'No especificada',
              telefono: 'No especificado',
              email: `sucursal.${clienteJhon.id}@importacion.temp`,
              nif: `NO-SPEC-${clienteJhon.id}`,
              cliente_id: clienteJhon.id
            }
          });
        } else {
          [sucursal] = await Sucursal.findOrCreate({
            where: { 
              direccion: row.DIRECCION,
              cliente_id: clienteJhon.id
            },
            defaults: {
              nombre: row.SUCURSAL || `Sucursal ${row.DIRECCION}`,
              direccion: row.DIRECCION,
              telefono: 'No especificado',
              email: `sucursal.${clienteJhon.id}.${Date.now()}@importacion.temp`,
              nif: `AUTO-${Date.now()}`,
              cliente_id: clienteJhon.id
            }
          });
        }

        // Verificar si el mantenimiento ya existe
        const mantenimientoExistente = await Mantenimiento.findOne({
          where: {
            fechaProgramada: fecha,
            cliente_id: clienteJhon.id,
            sucursal_id: sucursal.id,
            descripcion: row.COMENTARIOS || 'Sin comentarios'
          }
        });

        if (mantenimientoExistente) {
          console.log(`Mantenimiento ya existe - Fecha: ${fecha.toISOString()}`);
          continue;
        }

        // Buscar o crear dispensador
        const [dispensador] = await Dispensador.findOrCreate({
          where: {
            sucursal_id: sucursal.id,
            numero_serie: `IMP-${clienteJhon.id}-${sucursal.id}`
          },
          defaults: {
            modelo: 'Importado',
            fecha_instalacion: fecha,
            estado: 'activo',
            sector: row.SUCURSAL || 'No especificado',
            sucursal_id: sucursal.id,
            cliente_id: clienteJhon.id
          }
        });

        // Crear el mantenimiento
        const mantenimiento = await Mantenimiento.create({
          fechaProgramada: fecha,
          fechaRealizada: fecha,
          estado: 'completado',
          tipo: 'correctivo',
          descripcion: row.COMENTARIOS || 'Sin comentarios',
          observaciones: row.SOLUCION || 'Sin observaciones',
          cliente_id: clienteJhon.id,
          sucursal_id: sucursal.id,
          dispensador_id: dispensador.id,
          tecnico_id: 1
        });

        console.log(`Nuevo mantenimiento creado - ID: ${mantenimiento.id}`);
        importados++;

      } catch (error) {
        console.error('Error procesando registro:', error);
        errores++;
      }
    }

    console.log('\nResumen de importación:');
    console.log(`Total de registros de JHON MACHADO: ${jhonData.length}`);
    console.log(`Importados exitosamente: ${importados}`);
    console.log(`Errores: ${errores}`);

  } catch (error) {
    console.error('Error general:', error);
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

  importarMantenimientosJhon(filePath)
    .then(() => {
      console.log('Importación completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error en la importación:', error);
      process.exit(1);
    });
}

module.exports = importarMantenimientosJhon; 