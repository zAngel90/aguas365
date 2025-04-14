import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { reportesService } from '@/services/reportes.service'

interface ReportData {
  mes: string
  cantidad: number
}

interface ClienteDispensadores {
  cliente: string
  cantidad: number
}

interface SendReportData {
  clienteId: number
  email: string
  subject: string
  message: string
}

export const useReportesStore = defineStore('reportes', {
  state: () => ({
    mantenimientosPendientes: ref<ReportData[]>([]),
    dispensadoresPorCliente: ref<ClienteDispensadores[]>([]),
    loading: ref(false),
    error: ref<string | null>(null)
  }),

  actions: {
    async fetchMantenimientosPendientes() {
      this.loading = true
      this.error = null
      try {
        const data = await reportesService.getMantenimientosPendientes()
        this.mantenimientosPendientes = data
      } catch (error) {
        console.error('Error al obtener mantenimientos pendientes:', error)
        this.error = 'Error al cargar los datos de mantenimientos'
      } finally {
        this.loading = false
      }
    },

    async fetchDispensadoresPorCliente() {
      this.loading = true
      this.error = null
      try {
        const data = await reportesService.getDispensadoresPorCliente()
        this.dispensadoresPorCliente = data
      } catch (error) {
        console.error('Error al obtener dispensadores por cliente:', error)
        this.error = 'Error al cargar los datos de dispensadores'
      } finally {
        this.loading = false
      }
    },

    async sendReport(reportData: SendReportData) {
      this.loading = true
      this.error = null
      try {
        const response = await reportesService.sendReport(reportData)
        return response
      } catch (error: any) {
        console.error('Error al enviar reporte:', error)
        this.error = error.message || 'Error al enviar el reporte'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 