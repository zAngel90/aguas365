const mysql = require('mysql2/promise');

async function corregirFechas() {
  console.log('Iniciando corrección de fechas...');

  // Mantenimientos a corregir con sus fechas
  const mantenimientos4026 = [
    1137, 1138, // 04/04/4026
    1134, 1135, 1136, // 04/02/4026
  ];

  const mantenimientos4025 = [
    1132, 1133, // 04/11/4025
    1130, 1131, // 04/07/4025
    1140, // 11/06/2025
    992, 993, 994, // 12/05/2025
    748, 749, 751, 752, 753, 754, 755, 756, 757, 760, // 11/05/2025
    741 // 23/04/2025
  ];

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aquatrack',
    port: 3306
  });

  try {
    console.log('Conectado a la base de datos...');
    
    // Primero mostramos todos los registros que vamos a modificar
    const todosIds = [...mantenimientos4026, ...mantenimientos4025];
    const placeholdersAll = todosIds.map(() => '?').join(',');
    
    console.log('\nBuscando todos los mantenimientos a modificar...');
    const [registrosActuales] = await connection.execute(
      `SELECT id, fecha_programada FROM mantenimientos 
       WHERE id IN (${placeholdersAll})
       ORDER BY fecha_programada DESC`,
      todosIds
    );

    if (registrosActuales.length === 0) {
      console.log('¡ADVERTENCIA! No se encontraron los mantenimientos');
      return;
    }

    console.log('\nRegistros encontrados:');
    registrosActuales.forEach(r => {
      console.log(`Mantenimiento #${r.id}: ${new Date(r.fecha_programada).toLocaleDateString()}`);
    });

    // Actualizar fechas de 4026 a 2025
    console.log('\nActualizando fechas de 4026 a 2025...');
    const placeholders4026 = mantenimientos4026.map(() => '?').join(',');
    const [result4026] = await connection.execute(
      `UPDATE mantenimientos 
       SET fecha_programada = DATE_SUB(fecha_programada, INTERVAL 2001 YEAR) 
       WHERE id IN (${placeholders4026})
       AND YEAR(fecha_programada) = 4026`,
      mantenimientos4026
    );
    console.log(`Actualizados ${result4026.affectedRows} registros de 4026 a 2025`);

    // Actualizar fechas de 4025 a 2024
    console.log('\nActualizando fechas de 4025 a 2024...');
    const placeholders4025 = mantenimientos4025.map(() => '?').join(',');
    const [result4025] = await connection.execute(
      `UPDATE mantenimientos 
       SET fecha_programada = DATE_SUB(fecha_programada, INTERVAL 2001 YEAR) 
       WHERE id IN (${placeholders4025})
       AND YEAR(fecha_programada) = 4025`,
      mantenimientos4025
    );
    console.log(`Actualizados ${result4025.affectedRows} registros de 4025 a 2024`);

    // Verificar los cambios
    console.log('\nVerificando cambios realizados...');
    const [registrosActualizados] = await connection.execute(
      `SELECT id, fecha_programada FROM mantenimientos 
       WHERE id IN (${placeholdersAll})
       ORDER BY fecha_programada DESC`,
      todosIds
    );

    console.log('\nFechas después de la actualización:');
    registrosActualizados.forEach(r => {
      console.log(`Mantenimiento #${r.id}: ${new Date(r.fecha_programada).toLocaleDateString()}`);
    });

    console.log('\nCorrección de fechas completada exitosamente');

  } catch (error) {
    console.error('Error al corregir las fechas:', error);
  } finally {
    await connection.end();
  }
}

// Ejecutar el script
corregirFechas(); 