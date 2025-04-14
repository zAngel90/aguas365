import { Cliente } from './cliente.interface'

export interface Sucursal {
  id: number
  nombre: string
  direccion: string
  telefono: string
  email: string
  cliente_id: number
  cliente?: Cliente
  created_at?: Date
  updated_at?: Date
} 