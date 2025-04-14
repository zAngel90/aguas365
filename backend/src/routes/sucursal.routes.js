const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursal.controller');

// Rutas para sucursales
router.get('/cliente/:clienteId', sucursalController.getSucursalesByCliente);
router.get('/:id', sucursalController.getSucursalById);
router.get('/', sucursalController.getSucursales);
router.post('/', sucursalController.createSucursal);
router.put('/:id', sucursalController.updateSucursal);
router.delete('/:id', sucursalController.deleteSucursal);

module.exports = router; 