const XLSX = require('xlsx');
const { Sequelize, Op } = require('sequelize');
const { Mantenimiento, Cliente, Sucursal, Dispensador } = require('../models');
const moment = require('moment');

// Función para convertir fecha de Excel a JavaScript
function convertExcelDate(excelDate) {
  try {
    // Si la fecha ya está en formato string (ej: "1/9/24")
    if (typeof excelDate === 'string' && excelDate.includes('/')) {
      const [month, day, year] = excelDate.split('/');
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

    // Filtrar solo los registros de FARMASHOP
    const farmashopData = data.filter(row => {
      // Buscar en todas las columnas que puedan contener el nombre del cliente
      const cliente = row['CLIENTE'] || row['NOMBRE'] || row['RAZON SOCIAL'] || '';
      console.log('Revisando fila:', cliente);
      return cliente.toUpperCase().trim() === 'FARMASHOP';
    });

    console.log(`Se encontraron ${farmashopData.length} registros de FARMASHOP`);
    console.log('Primeros registros encontrados:', farmashopData.slice(0, 3));

    // Variables para mantener el último valor no vacío
    let ultimaFecha = null;
    let ultimoCliente = null;
    let ultimoNroCliente = null;

    for (const row of farmashopData) {
      try {
        // Heredar valores de filas anteriores si están vacíos
        const fechaStr = row['FECHA'] || ultimaFecha;
        const cliente = 'FARMASHOP'; // Forzar el nombre a FARMASHOP
        const nroCliente = row['Nro. CLIENTE'] || ultimoNroCliente;

        // Actualizar los últimos valores si no están vacíos
        if (row['FECHA']) ultimaFecha = row['FECHA'];
        if (row['Nro. CLIENTE']) ultimoNroCliente = row['Nro. CLIENTE'];

        // Convertir la fecha de Excel a formato MySQL
        const fecha = convertExcelDate(fechaStr);
        console.log(`Procesando FARMASHOP - Cliente: ${cliente}, Fecha original: ${fechaStr}, Fecha convertida: ${fecha.toISOString()}`);

        // Buscar o crear el cliente
        const [clienteObj] = await Cliente.findOrCreate({
          where: { 
            nombre: 'FARMASHOP' // Buscar específicamente por el nombre FARMASHOP
          },
          defaults: {
            nombre: 'FARMASHOP',
            email: 'farmashop@default.com',
            telefono: row['TELEFONO'] || 'No especificado',
            direccion: row['DIRECCION'] || 'No especificada'
          }
        });

        // Buscar o crear sucursal
        let sucursal;
        if (!row.DIRECCION) {
          [sucursal] = await Sucursal.findOrCreate({
            where: { 
              nombre: 'Sucursal no especificada',
              cliente_id: clienteObj.id
            },
            defaults: {
              nombre: 'Sucursal no especificada',
              direccion: 'No especificada',
              telefono: 'No especificado',
              email: `sucursal.${clienteObj.id}@importacion.temp`,
              nif: `NO-SPEC-${clienteObj.id}`,
              cliente_id: clienteObj.id
            }
          });
        } else {
          [sucursal] = await Sucursal.findOrCreate({
            where: { 
              direccion: row.DIRECCION,
              cliente_id: clienteObj.id
            },
            defaults: {
              nombre: row.SUCURSAL || `Sucursal ${row.DIRECCION}`,
              direccion: row.DIRECCION,
              telefono: 'No especificado',
              email: `sucursal.${clienteObj.id}.${Date.now()}@importacion.temp`,
              nif: `AUTO-${Date.now()}`,
              cliente_id: clienteObj.id
            }
          });
        }

        // Verificar si el mantenimiento ya existe
        const mantenimientoExistente = await Mantenimiento.findOne({
          where: {
            fechaProgramada: fecha,
            cliente_id: clienteObj.id,
            sucursal_id: sucursal.id,
            descripcion: row.COMENTARIOS || 'Sin comentarios'
          }
        });

        if (mantenimientoExistente) {
          console.log(`Mantenimiento ya existe para FARMASHOP - Cliente: ${clienteObj.id}, Sucursal: ${sucursal.id}, Fecha: ${fecha.toISOString()}`);
          // No usamos continue aquí para poder ver todos los registros
        } else {
          // Buscar o crear dispensador
          const [dispensador] = await Dispensador.findOrCreate({
            where: {
              sucursal_id: sucursal.id,
              numero_serie: `IMP-${clienteObj.id}-${sucursal.id}`
            },
            defaults: {
              modelo: 'Importado',
              fecha_instalacion: fecha,
              estado: 'activo',
              sector: row.SUCURSAL || 'No especificado',
              sucursal_id: sucursal.id,
              cliente_id: clienteObj.id
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
            cliente_id: clienteObj.id,
            sucursal_id: sucursal.id,
            dispensador_id: dispensador.id,
            tecnico_id: 1
          });

          console.log(`Nuevo mantenimiento creado para FARMASHOP - ID: ${mantenimiento.id}, Fecha: ${fecha.toISOString()}`);
        }
      } catch (error) {
        console.error('Error procesando registro de FARMASHOP:', error);
        console.error('Datos del registro:', row);
      }
    }

    console.log('Procesamiento de registros de FARMASHOP completado');
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