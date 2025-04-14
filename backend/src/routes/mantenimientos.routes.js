const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimiento.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas para mantenimientos
router.get('/', verifyToken, mantenimientoController.getAll);
router.get('/:id', verifyToken, mantenimientoController.getById);
router.get('/cliente/:clienteId', mantenimientoController.getByCliente);
router.get('/sucursal/:sucursalId', mantenimientoController.getBySucursal);
router.get('/tecnico/:tecnicoId', mantenimientoController.getByTecnico);
router.get('/dispensador/:dispensadorId', verifyToken, mantenimientoController.getByDispensador);
router.post('/', verifyToken, mantenimientoController.create);
router.put('/:id', verifyToken, mantenimientoController.update);
router.delete('/:id', verifyToken, mantenimientoController.delete);
router.patch('/:id/estado', verifyToken, mantenimientoController.cambiarEstado);

module.exports = router; 