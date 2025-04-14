const db = require('../config/database');
const bcrypt = require('bcryptjs');

const usuariosController = {
  getAll: async (req, res) => {
    try {
      const [usuarios] = await db.query('SELECT id, nombre, email, rol FROM usuarios');
      res.json({ data: usuarios });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [usuarios] = await db.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [id]);
      
      if (usuarios.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json({ data: usuarios[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuario', error });
    }
  },

  getTecnicos: async (req, res) => {
    try {
      const [usuarios] = await db.query('SELECT id, nombre, email FROM usuarios WHERE rol = "tecnico"');
      res.json({ data: usuarios });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener técnicos', error });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre, email, password, rol } = req.body;

      // Verificar si el email ya existe
      const [existingUsers] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar el nuevo usuario
      const [result] = await db.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, hashedPassword, rol]
      );

      // Obtener el usuario creado (sin la contraseña)
      const [newUser] = await db.query(
        'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({ data: newUser[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear usuario', error });
    }
  }
};

module.exports = usuariosController; 