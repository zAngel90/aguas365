import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { authService, type User, type LoginCredentials, type RegisterData } from '@/services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data); // Para debug
      
      // La respuesta viene directamente en data
      const { token: authToken, user: userData } = response.data;
      
      if (!authToken || !userData) {
        throw new Error('Respuesta de login inválida');
      }

      token.value = authToken;
      user.value = userData;
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Forzar la recarga de la página después de la redirección
      await router.push('/');
      window.location.reload();
    } catch (err: any) {
      console.error('Error en login:', err); // Para debug
      error.value = err.response?.data?.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData) => {
    try {
      loading.value = true;
      error.value = null;
      await authService.register(userData);
    } catch (error: any) {
      error.value = error.response?.data?.message || 'Error al registrar usuario';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      loading.value = true;
      error.value = null;
      user.value = await authService.updateProfile(userData);
    } catch (error: any) {
      error.value = error.response?.data?.message || 'Error al actualizar perfil';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      loading.value = true;
      error.value = null;
      await authService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      error.value = error.response?.data?.message || 'Error al cambiar contraseña';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    checkAuth,
    register,
    updateProfile,
    changePassword
  };
}); 