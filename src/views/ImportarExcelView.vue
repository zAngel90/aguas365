<template>
  <div class="import-container">
    <div class="import-header">
      <h1>Importar Historial de Mantenimientos</h1>
      <p class="description">
        Sube tu archivo Excel con el historial de mantenimientos para analizar su estructura.
        Una vez validada la estructura, podrás proceder con la importación.
      </p>
    </div>

    <div class="upload-section">
      <div class="upload-box" @dragover.prevent @drop.prevent="handleDrop">
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          @change="handleFileChange"
          class="file-input"
          ref="fileInput"
        />
        <div class="upload-content">
          <i class="fas fa-file-excel"></i>
          <p>Arrastra tu archivo Excel aquí o</p>
          <button class="btn-select" @click="triggerFileInput">Seleccionar Archivo</button>
          <p class="file-types">Formatos soportados: .xlsx, .xls</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-section">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Analizando archivo...</p>
    </div>

    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>

    <div v-if="previewData" class="preview-section">
      <div class="preview-header">
        <h2>Vista Previa de la Estructura</h2>
        <div class="preview-actions">
          <button class="btn-download" @click="downloadStructure">
            <i class="fas fa-download"></i> Descargar Estructura
          </button>
          <button class="btn-secondary" @click="resetPreview">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button class="btn-primary" @click="proceedWithImport" :disabled="!isValidStructure">
            <i class="fas fa-check"></i> Proceder con Importación
          </button>
        </div>
      </div>

      <div class="structure-info">
        <h3>Estructura Detectada</h3>
        <div class="columns-grid">
          <div v-for="(header, index) in previewData.headers" :key="index" class="column-item">
            <span class="column-name">{{ header.nombre }}</span>
            <span class="column-type" :class="header.tipo">{{ header.tipo }}</span>
          </div>
        </div>
      </div>

      <div class="data-preview">
        <h3>Datos de Ejemplo (Primeras 30 filas)</h3>
        <div class="total-rows">Total de filas detectadas: {{ previewData.totalRows }}</div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th v-for="(header, index) in previewData.headers" :key="index">
                  {{ header.nombre }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in limitedRows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';

const loading = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const previewData = ref<{
  headers: Array<{nombre: string; tipo: string}>;
  rows: any[][];
  totalRows: number;
} | null>(null);

const isValidStructure = computed(() => {
  if (!previewData.value?.headers) return false;
  // Aquí puedes agregar validaciones específicas de la estructura
  return true;
});

const limitedRows = computed(() => {
  if (!previewData.value?.rows) return [];
  return previewData.value.rows.slice(0, 30);
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFile(files[0]);
  }
};

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    handleFile(file);
  }
};

const downloadStructure = () => {
  if (!previewData.value) return;

  // Crear contenido del archivo
  let content = 'ESTRUCTURA DETECTADA DEL ARCHIVO EXCEL\n';
  content += '=====================================\n\n';
  
  // Agregar información de columnas
  content += 'COLUMNAS:\n';
  content += '---------\n';
  previewData.value.headers.forEach((header, index) => {
    content += `${index + 1}. ${header.nombre} (${header.tipo})\n`;
  });
  content += '\n';

  // Agregar información de filas
  content += `TOTAL DE FILAS: ${previewData.value.totalRows}\n\n`;
  
  // Agregar muestra de datos
  content += 'MUESTRA DE DATOS (Primeras 30 filas):\n';
  content += '--------------------------------\n';
  
  // Crear tabla de datos
  const headers = previewData.value.headers.map(h => h.nombre);
  content += headers.join('\t') + '\n';
  content += headers.map(() => '---').join('\t') + '\n';
  
  limitedRows.value.forEach(row => {
    content += row.join('\t') + '\n';
  });

  // Crear y descargar el archivo
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'estructura_excel.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const convertirFechaExcel = (numeroSerial) => {
  if (!numeroSerial) return '';
  try {
    // Convertir número serial de Excel a fecha JavaScript
    const excelEpoch = new Date(1899, 11, 30);
    const fecha = new Date(excelEpoch.getTime() + (numeroSerial * 24 * 60 * 60 * 1000));
    
    // Formatear la fecha como DD/MM/YYYY
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    
    return `${dia}/${mes}/${año}`;
  } catch (error) {
    console.error('Error al convertir fecha:', error);
    return numeroSerial;
  }
};

