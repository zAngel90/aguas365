require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', routes);

// Sincronizar la base de datos
async function initializeDatabase() {
  try {
    // Desactivar temporalmente las restricciones de clave foránea
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Sincronizar todos los modelos - sin forzar recreación
    await sequelize.sync();

    // Reactivar las restricciones de clave foránea
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Base de datos sincronizada correctamente');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    // Asegurarse de reactivar las restricciones de clave foránea en caso de error
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}

initializeDatabase();

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
}); 