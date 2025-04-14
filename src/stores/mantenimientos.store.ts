import { defineStore } from 'pinia';
import { mantenimientosService } from '@/services/mantenimientos.service';
import type { Mantenimiento } from '@/interfaces/mantenimiento.interface';

export const useMantenimientosStore = defineStore('mantenimientos', {
  state: () => ({
    mantenimientos: [] as Mantenimiento[],
    currentMantenimiento: null as Mantenimiento | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    getMantenimientoById: (state) => (id: number) => {
      return state.mantenimientos.find(mantenimiento => mantenimiento.id === id);
    },
    getMantenimientosByDispensador: (state) => (dispensadorId: number) => {
      return state.mantenimientos.filter(m => m.dispensadorId === dispensadorId);
    }
  },

  actions: {
    async fetchMantenimientos() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Iniciando carga de mantenimientos...');
        const mantenimientos = await mantenimientosService.getAll();
        console.log('Mantenimientos recibidos:', mantenimientos);
        this.mantenimientos = mantenimientos;
      } catch (error) {
        console.error('Error al cargar mantenimientos:', error);
        this.error = 'Error al cargar el historial de mantenimientos';
      } finally {
        this.loading = false;
      }
    },

    async fetchMantenimiento(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const mantenimiento = await mantenimientosService.getById(id);
        this.currentMantenimiento = mantenimiento;
        return mantenimiento;
      } catch (error: any) {
        console.error('Error al cargar mantenimiento:', error);
        this.error = error.response?.data?.message || 'Error al cargar mantenimiento';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createMantenimiento(mantenimientoData: Partial<Mantenimiento>) {
      this.loading = true;
      this.error = null;
      try {
        const mantenimiento = await mantenimientosService.create(mantenimientoData);
        this.mantenimientos.push(mantenimiento);
        return mantenimiento;
      } catch (error: any) {
        console.error('Error al crear mantenimiento:', error);
        this.error = error.response?.data?.message || 'Error al crear mantenimiento';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateMantenimiento(id: number, mantenimientoData: Partial<Mantenimiento>) {
      this.loading = true;
      this.error = null;
      try {
        const mantenimiento = await mantenimientosService.update(id, mantenimientoData);
        const index = this.mantenimientos.findIndex(m => m.id === id);
        if (index !== -1) {
          this.mantenimientos[index] = mantenimiento;
        }
        return mantenimiento;
      } catch (error: any) {
        console.error('Error al actualizar mantenimiento:', error);
        this.error = error.response?.data?.message || 'Error al actualizar mantenimiento';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteMantenimiento(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await mantenimientosService.delete(id);
        this.mantenimientos = this.mantenimientos.filter(m => m.id !== id);
      } catch (error: any) {
        console.error('Error al eliminar mantenimiento:', error);
        this.error = error.response?.data?.message || 'Error al eliminar mantenimiento';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMantenimientosByCliente(clienteId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await mantenimientosService.getByCliente(clienteId);
        this.mantenimientos = response;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar mantenimientos del cliente';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMantenimientosBySucursal(sucursalId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await mantenimientosService.getBySucursal(sucursalId);
        this.mantenimientos = response;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar mantenimientos de la sucursal';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMantenimientosByTecnico(tecnicoId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await mantenimientosService.getByTecnico(tecnicoId);
        this.mantenimientos = response;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar mantenimientos del técnico';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 