const procesarDatosExcel = (data) => {
  return data.map(row => {
    const newRow = { ...row };
    // Convertir la fecha si existe y es un número
    if (newRow.FECHA && typeof newRow.FECHA === 'number') {
      newRow.FECHA = convertirFechaExcel(newRow.FECHA);
    }
    return newRow;
  });
};

const handleFile = async (file: File) => {
  if (!file.name.match(/\.(xlsx|xls)$/)) {
    error.value = 'Por favor selecciona un archivo Excel válido (.xlsx o .xls)';
    return;
  }

  loading.value = true;
  error.value = null;
  previewData.value = null;

  try {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Buscar la hoja "SABANA"
        const sheetName = 'SABANA';
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error('No se encontró la hoja "SABANA" en el archivo Excel');
        }

        const worksheet = workbook.Sheets[sheetName];
        
        // Configurar opciones para leer todas las columnas como texto
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // Esto fuerza a que todas las celdas se lean como texto
          defval: '', // Valor por defecto para celdas vacías
          header: 1,   // Usar la primera fila como encabezados
          blankrows: false // Ignorar filas vacías
        });

        if (jsonData.length < 2) {
          throw new Error('El archivo no contiene suficientes datos');
        }

        // Obtener encabezados
        const headers = (jsonData[0] as string[]).map(header => ({
          nombre: header?.trim() || '',
          tipo: 'string'
        }));

        // Procesar las filas de datos
        const rows = jsonData.slice(1).map(row => {
          // Asegurarse de que cada fila tenga todas las columnas
          return headers.map((header, index) => {
            const value = (row as any[])[index];
            // Si es la columna FECHA y es un número, mantenerlo como número
            if (header.nombre === 'FECHA' && !isNaN(Number(value))) {
              return Number(value);
            }
            // Para otras columnas, asegurarse de que sea string
            return value?.toString() || '';
          });
        });

        previewData.value = {
          headers,
          rows,
          totalRows: rows.length
        };

        console.log('Headers detectados:', headers);
        console.log('Muestra de filas:', rows.slice(0, 3));

      } catch (err: any) {
        error.value = err.message || 'Error al procesar el archivo';
        console.error('Error detallado:', err);
      } finally {
        loading.value = false;
      }
    };

    reader.onerror = () => {
      error.value = 'Error al leer el archivo';
      loading.value = false;
    };

    reader.readAsArrayBuffer(file);
  } catch (err: any) {
    error.value = err.message || 'Error al procesar el archivo';
    loading.value = false;
  }
};

const resetPreview = () => {
  previewData.value = null;
  error.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const proceedWithImport = async () => {
  // Aquí implementaremos la lógica de importación
  console.log('Procediendo con la importación...');
};
</script>

<style scoped>
.import-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.import-header {
  text-align: center;
  margin-bottom: 2rem;
}

.import-header h1 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.description {
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.upload-section {
  margin: 2rem 0;
}

.upload-box {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #f8f9fa;
  position: relative;
  transition: border-color 0.3s, background-color 0.3s;
}

.upload-box:hover {
  border-color: var(--primary-color);
  background: #f1f3f5;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  pointer-events: none;
}

.upload-content i {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.btn-select {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 1rem 0;
}

.file-types {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.loading-section {
  text-align: center;
  padding: 2rem;
  color: var(--primary-color);
}

.loading-section i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1.5rem;
  margin-top: 2rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.preview-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.structure-info {
  margin-bottom: 2rem;
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.column-item {
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-type {
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  background: #e9ecef;
}

.column-type.string { background: #d4edda; color: #155724; }
.column-type.number { background: #cce5ff; color: #004085; }
.column-type.date { background: #fff3cd; color: #856404; }

.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th, td {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: left;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

tr:nth-child(even) {
  background: #f8f9fa;
}

.btn-download {
  background: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.btn-download:hover {
  background: #218838;
}

.total-rows {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  font-style: italic;
}
</style> 