const { Sucursal, Cliente, Dispensador } = require('../models');

// Obtener todas las sucursales
exports.getSucursales = async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll({
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['id', 'nombre']
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(sucursales);
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener sucursales por cliente
exports.getSucursalesByCliente = async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll({
      where: {
        cliente_id: req.params.clienteId
      },
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['id', 'nombre']
      }, {
        model: Dispensador,
        as: 'dispensadores',
        attributes: ['id', 'modelo', 'numero_serie', 'estado']
      }]
    });
    res.json(sucursales);
  } catch (error) {
    console.error('Error al obtener sucursales del cliente:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener una sucursal por ID
exports.getSucursalById = async (req, res) => {
  try {
    const sucursal = await Sucursal.findByPk(req.params.id, {
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['id', 'nombre']
      }, {
        model: Dispensador,
        as: 'dispensadores',
        attributes: ['id', 'modelo', 'numero_serie', 'estado']
      }]
    });
    if (!sucursal) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    res.json(sucursal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva sucursal
exports.createSucursal = async (req, res) => {
  try {
    const sucursal = await Sucursal.create(req.body);
    const sucursalConRelaciones = await Sucursal.findByPk(sucursal.id, {
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['id', 'nombre']
      }]
    });
    res.status(201).json(sucursalConRelaciones);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      console.error('Error al crear sucursal:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

// Actualizar una sucursal
exports.updateSucursal = async (req, res) => {
  try {
    const [updated] = await Sucursal.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedSucursal = await Sucursal.findByPk(req.params.id, {
        include: [{
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre']
        }]
      });
      res.json(updatedSucursal);
    } else {
      res.status(404).json({ message: 'Sucursal no encontrada' });
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Eliminar una sucursal
exports.deleteSucursal = async (req, res) => {
  try {
    const deleted = await Sucursal.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Sucursal no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 