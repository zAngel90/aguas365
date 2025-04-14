export interface Tecnico {
  id?: number;
  nombre: string;
  email: string;
  especialidad: string;
  telefono: string;
  estado: 'activo' | 'inactivo' | 'vacaciones';
  created_at?: string;
  updated_at?: string;
}

export interface TecnicoFormData {
  nombre: string;
  email: string;
  telefono: string;
  especialidad: string;
  estado: 'activo' | 'inactivo' | 'vacaciones';
} 