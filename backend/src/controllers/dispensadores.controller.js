const db = require('../config/database');

const dispensadoresController = {
  getAll: async (req, res) => {
    try {
      console.log('Obteniendo todos los dispensadores...');
      const [dispensadores] = await db.query(`
        SELECT 
          d.*,
          s.id as sucursal_id,
          s.nombre as sucursal_nombre,
          s.direccion as sucursal_direccion,
          s.telefono as sucursal_telefono,
          s.email as sucursal_email,
          s.cliente_id as cliente_id,
          c.nombre as cliente_nombre
        FROM dispensadores d
        LEFT JOIN sucursales s ON d.sucursal_id = s.id
        LEFT JOIN clientes c ON s.cliente_id = c.id
        ORDER BY d.id DESC
      `);

      console.log('Dispensadores encontrados:', dispensadores.length);
      console.log('Datos crudos de dispensadores:', JSON.stringify(dispensadores, null, 2));
      
      // Formatear los datos para la estructura esperada por el frontend
      const dispensadoresFormateados = dispensadores.map(d => {
        console.log('Procesando dispensador:', {
          id: d.id,
          sucursal_id: d.sucursal_id,
          cliente_id: d.cliente_id,
          cliente_nombre: d.cliente_nombre,
          sucursal_nombre: d.sucursal_nombre
        });
        
        const dispensador = {
          id: d.id,
          modelo: d.modelo,
          numero_serie: d.numero_serie,
          fecha_instalacion: d.fecha_instalacion,
          ultimo_mantenimiento: d.ultimo_mantenimiento,
          proximo_mantenimiento: d.proximo_mantenimiento,
          estado: d.estado,
          sector: d.sector || 'Sin sector',
          sucursal_id: d.sucursal_id
        };

        // Siempre crear el objeto sucursal si tenemos un sucursal_id
        if (d.sucursal_id) {
          dispensador.sucursal = {
            id: d.sucursal_id,
            nombre: d.sucursal_nombre,
            direccion: d.sucursal_direccion,
            telefono: d.sucursal_telefono,
            email: d.sucursal_email
          };

          // Siempre crear el objeto cliente si tenemos cliente_nombre
          if (d.cliente_nombre) {
            dispensador.sucursal.cliente = {
              id: d.cliente_id,
              nombre: d.cliente_nombre
            };
          }
        }

        console.log('Dispensador formateado final:', JSON.stringify(dispensador, null, 2));
        return dispensador;
      });

      console.log('Dispensadores formateados:', dispensadoresFormateados.length);
      res.json(dispensadoresFormateados);
    } catch (error) {
      console.error('Error al obtener dispensadores:', error);
      res.status(500).json({ 
        message: 'Error al obtener dispensadores',
        error: error.message 
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [dispensadores] = await db.query('SELECT * FROM dispensadores WHERE id = ?', [id]);
      
      if (dispensadores.length === 0) {
        return res.status(404).json({ message: 'Dispensador no encontrado' });
      }
      
      res.json({ data: dispensadores[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener dispensador', error });
    }
  },

  getByCliente: async (req, res) => {
    try {
      const { clienteId } = req.params;
      const [dispensadores] = await db.query('SELECT * FROM dispensadores WHERE cliente_id = ?', [clienteId]);
      res.json({ data: dispensadores });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener dispensadores del cliente', error });
    }
  },

  create: async (req, res) => {
    try {
      console.log('Iniciando creación de dispensador con datos:', req.body);
      const { sucursal_id, modelo, numero_serie, fecha_instalacion, estado, sector } = req.body;
      
      // Validar campos requeridos
      if (!sucursal_id || !modelo || !numero_serie) {
        console.log('Error de validación: Campos requeridos faltantes');
        return res.status(400).json({ 
          message: 'Campos requeridos faltantes',
          details: {
            sucursal_id: !sucursal_id ? 'Campo requerido' : null,
            modelo: !modelo ? 'Campo requerido' : null,
            numero_serie: !numero_serie ? 'Campo requerido' : null
          }
        });
      }

      // Validar que el estado sea uno de los permitidos
      const estadosPermitidos = ['activo', 'inactivo', 'mantenimiento'];
      if (!estadosPermitidos.includes(estado)) {
        console.log('Error de validación: Estado no válido:', estado);
        return res.status(400).json({ 
          message: 'Estado no válido',
          estadosPermitidos
        });
      }
      
      console.log('Insertando nuevo dispensador en la base de datos...');
      const [result] = await db.query(
        'INSERT INTO dispensadores (sucursal_id, modelo, numero_serie, fecha_instalacion, estado, sector) VALUES (?, ?, ?, ?, ?, ?)',
        [sucursal_id, modelo, numero_serie, fecha_instalacion, estado, sector]
      );
      
      console.log('Dispensador creado con ID:', result.insertId);
      const [newDispensador] = await db.query('SELECT * FROM dispensadores WHERE id = ?', [result.insertId]);
      
      console.log('Enviando respuesta con nuevo dispensador:', newDispensador[0]);
      res.status(201).json({ data: newDispensador[0] });
    } catch (error) {
      console.error('Error al crear dispensador:', {
        mensaje: error.message,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        code: error.code
      });
      
      // Manejar errores específicos de SQL
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          message: 'La sucursal especificada no existe',
          error: error.message 
        });
      }
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          message: 'Ya existe un dispensador con ese número de serie',
          error: error.message 
        });
      }
      
      res.status(500).json({ 
        message: 'Error al crear dispensador',
        error: error.message,
        details: error.sqlMessage
      });
    }
  },

  update: async (req, res) => {
    try {
      console.log('Iniciando actualización de dispensador:', {
        id: req.params.id,
        datos: req.body
      });
      
      const { sucursal_id, modelo, numero_serie, fecha_instalacion, estado, sector } = req.body;
      const id = req.params.id;

      // Verificar si el dispensador existe
      const [existingDispensador] = await db.query('SELECT * FROM dispensadores WHERE id = ?', [id]);
      if (existingDispensador.length === 0) {
        console.log('Dispensador no encontrado:', id);
        return res.status(404).json({ message: 'Dispensador no encontrado' });
      }

      // Validar que el estado sea uno de los permitidos
      if (estado) {
        const estadosPermitidos = ['activo', 'inactivo', 'mantenimiento'];
        if (!estadosPermitidos.includes(estado)) {
          console.log('Error de validación: Estado no válido:', estado);
          return res.status(400).json({ 
            message: 'Estado no válido',
            estadosPermitidos
          });
        }
      }

      console.log('Actualizando dispensador en la base de datos...');
      const [result] = await db.query(
        'UPDATE dispensadores SET sucursal_id = ?, modelo = ?, numero_serie = ?, fecha_instalacion = ?, estado = ?, sector = ? WHERE id = ?',
        [sucursal_id, modelo, numero_serie, fecha_instalacion, estado, sector, id]
      );

      if (result.affectedRows === 0) {
        console.log('No se realizaron cambios en el dispensador:', id);
        return res.status(400).json({ message: 'No se realizaron cambios' });
      }

      console.log('Obteniendo datos actualizados del dispensador:', id);
      const [updatedDispensador] = await db.query('SELECT * FROM dispensadores WHERE id = ?', [id]);
      
      console.log('Enviando respuesta con dispensador actualizado:', updatedDispensador[0]);
      res.json({ data: updatedDispensador[0] });
    } catch (error) {
      console.error('Error al actualizar dispensador:', {
        mensaje: error.message,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        code: error.code
      });
      
      // Manejar errores específicos de SQL
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          message: 'La sucursal especificada no existe',
          error: error.message 
        });
      }
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          message: 'Ya existe otro dispensador con ese número de serie',
          error: error.message 
        });
      }
      
      res.status(500).json({ 
        message: 'Error al actualizar dispensador',
        error: error.message,
        details: error.sqlMessage
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM dispensadores WHERE id = ?', [id]);
      res.json({ message: 'Dispensador eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar dispensador', error });
    }
  },

  cambiarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      // Validar que el estado sea uno de los permitidos
      const estadosPermitidos = ['activo', 'inactivo', 'mantenimiento'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }
      
      await db.query('UPDATE dispensadores SET estado = ? WHERE id = ?', [estado, id]);
      
      const [updatedDispensador] = await db.query('SELECT * FROM dispensadores WHERE id = ?', [id]);
      res.json({ data: updatedDispensador[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error al cambiar estado del dispensador', error });
    }
  }
};

module.exports = dispensadoresController; 