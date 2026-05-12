import type {
  Appointment,
  AvailabilitySlot,
  CreateAppointmentPayload,
  AdminLoginResponse,
} from '../types'

const ADMIN_TOKEN_KEY = 'rm_admin_token'
const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24 * 90

function readLocalToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  } catch {
    return null
  }
}

function writeLocalToken(token: string) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
  } catch {}
}

function removeLocalToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch {}
}

function getCookieToken(): string | null {
  try {
    const cookies = document.cookie.split(';').map(item => item.trim())
    const found = cookies.find(item => item.startsWith(`${ADMIN_TOKEN_KEY}=`))
    if (!found) return null
    const value = found.slice(ADMIN_TOKEN_KEY.length + 1)
    return decodeURIComponent(value || '')
  } catch {
    return null
  }
}

function setCookieToken(token: string) {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    const encoded = encodeURIComponent(token)
    document.cookie = `${ADMIN_TOKEN_KEY}=${encoded}; Max-Age=${ADMIN_TOKEN_MAX_AGE}; Path=/; SameSite=Lax${secure}`

    if (window.location.hostname === 'rosa-maria.pt' || window.location.hostname.endsWith('.rosa-maria.pt')) {
      document.cookie = `${ADMIN_TOKEN_KEY}=${encoded}; Max-Age=${ADMIN_TOKEN_MAX_AGE}; Path=/; Domain=.rosa-maria.pt; SameSite=Lax${secure}`
    }
  } catch {}
}

function clearCookieToken() {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${ADMIN_TOKEN_KEY}=; Max-Age=0; Path=/; SameSite=Lax${secure}`

    if (window.location.hostname === 'rosa-maria.pt' || window.location.hostname.endsWith('.rosa-maria.pt')) {
      document.cookie = `${ADMIN_TOKEN_KEY}=; Max-Age=0; Path=/; Domain=.rosa-maria.pt; SameSite=Lax${secure}`
    }
  } catch {}
}

function getAdminToken(): string | null {
  const localToken = readLocalToken()
  if (localToken) return localToken

  const cookieToken = getCookieToken()
  if (cookieToken) {
    writeLocalToken(cookieToken)
    return cookieToken
  }

  return null
}

function setAdminToken(token: string) {
  writeLocalToken(token)
  setCookieToken(token)
}

function clearAdminToken() {
  removeLocalToken()
  clearCookieToken()
}

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

function subscriptionEndpoint(value: string | PushSubscription | { endpoint?: string } | null | undefined) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return String(value.endpoint || '')
}

export const api = {
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

  async getPushPublicKey(): Promise<string> {
    const res = await fetch('/api/admin/push-public-key', {
      headers: authHeaders(),
    })

    const data = await parseResponse<{ publicKey: string }>(res)

    if (!data.publicKey) {
      throw new Error('Chave de notificações indisponível.')
    }

    return data.publicKey
  },

  async savePushSubscription(subscription: PushSubscription): Promise<void> {
    const res = await fetch('/api/admin/push-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(subscription),
    })

    await parseResponse<{ success: boolean }>(res)
  },

  async deletePushSubscription(subscription: string | PushSubscription | { endpoint?: string }): Promise<void> {
    const endpoint = subscriptionEndpoint(subscription)

    const res = await fetch('/api/admin/push-subscriptions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ endpoint }),
    })

    await parseResponse<{ success: boolean }>(res)
  },
}
