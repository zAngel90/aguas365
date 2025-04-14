const express = require('express');
const router = express.Router();
const tecnicosController = require('../controllers/tecnicos.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas protegidas que requieren autenticación
router.get('/', verifyToken, tecnicosController.getAll);
router.get('/:id', verifyToken, tecnicosController.getById);
router.post('/', verifyToken, tecnicosController.create);
router.put('/:id', verifyToken, tecnicosController.update);
router.delete('/:id', verifyToken, tecnicosController.delete);
router.patch('/:id/estado', verifyToken, tecnicosController.cambiarEstado);

module.exports = router; 