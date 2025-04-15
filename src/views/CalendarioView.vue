<template>
  <div class="calendario-container">
    <div class="page-header">
      <h1>Calendario de Mantenimientos</h1>
      <div class="calendario-controls">
        <button @click="mesAnterior" class="btn-control">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2>{{ nombreMes }} {{ año }}</h2>
        <button @click="mesSiguiente" class="btn-control">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Notificación -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      <i :class="notification.icon"></i>
      {{ notification.message }}
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      Cargando mantenimientos...
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>

    <!-- Calendario -->
    <div v-if="!loading && !error" class="calendario">
      <!-- Días de la semana -->
      <div class="dias-semana">
        <div v-for="dia in diasSemana" :key="dia" class="dia-header">
          {{ dia }}
        </div>
      </div>

      <!-- Grid de días -->
      <div class="dias-grid">
        <div 
          v-for="dia in diasDelMes" 
          :key="dia.fecha"
          :class="['dia-celda', { 
            'otro-mes': !dia.esDelMesActual,
            'hoy': dia.esHoy
          }]"
        >
          <div class="dia-numero">{{ new Date(dia.fecha).getDate() }}</div>
          
          <!-- Mantenimientos del día -->
          <div class="mantenimientos-dia">
            <div 
              v-for="mantenimiento in mantenimientosPorDia[dia.fecha]" 
              :key="mantenimiento.id"
              :class="['mantenimiento-item', mantenimiento.tipo.toLowerCase(), mantenimiento.estado.toLowerCase()]"
              @click="mostrarDetalles(mantenimiento)"
            >
              <span class="hora">{{ formatearHora(mantenimiento.fechaProgramada) }}</span>
              <span class="cliente">{{ mantenimiento.cliente?.nombre }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="mantenimientoSeleccionado" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detalles del Mantenimiento</h3>
          <button @click="cerrarDetalles" class="btn-cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="detalle-header">
            <span class="tipo" :class="mantenimientoSeleccionado.tipo.toLowerCase()">
              {{ mantenimientoSeleccionado.tipo }}
            </span>
            <span class="estado" :class="mantenimientoSeleccionado.estado.toLowerCase()">
              {{ mantenimientoSeleccionado.estado }}
            </span>
          </div>

          <div class="detalle-info">
            <p>
              <i class="fas fa-clock"></i>
              {{ formatearFechaCompleta(mantenimientoSeleccionado.fechaProgramada) }}
            </p>
            <p>
              <i class="fas fa-building"></i>
              {{ mantenimientoSeleccionado.cliente?.nombre }}
            </p>
            <p>
              <i class="fas fa-store"></i>
              {{ mantenimientoSeleccionado.sucursal?.nombre }}
            </p>
            <p>
              <i class="fas fa-tint"></i>
              Dispensador #{{ mantenimientoSeleccionado.dispensador?.numero_serie }}
            </p>
            <p>
              <i class="fas fa-user-cog"></i>
              {{ mantenimientoSeleccionado.tecnico?.nombre }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMantenimientosStore } from '@/stores/mantenimientos.store'
import { storeToRefs } from 'pinia'
import type { Mantenimiento } from '@/interfaces/mantenimiento.interface'
import type { Cliente } from '@/interfaces/cliente.interface'
import type { Sucursal } from '@/interfaces/sucursal.interface'
import type { Dispensador } from '@/interfaces/dispensador.interface'
import type { Tecnico } from '@/interfaces/tecnico.interface'

const mantenimientosStore = useMantenimientosStore()
const { mantenimientos, loading, error } = storeToRefs(mantenimientosStore)

const fechaActual = ref(new Date())
const mantenimientoSeleccionado = ref<Mantenimiento | null>(null)

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const nombreMes = computed(() => {
  return fechaActual.value.toLocaleString('es-ES', { month: 'long' })
})

const año = computed(() => {
  return fechaActual.value.getFullYear()
})

const diasDelMes = computed(() => {
  const primerDia = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth(), 1)
  const ultimoDia = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() + 1, 0)
  
  const dias = []
  
  // Agregar días del mes anterior
  const diasPrevios = primerDia.getDay()
  const ultimoDiaMesAnterior = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth(), 0)
  for (let i = diasPrevios - 1; i >= 0; i--) {
    const fecha = new Date(ultimoDiaMesAnterior)
    fecha.setDate(ultimoDiaMesAnterior.getDate() - i)
    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      esDelMesActual: false,
      esHoy: false
    })
  }
  
  // Agregar días del mes actual
  const hoy = new Date()
  for (let i = 1; i <= ultimoDia.getDate(); i++) {
    const fecha = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth(), i)
    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      esDelMesActual: true,
      esHoy: fecha.toDateString() === hoy.toDateString()
    })
  }
  
  // Agregar días del mes siguiente
  const diasRestantes = 42 - dias.length // 6 semanas completas
  for (let i = 1; i <= diasRestantes; i++) {
    const fecha = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() + 1, i)
    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      esDelMesActual: false,
      esHoy: false
    })
  }
  
  return dias
})

