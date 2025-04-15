<template>
  <div class="historial-mantenimientos-container">
    <div class="page-header">
      <h1>Historial de Mantenimientos</h1>
      <div class="filters">
        <div class="filter-group">
          <label>Cliente:</label>
          <select v-model="filtroCliente" class="filter-select">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Estado:</label>
          <select v-model="filtroEstado" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="completado">Completados</option>
            <option value="en_proceso">En Proceso</option>
            <option value="pendiente">Pendientes</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tipo:</label>
          <select v-model="filtroTipo" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando historial...
    </div>
    
    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>
    
    <div v-else-if="!mantenimientosFiltrados.length" class="empty-state">
      <i class="fas fa-tools"></i>
      <p>No hay mantenimientos que coincidan con los filtros seleccionados</p>
    </div>
    
    <div v-else class="mantenimientos-grid">
      <div v-for="mantenimiento in mantenimientosFiltrados" :key="mantenimiento.id" class="mantenimiento-card">
        <div class="card-header" :class="mantenimiento.estado">
          <div class="header-info">
            <h3>{{ mantenimiento.dispensador?.modelo || 'Sin modelo' }}</h3>
            <span class="serial">#{{ mantenimiento.dispensador?.numero_serie }}</span>
          </div>
          <span class="estado" :class="mantenimiento.estado">
            {{ formatEstado(mantenimiento.estado) }}
          </span>
        </div>

        <div class="card-content">
          <div class="info-item">
            <i class="fas fa-building"></i>
            <div class="info-text">
              <strong>{{ mantenimiento.cliente?.nombre || 'Sin cliente asignado' }}</strong>
              <span>{{ mantenimiento.sucursal?.nombre || 'Sin sucursal asignada' }}</span>
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-user-tie"></i>
            <div class="info-text">
              <span>Técnico: {{ mantenimiento.tecnico?.nombre || 'No asignado' }}</span>
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-calendar-alt"></i>
            <div class="info-text">
              <span>Programado: {{ formatDate(mantenimiento.fechaProgramada) }}</span>
              <span v-if="mantenimiento.fechaRealizada" class="fecha-realizada">
                Realizado: {{ formatDate(mantenimiento.fechaRealizada) }}
              </span>
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-info-circle"></i>
            <div class="info-text">
              <span class="tipo" :class="mantenimiento.tipo">{{ formatTipo(mantenimiento.tipo) }}</span>
              <span v-if="mantenimiento.descripcion">{{ mantenimiento.descripcion }}</span>
            </div>
          </div>

          <div v-if="mantenimiento.observaciones" class="info-item observaciones">
            <i class="fas fa-sticky-note"></i>
            <div class="info-text">
              <span>{{ mantenimiento.observaciones }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useMantenimientosStore } from '@/stores/mantenimientos.store'
import { useClientesStore } from '@/stores/clientes.store'
import { storeToRefs } from 'pinia'
import type { Mantenimiento } from '@/interfaces/mantenimiento.interface'

const mantenimientosStore = useMantenimientosStore()
const clientesStore = useClientesStore()
const { mantenimientos, loading, error } = storeToRefs(mantenimientosStore)
const { clientes } = storeToRefs(clientesStore)

const filtroEstado = ref('')
const filtroTipo = ref('')
const filtroCliente = ref('')

const mantenimientosFiltrados = computed(() => {
  let resultado = mantenimientos.value || []
  
  if (filtroEstado.value) {
    resultado = resultado.filter(m => m.estado === filtroEstado.value)
  }
  
  if (filtroTipo.value) {
    resultado = resultado.filter(m => m.tipo === filtroTipo.value)
  }

  if (filtroCliente.value) {
    resultado = resultado.filter(m => m.cliente?.id === Number(filtroCliente.value))
  }
  
  // Ordenar por fecha de realización (más reciente primero)
  return resultado.sort((a, b) => {
    const fechaA = a.fechaRealizada || a.fechaProgramada
    const fechaB = b.fechaRealizada || b.fechaProgramada
    return new Date(fechaB).getTime() - new Date(fechaA).getTime()
  })
})

onMounted(async () => {
  try {
    await Promise.all([
      mantenimientosStore.fetchMantenimientos(),
      clientesStore.fetchClientes()
    ])
  } catch (error) {
    console.error('Error al cargar datos:', error)
  }
})

const formatDate = (date: string) => {
  if (!date) return 'Fecha no especificada'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatEstado = (estado: string) => {
  const estados = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    completado: 'Completado',
    cancelado: 'Cancelado'
  }
  return estados[estado] || estado
}

const formatTipo = (tipo: string) => {
  const tipos = {
    preventivo: 'Preventivo',
    correctivo: 'Correctivo',
    emergencia: 'Emergencia'
  }
  return tipos[tipo] || tipo
}
</script>

<style scoped>
.historial-mantenimientos-container {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header h1 {
  color: var(--primary-color);
  margin: 0;
  font-size: 1.8rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 200px;
  background-color: white;
}

.filter-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.mantenimientos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.mantenimiento-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mantenimiento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.card-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header.pendiente { background: #FFF3E0; }
.card-header.en_proceso { background: #E3F2FD; }
.card-header.completado { background: #E8F5E9; }
.card-header.cancelado { background: #FFEBEE; }

.header-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--primary-color);
}

.serial {
  font-size: 0.9rem;
  color: #666;
}

.estado {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.estado.pendiente { background: #FFA726; color: white; }
.estado.en_proceso { background: #42A5F5; color: white; }
.estado.completado { background: #66BB6A; color: white; }
.estado.cancelado { background: #EF5350; color: white; }

.card-content {
  padding: 1rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item i {
  color: #666;
  width: 20px;
  text-align: center;
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fecha-realizada {
  color: #4CAF50;
  font-weight: 500;
}

.tipo {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tipo.preventivo { background: #E8F5E9; color: #2E7D32; }
.tipo.correctivo { background: #FFF3E0; color: #F57C00; }
.tipo.emergencia { background: #FFEBEE; color: #C62828; }

.observaciones {
  background: #f9f9f9;
  margin: 0.5rem -1rem -1rem;
  padding: 1rem;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i, .error i, .empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error {
  color: #EF5350;
}
</style> 