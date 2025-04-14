const express = require('express');
const router = express.Router();
const dispensadorController = require('../controllers/dispensador.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas protegidas que requieren autenticación
router.get('/', verifyToken, dispensadorController.getAll);
router.get('/:id', verifyToken, dispensadorController.getById);
router.post('/', verifyToken, dispensadorController.create);
router.put('/:id', verifyToken, dispensadorController.update);
router.delete('/:id', verifyToken, dispensadorController.delete);

module.exports = router; 