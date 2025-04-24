<template>
  <div class="dispensadores-container">
    <div class="page-header">
      <h1>Gestión de Dispensadores</h1>
      <button class="btn-primary" @click="openModal">
        <i class="fas fa-plus"></i>
        Nuevo Dispensador
      </button>
    </div>
    
    <div class="search-bar">
      <div class="search-filters">
        <div class="filter-group">
          <label>Cliente:</label>
          <select v-model="filtroCliente" @change="handleClienteFilterChange">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre }}
            </option>
          </select>
        </div>
        <div class="filter-group" v-if="filtroCliente">
          <label>Sucursal:</label>
          <select v-model="filtroSucursal">
            <option value="">Todas las sucursales</option>
            <option v-for="sucursal in sucursalesFiltradas" :key="sucursal.id" :value="sucursal.id">
              {{ sucursal.nombre }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Búsqueda:</label>
          <div class="search-input">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar por modelo o número de serie..."
              @input="filterDispensadores"
            >
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando dispensadores...
    </div>
    
    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>
    
    <div v-else-if="!dispensadores.length" class="empty-state">
      <i class="fas fa-water"></i>
      <p>No hay dispensadores registrados</p>
    </div>
    
    <div v-else class="dispensadores-grid">
      <div v-for="dispensador in filteredDispensadores" :key="dispensador.id" class="dispensador-card">
        <div class="card-header">
          <div class="header-info">
            <h3>{{ dispensador.modelo }}</h3>
            <span class="serial">#{{ dispensador.numero_serie }}</span>
          </div>
          <span class="estado" :class="dispensador.estado">
            {{ dispensador.estado }}
          </span>
        </div>

        <div class="card-content">
          <div class="info-item">
            <i class="fas fa-building"></i>
            <div class="info-text">
              <strong>{{ dispensador.cliente_nombre }}</strong>
              <span>{{ dispensador.sucursal_nombre }}</span>
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <div class="info-text">
              <span>{{ dispensador.sucursal_direccion }}</span>
              <span class="sector">{{ dispensador.sector || 'Sin sector' }}</span>
            </div>
          </div>

          <div class="info-item">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDate(dispensador.fecha_instalacion) }}</span>
          </div>

          <div class="info-item">
            <i class="fas fa-cubes"></i>
            <div class="info-text">
              <strong>Unidades totales: {{ dispensador.cantidad || 1 }}</strong>
              <span class="cantidad-detalle">{{ dispensador.cantidad > 1 ? `${dispensador.cantidad} unidades del mismo modelo` : '1 unidad' }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button @click="editDispensador(dispensador)" class="action-btn edit">
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button @click="deleteDispensador(dispensador.id)" class="action-btn delete">
            <i class="fas fa-trash"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Nuevo/Editar Dispensador -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Dispensador' : 'Nuevo Dispensador' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Tipo de Asignación</label>
              <select v-model="asignacionTipo" required @change="handleAsignacionChange">
                <option value="cliente">Cliente Directo</option>
                <option value="sucursal">Sucursal</option>
              </select>
            </div>

            <div class="form-group" v-if="asignacionTipo === 'cliente'">
              <label>Cliente</label>
              <select v-model="newDispensador.cliente_id" required>
                <option value="">Seleccione un cliente</option>
                <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                  {{ cliente.nombre }}
                </option>
              </select>
            </div>

            <div v-if="asignacionTipo === 'sucursal'">
              <div class="form-group">
                <label>Cliente</label>
                <select v-model="selectedClienteId" required @change="handleClienteChange">
                  <option value="">Seleccione un cliente</option>
                  <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                    {{ cliente.nombre }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Sucursal</label>
                <select v-model="newDispensador.sucursal_id" required :disabled="!selectedClienteId">
                  <option value="">Seleccione una sucursal</option>
                  <option v-for="sucursal in sucursalesFiltradas" :key="sucursal.id" :value="sucursal.id">
                    {{ sucursal.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Modelo</label>
              <input v-model="newDispensador.modelo" type="text" required>
            </div>
            <div class="form-group">
              <label>Número de Serie</label>
              <input v-model="newDispensador.numero_serie" type="text" required>
            </div>
            <div class="form-group">
              <label>Sector</label>
              <input v-model="newDispensador.sector" type="text">
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="newDispensador.estado" required>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha de Instalación</label>
              <input 
                v-model="newDispensador.fecha_instalacion" 
                type="datetime-local" 
                required
              >
            </div>
            <div class="form-group">
              <label>Cantidad</label>
              <input 
                v-model="newDispensador.cantidad" 
                type="number" 
                min="1" 
                required
              >
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDispensadoresStore } from '@/stores/dispensadores.store'
import { useClientesStore } from '@/stores/clientes.store'
import { useSucursalesStore } from '@/stores/sucursales.store'
import { storeToRefs } from 'pinia'

const dispensadoresStore = useDispensadoresStore()
const clientesStore = useClientesStore()
const sucursalesStore = useSucursalesStore()

const { dispensadores, loading, error } = storeToRefs(dispensadoresStore)
const { clientes } = storeToRefs(clientesStore)
const { sucursales } = storeToRefs(sucursalesStore)

const showModal = ref(false)
const isEditing = ref(false)
const asignacionTipo = ref('cliente')
const selectedClienteId = ref<number | null>(null)
const filtroCliente = ref<number | null>(null)
const filtroSucursal = ref<number | null>(null)
const searchQuery = ref('')

const newDispensador = ref({
  id: null as number | null,
  modelo: '',
  numero_serie: '',
  fecha_instalacion: new Date().toISOString().slice(0, 16),
  estado: 'activo' as 'activo' | 'inactivo' | 'mantenimiento',
  sector: '',
  cliente_id: null as number | null,
  sucursal_id: null as number | null,
  cantidad: 1
})

const sucursalesFiltradas = computed(() => {
  if (!filtroCliente.value) return []
  return sucursales.value?.filter(s => s.cliente_id === filtroCliente.value) || []
})

const handleClienteFilterChange = () => {
  filtroSucursal.value = null
  filterDispensadores()
}

const filteredDispensadores = computed(() => {
  let resultado = dispensadores.value
  
  // Filtrar por cliente
  if (filtroCliente.value) {
    resultado = resultado.filter(dispensador => {
      const dispensadorClienteId = dispensador.cliente_id || (dispensador.sucursal?.cliente_id)
      return dispensadorClienteId === filtroCliente.value
    })
  }
  
  // Filtrar por sucursal
  if (filtroSucursal.value) {
    resultado = resultado.filter(dispensador => {
      const dispensadorSucursalId = dispensador.sucursal_id || (dispensador.sucursal?.id)
      return dispensadorSucursalId === filtroSucursal.value
    })
  }
  
  // Filtrar por búsqueda de texto
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    resultado = resultado.filter(dispensador => {
      const modelo = dispensador.modelo?.toLowerCase() || ''
      const numeroSerie = dispensador.numero_serie?.toLowerCase() || ''
      return modelo.includes(query) || numeroSerie.includes(query)
    })
  }
  
  return resultado
})

onMounted(async () => {
  try {
    await Promise.all([
      dispensadoresStore.fetchDispensadores(),
      clientesStore.fetchClientes(),
      sucursalesStore.fetchSucursales()
    ])
  } catch (e) {
    console.error('Error al cargar datos:', e)
  }
})

function openModal() {
  showModal.value = true
  resetForm()
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function resetForm() {
  isEditing.value = false
  asignacionTipo.value = 'cliente'
  selectedClienteId.value = null
  newDispensador.value = {
    id: null,
    modelo: '',
    numero_serie: '',
    fecha_instalacion: new Date().toISOString().slice(0, 16),
    estado: 'activo',
    sector: '',
    cliente_id: null,
    sucursal_id: null,
    cantidad: 1
  }
}

function handleAsignacionChange() {
  newDispensador.value.cliente_id = null
  newDispensador.value.sucursal_id = null
  selectedClienteId.value = null
}

function handleClienteChange() {
  newDispensador.value.sucursal_id = null
}

async function handleSubmit() {
  try {
    if (asignacionTipo.value === 'sucursal') {
      newDispensador.value.cliente_id = null
    } else {
      newDispensador.value.sucursal_id = null
    }

    if (isEditing.value && newDispensador.value.id) {
      // Actualizamos el dispensador con su cantidad
      await dispensadoresStore.updateDispensador(newDispensador.value.id, newDispensador.value)
    } else {
      // Creamos un solo dispensador con la cantidad especificada
      await dispensadoresStore.createDispensador(newDispensador.value)
    }
    
    await dispensadoresStore.fetchDispensadores()
    closeModal()
  } catch (e) {
    console.error('Error al guardar dispensador:', e)
  }
}

function editDispensador(dispensador: any) {
  newDispensador.value = {
    id: dispensador.id,
    modelo: dispensador.modelo,
    numero_serie: dispensador.numero_serie,
    fecha_instalacion: dispensador.fecha_instalacion?.slice(0, 16) || new Date().toISOString().slice(0, 16),
    estado: dispensador.estado,
    sector: dispensador.sector || '',
    cliente_id: dispensador.cliente_id,
    sucursal_id: dispensador.sucursal_id,
    cantidad: dispensador.cantidad || 1
  }
  
  asignacionTipo.value = dispensador.sucursal_id ? 'sucursal' : 'cliente'
  if (dispensador.sucursal_id) {
    const sucursal = sucursales.value?.find(s => s.id === dispensador.sucursal_id)
    if (sucursal) {
      selectedClienteId.value = sucursal.cliente_id
    }
  }
  
  isEditing.value = true
  showModal.value = true
}

async function deleteDispensador(id: number) {
  if (confirm('¿Está seguro de eliminar este dispensador?')) {
    try {
      await dispensadoresStore.deleteDispensador(id)
      await dispensadoresStore.fetchDispensadores()
    } catch (e) {
      console.error('Error al eliminar dispensador:', e)
    }
  }
}

function formatDate(date: string) {
  if (!date) return 'Fecha no especificada'
  const instalacionDate = new Date(date)
  const today = new Date()
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  if (instalacionDate > today) {
    return `Próxima instalación: ${instalacionDate.toLocaleDateString('es-ES', options)}`
  }
  
  return `Instalado: ${instalacionDate.toLocaleDateString('es-ES', options)}`
}

function filterDispensadores() {
  // Implement the filter logic here
}
</script>

<style scoped>
.dispensadores-container {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: var(--primary-color);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.dispensadores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.dispensador-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  background: var(--primary-color);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.serial {
  font-size: 0.9rem;
  opacity: 0.9;
}

.estado {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  background: rgba(255,255,255,0.2);
}

.estado.activo { background: #4CAF50; }
.estado.inactivo { background: #f44336; }
.estado.mantenimiento { background: #FF9800; }

.card-content {
  padding: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item i {
  color: var(--primary-color);
  width: 20px;
  text-align: center;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.card-actions {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit:hover {
  background: #bbdefb;
}

.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: var(--primary-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.search-bar {
  margin: 1rem 0;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.filter-group label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.filter-group select {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white;
  cursor: pointer;
}

.filter-group select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.search-input {
  position: relative;
  flex: 1;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input input {
  width: 100%;
  padding: 0.6rem 0.6rem 0.6rem 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
}

.search-input input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.cantidad-detalle {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}
</style>