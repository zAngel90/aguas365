// Configuración de la API
export const API_BASE_URL = 'https://backend56.onrender.com/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      verify: '/auth/verify'
    },
    clientes: '/clientes',
    dispensadores: '/dispensadores',
    mantenimientos: '/mantenimientos',
    sucursales: '/sucursales',
    tecnicos: '/tecnicos',
    usuarios: '/usuarios',
    reportes: '/reportes'
  }
}

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
} 