import { defineStore } from 'pinia';
import api from '@/services/api';

export const useClientesStore = defineStore('clientes', {
  state: () => ({
    clientes: [],
    sucursales: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchClientes() {
      this.loading = true;
      try {
        const response = await api.get('/clientes');
        this.clientes = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchSucursales(clienteId) {
      this.loading = true;
      try {
        const response = await api.get(`/sucursales/cliente/${clienteId}`);
        this.sucursales = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createCliente(clienteData) {
      this.loading = true;
      try {
        const response = await api.post('/clientes', clienteData);
        this.clientes.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCliente(id, clienteData) {
      this.loading = true;
      try {
        const response = await api.put(`/clientes/${id}`, clienteData);
        const index = this.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
          this.clientes[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCliente(id) {
      this.loading = true;
      try {
        await api.delete(`/clientes/${id}`);
        this.clientes = this.clientes.filter(c => c.id !== id);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createSucursal(sucursalData) {
      this.loading = true;
      try {
        const response = await api.post('/sucursales', sucursalData);
        this.sucursales.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSucursal(id, sucursalData) {
      this.loading = true;
      try {
        const response = await api.put(`/sucursales/${id}`, sucursalData);
        const index = this.sucursales.findIndex(s => s.id === id);
        if (index !== -1) {
          this.sucursales[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteSucursal(id) {
      this.loading = true;
      try {
        await api.delete(`/sucursales/${id}`);
        this.sucursales = this.sucursales.filter(s => s.id !== id);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 