<template>
  <div class="home-container">
    <h1>Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <i class="fas fa-users stat-icon"></i>
        <div class="stat-info">
          <h3>Total Clientes</h3>
          <p class="stat-value">{{ stats.clientes || 0 }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-tint stat-icon"></i>
        <div class="stat-info">
          <h3>Dispensadores Activos</h3>
          <p class="stat-value">{{ stats.dispensadores || 0 }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-tools stat-icon"></i>
        <div class="stat-info">
          <h3>Mantenimientos Pendientes</h3>
          <p class="stat-value">{{ stats.mantenimientos || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const stats = ref({
  clientes: 0,
  dispensadores: 0,
  mantenimientos: 0
});

const loadStats = async () => {
  try {
    const [clientesRes, dispensadoresRes, mantenimientosRes] = await Promise.all([
      api.get('/clientes'),
      api.get('/dispensadores'),
      api.get('/mantenimientos')
    ]);

    stats.value = {
      clientes: Array.isArray(clientesRes.data) ? clientesRes.data.length : 0,
      dispensadores: Array.isArray(dispensadoresRes.data) ? dispensadoresRes.data.filter(d => d.estado === 'activo').length : 0,
      mantenimientos: Array.isArray(mantenimientosRes.data) ? mantenimientosRes.data.filter(m => m.estado === 'pendiente').length : 0
    };
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.home-container {
  padding: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  color: #3498db;
}

.stat-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #666;
}

.stat-value {
  margin: 0.5rem 0 0;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}
</style> 