<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            placeholder="Ingrese su email"
          >
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            placeholder="Ingrese su contraseña"
          >
        </div>
        <div class="form-group">
          <div class="captcha-box" @click="verifyCaptcha" :class="{ 'verifying': isVerifying, 'verified': form.notRobot }">
            <div class="captcha-checkbox" :class="{ 'checked': form.notRobot }">
              <i v-if="form.notRobot" class="fas fa-check"></i>
              <div v-if="isVerifying" class="spinner"></div>
            </div>
            <span>No soy un robot</span>
            <div class="captcha-logo">
              <i class="fas fa-shield-alt"></i>
              <span>AquaTrack Protect</span>
            </div>
          </div>
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button 
          type="submit" 
          class="btn-primary" 
          :disabled="loading || !form.notRobot"
        >
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const form = ref({
  email: '',
  password: '',
  notRobot: false
})

const isVerifying = ref(false)

onMounted(() => {
  // Si ya está autenticado, redirigir al dashboard
  if (authStore.checkAuth()) {
    router.push('/')
  }
})

const verifyCaptcha = async () => {
  if (form.value.notRobot || isVerifying.value) return
  
  isVerifying.value = true
  
  // Simulamos la verificación
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  form.value.notRobot = true
  isVerifying.value = false
}

const handleLogin = async () => {
  if (!form.value.notRobot) {
    return
  }
  
  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password
    })
    // La redirección se maneja en el store
  } catch (err) {
    console.error('Error en el login:', err)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.captcha-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.captcha-box:hover {
  border-color: #999;
}

.captcha-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.captcha-checkbox.checked {
  background-color: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.captcha-logo {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.8rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.5rem;
  background-color: #fde8e8;
  border-radius: 4px;
}

.btn-primary {
  width: 100%;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.captcha-box.verifying .captcha-checkbox {
  border-color: #3498db;
}

.captcha-box.verified {
  background-color: #f0fff0;
}
</style> 