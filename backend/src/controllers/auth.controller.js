const db = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verificar que se proporcionaron email y password
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }
      
      // Buscar usuario por email
      const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      const user = users[0];
      
      // Verificar la contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          rol: user.rol
        },
        process.env.JWT_SECRET || 'tu_jwt_secret',
        { expiresIn: '24h' }
      );
      
      // Enviar respuesta exitosa
      res.json({
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  register: async (req, res) => {
    try {
      const { nombre, email, password, rol } = req.body;
      
      // Verificar si el usuario ya existe
      const [existingUsers] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
      
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insertar nuevo usuario
      const [result] = await db.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, hashedPassword, rol || 'tecnico']
      );
      
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: result.insertId,
          nombre,
          email,
          rol: rol || 'tecnico'
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const [users] = await db.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [req.user.id]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json({ data: users[0] });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { nombre, email } = req.body;
      
      // Verificar si el nuevo email ya existe
      if (email) {
        const [existingUsuarios] = await db.query('SELECT * FROM usuarios WHERE email = ? AND id != ?', [email, userId]);
        
        if (existingUsuarios.length > 0) {
          return res.status(400).json({ message: 'El email ya está registrado' });
        }
      }
      
      // Actualizar perfil
      await db.query(
        'UPDATE usuarios SET nombre = COALESCE(?, nombre), email = COALESCE(?, email) WHERE id = ?',
        [nombre, email, userId]
      );
      
      // Obtener el usuario actualizado
      const [updatedUsuario] = await db.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [userId]);
      
      res.json({ data: updatedUsuario[0] });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar perfil', error });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Obtener usuario actual
      const [usuarios] = await db.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
      
      if (usuarios.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      const usuario = usuarios[0];
      
      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, usuario.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Contraseña actual incorrecta' });
      }
      
      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizar contraseña
      await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, userId]);
      
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al cambiar contraseña', error });
    }
  }
};

module.exports = authController; 