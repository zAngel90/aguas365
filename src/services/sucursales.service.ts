import api from './api'
import { apiConfig } from '@/config/api.config'

export interface Sucursal {
  id?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email?: string;
  nif: string;
  cliente_id: number;
  created_at?: string;
  updated_at?: string;
}

export const sucursalesService = {
  async getAll() {
    try {
      const response = await api.get(apiConfig.endpoints.sucursales)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener sucursales:', error)
      throw error
    }
  },

  async getById(id: number) {
    try {
      const response = await api.get(`${apiConfig.endpoints.sucursales}/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener sucursal:', error)
      throw error
    }
  },

  async getByCliente(clienteId: number) {
    try {
      const response = await api.get(`${apiConfig.endpoints.sucursales}/cliente/${clienteId}`)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener sucursales por cliente:', error)
      throw error
    }
  },

  async create(sucursalData: any) {
    try {
      const response = await api.post(apiConfig.endpoints.sucursales, sucursalData)
      return response.data.data
    } catch (error) {
      console.error('Error al crear sucursal:', error)
      throw error
    }
  },

  async update(id: number, sucursalData: any) {
    try {
      const response = await api.put(`${apiConfig.endpoints.sucursales}/${id}`, sucursalData)
      return response.data.data
    } catch (error) {
      console.error('Error al actualizar sucursal:', error)
      throw error
    }
  },

  async delete(id: number) {
    try {
      const response = await api.delete(`${apiConfig.endpoints.sucursales}/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error al eliminar sucursal:', error)
      throw error
    }
  }
} 