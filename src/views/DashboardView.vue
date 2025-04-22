<template>
  <div>
    <div class="page-header">
      <div class="user-info">
        <i class="fas fa-user-circle user-icon"></i>
        <span>Administrador</span>
      </div>
      <div class="header-actions">
        <h1>Dashboard</h1>
        <button @click="loadStats" class="refresh-btn">
          <i class="fas fa-sync-alt"></i> Actualizar
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando estadísticas...
    </div>

    <div v-else class="stats-grid">
      <StatCard title="Total Clientes" :value="stats.clientes" />
      <StatCard title="Dispensadores Activos" :value="stats.dispensadores" />
      <StatCard title="Mantenimientos Pendientes" :value="stats.mantenimientos" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import api from '@/services/api'

const loading = ref(false)
const stats = ref({
  clientes: 0,
  dispensadores: 0,
  mantenimientos: 0
})

const loadStats = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/dashboard/stats')
    console.log('Estadísticas recibidas del dashboard:', data)
    stats.value = {
      clientes: data.clientes || 0,
      dispensadores: data.dispensadores || 0,
      mantenimientos: data.mantenimientos || 0
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    stats.value = {
      clientes: 0,
      dispensadores: 0,
      mantenimientos: 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.user-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background: var(--primary-color-dark);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

h1 {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin: 0;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i {
  margin-right: 0.5rem;
}
</style> 