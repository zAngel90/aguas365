import { defineStore } from 'pinia';
import { dispensadoresService } from '@/services/dispensadores.service';
import type { Dispensador } from '@/interfaces/dispensador.interface';

interface DispensadoresState {
  dispensadores: Dispensador[];
  loading: boolean;
  error: string | null;
  selectedDispensador: Dispensador | null;
}

export const useDispensadoresStore = defineStore('dispensadores', {
  state: (): DispensadoresState => ({
    dispensadores: [],
    loading: false,
    error: null,
    selectedDispensador: null
  }),

  getters: {
    getDispensadores: (state) => state.dispensadores,
    getLoading: (state): boolean => state.loading,
    getError: (state): string | null => state.error,
    getSelectedDispensador: (state): Dispensador | null => state.selectedDispensador,
    getDispensadoresByCliente: (state) => (clienteId: number): Dispensador[] => {
      return state.dispensadores.filter(d => d.cliente_id === clienteId);
    },
    getDispensadoresBySucursal: (state) => (sucursalId: number): Dispensador[] => {
      return state.dispensadores.filter(d => d.sucursal_id === sucursalId);
    }
  },

  actions: {
    async fetchDispensadores() {
      this.loading = true;
      this.error = null;
      try {
        const dispensadores = await dispensadoresService.getAll();
        console.log('Dispensadores recibidos:', dispensadores);
        this.dispensadores = dispensadores;
      } catch (error) {
        console.error('Error fetching dispensadores:', error);
        this.error = 'Error al cargar los dispensadores';
        this.dispensadores = [];
      } finally {
        this.loading = false;
      }
    },

    async createDispensador(dispensador: Partial<Dispensador>) {
      this.loading = true;
      this.error = null;
      try {
        const newDispensador = await dispensadoresService.create(dispensador);
        this.dispensadores = [...this.dispensadores, newDispensador];
        return newDispensador;
      } catch (error) {
        console.error('Error creating dispensador:', error);
        this.error = 'Error al crear el dispensador';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateDispensador(id: number, dispensador: Partial<Dispensador>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedDispensador = await dispensadoresService.update(id, dispensador);
        const index = this.dispensadores.findIndex(d => d.id === id);
        if (index !== -1) {
          this.dispensadores = [
            ...this.dispensadores.slice(0, index),
            updatedDispensador,
            ...this.dispensadores.slice(index + 1)
          ];
        }
        return updatedDispensador;
      } catch (error) {
        console.error('Error updating dispensador:', error);
        this.error = 'Error al actualizar el dispensador';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteDispensador(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await dispensadoresService.delete(id);
        this.dispensadores = this.dispensadores.filter(d => d.id !== id);
      } catch (error) {
        console.error('Error deleting dispensador:', error);
        this.error = 'Error al eliminar el dispensador';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setSelectedDispensador(dispensador: Dispensador | null) {
      this.selectedDispensador = dispensador;
    }
  }
}); 