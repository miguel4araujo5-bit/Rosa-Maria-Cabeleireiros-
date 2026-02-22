import type {
  Appointment,
  AvailabilitySlot,
  CreateAppointmentPayload,
  AdminLoginResponse,
} from '../types'

const ADMIN_TOKEN_KEY = 'rm_admin_token'

/* ===========================
   Token Helpers
=========================== */

function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

/* ===========================
   Response Handler
=========================== */

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const message =
      data?.error ||
      data?.message ||
      `Erro ${res.status}`
    throw new Error(message)
  }

  return res.json()
}

/* ===========================
   API
=========================== */

export const api = {
  /* ---------------------------
     PUBLIC
  --------------------------- */

  async getAvailability(): Promise<AvailabilitySlot[]> {
    const res = await fetch('/api/availability')
    return parseResponse<AvailabilitySlot[]>(res)
  },

  async createAppointment(
    payload: CreateAppointmentPayload
  ): Promise<Appointment> {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        status: 'por_confirmar',
      }),
    })

    return parseResponse<Appointment>(res)
  },

  /* ---------------------------
     ADMIN AUTH
  --------------------------- */

  async adminLogin(password: string): Promise<void> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const data = await parseResponse<AdminLoginResponse>(res)

    if (!data?.token) {
      throw new Error('Falha no login.')
    }

    setAdminToken(data.token)
  },

  async adminLogout(): Promise<void> {
    const token = getAdminToken()

    if (!token) {
      clearAdminToken()
      return
    }

    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null)

    clearAdminToken()
  },

  /* ---------------------------
     ADMIN DATA
  --------------------------- */

  async getAdminAppointments(): Promise<Appointment[]> {
    const token = getAdminToken()

    const res = await fetch('/api/admin/appointments', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.status === 401) {
      clearAdminToken()
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    return parseResponse<Appointment[]>(res)
  },

  async updateAppointment(
    id: number | string,
    data: Partial<Appointment>
  ): Promise<Appointment> {
    const token = getAdminToken()

    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (res.status === 401) {
      clearAdminToken()
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    return parseResponse<Appointment>(res)
  },

  async deleteAppointment(id: number | string): Promise<void> {
    const token = getAdminToken()

    const res = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.status === 401) {
      clearAdminToken()
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!res.ok) {
      throw new Error(`Erro ${res.status}`)
    }
  },
}
