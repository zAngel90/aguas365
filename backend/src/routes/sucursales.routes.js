const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursal.controller');

// Rutas para sucursales
router.get('/', sucursalController.getSucursales);
router.get('/:id', sucursalController.getSucursalById);
router.post('/', sucursalController.createSucursal);
router.put('/:id', sucursalController.updateSucursal);
router.delete('/:id', sucursalController.deleteSucursal);

// Ruta para obtener sucursales por cliente
router.get('/cliente/:clienteId', sucursalController.getSucursalesByCliente);

module.exports = router; 