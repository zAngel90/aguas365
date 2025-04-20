require('dotenv').config();
const { sequelize } = require('./models');
const app = require('./app');

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: false });
    console.log('Base de datos sincronizada correctamente');

    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer(); 