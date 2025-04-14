import api from './api';
import type { Mantenimiento } from '@/interfaces/mantenimiento.interface';

export const mantenimientosService = {
  getAll: async (): Promise<Mantenimiento[]> => {
    try {
      const response = await api.get('/mantenimientos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Mantenimiento> => {
    try {
      const response = await api.get(`/mantenimientos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mantenimiento:', error);
      throw error;
    }
  },

  getByDispensador: async (dispensadorId: number): Promise<Mantenimiento[]> => {
    try {
      const response = await api.get(`/mantenimientos/dispensador/${dispensadorId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mantenimientos del dispensador:', error);
      throw error;
    }
  },

  create: async (mantenimiento: Omit<Mantenimiento, 'id'>): Promise<Mantenimiento> => {
    try {
      const response = await api.post('/mantenimientos', mantenimiento);
      return response.data;
    } catch (error) {
      console.error('Error al crear mantenimiento:', error);
      throw error;
    }
  },

  update: async (id: number, mantenimiento: Partial<Mantenimiento>): Promise<Mantenimiento> => {
    try {
      const response = await api.put(`/mantenimientos/${id}`, mantenimiento);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar mantenimiento:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/mantenimientos/${id}`);
    } catch (error) {
      console.error('Error al eliminar mantenimiento:', error);
      throw error;
    }
  },

  cambiarEstado: async (id: number, estado: Mantenimiento['estado']): Promise<Mantenimiento> => {
    try {
      const response = await api.patch(`/mantenimientos/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del mantenimiento:', error);
      throw error;
    }
  },

  getHistorial: async (dispensadorId: number) => {
    const response = await api.get(`/mantenimientos/historial/${dispensadorId}`);
    return response.data.data;
  }
}; 