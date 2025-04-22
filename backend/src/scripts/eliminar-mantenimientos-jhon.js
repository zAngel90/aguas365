const { Sequelize } = require('sequelize');
const { Mantenimiento, Cliente } = require('../models');

async function eliminarMantenimientosJhon() {
  try {
    console.log('Iniciando proceso de eliminación de mantenimientos de JHON MACHADO...');

    // Buscar el cliente JHON MACHADO
    const cliente = await Cliente.findOne({
      where: {
        nombre: 'JHON MACHADO'
      }
    });

    if (!cliente) {
      console.log('No se encontró el cliente JHON MACHADO');
      return;
    }

    console.log(`Cliente encontrado con ID: ${cliente.id}`);

    // Encontrar todos los mantenimientos del cliente
    const mantenimientos = await Mantenimiento.findAll({
      where: {
        cliente_id: cliente.id
      }
    });

    console.log(`Se encontraron ${mantenimientos.length} mantenimientos para eliminar`);

    // Mostrar los mantenimientos que se van a eliminar
    for (const mantenimiento of mantenimientos) {
      console.log(`- Mantenimiento ID: ${mantenimiento.id}`);
      console.log(`  Fecha: ${mantenimiento.fechaProgramada}`);
      console.log('---');
    }

    // Eliminar los mantenimientos
    const eliminados = await Mantenimiento.destroy({
      where: {
        cliente_id: cliente.id
      }
    });

    console.log(`\nResumen de la operación:`);
    console.log(`- Total de mantenimientos encontrados: ${mantenimientos.length}`);
    console.log(`- Mantenimientos eliminados: ${eliminados}`);

  } catch (error) {
    console.error('Error durante la eliminación:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  eliminarMantenimientosJhon()
    .then(() => {
      console.log('Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = eliminarMantenimientosJhon; 