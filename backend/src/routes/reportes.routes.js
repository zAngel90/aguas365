const express = require('express')
const router = express.Router()
const reportesController = require('../controllers/reportes.controller')
const { verifyToken } = require('../middleware/auth.middleware')

router.get('/mantenimientos-pendientes', verifyToken, reportesController.getMantenimientosPendientes)
router.get('/dispensadores-por-cliente', verifyToken, reportesController.getDispensadoresPorCliente)
router.post('/send-email', verifyToken, reportesController.sendReport)

module.exports = router 