<template>
  <div class="tecnicos-container">
    <div class="header">
      <div class="header-text">
        <h1>Técnicos</h1>
        <p>Gestiona tu equipo de técnicos especializados</p>
      </div>
      <button @click="openModal('add')" class="btn-add">
        <i class="fas fa-plus-circle"></i>
        <span>Agregar Técnico</span>
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando técnicos...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <div>
        <p class="error-title">Error</p>
        <p>{{ error }}</p>
      </div>
    </div>

    <div v-else-if="!tecnicos.length" class="empty-state">
      <i class="fas fa-users"></i>
      <p>No hay técnicos registrados.</p>
      <p>Comienza agregando un nuevo técnico al equipo.</p>
    </div>

    <div v-else class="tecnicos-grid">
      <div v-for="tecnico in tecnicos" :key="tecnico.id" class="tecnico-card">
        <div class="tecnico-header">
          <h3>{{ tecnico.nombre }}</h3>
          <span :class="getDisponibilidadClass(tecnico.estado || 'activo')">
            {{ formatEstado(tecnico.estado || 'activo') }}
          </span>
        </div>
        <div class="tecnico-info">
          <p><i class="fas fa-envelope"></i> {{ tecnico.email }}</p>
          <p><i class="fas fa-wrench"></i> {{ tecnico.especialidad }}</p>
          <p><i class="fas fa-phone"></i> {{ tecnico.telefono }}</p>
          <p><i class="fas fa-circle-check"></i> Estado: {{ formatEstado(tecnico.estado || 'activo') }}</p>
          <a :href="`https://wa.me/${formatWhatsAppNumber(tecnico.telefono)}`" 
             target="_blank" 
             class="whatsapp-button">
            <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
          </a>
        </div>
        <div class="tecnico-actions">
          <button @click="() => openModal('edit', tecnico)" class="edit-button">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="() => confirmDelete(tecnico)" class="delete-button">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <Modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="modal-header">
          <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
          <h3>{{ isEditing ? 'Editar Técnico' : 'Agregar Técnico' }}</h3>
        </div>
      </template>

      <template #body>
        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              v-model="form.nombre"
              required
              placeholder="Nombre completo"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              required
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div class="form-group">
            <label for="telefono">Teléfono (incluir código de país, ej: +57 300 123 4567)</label>
            <input
              type="tel"
              id="telefono"
              v-model="form.telefono"
              required
              placeholder="+57 300 123 4567"
            />
          </div>

          <div class="form-group">
            <label for="whatsapp">WhatsApp</label>
            <input
              type="tel"
              id="whatsapp"
              v-model="form.whatsapp"
              placeholder="+1234567890"
            />
          </div>

          <div class="form-group">
            <label for="especialidad">Especialidad</label>
            <input
              type="text"
              id="especialidad"
              v-model="form.especialidad"
              required
              placeholder="Ej: Mantenimiento de dispensadores"
            />
          </div>

          <div class="form-group">
            <label for="estado">Estado</label>
            <select
              id="estado"
              v-model="form.estado"
              required
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="vacaciones">Vacaciones</option>
            </select>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn-secondary">
            Cancelar
          </button>
          <button type="submit" @click="handleSubmit" class="btn-primary">
            {{ isEditing ? 'Guardar cambios' : 'Agregar técnico' }}
          </button>
        </div>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>
        <div class="modal-header delete">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Confirmar eliminación</h3>
        </div>
      </template>

      <template #body>
        <div class="delete-confirmation">
          <p>¿Está seguro que desea eliminar al técnico <strong>{{ selectedTecnico?.nombre }}</strong>?</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
        </div>
      </template>

      <template #footer>
        <div class="modal-footer">
          <button type="button" @click="closeDeleteModal" class="btn-secondary">
            Cancelar
          </button>
          <button type="button" @click="deleteTecnico" class="btn-danger">
            <i class="fas fa-trash"></i>
            <span>Eliminar</span>
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTecnicosStore } from '@/stores/tecnicos.store';
import Modal from '../components/Modal.vue';
import type { Tecnico } from '@/interfaces/tecnico.interface';

