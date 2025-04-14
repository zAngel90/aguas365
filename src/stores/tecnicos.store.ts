import { defineStore } from 'pinia';
import { tecnicosService } from '@/services/tecnicos.service';
import type { Tecnico, TecnicoFormData } from '@/interfaces/tecnico.interface';

interface TecnicosState {
  tecnicos: Tecnico[];
  loading: boolean;
  error: string | null;
  selectedTecnico: Tecnico | null;
}

export const useTecnicosStore = defineStore('tecnicos', {
  state: (): TecnicosState => ({
    tecnicos: [],
    loading: false,
    error: null,
    selectedTecnico: null
  }),

  getters: {
    getTecnicoById: (state) => (id: number) => {
      return state.tecnicos.find(tecnico => tecnico.id === id);
    },
    getTecnicos: (state) => state.tecnicos,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async fetchTecnicos() {
      this.loading = true;
      this.error = null;
      try {
        const tecnicos = await tecnicosService.getAll();
        this.tecnicos = tecnicos;
      } catch (error) {
        console.error('Error fetching technicians:', error);
        this.error = 'Error al cargar los técnicos';
      } finally {
        this.loading = false;
      }
    },

    async fetchTecnico(id: number) {
      this.loading = true;
      this.error = null;
      try {
        this.selectedTecnico = await tecnicosService.getById(id);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar técnico';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTecnico(tecnico: Omit<Tecnico, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const newTecnico = await tecnicosService.create(tecnico);
        this.tecnicos.push(newTecnico);
        return newTecnico;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear técnico';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTecnico(id: number, tecnicoData: Partial<Tecnico>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedTecnico = await tecnicosService.update(id, tecnicoData);
        const index = this.tecnicos.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tecnicos[index] = updatedTecnico;
        }
        if (this.selectedTecnico?.id === id) {
          this.selectedTecnico = updatedTecnico;
        }
        return updatedTecnico;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar técnico';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTecnico(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await tecnicosService.delete(id);
        this.tecnicos = this.tecnicos.filter(tecnico => tecnico.id !== id);
        if (this.selectedTecnico?.id === id) {
          this.selectedTecnico = null;
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar técnico';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cambiarDisponibilidad(id: number, disponibilidad: 'disponible' | 'ocupado' | 'vacaciones') {
      this.loading = true;
      this.error = null;
      try {
        const updatedTecnico = await tecnicosService.cambiarDisponibilidad(id, disponibilidad);
        const index = this.tecnicos.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tecnicos[index] = updatedTecnico;
        }
        if (this.selectedTecnico?.id === id) {
          this.selectedTecnico = updatedTecnico;
        }
        return updatedTecnico;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cambiar disponibilidad';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async enviarWhatsApp(id: number, mensaje: string) {
      this.loading = true;
      this.error = null;
      try {
        await tecnicosService.enviarWhatsApp(id, mensaje);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al enviar mensaje de WhatsApp';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 