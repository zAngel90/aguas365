const { Dispensador, Cliente, Sucursal } = require('../models');
const { Op } = require('sequelize');

const dispensadorController = {
  async getAll(req, res) {
    try {
      console.log('Iniciando búsqueda de dispensadores');
      const dispensadores = await Dispensador.findAll({
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre']
          },
          {
            model: Sucursal,
            as: 'sucursal',
            attributes: ['id', 'nombre', 'direccion'],
            include: [
              {
                model: Cliente,
                as: 'cliente',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      console.log(`Se encontraron ${dispensadores.length} dispensadores`);

      // Transformar los datos para incluir nombres planos
      const transformedDispensadores = dispensadores.map(d => {
        const dispensador = d.toJSON();
        return {
          id: dispensador.id,
          modelo: dispensador.modelo,
          numero_serie: dispensador.numero_serie,
          fecha_instalacion: dispensador.fecha_instalacion,
          ultimo_mantenimiento: dispensador.ultimo_mantenimiento,
          proximo_mantenimiento: dispensador.proximo_mantenimiento,
          estado: dispensador.estado,
          sector: dispensador.sector,
          cliente_id: dispensador.cliente_id,
          sucursal_id: dispensador.sucursal_id,
          cliente_nombre: dispensador.cliente?.nombre || dispensador.sucursal?.cliente?.nombre || 'Sin cliente',
          sucursal_nombre: dispensador.sucursal?.nombre || 'Sin sucursal',
          sucursal_direccion: dispensador.sucursal?.direccion || 'Sin dirección'
        };
      });

      // Enviar directamente el array de dispensadores
      return res.json(transformedDispensadores);
    } catch (error) {
      console.error('Error al obtener dispensadores:', error);
      return res.status(500).json({
        error: 'Error al obtener los dispensadores'
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const dispensador = await Dispensador.findByPk(id, {
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre']
          },
          {
            model: Sucursal,
            as: 'sucursal',
            attributes: ['id', 'nombre', 'direccion'],
            include: [
              {
                model: Cliente,
                as: 'cliente',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ]
      });

      if (!dispensador) {
        return res.status(404).json({
          error: 'Dispensador no encontrado'
        });
      }

      const transformedDispensador = {
        ...dispensador.toJSON(),
        cliente_nombre: dispensador.cliente?.nombre || dispensador.sucursal?.cliente?.nombre || 'Sin cliente',
        sucursal_nombre: dispensador.sucursal?.nombre || 'Sin sucursal',
        sucursal_direccion: dispensador.sucursal?.direccion || 'Sin dirección'
      };

      // Enviar directamente el dispensador
      return res.json(transformedDispensador);
    } catch (error) {
      console.error('Error al obtener dispensador:', error);
      return res.status(500).json({
        error: 'Error al obtener el dispensador'
      });
    }
  },

  async create(req, res) {
    try {
      const dispensadorData = req.body;
      
      if (!dispensadorData.cliente_id && !dispensadorData.sucursal_id) {
        return res.status(400).json({
          error: 'Debe especificar un cliente o una sucursal'
        });
      }

      const existingDispensador = await Dispensador.findOne({
        where: { numero_serie: dispensadorData.numero_serie }
      });

      if (existingDispensador) {
        return res.status(400).json({
          error: 'Ya existe un dispensador con ese número de serie'
        });
      }

      const dispensador = await Dispensador.create(dispensadorData);
      
      const dispensadorCreado = await Dispensador.findByPk(dispensador.id, {
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre']
          },
          {
            model: Sucursal,
            as: 'sucursal',
            attributes: ['id', 'nombre', 'direccion'],
            include: [
              {
                model: Cliente,
                as: 'cliente',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ]
      });

      const transformedDispensador = {
        ...dispensadorCreado.toJSON(),
        cliente_nombre: dispensadorCreado.cliente?.nombre || dispensadorCreado.sucursal?.cliente?.nombre || 'Sin cliente',
        sucursal_nombre: dispensadorCreado.sucursal?.nombre || 'Sin sucursal',
        sucursal_direccion: dispensadorCreado.sucursal?.direccion || 'Sin dirección'
      };

      // Enviar directamente el dispensador creado
      return res.status(201).json(transformedDispensador);
    } catch (error) {
      console.error('Error al crear dispensador:', error);
      return res.status(500).json({
        error: 'Error al crear el dispensador'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const dispensadorData = req.body;

      const dispensador = await Dispensador.findByPk(id);
      if (!dispensador) {
        return res.status(404).json({
          error: 'Dispensador no encontrado'
        });
      }

      if (dispensadorData.numero_serie) {
        const existingDispensador = await Dispensador.findOne({
          where: {
            numero_serie: dispensadorData.numero_serie,
            id: { [Op.ne]: id }
          }
        });

        if (existingDispensador) {
          return res.status(400).json({
            error: 'Ya existe un dispensador con ese número de serie'
          });
        }
      }

      await dispensador.update(dispensadorData);

      const dispensadorActualizado = await Dispensador.findByPk(id, {
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre']
          },
          {
            model: Sucursal,
            as: 'sucursal',
            attributes: ['id', 'nombre', 'direccion'],
            include: [
              {
                model: Cliente,
                as: 'cliente',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ]
      });

      const transformedDispensador = {
        ...dispensadorActualizado.toJSON(),
        cliente_nombre: dispensadorActualizado.cliente?.nombre || dispensadorActualizado.sucursal?.cliente?.nombre || 'Sin cliente',
        sucursal_nombre: dispensadorActualizado.sucursal?.nombre || 'Sin sucursal',
        sucursal_direccion: dispensadorActualizado.sucursal?.direccion || 'Sin dirección'
      };

      // Enviar directamente el dispensador actualizado
      return res.json(transformedDispensador);
    } catch (error) {
      console.error('Error al actualizar dispensador:', error);
      return res.status(500).json({
        error: 'Error al actualizar el dispensador'
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const dispensador = await Dispensador.findByPk(id);
      if (!dispensador) {
        return res.status(404).json({
          error: 'Dispensador no encontrado'
        });
      }

      await dispensador.destroy();
      
      return res.json({
        message: 'Dispensador eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar dispensador:', error);
      return res.status(500).json({
        error: 'Error al eliminar el dispensador'
      });
    }
  }
};

module.exports = dispensadorController;