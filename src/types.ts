export type AppointmentStatus =
  | 'por_confirmar'
  | 'confirmado'
  | 'bloqueado'

export interface Appointment {
  id: number | string
  date: string
  time: string
  service: string
  name: string
  whatsapp: string
  observation?: string
  status: AppointmentStatus
  created_at?: string
}

export interface AvailabilitySlot {
  date: string
  time: string
  status: AppointmentStatus
}

export interface CreateAppointmentPayload {
  date: string
  time: string
  service: string
  name: string
  whatsapp: string
  observation?: string
  status?: AppointmentStatus
}

export interface AdminLoginResponse {
  token: string
  expiresAt?: number
}
