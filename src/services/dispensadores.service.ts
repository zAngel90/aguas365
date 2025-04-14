import api from './api';
import { apiConfig } from '@/config/api.config';
import type { Dispensador } from '@/interfaces/dispensador.interface';

export const dispensadoresService = {
  async getAll(): Promise<Dispensador[]> {
    try {
      const response = await api.get(apiConfig.endpoints.dispensadores);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener dispensadores:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<Dispensador> {
    try {
      const response = await api.get(`${apiConfig.endpoints.dispensadores}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener dispensador:', error);
      throw error;
    }
  },

  async getByCliente(clienteId: number): Promise<Dispensador[]> {
    try {
      const response = await api.get(`${apiConfig.endpoints.dispensadores}/cliente/${clienteId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener dispensadores por cliente:', error);
      throw error;
    }
  },

  async create(dispensadorData: Partial<Dispensador>): Promise<Dispensador> {
    try {
      const response = await api.post(apiConfig.endpoints.dispensadores, dispensadorData);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear dispensador:', error);
      throw error;
    }
  },

  async update(id: number, dispensadorData: Partial<Dispensador>): Promise<Dispensador> {
    try {
      const response = await api.put(`${apiConfig.endpoints.dispensadores}/${id}`, dispensadorData);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar dispensador:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${apiConfig.endpoints.dispensadores}/${id}`);
  },

  async cambiarEstado(id: number, estado: string): Promise<Dispensador> {
    try {
      const response = await api.patch(`${apiConfig.endpoints.dispensadores}/${id}/estado`, { estado });
      return response.data.data;
    } catch (error) {
      console.error('Error al cambiar estado del dispensador:', error);
      throw error;
    }
  }
}; 