<template>
  <div class="import-container">
    <h1>Importar Datos desde Excel</h1>
    <p>Sube tu archivo Excel para analizar su estructura</p>

    <div class="upload-box">
      <input 
        type="file" 
        accept=".xlsx,.xls" 
        @change="handleFileChange"
        class="file-input"
      />
    </div>

    <div v-if="loading" class="loading">
      <p>Analizando archivo...</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="previewData" class="preview-section">
      <h2>Vista Previa</h2>
      <table>
        <thead>
          <tr>
            <th v-for="(header, index) in previewData.headers" :key="index">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in previewData.rows" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(false);
const error = ref<string | null>(null);
const previewData = ref<{
  headers: string[];
  rows: any[][];
} | null>(null);

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) {
    error.value = 'Por favor selecciona un archivo';
    return;
  }

  console.log('Archivo seleccionado:', {
    nombre: file.name,
    tipo: file.type,
    tamaño: file.size
  });

  loading.value = true;
  error.value = null;
  previewData.value = null;

  try {
    const formData = new FormData();
    formData.append('file', file, file.name);

    console.log('Enviando archivo...');
    
    const response = await fetch('http://localhost:3000/api/importar/detectar-estructura', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData
    });

    console.log('Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log('Respuesta completa:', responseText);

    if (!response.ok) {
      throw new Error(responseText);
    }

    try {
      const result = JSON.parse(responseText);
      if (result.success) {
        previewData.value = {
          headers: result.data.columnas.map((col: any) => `${col.nombre} (${col.tipo})`),
          rows: result.data.filas
        };
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (parseError) {
      throw new Error('Error al procesar la respuesta del servidor');
    }
  } catch (err: any) {
    console.error('Error detallado:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.import-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.upload-box {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
  cursor: pointer;
}

.file-input {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}

.loading {
  text-align: center;
  margin: 20px 0;
  color: #2196F3;
}

.error-message {
  color: #f44336;
  padding: 10px;
  margin: 10px 0;
  background-color: #ffebee;
  border-radius: 4px;
}

.preview-section {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f5f5f5;
}
</style> 