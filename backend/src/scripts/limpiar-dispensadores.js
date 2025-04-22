const { Sequelize, Op } = require('sequelize');
const { Dispensador, Mantenimiento, Sucursal } = require('../models');

async function limpiarDispensadores() {
  try {
    console.log('Iniciando limpieza de dispensadores duplicados...');

    // 1. Encontrar dispensadores con el mismo número de serie en la misma sucursal
    const dispensadores = await Dispensador.findAll({
      include: [
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['nombre', 'direccion']
        }
      ]
    });

    const grupos = {};
    dispensadores.forEach(disp => {
      const key = `${disp.sucursal_id}-${disp.numero_serie}`;
      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(disp);
    });

    console.log(`Se encontraron ${dispensadores.length} dispensadores en total`);

    let dispensadoresEliminados = 0;
    let mantenimientosActualizados = 0;

    // 2. Procesar cada grupo de dispensadores duplicados
    for (const key in grupos) {
      const grupo = grupos[key];
      if (grupo.length > 1) {
        console.log(`\nEncontrado grupo de ${grupo.length} dispensadores duplicados:`);
        console.log(`Sucursal: ${grupo[0].sucursal?.nombre}`);
        console.log(`Número de serie: ${grupo[0].numero_serie}`);

        // Mantener el primer dispensador y eliminar los demás
        const dispensadorPrincipal = grupo[0];
        const dispensadoresAEliminar = grupo.slice(1);

        for (const dispensadorDuplicado of dispensadoresAEliminar) {
          // Encontrar mantenimientos del dispensador duplicado
          const mantenimientos = await Mantenimiento.findAll({
            where: { dispensador_id: dispensadorDuplicado.id }
          });

          console.log(`- Dispensador ID ${dispensadorDuplicado.id} tiene ${mantenimientos.length} mantenimientos`);

          // Verificar y actualizar mantenimientos
          for (const mantenimiento of mantenimientos) {
            // Buscar si existe un mantenimiento similar en el dispensador principal
            const mantenimientoExistente = await Mantenimiento.findOne({
              where: {
                dispensador_id: dispensadorPrincipal.id,
                fechaProgramada: mantenimiento.fechaProgramada,
                cliente_id: mantenimiento.cliente_id,
                sucursal_id: mantenimiento.sucursal_id
              }
            });

            if (!mantenimientoExistente) {
              // Si no existe, mover el mantenimiento al dispensador principal
              await mantenimiento.update({
                dispensador_id: dispensadorPrincipal.id
              });
              mantenimientosActualizados++;
              console.log(`  - Mantenimiento ID ${mantenimiento.id} movido al dispensador principal`);
            } else {
              // Si existe, eliminar el mantenimiento duplicado
              await mantenimiento.destroy();
              console.log(`  - Mantenimiento ID ${mantenimiento.id} eliminado por duplicado`);
            }
          }

          // Eliminar el dispensador duplicado
          await dispensadorDuplicado.destroy();
          dispensadoresEliminados++;
          console.log(`  - Dispensador ID ${dispensadorDuplicado.id} eliminado`);
        }
      }
    }

    // 3. Encontrar y eliminar dispensadores sin mantenimientos
    const dispensadoresSinMantenimientos = await Dispensador.findAll({
      include: [{
        model: Mantenimiento,
        as: 'mantenimientos',
        required: false
      }],
      where: {
        '$mantenimientos.id$': null
      }
    });

    console.log(`\nEncontrados ${dispensadoresSinMantenimientos.length} dispensadores sin mantenimientos`);
    
    for (const disp of dispensadoresSinMantenimientos) {
      await disp.destroy();
      dispensadoresEliminados++;
      console.log(`- Dispensador ID ${disp.id} eliminado por no tener mantenimientos`);
    }

    // Resumen final
    console.log('\nResumen de la limpieza:');
    console.log(`- Dispensadores eliminados: ${dispensadoresEliminados}`);
    console.log(`- Mantenimientos actualizados: ${mantenimientosActualizados}`);
    console.log(`- Dispensadores restantes: ${await Dispensador.count()}`);

  } catch (error) {
    console.error('Error durante la limpieza:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  limpiarDispensadores()
    .then(() => {
      console.log('Limpieza completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error en la limpieza:', error);
      process.exit(1);
    });
}

module.exports = limpiarDispensadores; 