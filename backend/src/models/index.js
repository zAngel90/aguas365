const { Sequelize } = require('sequelize');
const config = require('../config/config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
  }
);

// Importar definiciones de modelos
const defineCliente = require('./cliente.model');
const defineSucursal = require('./sucursal.model');
const defineDispensador = require('./dispensador.model');
const defineMantenimiento = require('./mantenimiento.model');
const defineTecnico = require('./tecnico.model');

// Inicializar modelos
const Cliente = defineCliente(sequelize);
const Sucursal = defineSucursal(sequelize);
const Dispensador = defineDispensador(sequelize);
const Mantenimiento = defineMantenimiento(sequelize);
const Tecnico = defineTecnico(sequelize);

// Definir relaciones
Cliente.hasMany(Sucursal, {
  foreignKey: 'cliente_id',
  as: 'sucursales'
});

Sucursal.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

Cliente.hasMany(Dispensador, {
  foreignKey: 'cliente_id',
  as: 'dispensadores'
});

Dispensador.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

Sucursal.hasMany(Dispensador, {
  foreignKey: 'sucursal_id',
  as: 'dispensadores'
});

Dispensador.belongsTo(Sucursal, {
  foreignKey: 'sucursal_id',
  as: 'sucursal'
});

Dispensador.hasMany(Mantenimiento, {
  foreignKey: 'dispensador_id',
  as: 'mantenimientos'
});

Mantenimiento.belongsTo(Dispensador, {
  foreignKey: 'dispensador_id',
  as: 'dispensador'
});

// Agregar las asociaciones faltantes para Mantenimiento
Cliente.hasMany(Mantenimiento, {
  foreignKey: 'cliente_id',
  as: 'mantenimientos'
});

Mantenimiento.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

Sucursal.hasMany(Mantenimiento, {
  foreignKey: 'sucursal_id',
  as: 'mantenimientos'
});

Mantenimiento.belongsTo(Sucursal, {
  foreignKey: 'sucursal_id',
  as: 'sucursal'
});

Mantenimiento.belongsTo(Tecnico, {
  foreignKey: 'tecnico_id',
  as: 'tecnico'
});

Tecnico.hasMany(Mantenimiento, {
  foreignKey: 'tecnico_id',
  as: 'mantenimientos'
});

module.exports = {
  sequelize,
  Cliente,
  Sucursal,
  Dispensador,
  Mantenimiento,
  Tecnico
}; 