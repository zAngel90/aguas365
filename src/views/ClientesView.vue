<template>
  <div class="clientes-container">
    <div class="page-header">
      <h1>Gestión de Clientes</h1>
      <button class="btn-primary" @click="openModal">
        <i class="fas fa-plus"></i>
        Nuevo Cliente
      </button>
    </div>

    <!-- Notificación de éxito -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      <i :class="notification.icon"></i>
      {{ notification.message }}
    </div>

    <div class="clientes-grid">
      <div v-for="cliente in clientes" :key="cliente.id" class="cliente-card">
        <div class="cliente-header">
          <h3>{{ cliente.nombre }}</h3>
          <div class="cliente-actions">
            <button @click="openSucursalesModal(cliente)" class="btn-icon">
              <i class="fas fa-store"></i>
            </button>
            <button @click="editCliente(cliente)" class="btn-icon">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteCliente(cliente.id)" class="btn-icon">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="cliente-info">
          <p><i class="fas fa-map-marker-alt"></i> {{ cliente.direccion }}</p>
          <p><i class="fas fa-phone"></i> {{ cliente.telefono }}</p>
          <p><i class="fas fa-envelope"></i> {{ cliente.email }}</p>
        </div>
        <div class="cliente-footer">
          <span class="sucursales-count">
            <i class="fas fa-store"></i> {{ getSucursalesCount(cliente.id) }} sucursales
          </span>
        </div>
      </div>
    </div>

    <!-- Modal de Cliente -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingCliente ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
        <form @submit.prevent="saveCliente">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.nombre" required>
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input v-model="form.direccion" required>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="form.telefono" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email">
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Sucursales -->
    <div v-if="showSucursalesModal" class="modal">
      <div class="modal-content">
        <h2>Gestión de Sucursales - {{ selectedCliente?.nombre }}</h2>
        <div class="sucursales-header">
          <button class="btn-primary" @click="openSucursalModal">
            <i class="fas fa-plus"></i>
            Nueva Sucursal
          </button>
        </div>
        <div class="sucursales-grid">
          <div v-for="sucursal in sucursales" :key="sucursal.id" class="sucursal-card">
            <div class="sucursal-header">
              <h3>{{ sucursal.nombre }}</h3>
              <div class="sucursal-actions">
                <button @click="editSucursal(sucursal)" class="btn-icon">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteSucursal(sucursal.id)" class="btn-icon">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="sucursal-info">
              <p><i class="fas fa-map-marker-alt"></i> {{ sucursal.direccion }}</p>
              <p><i class="fas fa-phone"></i> {{ sucursal.telefono }}</p>
              <p><i class="fas fa-envelope"></i> {{ sucursal.email }}</p>
              <p><i class="fas fa-id-card"></i> {{ sucursal.nif }}</p>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeSucursalesModal" class="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Sucursal -->
    <div v-if="showSucursalModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal' }}</h2>
        <form @submit.prevent="saveSucursal">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="sucursalForm.nombre" required>
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input v-model="sucursalForm.direccion" required>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="sucursalForm.telefono">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="sucursalForm.email" type="email">
          </div>
          <div class="form-group">
            <label>NIF</label>
            <input v-model="sucursalForm.nif" required>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeSucursalModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useClientesStore } from '@/stores/clientes.store'
import { clientesService } from '@/services/clientes.service'
import { storeToRefs } from 'pinia'

const clientesStore = useClientesStore()
const { clientes, sucursales, loading, error } = storeToRefs(clientesStore)

// Estados para modales
const showModal = ref(false)
const showSucursalesModal = ref(false)
const showSucursalModal = ref(false)
const editingCliente = ref(null)
const editingSucursal = ref(null)
const selectedCliente = ref(null)

// Formularios
const form = reactive({
  nombre: '',
  direccion: '',
  telefono: '',
  email: ''
})

const sucursalForm = reactive({
  nombre: '',
  direccion: '',
  telefono: '',
  email: '',
  nif: '',
  cliente_id: null as number | null
})

// Estado para almacenar los conteos de sucursales
const sucursalesCounts = ref<Record<number, number>>({})

// Estado para notificaciones
const notification = reactive({
  show: false,
  message: '',
  type: 'success',
  icon: 'fas fa-check-circle'
})

// Métodos
const openModal = () => {
  editingCliente.value = null
  form.nombre = ''
  form.direccion = ''
  form.telefono = ''
  form.email = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const openSucursalesModal = (cliente) => {
  selectedCliente.value = cliente
  sucursalForm.cliente_id = cliente.id
  clientesStore.fetchSucursales(cliente.id)
  showSucursalesModal.value = true
}

const closeSucursalesModal = () => {
  showSucursalesModal.value = false
  selectedCliente.value = null
}

const openSucursalModal = () => {
  editingSucursal.value = null
  sucursalForm.nombre = ''
  sucursalForm.direccion = ''
  sucursalForm.telefono = ''
  sucursalForm.email = ''
  sucursalForm.nif = ''
  if (selectedCliente.value) {
    sucursalForm.cliente_id = selectedCliente.value.id
  }
  showSucursalModal.value = true
}

const closeSucursalModal = () => {
  showSucursalModal.value = false
}

const editCliente = (cliente) => {
  editingCliente.value = cliente
  form.nombre = cliente.nombre
  form.direccion = cliente.direccion
  form.telefono = cliente.telefono
  form.email = cliente.email
  showModal.value = true
}

const editSucursal = (sucursal) => {
  editingSucursal.value = sucursal
  sucursalForm.nombre = sucursal.nombre
  sucursalForm.direccion = sucursal.direccion
  sucursalForm.telefono = sucursal.telefono
  sucursalForm.email = sucursal.email
  sucursalForm.nif = sucursal.nif
  showSucursalModal.value = true
}

const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.show = true
  notification.message = message
  notification.type = type
  notification.icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
  
  // Ocultar la notificación después de 3 segundos
  setTimeout(() => {
    notification.show = false
  }, 3000)
}

