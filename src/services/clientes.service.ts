import api from './api';
import { apiConfig } from '@/config/api.config';

export interface Cliente {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  created_at?: string;
  updated_at?: string;
}

export const clientesService = {
  getAll: async () => {
    try {
      const response = await api.get(apiConfig.endpoints.clientes);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`${apiConfig.endpoints.clientes}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  },

  create: async (clienteData: any) => {
    try {
      const response = await api.post(apiConfig.endpoints.clientes, clienteData);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  update: async (id: number, clienteData: any) => {
    try {
      const response = await api.put(`${apiConfig.endpoints.clientes}/${id}`, clienteData);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await api.delete(`${apiConfig.endpoints.clientes}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
  },

  getSucursalesCount: async (clienteId: number): Promise<number> => {
    try {
      const response = await api.get(`${apiConfig.endpoints.clientes}/${clienteId}/sucursales/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error al obtener conteo de sucursales:', error);
      throw error;
    }
  },

  getSucursales: async (clienteId: number) => {
    try {
      const response = await api.get(`${apiConfig.endpoints.sucursales}/cliente/${clienteId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener sucursales del cliente:', error);
      throw error;
    }
  }
}; 