const tecnicosStore = useTecnicosStore();
const { tecnicos, loading, error } = storeToRefs(tecnicosStore);

const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedTecnico = ref<Tecnico | null>(null);

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  whatsapp: '',
  especialidad: '',
  estado: 'activo' as 'activo' | 'inactivo' | 'vacaciones'
});

onMounted(async () => {
  await tecnicosStore.fetchTecnicos();
});

const openModal = (mode: 'add' | 'edit', tecnico?: Tecnico) => {
  isEditing.value = mode === 'edit';
  if (mode === 'edit' && tecnico) {
    selectedTecnico.value = tecnico;
    form.value = {
      nombre: tecnico.nombre,
      email: tecnico.email,
      telefono: tecnico.telefono,
      especialidad: tecnico.especialidad,
      estado: tecnico.estado
    };
  } else {
    form.value = {
      nombre: '',
      email: '',
      telefono: '',
      whatsapp: '',
      especialidad: '',
      estado: 'activo'
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedTecnico.value = null;
  form.value = {
    nombre: '',
    email: '',
    telefono: '',
    whatsapp: '',
    especialidad: '',
    estado: 'activo'
  };
};

const handleSubmit = async () => {
  try {
    if (isEditing.value && selectedTecnico.value) {
      await tecnicosStore.updateTecnico(selectedTecnico.value.id, form.value);
    } else {
      await tecnicosStore.createTecnico(form.value);
    }
    closeModal();
  } catch (err) {
    console.error('Error al guardar técnico:', err);
  }
};

const confirmDelete = (tecnico: Tecnico) => {
  selectedTecnico.value = tecnico;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedTecnico.value = null;
};

const deleteTecnico = async (id?: number) => {
  try {
    if (id) {
      await tecnicosStore.deleteTecnico(id);
    } else if (selectedTecnico.value) {
      await tecnicosStore.deleteTecnico(selectedTecnico.value.id);
      closeDeleteModal();
    }
  } catch (err) {
    console.error('Error al eliminar técnico:', err);
  }
};

const getDisponibilidadClass = (estado: string) => {
  const classes = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-red-100 text-red-800',
    vacaciones: 'bg-yellow-100 text-yellow-800'
  };
  return classes[estado as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const formatEstado = (estado: string) => {
  const estados = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    vacaciones: 'Vacaciones'
  };
  return estados[estado as keyof typeof estados] || estado;
};

const formatWhatsAppNumber = (number: string | undefined) => {
  if (!number) return '';
  return number.replace(/[^\d+]/g, '');
};
</script>

<style scoped>
.tecnicos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.header-text p {
  color: #6b7280;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-add:hover {
  background-color: #1d4ed8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 3rem 0;
}

.spinner {
  width: 4rem;
  height: 4rem;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.empty-state i {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state p:first-of-type {
  color: #4b5563;
  font-size: 1.125rem;
}

.empty-state p:last-of-type {
  color: #6b7280;
  margin-top: 0.5rem;
}

.tecnicos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.tecnico-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.tecnico-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.tecnico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.tecnico-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.tecnico-info {
  padding: 1rem;
}

.tecnico-info p {
  margin-bottom: 0.5rem;
}

.tecnico-info i {
  margin-right: 0.5rem;
}

.tecnico-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.edit-button,
.delete-button {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-button {
  color: #2563eb;
}

.edit-button:hover {
  background-color: #eff6ff;
}

.delete-button {
  color: #dc2626;
}

.delete-button:hover {
  background-color: #fee2e2;
}

.whatsapp-button {
  color: #25d366;
  text-decoration: none;
}

.whatsapp-button:hover {
  text-decoration: underline;
}

.form {
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
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header i {
  color: #2563eb;
}

.modal-header.delete i {
  color: #dc2626;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.delete-confirmation {
  color: #4b5563;
}

.delete-confirmation .warning {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.tecnico-header span {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .tecnicos-grid {
    grid-template-columns: 1fr;
  }
}
</style> 