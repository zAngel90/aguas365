const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Validaciones
const clienteValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('direccion').notEmpty().withMessage('La dirección es requerida'),
  body('telefono').notEmpty().withMessage('El teléfono es requerido')
    .matches(/^[0-9+\s-]+$/).withMessage('Formato de teléfono inválido'),
  body('email').optional().isEmail().withMessage('Email inválido')
];

// Rutas
router.get('/', verifyToken, clientesController.getClientes);
router.get('/:id', verifyToken, clientesController.getClienteById);
router.post('/', verifyToken, clienteValidation, clientesController.createCliente);
router.put('/:id', verifyToken, clienteValidation, clientesController.updateCliente);
router.delete('/:id', verifyToken, clientesController.deleteCliente);

// Obtener cantidad de sucursales por cliente
router.get('/:clienteId/sucursales/count', clientesController.getSucursalesCount);

module.exports = router; 