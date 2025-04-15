<template>
  <div class="maintenance-list-container">
    <div class="header">
      <h1>Agenda de Mantenimientos</h1>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label>Cliente</label>
        <select v-model="filters.clienteId">
          <option value="">Todos los clientes</option>
          <option v-for="cliente in uniqueClients" 
                  :key="cliente.id" 
                  :value="cliente.id">
            {{ cliente.nombre }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Sucursal</label>
        <select v-model="filters.sucursalId" 
                :disabled="!filters.clienteId">
          <option value="">Todas las sucursales</option>
          <option v-for="sucursal in filteredBranches" 
                  :key="sucursal.id" 
                  :value="sucursal.id">
            {{ sucursal.nombre }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Tipo</label>
        <select v-model="filters.tipo">
          <option value="">Todos los tipos</option>
          <option value="PREVENTIVO">Preventivo</option>
          <option value="CORRECTIVO">Correctivo</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Estado</label>
        <select v-model="filters.estado">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="COMPLETADO">Completado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <button class="clear-filters" @click="clearFilters">
        <i class="fas fa-times"></i>
        Limpiar filtros
      </button>
    </div>

    <!-- Resumen de filtros activos -->
    <div v-if="hasActiveFilters" class="active-filters">
      <span>Filtros activos:</span>
      <div class="filter-tags">
        <div v-if="filters.clienteId" class="filter-tag">
          Cliente: {{ getClienteName(filters.clienteId) }}
          <button @click="filters.clienteId = ''">×</button>
        </div>
        <div v-if="filters.sucursalId" class="filter-tag">
          Sucursal: {{ getBranchName(filters.sucursalId) }}
          <button @click="filters.sucursalId = ''">×</button>
        </div>
        <div v-if="filters.tipo" class="filter-tag">
          Tipo: {{ filters.tipo }}
          <button @click="filters.tipo = ''">×</button>
        </div>
        <div v-if="filters.estado" class="filter-tag">
          Estado: {{ filters.estado }}
          <button @click="filters.estado = ''">×</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Cargando mantenimientos...</span>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="Object.keys(filteredMaintenances).length === 0" class="no-results">
      <i class="fas fa-search"></i>
      <p>No se encontraron mantenimientos con los filtros seleccionados</p>
    </div>

    <div v-else class="maintenance-groups">
      <div v-for="(group, date) in filteredMaintenances" :key="date" class="date-group">
        <div class="date-header">
          <h2>{{ formatDateHeader(date) }}</h2>
          <span class="count">{{ group.length }} mantenimiento(s)</span>
        </div>

        <div class="maintenance-cards">
          <div 
            v-for="maintenance in group" 
            :key="maintenance.id"
            :class="['maintenance-card', maintenance.tipo.toLowerCase(), maintenance.estado.toLowerCase()]"
            @click="showDetails(maintenance)"
          >
            <div class="time">{{ formatTime(maintenance.fechaProgramada) }}</div>
            <div class="main-info">
              <div class="client">{{ maintenance.cliente?.nombre }}</div>
              <div class="branch">{{ maintenance.sucursal?.nombre }}</div>
            </div>
            <div class="status-badges">
              <span class="type-badge">{{ maintenance.tipo }}</span>
              <span class="status-badge">{{ maintenance.estado }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="selectedMaintenance" class="modal" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalles del Mantenimiento</h3>
          <button @click="closeDetails" class="close-button">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Cliente</label>
              <span>{{ selectedMaintenance.cliente?.nombre }}</span>
            </div>
            <div class="detail-item">
              <label>Sucursal</label>
              <span>{{ selectedMaintenance.sucursal?.nombre }}</span>
            </div>
            <div class="detail-item">
              <label>Fecha y Hora</label>
              <span>{{ formatFullDate(selectedMaintenance.fechaProgramada) }}</span>
            </div>
            <div class="detail-item">
              <label>Tipo</label>
              <span>{{ selectedMaintenance.tipo }}</span>
            </div>
            <div class="detail-item">
              <label>Estado</label>
              <span>{{ selectedMaintenance.estado }}</span>
            </div>
            <div class="detail-item">
              <label>Técnico</label>
              <span>{{ selectedMaintenance.tecnico?.nombre }}</span>
            </div>
            <div class="detail-item">
              <label>Dispensador</label>
              <span>#{{ selectedMaintenance.dispensador?.numero_serie }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMantenimientosStore } from '@/stores/mantenimientos.store'
import { storeToRefs } from 'pinia'
import type { Mantenimiento } from '@/interfaces/mantenimiento.interface'

const store = useMantenimientosStore()
const { mantenimientos, loading, error } = storeToRefs(store)
const selectedMaintenance = ref<Mantenimiento | null>(null)

const filters = ref({
  clienteId: '',
  sucursalId: '',
  tipo: '',
  estado: ''
})

const groupedMaintenances = computed(() => {
  if (!mantenimientos.value) return {}

  const groups: Record<string, Mantenimiento[]> = {}
  
  mantenimientos.value.forEach(maintenance => {
    const date = new Date(maintenance.fechaProgramada).toISOString().split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(maintenance)
  })

  // Ordenar por fecha
  const sortedGroups: Record<string, Mantenimiento[]> = {}
  Object.keys(groups)
    .sort()
    .forEach(date => {
      // Ordenar por hora dentro de cada grupo
      sortedGroups[date] = groups[date].sort((a, b) => 
        new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime()
      )
    })

  return sortedGroups
})

// Obtener clientes únicos de los mantenimientos
const uniqueClients = computed(() => {
  if (!mantenimientos.value) return []
  const clientesMap = new Map()
  mantenimientos.value.forEach(m => {
    if (m.cliente) {
      clientesMap.set(m.cliente.id, m.cliente)
    }
  })
  return Array.from(clientesMap.values())
})

// Obtener sucursales filtradas por cliente seleccionado
const filteredBranches = computed(() => {
  if (!mantenimientos.value || !filters.value.clienteId) return []
  const sucursalesMap = new Map()
  mantenimientos.value
    .filter(m => m.cliente?.id === filters.value.clienteId)
    .forEach(m => {
      if (m.sucursal) {
        sucursalesMap.set(m.sucursal.id, m.sucursal)
      }
    })
  return Array.from(sucursalesMap.values())
})

// Verificar si hay filtros activos
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '')
})

