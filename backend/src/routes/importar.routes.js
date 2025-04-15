const { Router } = require('express');
const { importarExcel, detectarEstructura } = require('../controllers/importar.controller');

const router = Router();

router.post('/importar', importarExcel);
router.post('/detectar-estructura', detectarEstructura);

module.exports = router; 