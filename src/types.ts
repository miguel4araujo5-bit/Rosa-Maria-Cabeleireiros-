export type AppointmentStatus =
  | 'por_confirmar'
  | 'confirmado'
  | 'bloqueado'

export interface Appointment {
  id: string
  name: string
  whatsapp: string
  services: string  // JSON string com array de serviços
  date: string      // YYYY-MM-DD
  time: string      // HH:MM
  observation?: string
  status: AppointmentStatus
  created_at?: string
}
