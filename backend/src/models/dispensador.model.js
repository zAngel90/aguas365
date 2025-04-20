const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dispensador = sequelize.define('dispensadores', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    modelo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'modelo'
    },
    numero_serie: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'numero_serie'
    },
    fecha_instalacion: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'fecha_instalacion'
    },
    ultimo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ultimo_mantenimiento'
    },
    proximo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'proximo_mantenimiento'
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'mantenimiento'),
      allowNull: false,
      defaultValue: 'activo',
      field: 'estado'
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'sector'
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'cantidad'
    },
    sucursal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sucursal_id',
      references: {
        model: 'sucursales',
        key: 'id'
      }
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'cliente_id',
      references: {
        model: 'clientes',
        key: 'id'
      }
    }
  }, {
    tableName: 'dispensadores',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Dispensador;
}; 