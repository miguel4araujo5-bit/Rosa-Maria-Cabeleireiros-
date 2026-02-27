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
  if (res.status === 401) {
    clearAdminToken()
    throw new Error('Sessão expirada. Faça login novamente.')
  }

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

function authHeaders(): HeadersInit {
  const token = getAdminToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
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
  ): Promise<void> {
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

    await parseResponse<{ success: boolean }>(res)
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

    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null)
    }

    clearAdminToken()
  },

  /* ---------------------------
     ADMIN DATA
  --------------------------- */

  async getAdminAppointments(): Promise<Appointment[]> {
    const res = await fetch('/api/admin/appointments', {
      headers: authHeaders(),
    })

    return parseResponse<Appointment[]>(res)
  },

  async updateAppointment(
    id: string,
    data: Partial<Appointment>
  ): Promise<void> {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(data),
    })

    await parseResponse<{ success: boolean }>(res)
  },

  async deleteAppointment(id: string): Promise<void> {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })

    if (!res.ok) {
      if (res.status === 401) {
        clearAdminToken()
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      throw new Error(`Erro ${res.status}`)
    }
  },
}
