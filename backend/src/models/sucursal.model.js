const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sucursal = sequelize.define('Sucursal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    nif: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      }
    }
  }, {
    tableName: 'sucursales',
    timestamps: true,
    underscored: true
  });

  return Sucursal;
}; 