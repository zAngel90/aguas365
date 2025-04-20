const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Mantenimiento extends Model {}

Mantenimiento.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fechaProgramada: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'fecha_programada'
  },
  fechaRealizada: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_realizada'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'completado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  tipo: {
    type: DataTypes.ENUM('preventivo', 'correctivo', 'emergencia'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  sucursal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sucursales',
      key: 'id'
    }
  },
  dispensador_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'dispensadores',
      key: 'id'
    }
  },
  tecnico_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tecnicos',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Mantenimiento',
  tableName: 'mantenimientos',
  timestamps: true,
  underscored: true
});

module.exports = Mantenimiento; 