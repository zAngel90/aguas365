const db = require('../config/database');

const dashboardController = {
  getStats: async (req, res) => {
    try {
      // Obtener total de clientes
      const [clientesResult] = await db.query('SELECT COUNT(*) as total FROM clientes');
      
      // Obtener total de dispensadores activos
      const [dispensadoresResult] = await db.query('SELECT COUNT(*) as total FROM dispensadores WHERE estado = "activo"');
      
      // Obtener total de mantenimientos pendientes
      const [mantenimientosResult] = await db.query('SELECT COUNT(*) as total FROM mantenimientos WHERE estado = "pendiente"');
      
      res.json({
        clientes: clientesResult[0].total,
        dispensadores: dispensadoresResult[0].total,
        mantenimientos: mantenimientosResult[0].total
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  }
};

module.exports = dashboardController; 