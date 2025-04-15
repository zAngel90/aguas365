const express = require('express');
const router = express.Router();

// Importar todas las rutas
const clientesRoutes = require('./clientes.routes');
const sucursalesRoutes = require('./sucursales.routes');
const dispensadoresRoutes = require('./dispensadores.routes');
const mantenimientosRoutes = require('./mantenimientos.routes');
const tecnicosRoutes = require('./tecnicos.routes');
const usuariosRoutes = require('./usuarios.routes');
const authRoutes = require('./auth.routes');
const reportesRoutes = require('./reportes.routes');
const dashboardRoutes = require('./dashboard.routes');
const importarRoutes = require('./importar.routes');

// Montar las rutas
router.use('/auth', authRoutes);
router.use('/importar', importarRoutes);
router.use('/clientes', clientesRoutes);
router.use('/sucursales', sucursalesRoutes);
router.use('/dispensadores', dispensadoresRoutes);
router.use('/mantenimientos', mantenimientosRoutes);
router.use('/tecnicos', tecnicosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/reportes', reportesRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router; 