const mantenimientosPorDia = computed(() => {
  const porDia: Record<string, Mantenimiento[]> = {}
  
  if (!mantenimientos.value) return porDia
  
  mantenimientos.value.forEach(mantenimiento => {
    const fecha = mantenimiento.fechaProgramada.split('T')[0]
    if (!porDia[fecha]) {
      porDia[fecha] = []
    }
    porDia[fecha].push(mantenimiento)
  })
  
  // Ordenar por hora
  Object.keys(porDia).forEach(fecha => {
    porDia[fecha].sort((a, b) => 
      new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime()
    )
  })
  
  return porDia
})

const mesAnterior = () => {
  fechaActual.value = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() - 1)
}

const mesSiguiente = () => {
  fechaActual.value = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() + 1)
}

const formatearHora = (fecha: string) => {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearFechaCompleta = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const mostrarDetalles = (mantenimiento: Mantenimiento) => {
  mantenimientoSeleccionado.value = mantenimiento
}

const cerrarDetalles = () => {
  mantenimientoSeleccionado.value = null
}

// Estado para notificaciones
const notification = ref({
  show: false,
  message: '',
  type: 'success',
  icon: 'fas fa-check-circle'
})

onMounted(async () => {
  try {
    await mantenimientosStore.fetchMantenimientos()
  } catch (error) {
    console.error('Error al cargar mantenimientos:', error)
  }
})
</script>

<style scoped>
.calendario-container {
  padding: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.calendario-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-control {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.btn-control:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.calendario {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dias-semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--primary-color);
  color: white;
  border-radius: 8px 8px 0 0;
}

.dia-header {
  padding: 1rem;
  text-align: center;
  font-weight: 500;
}

.dias-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-top: 1px solid #eee;
}

.dia-celda {
  min-height: 120px;
  padding: 0.5rem;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.dia-celda:nth-child(7n) {
  border-right: none;
}

.dia-numero {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.otro-mes {
  background-color: #f8f9fa;
  color: #adb5bd;
}

.hoy {
  background-color: #e8f5e9;
}

.hoy .dia-numero {
  color: var(--primary-color);
  font-weight: bold;
}

.mantenimientos-dia {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mantenimiento-item {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mantenimiento-item:hover {
  transform: scale(1.02);
}

.mantenimiento-item.preventivo {
  background: #e3f2fd;
  color: #1976d2;
}

.mantenimiento-item.correctivo {
  background: #fce4ec;
  color: #c2185b;
}

.mantenimiento-item.pendiente {
  border-left: 3px solid #e65100;
}

.mantenimiento-item.en_proceso {
  border-left: 3px solid #1976d2;
}

.mantenimiento-item.completado {
  border-left: 3px solid #2e7d32;
}

.mantenimiento-item.cancelado {
  border-left: 3px solid #c2185b;
}

.hora {
  font-weight: 500;
  margin-right: 0.5rem;
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.detalle-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.detalle-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detalle-info p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detalle-info i {
  width: 20px;
  color: var(--primary-color);
}

.tipo, .estado {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
}

.tipo.preventivo {
  background: #e3f2fd;
  color: #1976d2;
}

.tipo.correctivo {
  background: #fce4ec;
  color: #c2185b;
}

.estado.pendiente {
  background: #fff3e0;
  color: #e65100;
}

.estado.en_proceso {
  background: #e3f2fd;
  color: #1976d2;
}

.estado.completado {
  background: #e8f5e9;
  color: #2e7d32;
}

.estado.cancelado {
  background: #fce4ec;
  color: #c2185b;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 