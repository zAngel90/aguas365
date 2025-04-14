<template>
  <div>
    <div class="page-header">
      <div class="user-info">
        <i class="fas fa-user-circle user-icon"></i>
        <span>Administrador</span>
      </div>
      <h1>Dashboard</h1>
    </div>

    <div class="stats-grid">
      <StatCard title="Total Clientes" :value="totalClientes" />
      <StatCard title="Total Dispensadores" :value="totalDispensadores" />
      <StatCard title="Mantenimientos Pendientes" :value="mantenimientosPendientes" />
      <StatCard title="Próximos Mantenimientos" :value="proximosMantenimientos" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatCard from '@/components/dashboard/StatCard.vue'

const totalClientes = ref(0)
const totalDispensadores = ref(0)
const mantenimientosPendientes = ref(0)
const proximosMantenimientos = ref(0)
</script>

<style scoped>
.user-icon {
  font-size: 2rem;
  color: var(--primary-color);
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
</style> 