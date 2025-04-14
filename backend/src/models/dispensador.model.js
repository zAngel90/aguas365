const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dispensador = sequelize.define('Dispensador', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    modelo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numero_serie: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fecha_instalacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ultimo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    proximo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'mantenimiento'),
      allowNull: false,
      defaultValue: 'activo'
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sucursal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sucursales',
        key: 'id'
      }
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientes',
        key: 'id'
      }
    }
  }, {
    tableName: 'dispensadores',
    timestamps: true,
    underscored: true
  });

  return Dispensador;
}; 