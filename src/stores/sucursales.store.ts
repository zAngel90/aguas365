import { defineStore } from 'pinia'
import type { Sucursal } from '@/interfaces/sucursal.interface'
import api from '@/services/api'

const API_URL = '/sucursales'

interface State {
  sucursales: Sucursal[]
  loading: boolean
  error: string | null
}

export const useSucursalesStore = defineStore('sucursales', {
  state: (): State => ({
    sucursales: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchSucursales() {
      this.loading = true
      try {
        const response = await api.get(API_URL)
        this.sucursales = response.data
        this.error = null
      } catch (error) {
        console.error('Error al obtener sucursales:', error)
        this.error = 'Error al cargar las sucursales'
      } finally {
        this.loading = false
      }
    },

    async createSucursal(sucursal: Omit<Sucursal, 'id'>) {
      this.loading = true
      try {
        const response = await api.post(API_URL, sucursal)
        this.sucursales.push(response.data)
        this.error = null
        return response.data
      } catch (error) {
        console.error('Error al crear sucursal:', error)
        this.error = 'Error al crear la sucursal'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateSucursal(id: number, sucursal: Partial<Sucursal>) {
      this.loading = true
      try {
        const response = await api.put(`${API_URL}/${id}`, sucursal)
        const index = this.sucursales.findIndex(s => s.id === id)
        if (index !== -1) {
          this.sucursales[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error) {
        console.error('Error al actualizar sucursal:', error)
        this.error = 'Error al actualizar la sucursal'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteSucursal(id: number) {
      this.loading = true
      try {
        await api.delete(`${API_URL}/${id}`)
        this.sucursales = this.sucursales.filter(s => s.id !== id)
        this.error = null
      } catch (error) {
        console.error('Error al eliminar sucursal:', error)
        this.error = 'Error al eliminar la sucursal'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 