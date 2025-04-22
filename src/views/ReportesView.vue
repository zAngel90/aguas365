<template>
  <div class="reportes-container">
    <div class="page-header">
      <h1>Historial de Mantenimientos</h1>
      <div class="filters">
        <div class="filter-group">
          <label>Cliente:</label>
          <select v-model="filtros.cliente" class="filter-select">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Estado:</label>
          <select v-model="filtros.estado" class="filter-select">
            <option value="">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_proceso">En Proceso</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Fecha Desde:</label>
          <input 
            type="date" 
            v-model="filtros.fechaDesde"
            class="filter-select"
          >
        </div>
        <div class="filter-group">
          <label>Fecha Hasta:</label>
          <input 
            type="date" 
            v-model="filtros.fechaHasta"
            class="filter-select"
          >
        </div>
        <button @click="exportarExcel" class="btn-exportar">
          <i class="fas fa-file-excel"></i> Exportar a Excel
        </button>
      </div>

      <div class="results-count" v-if="!loading">
        Mostrando {{ mantenimientosFiltrados.length }} mantenimientos
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando historial...
    </div>
    
    <div v-else-if="!mantenimientosFiltrados.length" class="empty-state">
      <i class="fas fa-tools"></i>
      <p>No hay mantenimientos que coincidan con los filtros seleccionados</p>
      <button @click="resetFiltros" class="reset-button">Resetear filtros</button>
    </div>

    <div v-else class="mantenimientos-grid">
      <div 
        v-for="mantenimiento in mantenimientosFiltrados" 
        :key="mantenimiento.id" 
        class="mantenimiento-card"
      >
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMantenimientosStore } from '@/stores/mantenimientos.store'
import { useClientesStore } from '@/stores/clientes.store'
import { storeToRefs } from 'pinia'
import type { Mantenimiento } from '@/interfaces/mantenimiento.interface'
import * as XLSX from 'xlsx'

const mantenimientosStore = useMantenimientosStore()
const clientesStore = useClientesStore()
const { mantenimientos } = storeToRefs(mantenimientosStore)
const { clientes } = storeToRefs(clientesStore)

const loading = ref(false)
const filtros = ref({
  cliente: '',
  estado: '',
  fechaDesde: '',
  fechaHasta: ''
})

const mantenimientosFiltrados = computed(() => {
  // Primero filtrar solo pendientes y en proceso
  let resultado = (mantenimientos.value || []).filter(m => 
    m.estado === 'pendiente' || m.estado === 'en_proceso'
  )

  if (filtros.value.cliente) {
    resultado = resultado.filter(m => 
      m.cliente?.id === Number(filtros.value.cliente)
    )
  }

  if (filtros.value.estado) {
    resultado = resultado.filter(m => 
      m.estado.toLowerCase() === filtros.value.estado.toLowerCase()
    )
  }

  if (filtros.value.fechaDesde) {
    const fechaDesde = new Date(filtros.value.fechaDesde)
    resultado = resultado.filter(m => new Date(m.fechaProgramada) >= fechaDesde)
  }

  if (filtros.value.fechaHasta) {
    const fechaHasta = new Date(filtros.value.fechaHasta)
    resultado = resultado.filter(m => new Date(m.fechaProgramada) <= fechaHasta)
  }

  // Ordenar por fecha de más reciente a más antigua
  return resultado.sort((a, b) => 
    new Date(b.fechaProgramada).getTime() - new Date(a.fechaProgramada).getTime()
  )
})

function formatDate(date: string) {
  if (!date) return 'Fecha no especificada'
  
  try {
    const dateObj = new Date(date)
    
    // Si el año es 2024, ajustarlo a 2025
    if (dateObj.getFullYear() === 2024) {
      dateObj.setFullYear(2025)
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return 'Fecha no especificada'
  }
}

function formatEstado(estado: string) {
  const estados = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso'
  }
  return estados[estado] || estado
}

function formatTipo(tipo: string) {
  const tipos = {
    preventivo: 'Preventivo',
    correctivo: 'Correctivo',
    emergencia: 'Emergencia'
  }
  return tipos[tipo] || tipo
}

function resetFiltros() {
  filtros.value = {
    cliente: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  }
}

function exportarExcel() {
  const wb = XLSX.utils.book_new()
  
  const datos = mantenimientosFiltrados.value.map(m => {
    const fecha = new Date(m.fechaProgramada)
    if (fecha.getFullYear() === 2024) {
      fecha.setFullYear(2025)
    }
    
    return {
      'Fecha Programada': formatDate(fecha.toISOString()),
      'Cliente': m.cliente?.nombre || 'Sin cliente',
      'Sucursal': m.sucursal?.nombre || 'Sin sucursal',
      'Dispensador': m.dispensador?.numero_serie || 'Sin número',
      'Estado': formatEstado(m.estado),
      'Tipo': formatTipo(m.tipo),
      'Descripción': m.descripcion || '-'
    }
  })

  const ws = XLSX.utils.json_to_sheet(datos)
  XLSX.utils.book_append_sheet(wb, ws, 'Mantenimientos')
  XLSX.writeFile(wb, 'historial-mantenimientos.xlsx')
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      mantenimientosStore.fetchMantenimientos(),
      clientesStore.fetchClientes()
    ])
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.reportes-container {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
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
  min-width: 200px;
}

.btn-exportar {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: fit-content;
  align-self: flex-end;
}

.results-count {
  color: #666;
  font-size: 0.9rem;
}

.mantenimientos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
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

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading i, .empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.reset-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
}
</style> 