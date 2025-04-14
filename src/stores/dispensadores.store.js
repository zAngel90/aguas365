import { defineStore } from 'pinia';
import api from '@/services/api';

export const useDispensadoresStore = defineStore('dispensadores', {
  state: () => ({
    dispensadores: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchDispensadores() {
      this.loading = true;
      try {
        const response = await api.get('/dispensadores');
        this.dispensadores = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchDispensadoresByCliente(clienteId) {
      this.loading = true;
      try {
        const response = await api.get(`/dispensadores/cliente/${clienteId}`);
        this.dispensadores = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchDispensadoresBySucursal(sucursalId) {
      this.loading = true;
      try {
        const response = await api.get(`/dispensadores/sucursal/${sucursalId}`);
        this.dispensadores = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createDispensador(dispensadorData) {
      this.loading = true;
      try {
        const response = await api.post('/dispensadores', dispensadorData);
        this.dispensadores.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateDispensador(id, dispensadorData) {
      this.loading = true;
      try {
        const response = await api.put(`/dispensadores/${id}`, dispensadorData);
        const index = this.dispensadores.findIndex(d => d.id === id);
        if (index !== -1) {
          this.dispensadores[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteDispensador(id) {
      this.loading = true;
      try {
        await api.delete(`/dispensadores/${id}`);
        this.dispensadores = this.dispensadores.filter(d => d.id !== id);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 