import type { Cliente } from './cliente.interface'
import type { Sucursal } from './sucursal.interface'

export interface Dispensador {
  id: number
  modelo: string
  numero_serie: string
  estado: 'activo' | 'inactivo' | 'mantenimiento'
  sector: string
  fecha_instalacion: string
  ultimo_mantenimiento?: string
  proximo_mantenimiento?: string
  sucursal_id?: number | null
  cliente_id?: number | null
  cliente_nombre?: string
  sucursal_nombre?: string
  sucursal?: Sucursal & {
    cliente?: Cliente
  }
  cliente?: Cliente
} 