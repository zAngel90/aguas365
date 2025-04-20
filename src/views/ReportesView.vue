<template>
  <div class="reportes">
    <div class="header">
      <h2 class="page-title">Panel de Reportes</h2>
      <button class="btn-send-report" @click="openSendReportModal">
        <i class="fas fa-paper-plane"></i>
        Enviar Reporte
      </button>
    </div>
    
    <div class="report-grid">
      <div class="report-card">
        <div class="card-header">
          <i class="fas fa-calendar-check"></i>
          <h3>Mantenimientos Pendientes</h3>
        </div>
        <div class="chart-container">
          <canvas ref="mantenimientosChart"></canvas>
        </div>
      </div>

      <div class="report-card">
        <div class="card-header">
          <i class="fas fa-water"></i>
          <h3>Dispensadores por Cliente</h3>
        </div>
        <div class="chart-container">
          <canvas ref="dispensadoresChart"></canvas>
        </div>
      </div>
    </div>

    <Modal v-if="showSendReportModal" @close="closeSendReportModal">
      <template #header>
        <h3>Enviar Reporte</h3>
      </template>
      
      <template #body>
        <form @submit.prevent="sendReport" class="report-form">
          <div class="form-group">
            <label>Cliente</label>
            <select v-model="selectedClienteId" @change="handleClienteChange" required>
              <option :value="null">Seleccionar Cliente...</option>
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                {{ cliente.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Correo del Cliente</label>
            <input type="email" v-model="selectedClienteEmail" readonly>
          </div>

          <div class="form-group">
            <label>Asunto</label>
            <input type="text" v-model="reportSubject" required placeholder="Asunto del reporte">
          </div>

          <div class="form-group">
            <label>Mensaje</label>
            <textarea 
              v-model="reportMessage" 
              required 
              rows="6"
              placeholder="Escriba el contenido del reporte aquí..."
            ></textarea>
          </div>
        </form>
      </template>

      <template #footer>
        <button class="btn-secondary" @click="closeSendReportModal">Cancelar</button>
        <button class="btn-primary" @click="sendReport" :disabled="sending">
          <i class="fas fa-spinner fa-spin" v-if="sending"></i>
          {{ sending ? 'Enviando...' : 'Enviar Reporte' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)
import { useReportesStore } from '@/stores/reportes.store'
import { useClientesStore } from '@/stores/clientes.store'
import { storeToRefs } from 'pinia'
import Modal from '../components/Modal.vue'

interface Cliente {
  id: number
  nombre: string
  email: string
}

const mantenimientosChart = ref<HTMLCanvasElement | null>(null)
const dispensadoresChart = ref<HTMLCanvasElement | null>(null)
const reportesStore = useReportesStore()
const clientesStore = useClientesStore()
const { mantenimientosPendientes, dispensadoresPorCliente } = storeToRefs(reportesStore)
const { clientes } = storeToRefs(clientesStore)

// Estado para el modal de envío de reportes
const showSendReportModal = ref(false)
const selectedClienteId = ref<number | null>(null)
const selectedClienteEmail = ref('')
const reportSubject = ref('')
const reportMessage = ref('')
const sending = ref(false)

const openSendReportModal = () => {
  showSendReportModal.value = true
}

const closeSendReportModal = () => {
  showSendReportModal.value = false
  selectedClienteId.value = null
  selectedClienteEmail.value = ''
  reportSubject.value = ''
  reportMessage.value = ''
}

const handleClienteChange = () => {
  const cliente = clientes.value.find(c => c.id === selectedClienteId.value)
  if (cliente) {
    selectedClienteEmail.value = cliente.email || ''
  } else {
    selectedClienteEmail.value = ''
  }
}

const sendReport = async () => {
  if (!selectedClienteId.value || !selectedClienteEmail.value || !reportSubject.value || !reportMessage.value) {
    alert('Por favor complete todos los campos')
    return
  }
  
  try {
    sending.value = true
    const response = await reportesStore.sendReport({
      clienteId: selectedClienteId.value,
      email: selectedClienteEmail.value,
      subject: reportSubject.value,
      message: reportMessage.value
    })

    if (response.success) {
      alert('Reporte enviado correctamente')
      closeSendReportModal()
    } else {
      throw new Error(response.message || 'Error al enviar el reporte')
    }
  } catch (error) {
    console.error('Error al enviar reporte:', error)
    alert(error.message || 'Error al enviar el reporte. Por favor intente nuevamente.')
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    reportesStore.fetchMantenimientosPendientes(),
    reportesStore.fetchDispensadoresPorCliente(),
    clientesStore.fetchClientes()
  ])

  console.log('Datos de dispensadores por cliente:', dispensadoresPorCliente.value)
  console.log('Elemento canvas de dispensadores:', dispensadoresChart.value)

  // Crear gráfico de mantenimientos
  if (mantenimientosChart.value && mantenimientosPendientes.value.length > 0) {
    new Chart(mantenimientosChart.value, {
      type: 'line',
      data: {
        labels: mantenimientosPendientes.value.map(item => {
          const [year, month] = item.mes.split('-')
          const fecha = new Date(parseInt(year), parseInt(month) - 1)
          return fecha.toLocaleString('es', { month: 'long', year: 'numeric' })
        }),
        datasets: [{
          label: 'Mantenimientos',
          data: mantenimientosPendientes.value.map(item => item.cantidad),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Evolución de Mantenimientos Pendientes',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
  }

  // Crear gráfico de dispensadores
  if (dispensadoresChart.value && dispensadoresPorCliente.value.length > 0) {
    console.log('Creando gráfico de dispensadores con datos:', {
      labels: dispensadoresPorCliente.value.map(item => item.cliente),
      data: dispensadoresPorCliente.value.map(item => item.cantidad)
    })
    new Chart(dispensadoresChart.value, {
      type: 'doughnut',
      data: {
        labels: dispensadoresPorCliente.value.map(item => item.cliente),
        datasets: [{
          data: dispensadoresPorCliente.value.map(item => item.cantidad),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Distribución de Dispensadores',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          }
        },
        cutout: '60%'
      }
    })
  } else {
    console.log('No se pudo crear el gráfico de dispensadores porque:', {
      hasCanvas: !!dispensadoresChart.value,
      hasData: dispensadoresPorCliente.value.length > 0,
      dataLength: dispensadoresPorCliente.value.length
    })
  }
})
</script>

<style scoped>
.reportes {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-send-report {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-send-report:hover {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
}

/* Estilos del modal */
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
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.modal-body {
  padding: 1.5rem;
}

.report-form {
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
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:read-only {
  background-color: #f8f9fa;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.8rem 1.5rem;
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

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #ddd;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.report-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-header i {
  font-size: 1.5rem;
  color: #3498db;
  margin-right: 1rem;
}

.card-header h3 {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .reportes {
    padding: 1rem;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}
</style> 