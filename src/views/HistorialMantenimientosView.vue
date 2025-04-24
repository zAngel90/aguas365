<template>
  <div class="historial-mantenimientos-container">
    <div class="page-header">
      <h1>Historial de Mantenimientos</h1>
      <div class="filters">
        <div class="filter-group">
          <label>Cliente:</label>
          <select v-model="filtroCliente" @change="handleClienteFilterChange" class="filter-select">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre }}
            </option>
          </select>
        </div>
        <div class="filter-group" v-if="filtroCliente">
          <label>Sucursal:</label>
          <select v-model="filtroSucursal" class="filter-select">
            <option value="">Todas las sucursales</option>
            <option v-for="sucursal in sucursalesFiltradas" :key="sucursal.id" :value="sucursal.id">
              {{ sucursal.nombre }}
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
        <div class="filter-group">
          <label>Fecha Inicio:</label>
          <input type="date" v-model="filtroFechaInicio" class="filter-select">
        </div>
        <div class="filter-group">
          <label>Fecha Fin:</label>
          <input type="date" v-model="filtroFechaFin" class="filter-select">
        </div>
      </div>
      <div class="results-count" v-if="!loading && !error">
        Mostrando {{ mantenimientosFiltrados.length }} de {{ mantenimientos.length }} mantenimientos
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando historial...
    </div>
    
    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
      <button @click="recargarDatos" class="retry-button">Reintentar</button>
    </div>
    
    <div v-else-if="!mantenimientosFiltrados.length" class="empty-state">
      <i class="fas fa-tools"></i>
      <p>No hay mantenimientos que coincidan con los filtros seleccionados</p>
      <button @click="resetFiltros" class="reset-button">Resetear filtros</button>
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

          <div class="card-actions">
            <button @click="editMantenimiento(mantenimiento)" class="action-btn edit">
              <i class="fas fa-edit"></i>
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Edición -->
  <div v-if="showEditModal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>Editar Mantenimiento</h2>
        <button class="close-btn" @click="closeEditModal">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="saveEdit" class="edit-form">
          <div class="form-group">
            <label>Estado</label>
            <select v-model="editingMantenimiento.estado" required>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div class="form-group">
            <label>Tipo</label>
            <select v-model="editingMantenimiento.tipo" required>
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
              <option value="emergencia">Emergencia</option>
            </select>
          </div>

          <div class="form-group">
            <label>Fecha Programada</label>
            <input 
              v-model="editingMantenimiento.fechaProgramada" 
              type="datetime-local" 
              required
            >
          </div>

          <div class="form-group">
            <label>Fecha Realizada</label>
            <input 
              v-model="editingMantenimiento.fechaRealizada" 
              type="datetime-local"
            >
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="editingMantenimiento.descripcion" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Observaciones</label>
            <textarea v-model="editingMantenimiento.observaciones" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeEditModal">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useMantenimientosStore } from '@/stores/mantenimientos.store'
import { useClientesStore } from '@/stores/clientes.store'
import { useSucursalesStore } from '@/stores/sucursales.store'
import { storeToRefs } from 'pinia'
import type { Mantenimiento } from '@/interfaces/mantenimiento.interface'
import { useRouter } from 'vue-router'

const router = useRouter()
const mantenimientosStore = useMantenimientosStore()
const clientesStore = useClientesStore()
const sucursalesStore = useSucursalesStore()

const { mantenimientos } = storeToRefs(mantenimientosStore)
const { clientes } = storeToRefs(clientesStore)
const { sucursales } = storeToRefs(sucursalesStore)

const loading = ref(false)
const error = ref('')
const filtroEstado = ref('')
const filtroTipo = ref('')
const filtroCliente = ref<number | null>(null)
const filtroSucursal = ref<number | null>(null)
const filtroFechaInicio = ref('')
const filtroFechaFin = ref('')

const sucursalesFiltradas = computed(() => {
  if (!filtroCliente.value) return []
  return sucursales.value?.filter(s => s.cliente_id === filtroCliente.value) || []
})

const handleClienteFilterChange = () => {
  filtroSucursal.value = null
}

const mantenimientosFiltrados = computed(() => {
  let resultado = mantenimientos.value || []
  
  // Filtrar por cliente
  if (filtroCliente.value) {
    resultado = resultado.filter(m => m.cliente?.id === filtroCliente.value)
  }
  
  // Filtrar por sucursal
  if (filtroSucursal.value) {
    resultado = resultado.filter(m => m.sucursal?.id === filtroSucursal.value)
  }
  
  if (filtroEstado.value) {
    resultado = resultado.filter(m => m.estado === filtroEstado.value)
  }
  
  if (filtroTipo.value) {
    resultado = resultado.filter(m => m.tipo === filtroTipo.value)
  }

  if (filtroFechaInicio.value) {
    resultado = resultado.filter(m => {
      const fecha = new Date(m.fechaProgramada)
      return fecha >= new Date(filtroFechaInicio.value)
    })
  }

  if (filtroFechaFin.value) {
    resultado = resultado.filter(m => {
      const fecha = new Date(m.fechaProgramada)
      return fecha <= new Date(filtroFechaFin.value)
    })
  }
  
  // Ordenar por fecha de realización (más reciente primero)
  return resultado.sort((a, b) => {
    const fechaA = a.fechaRealizada || a.fechaProgramada
    const fechaB = b.fechaRealizada || b.fechaProgramada
    return new Date(fechaB).getTime() - new Date(fechaA).getTime()
  })
})

const cargarDatos = async () => {
  loading.value = true
  error.value = ''
  try {
    await Promise.all([
      mantenimientosStore.fetchMantenimientos(),
      clientesStore.fetchClientes(),
      sucursalesStore.fetchSucursales()
    ])
  } catch (err) {
    error.value = 'Error al cargar los datos. Por favor, intente nuevamente.'
    console.error('Error al cargar datos:', err)
  } finally {
    loading.value = false
  }
}

const recargarDatos = () => {
  cargarDatos()
}

const resetFiltros = () => {
  filtroEstado.value = ''
  filtroTipo.value = ''
  filtroCliente.value = null
  filtroSucursal.value = null
  filtroFechaInicio.value = ''
  filtroFechaFin.value = ''
}

onMounted(() => {
  cargarDatos()
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

const showEditModal = ref(false)
const editingMantenimiento = ref<Mantenimiento | null>(null)

const editMantenimiento = (mantenimiento: Mantenimiento) => {
  editingMantenimiento.value = { ...mantenimiento }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingMantenimiento.value = null
}

const saveEdit = async () => {
  if (!editingMantenimiento.value) return

  try {
    await mantenimientosStore.updateMantenimiento(editingMantenimiento.value.id, editingMantenimiento.value)
    await mantenimientosStore.fetchMantenimientos()
    closeEditModal()
  } catch (error) {
    console.error('Error al actualizar mantenimiento:', error)
    alert('Error al actualizar el mantenimiento. Por favor, intente nuevamente.')
  }
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

.results-count {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.retry-button, .reset-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover, .reset-button:hover {
  background-color: var(--primary-color-dark);
}

.filter-group input[type="date"] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 200px;
  background-color: white;
}

.filter-group input[type="date"]:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.card-actions {
  padding: 1rem;
  display: flex;
  gap: 0.8rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  margin-top: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.action-btn i {
  font-size: 1rem;
}

.action-btn.edit {
  background: var(--primary-color);
  color: white;
}

.action-btn.edit:hover {
  background: #1a5f7a;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.modal-overlay {
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

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.btn-secondary:hover {
  background: #e9ecef;
}
</style> 