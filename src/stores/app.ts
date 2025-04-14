import { defineStore } from 'pinia'

interface Cliente {
  id: number
  nombre: string
  tipo: string
  dispensadores: number
}

interface Dispensador {
  id: number
  cliente: string
  ubicacion: string
  ultimoMantenimiento: string
  proximoMantenimiento: string
}

interface Mantenimiento {
  id: number
  dispensador: string
  fecha: string
  tipo: string
  tecnico: string
  estado: string
}

export const useAppStore = defineStore('app', {
  state: () => ({
    clientes: [] as Cliente[],
    dispensadores: [] as Dispensador[],
    mantenimientos: [] as Mantenimiento[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    totalClientes: (state) => state.clientes.length,
    totalDispensadores: (state) => state.dispensadores.length,
    mantenimientosPendientes: (state) => 
      state.mantenimientos.filter(m => m.estado === 'pendiente').length,
    proximosMantenimientos: (state) => 
      state.mantenimientos.filter(m => m.estado === 'en-progreso').length
  },

  actions: {
    async fetchClientes() {
      this.loading = true
      try {
        // Aquí irá la llamada a la API cuando la tengamos
        this.clientes = []
      } catch (error) {
        this.error = 'Error al cargar los clientes'
      } finally {
        this.loading = false
      }
    },

    async fetchDispensadores() {
      this.loading = true
      try {
        // Aquí irá la llamada a la API cuando la tengamos
        this.dispensadores = []
      } catch (error) {
        this.error = 'Error al cargar los dispensadores'
      } finally {
        this.loading = false
      }
    },

    async fetchMantenimientos() {
      this.loading = true
      try {
        // Aquí irá la llamada a la API cuando la tengamos
        this.mantenimientos = []
      } catch (error) {
        this.error = 'Error al cargar los mantenimientos'
      } finally {
        this.loading = false
      }
    },

    addCliente(cliente: Omit<Cliente, 'id'>) {
      const newId = Math.max(...this.clientes.map(c => c.id), 0) + 1
      this.clientes.push({ ...cliente, id: newId })
    },

    updateCliente(cliente: Cliente) {
      const index = this.clientes.findIndex(c => c.id === cliente.id)
      if (index !== -1) {
        this.clientes[index] = cliente
      }
    },

    deleteCliente(id: number) {
      this.clientes = this.clientes.filter(c => c.id !== id)
    },

    addDispensador(dispensador: Omit<Dispensador, 'id'>) {
      const newId = Math.max(...this.dispensadores.map(d => d.id), 0) + 1
      this.dispensadores.push({ ...dispensador, id: newId })
    },

    updateDispensador(dispensador: Dispensador) {
      const index = this.dispensadores.findIndex(d => d.id === dispensador.id)
      if (index !== -1) {
        this.dispensadores[index] = dispensador
      }
    },

    deleteDispensador(id: number) {
      this.dispensadores = this.dispensadores.filter(d => d.id !== id)
    },

    addMantenimiento(mantenimiento: Omit<Mantenimiento, 'id'>) {
      const newId = Math.max(...this.mantenimientos.map(m => m.id), 0) + 1
      this.mantenimientos.push({ ...mantenimiento, id: newId })
    },

    updateMantenimiento(mantenimiento: Mantenimiento) {
      const index = this.mantenimientos.findIndex(m => m.id === mantenimiento.id)
      if (index !== -1) {
        this.mantenimientos[index] = mantenimiento
      }
    },

    deleteMantenimiento(id: number) {
      this.mantenimientos = this.mantenimientos.filter(m => m.id !== id)
    }
  }
}) 