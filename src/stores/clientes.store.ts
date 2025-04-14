import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { clientesService, type Cliente } from '@/services/clientes.service';
import { sucursalesService, type Sucursal } from '@/services/sucursales.service';

export const useClientesStore = defineStore('clientes', () => {
  const clientes = ref<Cliente[]>([]);
  const sucursales = ref<Sucursal[]>([]);
  const currentCliente = ref<Cliente | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchClientes = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get('/clientes');
      clientes.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener clientes';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSucursales = async (clienteId: number) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await sucursalesService.getByCliente(clienteId);
      sucursales.value = response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener sucursales';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCliente = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      currentCliente.value = await clientesService.getById(id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener cliente';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCliente = async (clienteData: Omit<Cliente, 'id'>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await clientesService.create(clienteData);
      clientes.value.push(response);
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear cliente';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCliente = async (id: number, clienteData: Partial<Cliente>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await clientesService.update(id, clienteData);
      const index = clientes.value.findIndex(c => c.id === id);
      if (index !== -1) {
        clientes.value[index] = response;
      }
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar cliente';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCliente = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await clientesService.delete(id);
      clientes.value = clientes.value.filter(c => c.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar cliente';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSucursal = async (sucursalData: Omit<Sucursal, 'id'>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await sucursalesService.create({
        ...sucursalData,
        cliente_id: sucursalData.cliente_id
      });
      sucursales.value.push(response);
      // Actualizar el conteo de sucursales del cliente
      await fetchClientes();
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear sucursal';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSucursal = async (id: number, sucursalData: Partial<Sucursal>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await sucursalesService.update(id, {
        ...sucursalData,
        cliente_id: sucursalData.cliente_id
      });
      const index = sucursales.value.findIndex(s => s.id === id);
      if (index !== -1) {
        sucursales.value[index] = response;
      }
      // Actualizar el conteo de sucursales del cliente
      await fetchClientes();
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar sucursal';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSucursal = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await sucursalesService.delete(id);
      sucursales.value = sucursales.value.filter(s => s.id !== id);
      // Actualizar el conteo de sucursales del cliente
      await fetchClientes();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar sucursal';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    clientes,
    sucursales,
    currentCliente,
    loading,
    error,
    fetchClientes,
    fetchSucursales,
    fetchCliente,
    createCliente,
    updateCliente,
    deleteCliente,
    createSucursal,
    updateSucursal,
    deleteSucursal
  };
}); 