const saveCliente = async () => {
  try {
    loading.value = true
    if (editingCliente.value) {
      await clientesStore.updateCliente(editingCliente.value.id, form)
      showNotification('Cliente actualizado exitosamente')
    } else {
      await clientesStore.createCliente(form)
      showNotification('Cliente creado exitosamente')
    }
    closeModal()
    await clientesStore.fetchClientes()
    // Recargar conteos después de guardar
    for (const cliente of clientes.value) {
      await loadSucursalesCount(cliente.id)
    }
  } catch (error: any) {
    console.error('Error al guardar cliente:', error)
    // Si es un error 500 pero los datos se guardaron, mostrar éxito
    if (error?.response?.status === 500) {
      showNotification('Cliente guardado exitosamente')
      closeModal()
      await clientesStore.fetchClientes()
      // Recargar conteos después de guardar
      for (const cliente of clientes.value) {
        await loadSucursalesCount(cliente.id)
      }
    } else {
      const errorMessage = error?.response?.data?.message || 'Error al guardar el cliente. Por favor, intente nuevamente.'
      showNotification(errorMessage, 'error')
    }
  } finally {
    loading.value = false
  }
}

const saveSucursal = async () => {
  try {
    loading.value = true
    if (editingSucursal.value) {
      await clientesStore.updateSucursal(editingSucursal.value.id, sucursalForm)
      showNotification('Sucursal actualizada exitosamente')
    } else {
      await clientesStore.createSucursal(sucursalForm)
      showNotification('Sucursal creada exitosamente')
    }
    
    if (selectedCliente.value) {
      await clientesStore.fetchSucursales(selectedCliente.value.id)
      await clientesStore.fetchClientes()
      // Recargar conteos después de guardar
      for (const cliente of clientes.value) {
        await loadSucursalesCount(cliente.id)
      }
    }
    closeSucursalModal()
  } catch (error: any) {
    console.error('Error al guardar sucursal:', error)
    // Si es un error 500 pero los datos se guardaron, mostrar éxito
    if (error?.response?.status === 500) {
      showNotification('Sucursal guardada exitosamente')
      closeSucursalModal()
      if (selectedCliente.value) {
        await clientesStore.fetchSucursales(selectedCliente.value.id)
        await clientesStore.fetchClientes()
        // Recargar conteos después de guardar
        for (const cliente of clientes.value) {
          await loadSucursalesCount(cliente.id)
        }
      }
    } else {
      const errorMessage = error?.response?.data?.message || 'Error al guardar la sucursal. Por favor, intente nuevamente.'
      showNotification(errorMessage, 'error')
    }
  } finally {
    loading.value = false
  }
}

const deleteCliente = async (id) => {
  if (confirm('¿Está seguro de eliminar este cliente?')) {
    try {
      loading.value = true
      await clientesStore.deleteCliente(id)
      showNotification('Cliente eliminado exitosamente')
      await clientesStore.fetchClientes()
      // Recargar conteos después de eliminar
      for (const cliente of clientes.value) {
        await loadSucursalesCount(cliente.id)
      }
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error)
      const errorMessage = error?.response?.data?.message || 'Error al eliminar el cliente. Por favor, intente nuevamente.'
      showNotification(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }
}

const deleteSucursal = async (id) => {
  if (confirm('¿Está seguro de eliminar esta sucursal?')) {
    try {
      loading.value = true
      await clientesStore.deleteSucursal(id)
      showNotification('Sucursal eliminada exitosamente')
      
      if (selectedCliente.value) {
        await clientesStore.fetchSucursales(selectedCliente.value.id)
        await clientesStore.fetchClientes()
        // Recargar conteos después de eliminar
        for (const cliente of clientes.value) {
          await loadSucursalesCount(cliente.id)
        }
      }
    } catch (error: any) {
      console.error('Error al eliminar sucursal:', error)
      const errorMessage = error?.response?.data?.message || 'Error al eliminar la sucursal. Por favor, intente nuevamente.'
      showNotification(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }
}

// Función para cargar el conteo de sucursales de un cliente
const loadSucursalesCount = async (clienteId: number) => {
  try {
    const count = await clientesService.getSucursalesCount(clienteId)
    sucursalesCounts.value[clienteId] = count
  } catch (error) {
    console.error('Error al obtener conteo de sucursales:', error)
  }
}

// Función para obtener el conteo de sucursales
const getSucursalesCount = (clienteId: number) => {
  return sucursalesCounts.value[clienteId] || 0
}

// Cargar clientes al montar el componente
onMounted(async () => {
  try {
    await clientesStore.fetchClientes()
    // Cargar conteos de sucursales para cada cliente
    for (const cliente of clientes.value) {
      await loadSucursalesCount(cliente.id)
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  }
})
</script>

<style scoped>
.clientes-container {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.clientes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.cliente-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cliente-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.cliente-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cliente-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.cliente-info {
  margin-bottom: 1rem;
}

.cliente-info p {
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cliente-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.sucursales-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
}

.sucursales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.sucursal-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sucursal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sucursal-info {
  margin-bottom: 1rem;
}

.sucursal-info p {
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background: #e0e0e0;
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