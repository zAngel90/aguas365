const express = require('express')
const router = express.Router()
const mantenimientoController = require('../controllers/mantenimiento.controller')

// Rutas para mantenimientos
router.get('/', mantenimientoController.getAll)
router.get('/:id', mantenimientoController.getById)
router.post('/', mantenimientoController.create)
router.put('/:id', mantenimientoController.update)
router.delete('/:id', mantenimientoController.delete)

// Rutas para filtros
router.get('/cliente/:clienteId', mantenimientoController.getByCliente)
router.get('/sucursal/:sucursalId', mantenimientoController.getBySucursal)
router.get('/tecnico/:tecnicoId', mantenimientoController.getByTecnico)

module.exports = router 