// Mantenimientos filtrados
const filteredMaintenances = computed(() => {
  if (!mantenimientos.value) return {}

  const filtered = mantenimientos.value.filter(m => {
    if (filters.value.clienteId && m.cliente?.id !== filters.value.clienteId) return false
    if (filters.value.sucursalId && m.sucursal?.id !== filters.value.sucursalId) return false
    if (filters.value.tipo && m.tipo !== filters.value.tipo) return false
    if (filters.value.estado && m.estado !== filters.value.estado) return false
    return true
  })

  const groups: Record<string, Mantenimiento[]> = {}
  filtered.forEach(maintenance => {
    const date = new Date(maintenance.fechaProgramada).toISOString().split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(maintenance)
  })

  // Ordenar por fecha y hora
  const sortedGroups: Record<string, Mantenimiento[]> = {}
  Object.keys(groups)
    .sort()
    .forEach(date => {
      sortedGroups[date] = groups[date].sort((a, b) => 
        new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime()
      )
    })

  return sortedGroups
})

const formatDateHeader = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFullDate = (date: string) => {
  return new Date(date).toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showDetails = (maintenance: Mantenimiento) => {
  selectedMaintenance.value = maintenance
}

const closeDetails = () => {
  selectedMaintenance.value = null
}

// Funciones auxiliares
const getClienteName = (id: string) => {
  return uniqueClients.value.find(c => c.id === id)?.nombre || ''
}

const getBranchName = (id: string) => {
  return filteredBranches.value.find(b => b.id === id)?.nombre || ''
}

const clearFilters = () => {
  filters.value = {
    clienteId: '',
    sucursalId: '',
    tipo: '',
    estado: ''
  }
}

onMounted(async () => {
  await store.fetchMantenimientos()
})
</script>

<style scoped>
.maintenance-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.header h1 {
  color: var(--primary-color);
  font-size: 2rem;
}

.loading, .error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: #dc3545;
}

.maintenance-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.date-group {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.date-header {
  background: var(--primary-color);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-header h2 {
  margin: 0;
  font-size: 1.2rem;
  text-transform: capitalize;
}

.count {
  font-size: 0.9rem;
  opacity: 0.9;
}

.maintenance-cards {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.maintenance-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.maintenance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.maintenance-card.preventivo {
  border-left: 4px solid #1976d2;
}

.maintenance-card.correctivo {
  border-left: 4px solid #dc3545;
}

.time {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--primary-color);
}

.main-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.client {
  font-weight: 500;
}

.branch {
  font-size: 0.9rem;
  color: #666;
}

.status-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.type-badge, .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge {
  background: #fff3e0;
  color: #e65100;
}

.maintenance-card.pendiente .status-badge {
  background: #fff3e0;
  color: #e65100;
}

.maintenance-card.en_proceso .status-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.maintenance-card.completado .status-badge {
  background: #e8f5e9;
  color: #2e7d32;
}

.maintenance-card.cancelado .status-badge {
  background: #fce4ec;
  color: #c2185b;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: var(--primary-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-weight: 500;
  color: #666;
}

.detail-item span {
  font-size: 1.1rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #666;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  color: #333;
}

.filter-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.clear-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #ddd;
  border-radius: 5px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters:hover {
  background: #f5f5f5;
  color: #333;
}

.active-filters {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.active-filters > span {
  color: #666;
  font-weight: 500;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 15px;
  font-size: 0.9rem;
}

.filter-tag button {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results p {
  font-size: 1.2rem;
  margin: 0;
}
</style> 