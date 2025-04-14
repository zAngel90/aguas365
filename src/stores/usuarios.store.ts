import { defineStore } from 'pinia';
import api from '@/services/api';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'tecnico';
}

interface CreateUsuarioDTO {
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'tecnico';
}

export const useUsuariosStore = defineStore('usuarios', {
  state: () => ({
    usuarios: [] as Usuario[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    getUsuarioById: (state) => (id: number) => {
      return state.usuarios.find(usuario => usuario.id === id);
    },
    getUsuariosTecnicos: (state) => {
      return state.usuarios.filter(usuario => usuario.rol === 'tecnico');
    }
  },

  actions: {
    async fetchUsuarios() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/usuarios');
        this.usuarios = response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar usuarios';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createUsuario(usuario: CreateUsuarioDTO) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/usuarios', usuario);
        this.usuarios.push(response.data.data);
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear usuario';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteUsuario(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/usuarios/${id}`);
        this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar usuario';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 