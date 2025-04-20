import api from './api';
import { apiConfig } from '@/config/api.config';

interface ReportData {
  mes: string;
  cantidad: number;
}

interface ClienteDispensadores {
  cliente: string;
  cantidad: number;
}

interface SendReportData {
  clienteId: number;
  email: string;
  subject: string;
  message: string;
}

interface SendReportResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const reportesService = {
  async getMantenimientosPendientes(): Promise<ReportData[]> {
    try {
      const response = await api.get(apiConfig.endpoints.reportes + '/mantenimientos-pendientes');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener mantenimientos pendientes:', error);
      throw error;
    }
  },

  async getDispensadoresPorCliente(): Promise<ClienteDispensadores[]> {
    try {
      console.log('Llamando al endpoint de dispensadores por cliente');
      const response = await api.get(apiConfig.endpoints.reportes + '/dispensadores-por-cliente');
      console.log('Respuesta del servidor:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener dispensadores por cliente:', error);
      throw error;
    }
  },

  async sendReport(reportData: SendReportData): Promise<SendReportResponse> {
    try {
      const response = await api.post(apiConfig.endpoints.reportes + '/send-email', reportData);
      return response.data;
    } catch (error: any) {
      console.error('Error al enviar reporte:', error);
      throw error.response?.data || { 
        success: false, 
        message: 'Error al enviar el reporte',
        error: error.message 
      };
    }
  }
}; 