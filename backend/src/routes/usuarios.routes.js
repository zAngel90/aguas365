const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Validaciones
const userValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol').isIn(['admin', 'tecnico']).withMessage('Rol inválido')
];

// Rutas protegidas que requieren autenticación
router.get('/', verifyToken, usuariosController.getAll);
router.get('/tecnicos', verifyToken, usuariosController.getTecnicos);
router.get('/:id', verifyToken, usuariosController.getById);
router.post('/', verifyToken, userValidation, usuariosController.create);

module.exports = router; 