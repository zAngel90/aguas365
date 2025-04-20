const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Tecnico extends Model {}

Tecnico.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  especialidad: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'vacaciones'),
    defaultValue: 'activo'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'createdAt'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updatedAt'
  }
}, {
  sequelize,
  modelName: 'Tecnico',
  tableName: 'tecnicos'
});

module.exports = Tecnico; 