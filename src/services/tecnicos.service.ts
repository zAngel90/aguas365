import api from './api';
import { apiConfig } from '@/config/api.config';
import type { Tecnico } from '@/interfaces/tecnico.interface';

export const tecnicosService = {
  async getAll(): Promise<Tecnico[]> {
    try {
      const response = await api.get(apiConfig.endpoints.tecnicos);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener técnicos:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<Tecnico> {
    try {
      const response = await api.get(`${apiConfig.endpoints.tecnicos}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener técnico:', error);
      throw error;
    }
  },

  async create(tecnicoData: any): Promise<Tecnico> {
    try {
      const response = await api.post(apiConfig.endpoints.tecnicos, tecnicoData);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear técnico:', error);
      throw error;
    }
  },

  async update(id: number, tecnicoData: any): Promise<Tecnico> {
    try {
      const response = await api.put(`${apiConfig.endpoints.tecnicos}/${id}`, tecnicoData);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar técnico:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${apiConfig.endpoints.tecnicos}/${id}`);
  },

  async cambiarDisponibilidad(id: number, disponibilidad: 'disponible' | 'ocupado' | 'vacaciones') {
    const response = await api.patch(`${apiConfig.endpoints.tecnicos}/${id}/disponibilidad`, { disponibilidad });
    const updatedTecnico = response.data.data;
    return {
      ...updatedTecnico,
      usuario: {
        id: updatedTecnico.usuario_id,
        nombre: updatedTecnico.nombre,
        email: updatedTecnico.email
      }
    };
  },

  async enviarWhatsApp(id: number, mensaje: string): Promise<void> {
    try {
      const response = await api.post(`${apiConfig.endpoints.tecnicos}/${id}/whatsapp`, { mensaje });
      return response.data.data;
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      throw error;
    }
  }
}; 