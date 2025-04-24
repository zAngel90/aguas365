<template>
  <div class="mantenimientos-container">
    <div class="header">
      <h1>Gestión de Mantenimientos</h1>
      <div class="header-actions">
        <button v-if="selectedMantenimientos.length > 0" 
                class="btn-danger" 
                @click="deleteSelectedMantenimientos">
          <i class="fas fa-trash"></i> 
          Eliminar {{ selectedMantenimientos.length }} seleccionados
        </button>
        <button class="btn-primary" @click="openNewMaintenanceModal">
          <i class="fas fa-plus"></i> Nuevo Mantenimiento
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="mantenimientos-grid">
      <div v-for="mantenimiento in mantenimientosFiltrados" 
           :key="mantenimiento.id" 
           class="mantenimiento-card"
           :class="{ 'selected': selectedMantenimientos.includes(mantenimiento.id) }">
        <div class="card-selection">
          <input type="checkbox" 
                 :checked="selectedMantenimientos.includes(mantenimiento.id)"
                 @change="toggleSelection(mantenimiento.id)">
        </div>
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
              <i class="fas fa-map-marker-alt"></i>
              <div class="info-text">
                <strong>Ubicación</strong>
                <span>{{ getSucursalDireccion(mantenimiento.sucursal_id) }}</span>
                <span v-if="mantenimiento.dispensador?.sector" class="sector-info">
                  <i class="fas fa-map-signs"></i>
                  Sector: {{ mantenimiento.dispensador.sector }}
                </span>
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

            <div v-if="mantenimiento.descripcion" class="info-item">
              <i class="fas fa-clipboard-list"></i>
              <div class="info-text">
                <strong>Descripción</strong>
                <span>{{ mantenimiento.descripcion }}</span>
              </div>
            </div>

            <div v-if="mantenimiento.observaciones" class="info-item">
              <i class="fas fa-clipboard-check"></i>
              <div class="info-text">
                <strong>Observaciones</strong>
                <span>{{ mantenimiento.observaciones }}</span>
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
          <button @click="openEnviarTecnicoModal(mantenimiento)" class="action-btn whatsapp">
            <i class="fab fa-whatsapp"></i>
            Enviar a Técnico
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
            <div class="form-group sucursal-group" v-if="sucursalesFiltradas.length > 0">
              <label>Sucursal</label>
              <div class="sucursal-select-container">
                <select v-model="newMantenimiento.sucursal_id" @change="handleSucursalChange">
                  <option value="">Seleccionar...</option>
                  <option v-for="sucursal in sucursalesFiltradas" :key="sucursal.id" :value="sucursal.id">
                    {{ sucursal.nombre }} - {{ sucursal.direccion }}
                  </option>
                </select>
                <div v-if="sucursalSeleccionadaDireccion" class="sucursal-direccion">
                  <i class="fas fa-map-marker-alt"></i> {{ sucursalSeleccionadaDireccion }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Dispensador</label>
              <select v-model="newMantenimiento.dispensador_id" required>
                <option value="">Seleccionar...</option>
                <option v-for="disp in dispensadoresFiltrados" :key="disp.id + '-' + disp.numero_serie_display" :value="disp.id">
                  {{ disp.modelo }} - {{ disp.numero_serie_display }}
                </option>
              </select>
              <small v-if="sucursalesFiltradas.length > 0" class="form-text text-muted">
                Seleccione una sucursal para ver sus dispensadores
              </small>
              <small v-else class="form-text text-muted">
                Se mostrarán los dispensadores directos del cliente
              </small>
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
              >
              <small class="form-text text-muted">
                Puede seleccionar fechas pasadas para registrar mantenimientos históricos
              </small>
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

          <div v-if="ultimoMantenimiento" class="historial-section">
            <div class="historial-header">
              <i class="fas fa-history"></i>
              <h3>Último Mantenimiento Realizado</h3>
              <button class="btn-edit-historial" @click="editUltimoMantenimiento">
                <i class="fas fa-edit"></i>
                Editar
              </button>
            </div>
            <div class="historial-content">
              <div class="historial-item">
                <strong>Fecha:</strong>
                <span>{{ formatDate(ultimoMantenimiento.fechaProgramada) }}</span>
              </div>
              <div class="historial-item">
                <strong>Estado:</strong>
                <span :class="ultimoMantenimiento.estado">{{ formatEstado(ultimoMantenimiento.estado) }}</span>
              </div>
              <div class="historial-item">
                <strong>Tipo:</strong>
                <span :class="ultimoMantenimiento.tipo">{{ ultimoMantenimiento.tipo }}</span>
              </div>
              <div v-if="ultimoMantenimiento.descripcion" class="historial-item">
                <strong>Descripción:</strong>
                <p>{{ ultimoMantenimiento.descripcion }}</p>
              </div>
              <div v-if="ultimoMantenimiento.observaciones" class="historial-item">
                <strong>Observaciones:</strong>
                <p>{{ ultimoMantenimiento.observaciones }}</p>
              </div>
              <div class="historial-item">
                <strong>Técnico:</strong>
                <span>{{ getTecnicoNombre(ultimoMantenimiento.tecnico) }}</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal para enviar a técnico -->
  <div v-if="showEnviarTecnicoModal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>Enviar a Técnico</h2>
        <button class="close-btn" @click="closeEnviarTecnicoModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Seleccionar Técnico</label>
          <select v-model="selectedTecnicoId" required>
            <option value="">Seleccionar...</option>
            <option v-for="tecnico in tecnicos" :key="tecnico.id" :value="tecnico.id">
              {{ tecnico.nombre }} - {{ tecnico.telefono }}
            </option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeEnviarTecnicoModal">Cancelar</button>
          <a v-if="selectedTecnicoId" :href="getWhatsAppLink" target="_blank" class="btn-whatsapp">
            <i class="fab fa-whatsapp"></i>
            Enviar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
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

// Obtener el año actual o usar 2025 por defecto
const currentYear = computed(() => {
  try {
    return new Date().getFullYear();
  } catch (error) {
    console.warn('Error al obtener el año actual, usando 2025 por defecto:', error);
    return 2025;
  }
});

// Agregar computed property para filtrar mantenimientos pendientes
const mantenimientosFiltrados = computed(() => {
  return mantenimientos.value
    .filter(m => m.estado === 'pendiente' || m.estado === 'en_proceso')
    .map(m => {
      const fechaAjustada = new Date(m.fechaProgramada);
      return {
        ...m,
        fechaMostrada: fechaAjustada
      };
    })
    .sort((a, b) => b.fechaMostrada.getTime() - a.fechaMostrada.getTime());
});

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

const showEnviarTecnicoModal = ref(false);
const selectedTecnicoId = ref<number | null>(null);
const selectedMantenimiento = ref<any>(null);

// Referencia para el último mantenimiento
const ultimoMantenimiento = ref<Mantenimiento | null>(null);

// Computed para filtrar sucursales según el cliente seleccionado
const sucursalesFiltradas = computed(() => {
  if (!selectedClienteId.value) return [];
  return sucursales.value.filter(s => s.cliente_id === selectedClienteId.value);
});

// Computed para filtrar dispensadores según la sucursal seleccionada
const dispensadoresFiltrados = computed(() => {
  if (!newMantenimiento.value.cliente_id) {
    console.log('No hay cliente seleccionado');
    return [];
  }
  
  console.log('Filtrando dispensadores para:', {
    sucursal_id: newMantenimiento.value.sucursal_id,
    cliente_id: newMantenimiento.value.cliente_id
  });
  
  const dispensadoresExpandidos = [];
  
  dispensadores.value.forEach(d => {
    // Verificar si el dispensador pertenece a la sucursal seleccionada o al cliente seleccionado
    const dispensadorSucursalId = d.sucursal_id || (d.sucursal?.id);
    const dispensadorClienteId = d.cliente_id || (d.sucursal?.cliente_id);
    
    if (newMantenimiento.value.sucursal_id) {
      // Si hay sucursal seleccionada, mostrar solo dispensadores de esa sucursal
      if (dispensadorSucursalId === newMantenimiento.value.sucursal_id) {
        const cantidad = d.cantidad || 1;
        for (let i = 0; i < cantidad; i++) {
          dispensadoresExpandidos.push({
            ...d,
            numero_serie_display: `${d.numero_serie} (Unidad ${i + 1} de ${cantidad})`
          });
        }
      }
    } else {
      // Si no hay sucursal seleccionada, mostrar dispensadores directos del cliente
      if (dispensadorClienteId === newMantenimiento.value.cliente_id && !dispensadorSucursalId) {
        const cantidad = d.cantidad || 1;
        for (let i = 0; i < cantidad; i++) {
          dispensadoresExpandidos.push({
            ...d,
            numero_serie_display: `${d.numero_serie} (Unidad ${i + 1} de ${cantidad})`
          });
        }
      }
    }
  });
  
  console.log('Dispensadores expandidos:', dispensadoresExpandidos);
  return dispensadoresExpandidos;
});

const sucursalSeleccionadaDireccion = computed(() => {
  if (!newMantenimiento.value.sucursal_id) return '';
  const sucursal = sucursales.value.find(s => s.id === newMantenimiento.value.sucursal_id);
  return sucursal?.direccion || '';
});

const selectedMantenimientos = ref<number[]>([]);

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

const formatDate = (date: string | Date | null) => {
  if (!date) return 'Fecha no especificada';
  
  try {
    let dateObj: Date;
    
    // Si es un número o string numérico (fecha serial de Excel)
    if (typeof date === 'number' || /^\d{5}$/.test(date.toString())) {
      const numeroSerial = typeof date === 'number' ? date : parseInt(date.toString());
      // Convertir número serial de Excel a fecha JavaScript
      const excelEpoch = new Date(1899, 11, 30);
      dateObj = new Date(excelEpoch.getTime() + (numeroSerial * 24 * 60 * 60 * 1000));
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Verificar si es una fecha válida
    if (isNaN(dateObj.getTime())) {
      console.error('Fecha inválida:', date);
      return 'Fecha inválida';
    }

    // Si el año es 2024, ajustarlo a 2025
    if (dateObj.getFullYear() === 2024) {
      dateObj.setFullYear(2025);
    }

    // Formatear la fecha en español
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);

  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error en fecha';
  }
};

const formatDateForInput = (date: string | Date | null) => {
  if (!date) return new Date().toISOString().slice(0, 16);
  
  try {
    let dateObj: Date;
    
    // Si es un número o string numérico (fecha serial de Excel)
    if (typeof date === 'number' || /^\d{5}$/.test(date.toString())) {
      const numeroSerial = typeof date === 'number' ? date : parseInt(date.toString());
      // Convertir número serial de Excel a fecha JavaScript
      const excelEpoch = new Date(1899, 11, 30);
      dateObj = new Date(excelEpoch.getTime() + (numeroSerial * 24 * 60 * 60 * 1000));
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Verificar si es una fecha válida
    if (isNaN(dateObj.getTime())) {
      console.error('Fecha inválida para input:', date);
      return new Date().toISOString().slice(0, 16);
    }

    // Formatear para input datetime-local (YYYY-MM-DDThh:mm)
    return dateObj.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error al formatear fecha para input:', error);
    return new Date().toISOString().slice(0, 16);
  }
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
    fechaProgramada: formatDateForInput(new Date()),
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
  
  newMantenimiento.value = {
    dispensador_id: mantenimiento.dispensador_id,
    cliente_id: mantenimiento.cliente_id,
    sucursal_id: mantenimiento.sucursal_id,
    tecnico_id: mantenimiento.tecnico_id,
    fechaProgramada: formatDateForInput(mantenimiento.fechaProgramada),
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
  ultimoMantenimiento.value = null;
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
    // Verificar si el cliente tiene sucursales
    const clienteTieneSucursales = sucursalesFiltradas.value.length > 0;
    
    // Si el cliente tiene sucursales y se ha seleccionado un dispensador sin sucursal,
    // permitir guardar sin sucursal
    if (clienteTieneSucursales && !newMantenimiento.value.sucursal_id) {
      const dispensadorSeleccionado = dispensadores.value.find(d => d.id === newMantenimiento.value.dispensador_id);
      if (dispensadorSeleccionado?.sucursal_id) {
        alert('Por favor, seleccione una sucursal para este dispensador');
        return;
      }
    }

    if (isEditing.value && editingMantenimientoId.value) {
      await mantenimientosStore.updateMantenimiento(editingMantenimientoId.value, newMantenimiento.value);
    } else {
      await mantenimientosStore.createMantenimiento(newMantenimiento.value);
    }
    await mantenimientosStore.fetchMantenimientos();
    closeModal();
  } catch (error) {
    console.error('Error al guardar mantenimiento:', error);
    alert('Error al guardar el mantenimiento: ' + error.message);
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

const getSucursalDireccion = (sucursalId: number | null) => {
  if (!sucursalId) {
    // Si no hay sucursal, buscar el cliente del mantenimiento actual
    const mantenimientoActual = mantenimientos.value.find(m => m.sucursal_id === sucursalId);
    if (mantenimientoActual?.cliente_id) {
      const cliente = clientes.value.find(c => c.id === mantenimientoActual.cliente_id);
      return cliente?.direccion || 'Dirección no disponible';
    }
    return 'Dirección no disponible';
  }
  const sucursal = sucursales.value.find(s => s.id === sucursalId);
  return sucursal?.direccion || 'Dirección no disponible';
};

const openEnviarTecnicoModal = (mantenimiento: any) => {
  selectedMantenimiento.value = mantenimiento;
  showEnviarTecnicoModal.value = true;
};

const closeEnviarTecnicoModal = () => {
  showEnviarTecnicoModal.value = false;
  selectedTecnicoId.value = null;
  selectedMantenimiento.value = null;
};

const getWhatsAppLink = computed(() => {
  if (!selectedTecnicoId.value || !selectedMantenimiento.value) return '#';
  
  const tecnico = tecnicos.value.find(t => t.id === selectedTecnicoId.value);
  if (!tecnico?.telefono) return '#';

  const sucursal = sucursales.value.find(s => s.id === selectedMantenimiento.value.sucursal_id);
  const cliente = clientes.value.find(c => c.id === selectedMantenimiento.value.cliente_id);
  const dispensador = dispensadores.value.find(d => d.id === selectedMantenimiento.value.dispensador_id);

  const mensaje = encodeURIComponent(`*Nuevo Mantenimiento Asignado*
-----------------------------------
*Cliente:* ${cliente?.nombre}
*Sucursal:* ${sucursal?.nombre}
*Dirección:* ${sucursal?.direccion}
*Fecha:* ${formatDate(selectedMantenimiento.value.fechaProgramada)}
*Tipo:* ${selectedMantenimiento.value.tipo}
*Estado:* ${selectedMantenimiento.value.estado}
*Dispensador:* ${dispensador?.modelo} - #${dispensador?.numero_serie}
-----------------------------------
*Detalles del Mantenimiento:*
${selectedMantenimiento.value.descripcion ? `*Descripción:*
${selectedMantenimiento.value.descripcion}

` : ''}${selectedMantenimiento.value.observaciones ? `*Observaciones:*
${selectedMantenimiento.value.observaciones}` : ''}`);

  const telefono = tecnico.telefono.replace(/\D/g, '');
  return `https://wa.me/${telefono}?text=${mensaje}`;
});

// Función para obtener el último mantenimiento
const obtenerUltimoMantenimiento = async (dispensadorId: number) => {
  try {
    const mantenimientosFiltrados = mantenimientos.value
      .filter(m => m.dispensador_id === dispensadorId)
      .sort((a, b) => new Date(b.fechaProgramada).getTime() - new Date(a.fechaProgramada).getTime());
    
    ultimoMantenimiento.value = mantenimientosFiltrados[0] || null;
  } catch (error) {
    console.error('Error al obtener último mantenimiento:', error);
    ultimoMantenimiento.value = null;
  }
};

// Modificar el watch del dispensador_id para obtener el último mantenimiento
watch(() => newMantenimiento.value.dispensador_id, async (newId) => {
  if (newId && !isEditing.value) {
    await obtenerUltimoMantenimiento(newId);
  } else {
    ultimoMantenimiento.value = null;
  }
});

const toggleSelection = (id: number) => {
  const index = selectedMantenimientos.value.indexOf(id);
  if (index === -1) {
    selectedMantenimientos.value.push(id);
  } else {
    selectedMantenimientos.value.splice(index, 1);
  }
};

const deleteSelectedMantenimientos = async () => {
  if (!selectedMantenimientos.value.length) return;

  if (confirm(`¿Está seguro de que desea eliminar ${selectedMantenimientos.value.length} mantenimientos?`)) {
    try {
      for (const id of selectedMantenimientos.value) {
        await mantenimientosStore.deleteMantenimiento(id);
      }
      selectedMantenimientos.value = []; // Limpiar selección
      await mantenimientosStore.fetchMantenimientos(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar mantenimientos:', error);
    }
  }
};

const editUltimoMantenimiento = () => {
  if (ultimoMantenimiento.value) {
    editMantenimiento(ultimoMantenimiento.value);
  }
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

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-danger:hover {
  background: #c82333;
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
  position: relative;
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

.info-text span.address {
  color: #666;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.info-text span.address i {
  color: var(--primary-color);
  font-size: 0.9rem;
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

.action-btn.whatsapp {
  background: #25d366;
  color: white;
}

.action-btn.whatsapp:hover {
  background: #128c7e;
}

.btn-whatsapp {
  background: #25d366;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-whatsapp:hover {
  background: #128c7e;
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

.sucursal-group {
  flex: 1;
}

.sucursal-select-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sucursal-direccion {
  font-size: 0.9rem;
  color: #666;
  padding: 0.3rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sucursal-direccion i {
  color: var(--primary-color);
}

.sector-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  color: var(--primary-color);
  font-size: 0.9rem;
}

.sector-info i {
  font-size: 0.9rem;
}

.historial-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.historial-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  justify-content: space-between;
}

.historial-header i {
  font-size: 1.2rem;
}

.historial-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.btn-edit-historial {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
}

.btn-edit-historial:hover {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.btn-edit-historial i {
  font-size: 0.9rem;
}

.historial-content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.historial-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.historial-item strong {
  color: #495057;
  font-size: 0.9rem;
}

.historial-item span {
  color: #212529;
}

.historial-item p {
  margin: 0;
  color: #212529;
  font-size: 0.95rem;
  line-height: 1.4;
}

.historial-item span.completado {
  color: #198754;
}

.historial-item span.pendiente {
  color: #ffc107;
}

.historial-item span.en_proceso {
  color: #0d6efd;
}

.historial-item span.cancelado {
  color: #dc3545;
}

.historial-item span.preventivo {
  color: #198754;
}

.historial-item span.correctivo {
  color: #dc3545;
}

.historial-item span.emergencia {
  color: #ffc107;
}

.card-selection {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}

.card-selection input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.mantenimiento-card.selected {
  border: 2px solid var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.mantenimiento-card:hover .card-selection {
  opacity: 1;
}
</style> 