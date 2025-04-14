const { Cliente, Sucursal } = require('../models');
const { Sequelize } = require('sequelize');

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [{
        model: Sucursal,
        as: 'sucursales',
        attributes: []
      }],
      attributes: [
        'id',
        'nombre',
        'email',
        'telefono',
        'direccion',
        'created_at',
        'updated_at',
        [Sequelize.fn('COUNT', Sequelize.col('sucursales.id')), 'sucursalesCount']
      ],
      group: ['Cliente.id', 'Cliente.nombre', 'Cliente.email', 'Cliente.telefono', 'Cliente.direccion', 'Cliente.created_at', 'Cliente.updated_at'],
      order: [['created_at', 'DESC']]
    });

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [{
        model: Sucursal,
        as: 'sucursales',
        attributes: ['id', 'nombre', 'direccion', 'telefono', 'email']
      }]
    });
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    const clienteConSucursales = await Cliente.findByPk(cliente.id, {
      include: [{
        model: Sucursal,
        as: 'sucursales',
        attributes: ['id']
      }],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('sucursales.id')), 'sucursalesCount']
        ]
      },
      group: ['Cliente.id']
    });
    res.status(201).json(clienteConSucursales);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Actualizar un cliente
exports.updateCliente = async (req, res) => {
  try {
    const [updated] = await Cliente.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const clienteActualizado = await Cliente.findByPk(req.params.id, {
        include: [{
          model: Sucursal,
          as: 'sucursales',
          attributes: ['id']
        }],
        attributes: {
          include: [
            [Sequelize.fn('COUNT', Sequelize.col('sucursales.id')), 'sucursalesCount']
          ]
        },
        group: ['Cliente.id']
      });
      res.json(clienteActualizado);
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Eliminar un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const deleted = await Cliente.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener cantidad de sucursales por cliente
exports.getSucursalesCount = async (req, res) => {
  try {
    const clienteId = req.params.clienteId;
    const count = await Sucursal.count({
      where: {
        cliente_id: clienteId
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error al obtener cantidad de sucursales:', error);
    res.status(500).json({ message: error.message });
  }
}; 