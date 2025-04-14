import { Dispensador } from './dispensador.interface';
import { Cliente } from './cliente.interface';
import { Sucursal } from './sucursal.interface';
import { Tecnico } from './tecnico.interface';

export interface Mantenimiento {
  id?: number;
  dispensador_id: number;
  cliente_id: number;
  sucursal_id: number;
  tecnico_id: number;
  fechaProgramada: string;
  fechaRealizada?: string;
  tipo: 'preventivo' | 'correctivo' | 'emergencia';
  descripcion: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  observaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
  dispensador?: Dispensador;
  cliente?: Cliente;
  sucursal?: Sucursal;
  tecnico?: Tecnico;
} 