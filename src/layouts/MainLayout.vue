<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <img 
          src="https://i.postimg.cc/15X3txx1/Captura-de-pantalla-2025-04-10-211230.png" 
          alt="AquaTrack Logo" 
          class="logo"
        >
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <i class="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </router-link>
        
        <router-link to="/clientes" class="nav-item" :class="{ active: $route.path === '/clientes' }">
          <i class="fas fa-users"></i>
          <span>Clientes</span>
        </router-link>
        
        <router-link to="/dispensadores" class="nav-item" :class="{ active: $route.path === '/dispensadores' }">
          <i class="fas fa-tint"></i>
          <span>Dispensadores</span>
        </router-link>
        
        <router-link to="/mantenimientos" class="nav-item" :class="{ active: $route.path === '/mantenimientos' }">
          <i class="fas fa-tools"></i>
          <span>Mantenimientos</span>
        </router-link>
        
        <router-link to="/calendario" class="nav-item" :class="{ active: $route.path === '/calendario' }">
          <i class="fas fa-calendar-alt"></i>
          <span>Calendario</span>
        </router-link>
        
        <router-link to="/historial-mantenimientos" class="nav-item" :class="{ active: $route.path === '/historial-mantenimientos' }">
          <i class="fas fa-history"></i>
          <span>Historial</span>
        </router-link>
        
        <router-link to="/tecnicos" class="nav-item" :class="{ active: $route.path === '/tecnicos' }">
          <i class="fas fa-user-cog"></i>
          <span>Técnicos</span>
        </router-link>
        
        <router-link to="/usuarios" class="nav-item" :class="{ active: $route.path === '/usuarios' }">
          <i class="fas fa-users-cog"></i>
          <span>Usuarios</span>
        </router-link>
        
        <router-link to="/reportes" class="nav-item" :class="{ active: $route.path === '/reportes' }">
          <i class="fas fa-chart-bar"></i>
          <span>Reportes</span>
        </router-link>

        <router-link to="/importar-excel" class="nav-item" :class="{ active: $route.path === '/importar-excel' }">
          <i class="fas fa-file-excel"></i>
          <span>Importar Excel</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <div class="content-header">
        <h2 class="page-title">{{ pageTitle }}</h2>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <i class="fas fa-user-circle"></i>
        </div>
      </div>
      <div class="content-body">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const route = useRoute();

const userName = computed(() => authStore.user?.username || 'Usuario');

const pageTitle = computed(() => {
  switch (route.path) {
    case '/': return 'Dashboard';
    case '/clientes': return 'Gestión de Clientes';
    case '/dispensadores': return 'Gestión de Dispensadores';
    case '/mantenimientos': return 'Gestión de Mantenimientos';
    case '/calendario': return 'Calendario de Mantenimientos';
    case '/historial-mantenimientos': return 'Historial de Mantenimientos';
    case '/tecnicos': return 'Gestión de Técnicos';
    case '/usuarios': return 'Gestión de Usuarios';
    case '/reportes': return 'Reportes';
    case '/importar-excel': return 'Importar Excel';
    default: return '';
  }
});

const logout = () => {
  authStore.logout();
};
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.sidebar {
  width: 260px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  max-width: 200px;
  height: auto;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background-color: #3498db;
  color: white;
}

.nav-item i {
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  color: #2c3e50;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2c3e50;
}

.user-name {
  font-weight: 500;
}

.user-info i {
  font-size: 1.5rem;
}

.content-body {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}
</style> 