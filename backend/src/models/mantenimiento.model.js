const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Mantenimiento = sequelize.define('Mantenimiento', {
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
      allowNull: false,
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
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      },
      field: 'cliente_id'
    },
    sucursal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sucursales',
        key: 'id'
      },
      field: 'sucursal_id'
    },
    dispensador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dispensadores',
        key: 'id'
      },
      field: 'dispensador_id'
    },
    tecnico_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tecnicos',
        key: 'id'
      },
      field: 'tecnico_id'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'mantenimientos',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  return Mantenimiento
} 