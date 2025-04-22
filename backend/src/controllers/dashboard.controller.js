const db = require('../config/database');

const dashboardController = {
  getStats: async (req, res) => {
    try {
      console.log('Iniciando obtención de estadísticas del dashboard');
      
      // Obtener total de clientes
      const [clientesResult] = await db.query('SELECT COUNT(*) as total FROM clientes');
      console.log('Total clientes:', clientesResult[0].total);
      
      // Obtener total de dispensadores activos sumando las cantidades
      const [dispensadoresResult] = await db.query(`
        SELECT 
          COUNT(*) as total_registros,
          COALESCE(SUM(cantidad), 0) as total_unidades,
          GROUP_CONCAT(CONCAT(id, ':', COALESCE(cantidad, 1))) as detalles
        FROM dispensadores 
        WHERE estado = "activo"
      `);
      
      const totalDispensadores = parseInt(dispensadoresResult[0].total_unidades) || 0;
      console.log('Desglose dispensadores:', {
        registros: dispensadoresResult[0].total_registros,
        unidades_totales: totalDispensadores,
        detalles: dispensadoresResult[0].detalles
      });
      
      // Obtener total de mantenimientos pendientes
      const [mantenimientosResult] = await db.query('SELECT COUNT(*) as total FROM mantenimientos WHERE estado = "pendiente"');
      console.log('Total mantenimientos pendientes:', mantenimientosResult[0].total);
      
      const response = {
        clientes: parseInt(clientesResult[0].total) || 0,
        dispensadores: totalDispensadores,
        mantenimientos: parseInt(mantenimientosResult[0].total) || 0
      };
      
      console.log('Enviando respuesta del dashboard:', response);
      res.json(response);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  }
};

module.exports = dashboardController; 