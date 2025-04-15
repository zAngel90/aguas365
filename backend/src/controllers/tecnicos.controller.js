const db = require('../config/database');

const tecnicosController = {
  getAll: async (req, res) => {
    try {
      const [tecnicos] = await db.query(`
        SELECT id, nombre, email, telefono, especialidad, 
               estado, createdAt, updatedAt
        FROM tecnicos
      `);
      res.json({ data: tecnicos });
    } catch (error) {
      console.error('Error al obtener técnicos:', error);
      res.status(500).json({ message: 'Error al obtener técnicos', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [tecnicos] = await db.query('SELECT * FROM tecnicos WHERE id = ?', [id]);
      
      if (tecnicos.length === 0) {
        return res.status(404).json({ message: 'Técnico no encontrado' });
      }
      
      res.json({ data: tecnicos[0] });
    } catch (error) {
      console.error('Error al obtener técnico:', error);
      res.status(500).json({ message: 'Error al obtener técnico', error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre, email, telefono, especialidad, estado = 'activo' } = req.body;
      
      // Validar campos requeridos
      if (!nombre || !email || !telefono) {
        return res.status(400).json({ 
          message: 'Nombre, email y teléfono son campos requeridos' 
        });
      }

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const [result] = await db.query(
        'INSERT INTO tecnicos (nombre, email, telefono, especialidad, estado, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, email, telefono, especialidad, estado, now, now]
      );

      const [newTecnico] = await db.query('SELECT * FROM tecnicos WHERE id = ?', [result.insertId]);
      res.status(201).json({ data: newTecnico[0] });
    } catch (error) {
      console.error('Error al crear técnico:', error);
      // Si es un error de MySQL pero los datos se guardaron, intentar recuperar el técnico
      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD' && result?.insertId) {
        const [newTecnico] = await db.query('SELECT * FROM tecnicos WHERE id = ?', [result.insertId]);
        if (newTecnico.length > 0) {
          return res.status(201).json({ data: newTecnico[0] });
        }
      }
      res.status(500).json({ message: 'Error al crear técnico', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, email, telefono, especialidad, estado } = req.body;

      const [existingTecnico] = await db.query('SELECT * FROM tecnicos WHERE id = ?', [id]);
      if (existingTecnico.length === 0) {
        return res.status(404).json({ message: 'Técnico no encontrado' });
      }

      await db.query(
        'UPDATE tecnicos SET nombre = ?, email = ?, telefono = ?, especialidad = ?, estado = ? WHERE id = ?',
        [nombre, email, telefono, especialidad, estado, id]
      );

      const [updatedTecnico] = await db.query('SELECT * FROM tecnicos WHERE id = ?', [id]);
      res.json({ data: updatedTecnico[0] });
    } catch (error) {
      console.error('Error al actualizar técnico:', error);
      res.status(500).json({ message: 'Error al actualizar técnico', error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await db.query('DELETE FROM tecnicos WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Técnico no encontrado' });
      }

      res.json({ message: 'Técnico eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar técnico:', error);
      res.status(500).json({ message: 'Error al eliminar técnico', error: error.message });
    }
  },

  cambiarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      const estadosPermitidos = ['activo', 'inactivo', 'vacaciones'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }

      await db.query('UPDATE tecnicos SET estado = ? WHERE id = ?', [estado, id]);

      const [updatedTecnico] = await db.query('SELECT * FROM tecnicos WHERE id = ?', [id]);

      if (updatedTecnico.length === 0) {
        return res.status(404).json({ message: 'Técnico no encontrado' });
      }

      res.json({ data: updatedTecnico[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error al cambiar estado del técnico', error });
    }
  }
};

module.exports = tecnicosController; 