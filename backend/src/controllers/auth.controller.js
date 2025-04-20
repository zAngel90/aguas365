const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verificar que se proporcionaron email y password
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }
      
      // Buscar usuario por email usando el modelo Sequelize
      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // Verificar la contraseña
      const isValidPassword = await usuario.validarPassword(password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol
        },
        process.env.JWT_SECRET || 'tu_jwt_secret',
        { expiresIn: '24h' }
      );
      
      // Enviar respuesta exitosa
      res.json({
        token,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
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
      
      // Verificar si el usuario ya existe usando el modelo Sequelize
      const existingUsuario = await Usuario.findOne({ where: { email } });
      
      if (existingUsuario) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
      
      // Crear nuevo usuario usando el modelo Sequelize
      const usuario = await Usuario.create({
        nombre,
        email,
        password,
        rol: rol || 'tecnico'
      });
      
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.user.id, {
        attributes: ['id', 'nombre', 'email', 'rol']
      });
      
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json({ data: usuario });
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
        const existingUsuario = await Usuario.findOne({
          where: { email, id: { [Op.ne]: userId } }
        });
        
        if (existingUsuario) {
          return res.status(400).json({ message: 'El email ya está registrado' });
        }
      }
      
      // Actualizar perfil usando el modelo Sequelize
      const [updated] = await Usuario.update(
        { nombre, email },
        { where: { id: userId } }
      );
      
      if (!updated) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Obtener el usuario actualizado
      const usuario = await Usuario.findByPk(userId, {
        attributes: ['id', 'nombre', 'email', 'rol']
      });
      
      res.json({ data: usuario });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar perfil', error });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Obtener usuario actual
      const usuario = await Usuario.findByPk(userId);
      
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Verificar contraseña actual
      const isValidPassword = await usuario.validarPassword(currentPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Contraseña actual incorrecta' });
      }
      
      // Actualizar contraseña
      usuario.password = newPassword;
      await usuario.save();
      
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al cambiar contraseña', error });
    }
  }
};

module.exports = authController; 