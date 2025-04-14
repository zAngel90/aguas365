<template>
  <div class="mantenimientos-container">
    <div class="header">
      <h1>Gestión de Mantenimientos</h1>
      <button class="btn-primary" @click="openNewMaintenanceModal">
        <i class="fas fa-plus"></i> Nuevo Mantenimiento
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="mantenimientos-grid">
      <div v-for="mantenimiento in mantenimientos" :key="mantenimiento.id" class="mantenimiento-card">
        <div class="card-header">
          <div class="header-info">
            <h3>Mantenimiento #{{ mantenimiento.id }}</h3>
            <span class="tipo-badge" :class="mantenimiento.tipo">{{ mantenimiento.tipo }}</span>
          </div>
          <span class="estado-badge" :class="mantenimiento.estado">
            {{ formatEstado(mantenimiento.estado) }}
          </span>
        </div>

        <div class="card-content">
          <div class="info-section">
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <div class="info-text">
                <strong>Fecha Programada</strong>
                <span>{{ formatDate(mantenimiento.fechaProgramada) }}</span>
              </div>
            </div>

            <div class="info-item">
              <i class="fas fa-building"></i>
              <div class="info-text">
                <strong>{{ mantenimiento.cliente?.nombre || 'Cliente no asignado' }}</strong>
                <span>{{ mantenimiento.sucursal?.nombre || 'Sucursal no asignada' }}</span>
              </div>
            </div>

            <div class="info-item">
              <i class="fas fa-tint"></i>
              <div class="info-text">
                <strong>Dispensador</strong>
                <span>{{ mantenimiento.dispensador?.modelo }} - #{{ mantenimiento.dispensador?.numero_serie }}</span>
              </div>
            </div>

            <div class="info-item">
              <i class="fas fa-user-cog"></i>
              <div class="info-text">
                <strong>Técnico Asignado</strong>
                <span>{{ mantenimiento.tecnico?.nombre || 'No asignado' }}</span>
              </div>
            </div>

            <div class="info-item description" v-if="mantenimiento.descripcion">
              <i class="fas fa-clipboard-list"></i>
              <div class="info-text">
                <strong>Descripción</strong>
                <span>{{ mantenimiento.descripcion }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button @click="editMantenimiento(mantenimiento)" class="action-btn edit">
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button @click="deleteMantenimiento(mantenimiento.id)" class="action-btn delete">
            <i class="fas fa-trash"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Mantenimiento -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento' }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="saveMantenimiento" class="maintenance-form">
          <div class="form-row">
            <div class="form-group">
              <label>Cliente</label>
              <select v-model="selectedClienteId" @change="handleClienteChange" required>
                <option value="">Seleccionar...</option>
                <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                  {{ cliente.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Sucursal</label>
              <select v-model="newMantenimiento.sucursal_id" @change="handleSucursalChange" required>
                <option value="">Seleccionar...</option>
                <option v-for="sucursal in sucursalesFiltradas" :key="sucursal.id" :value="sucursal.id">
                  {{ sucursal.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Dispensador</label>
              <select v-model="newMantenimiento.dispensador_id" required>
                <option value="">Seleccionar...</option>
                <option v-for="disp in dispensadoresFiltrados" :key="disp.id" :value="disp.id">
                  {{ disp.modelo }} - #{{ disp.numero_serie }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Técnico</label>
              <select v-model="newMantenimiento.tecnico_id" required>
                <option value="">Seleccionar...</option>
                <option v-for="tecnico in tecnicos" :key="tecnico.id" :value="tecnico.id">
                  {{ getTecnicoNombre(tecnico) }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha Programada</label>
              <input 
                v-model="newMantenimiento.fechaProgramada" 
                type="datetime-local" 
                required
                :min="new Date().toISOString().slice(0, 16)"
              >
            </div>
            <div class="form-group">
              <label>Tipo</label>
              <select v-model="newMantenimiento.tipo" required>
                <option value="">Seleccionar...</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Estado</label>
            <select v-model="newMantenimiento.estado" required>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="newMantenimiento.descripcion" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Observaciones</label>
            <textarea v-model="newMantenimiento.observaciones" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMantenimientosStore } from '@/stores/mantenimientos.store';
import { useDispensadoresStore } from '@/stores/dispensadores.store';
import { useClientesStore } from '@/stores/clientes.store';
import { useSucursalesStore } from '@/stores/sucursales.store';
import { useTecnicosStore } from '@/stores/tecnicos.store';
import { storeToRefs } from 'pinia';
import type { Mantenimiento } from '@/interfaces/mantenimiento.interface';
import type { Tecnico } from '@/interfaces/tecnico.interface';

const mantenimientosStore = useMantenimientosStore();
const dispensadoresStore = useDispensadoresStore();
const clientesStore = useClientesStore();
const sucursalesStore = useSucursalesStore();
const tecnicosStore = useTecnicosStore();

const { mantenimientos, loading, error } = storeToRefs(mantenimientosStore);
const { dispensadores } = storeToRefs(dispensadoresStore);
const { clientes } = storeToRefs(clientesStore);
const { sucursales } = storeToRefs(sucursalesStore);
const { tecnicos } = storeToRefs(tecnicosStore);

const showModal = ref(false);
const isEditing = ref(false);
const editingMantenimientoId = ref<number | null>(null);
const selectedClienteId = ref<number | null>(null);

const newMantenimiento = ref({
  dispensador_id: null as number | null,
  cliente_id: null as number | null,
  sucursal_id: null as number | null,
  tecnico_id: null as number | null,
  fechaProgramada: new Date().toISOString().slice(0, 16),
  tipo: 'preventivo' as 'preventivo' | 'correctivo' | 'emergencia',
  estado: 'pendiente' as 'pendiente' | 'en_proceso' | 'completado' | 'cancelado',
  descripcion: '',
  observaciones: ''
});

// Computed para filtrar sucursales según el cliente seleccionado
const sucursalesFiltradas = computed(() => {
  if (!selectedClienteId.value) return [];
  return sucursales.value.filter(s => s.cliente_id === selectedClienteId.value);
});

// Computed para filtrar dispensadores según la sucursal seleccionada
const dispensadoresFiltrados = computed(() => {
  if (!newMantenimiento.value.sucursal_id) {
    console.log('No hay sucursal seleccionada');
    return [];
  }
  
  console.log('Filtrando dispensadores para sucursal:', newMantenimiento.value.sucursal_id);
  console.log('Total dispensadores disponibles:', dispensadores.value.length);
  console.log('Dispensadores disponibles:', dispensadores.value);
  
  const filtrados = dispensadores.value.filter(d => {
    console.log('Evaluando dispensador:', {
      id: d.id,
      modelo: d.modelo,
      sucursal_id: d.sucursal_id,
      sucursal: d.sucursal
    });
    
    // Intentar obtener el sucursal_id de diferentes formas
    const dispensadorSucursalId = d.sucursal_id || (d.sucursal?.id);
    const match = dispensadorSucursalId === newMantenimiento.value.sucursal_id;
    
    console.log(`Dispensador ${d.id}: sucursal_id=${dispensadorSucursalId}, buscando=${newMantenimiento.value.sucursal_id}, match=${match}`);
    return match;
  });
  
  console.log('Dispensadores filtrados:', filtrados);
  return filtrados;
});

onMounted(async () => {
  console.log('Iniciando carga de datos en MantenimientosView...');
  loading.value = true;
  try {
    await Promise.all([
      mantenimientosStore.fetchMantenimientos(),
      clientesStore.fetchClientes(),
      sucursalesStore.fetchSucursales(),
      dispensadoresStore.fetchDispensadores(),
      tecnicosStore.fetchTecnicos()
    ]);
    console.log('Datos cargados exitosamente:', {
      mantenimientos: mantenimientosStore.mantenimientos,
      clientes: clientesStore.clientes,
      sucursales: sucursalesStore.sucursales,
      dispensadores: dispensadoresStore.dispensadores,
      tecnicos: tecnicosStore.tecnicos
    });
  } catch (err) {
    console.error('Error al cargar datos:', err);
    error.value = 'Error al cargar los datos necesarios';
  } finally {
    loading.value = false;
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatEstado = (estado: string) => {
  // Reemplazar guiones bajos por espacios y capitalizar cada palabra
  return estado
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const openNewMaintenanceModal = () => {
  isEditing.value = false;
  editingMantenimientoId.value = null;
  selectedClienteId.value = null;
  newMantenimiento.value = {
    dispensador_id: null,
    cliente_id: null,
    sucursal_id: null,
    tecnico_id: null,
    fechaProgramada: new Date().toISOString().slice(0, 16),
    tipo: 'preventivo',
    estado: 'pendiente',
    descripcion: '',
    observaciones: ''
  };
  showModal.value = true;
};

const editMantenimiento = (mantenimiento: Mantenimiento) => {
  isEditing.value = true;
  editingMantenimientoId.value = mantenimiento.id;
  selectedClienteId.value = mantenimiento.cliente_id;
  
  // Convertir la fecha a string en formato ISO
  const fechaStr = typeof mantenimiento.fechaProgramada === 'string' 
    ? new Date(mantenimiento.fechaProgramada).toISOString().slice(0, 16)
    : mantenimiento.fechaProgramada.toISOString().slice(0, 16);

  newMantenimiento.value = {
    dispensador_id: mantenimiento.dispensador_id,
    cliente_id: mantenimiento.cliente_id,
    sucursal_id: mantenimiento.sucursal_id,
    tecnico_id: mantenimiento.tecnico_id,
    fechaProgramada: fechaStr,
    tipo: mantenimiento.tipo,
    estado: mantenimiento.estado,
    descripcion: mantenimiento.descripcion,
    observaciones: mantenimiento.observaciones || ''
  };
  showModal.value = true;
};

const handleClienteChange = async () => {
  console.log('Cliente seleccionado:', selectedClienteId.value);
  // Actualizar el cliente_id en el newMantenimiento
  newMantenimiento.value.cliente_id = selectedClienteId.value;
  // Resetear la sucursal y el dispensador seleccionados
  newMantenimiento.value.sucursal_id = null;
  newMantenimiento.value.dispensador_id = null;
  
  if (selectedClienteId.value) {
    // Asegurarse de que tenemos los dispensadores cargados
    await dispensadoresStore.fetchDispensadores();
  }
};

const handleSucursalChange = async () => {
  console.log('Sucursal seleccionada:', newMantenimiento.value.sucursal_id);
  // Resetear solo el dispensador seleccionado
  newMantenimiento.value.dispensador_id = null;
  
  if (newMantenimiento.value.sucursal_id) {
    // Asegurarse de que tenemos los dispensadores actualizados
    await dispensadoresStore.fetchDispensadores();
    console.log('Dispensadores después de cambio de sucursal:', dispensadoresFiltrados.value);
  }
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingMantenimientoId.value = null;
  selectedClienteId.value = null;
  newMantenimiento.value = {
    dispensador_id: null,
    cliente_id: null,
    sucursal_id: null,
    tecnico_id: null,
    fechaProgramada: new Date().toISOString().slice(0, 16),
    tipo: 'preventivo',
    estado: 'pendiente',
    descripcion: '',
    observaciones: ''
  };
};

const saveMantenimiento = async () => {
  try {
    if (isEditing.value && editingMantenimientoId.value) {
      await mantenimientosStore.updateMantenimiento(editingMantenimientoId.value, newMantenimiento.value);
    } else {
      await mantenimientosStore.createMantenimiento(newMantenimiento.value);
    }
    await mantenimientosStore.fetchMantenimientos();
    closeModal();
  } catch (error) {
    console.error('Error al guardar mantenimiento:', error);
  }
};

const deleteMantenimiento = async (id: number) => {
  if (confirm('¿Está seguro de que desea eliminar este mantenimiento?')) {
    try {
      await mantenimientosStore.deleteMantenimiento(id);
      await mantenimientosStore.fetchMantenimientos();
    } catch (error) {
      console.error('Error al eliminar mantenimiento:', error);
    }
  }
};

const getTecnicoNombre = (tecnico: Tecnico | null) => {
  if (!tecnico) return '';
  return tecnico.nombre;
};
</script>

<style scoped>
.mantenimientos-container {
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

.header h1 {
  color: var(--primary-color);
  margin: 0;
  font-size: 1.8rem;
}

.mantenimientos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.mantenimiento-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mantenimiento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-header {
  background: var(--primary-color);
  color: white;
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-info h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.tipo-badge {
  font-size: 0.85rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  align-self: flex-start;
}

.tipo-badge.preventivo { background: #4CAF50; }
.tipo-badge.correctivo { background: #f44336; }

.estado-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: rgba(255,255,255,0.2);
}

.estado-badge.pendiente { background: #ff9800; }
.estado-badge.en_proceso { background: #2196F3; }
.estado-badge.completado { background: #4CAF50; }
.estado-badge.cancelado { background: #f44336; }

.card-content {
  padding: 1.2rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;
}

.info-item i {
  color: var(--primary-color);
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.info-text strong {
  color: #2c3e50;
  font-size: 0.9rem;
}

.info-text span {
  color: #666;
  font-size: 0.95rem;
}

.description {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.card-actions {
  padding: 1rem;
  display: flex;
  gap: 0.8rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
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

.action-btn.delete {
  background: #dc3545;
  color: white;
}

.action-btn.delete:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error i {
  font-size: 1.2rem;
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
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: white;
  font-size: 1.4rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.form-group select {
  background-color: white;
  cursor: pointer;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
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
  transform: translateY(-1px);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.maintenance-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style> 