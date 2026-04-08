export type AppointmentStatus =
  | 'por_confirmar'
  | 'confirmado'
  | 'bloqueado'

export interface Appointment {
  id: string
  name: string
  whatsapp: string
  services: string
  date: string
  time: string
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
  name: string
  whatsapp: string
  services: string
  date: string
  time: string
  observation?: string
  status?: AppointmentStatus
}

export interface AdminLoginResponse {
  token: string
}
