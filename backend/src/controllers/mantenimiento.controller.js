const { Mantenimiento, Cliente, Sucursal, Dispensador, Tecnico } = require('../models');

// Obtener todos los mantenimientos
exports.getAll = async (req, res) => {
  try {
    const mantenimientos = await Mantenimiento.findAll({
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre']
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre']
        },
        {
          model: Dispensador,
          as: 'dispensador',
          attributes: ['id', 'modelo', 'numero_serie']
        },
        {
          model: Tecnico,
          as: 'tecnico',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_programada', 'DESC']]
    });
    res.json(mantenimientos);
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener un mantenimiento por ID
exports.getById = async (req, res) => {
  try {
    const mantenimiento = await Mantenimiento.findByPk(req.params.id, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre']
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre']
        },
        {
          model: Dispensador,
          as: 'dispensador',
          attributes: ['id', 'modelo', 'numero_serie']
        },
        {
          model: Tecnico,
          as: 'tecnico',
          attributes: ['id', 'nombre']
        }
      ]
    });
    if (!mantenimiento) {
      return res.status(404).json({ message: 'Mantenimiento no encontrado' });
    }
    res.json(mantenimiento);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener mantenimientos por cliente
exports.getByCliente = async (req, res) => {
  try {
    const mantenimientos = await Mantenimiento.findAll({
      where: { clienteId: req.params.clienteId },
      include: [
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre']
        },
        {
          model: Dispensador,
          as: 'dispensador',
          attributes: ['id', 'modelo', 'numero_serie']
        },
        {
          model: Tecnico,
          as: 'tecnico',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_programada', 'DESC']]
    });
    res.json(mantenimientos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener mantenimientos por sucursal
exports.getBySucursal = async (req, res) => {
  try {
    const mantenimientos = await Mantenimiento.findAll({
      where: { sucursalId: req.params.sucursalId },
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre']
        },
        {
          model: Dispensador,
          as: 'dispensador',
          attributes: ['id', 'modelo', 'numero_serie']
        },
        {
          model: Tecnico,
          as: 'tecnico',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_programada', 'DESC']]
    });
    res.json(mantenimientos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener mantenimientos por técnico
exports.getByTecnico = async (req, res) => {
  try {
    const mantenimientos = await Mantenimiento.findAll({
      where: { tecnicoId: req.params.tecnicoId },
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre']
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre']
        },
        {
          model: Dispensador,
          as: 'dispensador',
          attributes: ['id', 'modelo', 'numero_serie']
        }
      ],
      order: [['fecha_programada', 'DESC']]
    });
    res.json(mantenimientos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener mantenimientos por dispensador
exports.getByDispensador = async (req, res) => {
  try {
    const mantenimientos = await Mantenimiento.findAll({
      where: { dispensador_id: req.params.dispensadorId },
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre']
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre']
        },
        {
          model: Tecnico,
          as: 'tecnico',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_programada', 'DESC']]
    });
    res.json(mantenimientos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo mantenimiento
exports.create = async (req, res) => {
  try {
    const mantenimiento = await Mantenimiento.create(req.body);
    const mantenimientoConRelaciones = await Mantenimiento.findByPk(mantenimiento.id, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre']
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre']
        },
        {
          model: Dispensador,
          as: 'dispensador',
          attributes: ['id', 'modelo', 'numero_serie']
        },
        {
          model: Tecnico,
          as: 'tecnico',
          attributes: ['id', 'nombre']
        }
      ]
    });
    res.status(201).json(mantenimientoConRelaciones);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      console.error('Error al crear mantenimiento:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

// Actualizar un mantenimiento
exports.update = async (req, res) => {
  try {
    const [updated] = await Mantenimiento.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedMantenimiento = await Mantenimiento.findByPk(req.params.id, {
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre']
          },
          {
            model: Sucursal,
            as: 'sucursal',
            attributes: ['id', 'nombre']
          },
          {
            model: Dispensador,
            as: 'dispensador',
            attributes: ['id', 'modelo', 'numero_serie']
          },
          {
            model: Tecnico,
            as: 'tecnico',
            attributes: ['id', 'nombre']
          }
        ]
      });
      res.json(updatedMantenimiento);
    } else {
      res.status(404).json({ message: 'Mantenimiento no encontrado' });
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Eliminar un mantenimiento
exports.delete = async (req, res) => {
  try {
    const deleted = await Mantenimiento.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Mantenimiento no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cambiar estado de un mantenimiento
exports.cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const [updated] = await Mantenimiento.update(
      { estado },
      { where: { id: req.params.id } }
    );
    if (updated) {
      const updatedMantenimiento = await Mantenimiento.findByPk(req.params.id, {
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre']
          },
          {
            model: Sucursal,
            as: 'sucursal',
            attributes: ['id', 'nombre']
          },
          {
            model: Dispensador,
            as: 'dispensador',
            attributes: ['id', 'modelo', 'numero_serie']
          },
          {
            model: Tecnico,
            as: 'tecnico',
            attributes: ['id', 'nombre']
          }
        ]
      });
      res.json(updatedMantenimiento);
    } else {
      res.status(404).json({ message: 'Mantenimiento no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 