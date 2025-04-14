import api from './api'
import { apiConfig } from '@/config/api.config'

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'tecnico';
}

export const usuariosService = {
  async getAll() {
    try {
      const response = await api.get(apiConfig.endpoints.usuarios)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      throw error
    }
  },

  async getById(id: number) {
    try {
      const response = await api.get(`${apiConfig.endpoints.usuarios}/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      throw error
    }
  },

  async create(usuarioData: any) {
    try {
      const response = await api.post(apiConfig.endpoints.usuarios, usuarioData)
      return response.data.data
    } catch (error) {
      console.error('Error al crear usuario:', error)
      throw error
    }
  },

  async update(id: number, usuarioData: any) {
    try {
      const response = await api.put(`${apiConfig.endpoints.usuarios}/${id}`, usuarioData)
      return response.data.data
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      throw error
    }
  },

  async cambiarEstado(id: number, estado: string) {
    try {
      const response = await api.patch(`${apiConfig.endpoints.usuarios}/${id}/estado`, { estado })
      return response.data.data
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error)
      throw error
    }
  }
} 