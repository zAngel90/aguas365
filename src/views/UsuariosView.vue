<template>
  <div>
    <div class="page-header">
      <h1>Gestión de Usuarios</h1>
      <!-- <button class="btn-primary" @click="openModal">
        <i class="fas fa-plus"></i>
        Nuevo Usuario
      </button> -->
    </div>

    <div v-if="loading" class="loading">Cargando usuarios...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="usuarios-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td>{{ usuario.id }}</td>
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.email }}</td>
            <td>
              <span :class="['badge', usuario.rol]">
                {{ usuario.rol }}
              </span>
            </td>
            <td>
              <button class="btn-icon" @click="deleteUsuario(usuario.id)" v-if="usuario.rol !== 'admin'">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Usuario -->
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Nuevo Usuario</h3>
          <button class="close-modal" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUsuario">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" v-model="usuarioForm.nombre" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="usuarioForm.email" required>
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input type="password" id="password" v-model="usuarioForm.password" required>
            </div>
            <div class="form-group">
              <label for="rol">Rol</label>
              <select id="rol" v-model="usuarioForm.rol" required>
                <option value="tecnico">Técnico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUsuariosStore } from '@/stores/usuarios.store'
import { storeToRefs } from 'pinia'

const usuariosStore = useUsuariosStore()
const { usuarios, loading, error } = storeToRefs(usuariosStore)

const showModal = ref(false)
const usuarioForm = reactive({
  nombre: '',
  email: '',
  password: '',
  rol: 'tecnico'
})

onMounted(async () => {
  await usuariosStore.fetchUsuarios()
})

const openModal = () => {
  usuarioForm.nombre = ''
  usuarioForm.email = ''
  usuarioForm.password = ''
  usuarioForm.rol = 'tecnico'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveUsuario = async () => {
  try {
    await usuariosStore.createUsuario(usuarioForm)
    closeModal()
  } catch (error) {
    console.error('Error al guardar usuario:', error)
  }
}

const deleteUsuario = async (id: number) => {
  if (confirm('¿Estás seguro de eliminar este usuario?')) {
    try {
      await usuariosStore.deleteUsuario(id)
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
    }
  }
}
</script>

<style scoped>
.usuarios-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-top: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

th {
  background-color: #f8f9fa;
  font-weight: 500;
  color: var(--text-color);
}

tr:hover {
  background-color: #f8f9fa;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  margin: 0 0.5rem;
}

.btn-icon:hover {
  color: var(--secondary-color);
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.admin {
  background-color: #e3f2fd;
  color: #1565c0;
}

.badge.tecnico {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background-color: #f5f5f5;
  color: var(--text-color);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color);
}
</style> 