import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Phone, Instagram, CheckCircle2, Loader2 } from 'lucide-react'
import { api } from './services/api'
import type { Appointment } from './types'
import Logo from './Logo'

type AvailabilitySlot = {
  date: string
  time: string
  status: 'por_confirmar' | 'confirmado' | 'bloqueado'
}

const SERVICES = [
  { id: 'corte_mulher', label: 'Corte Mulher' },
  { id: 'corte_homem', label: 'Corte Homem' },
  { id: 'coloracao', label: 'Coloração' },
  { id: 'madeixas', label: 'Madeixas' },
  { id: 'brushing', label: 'Brushing' },
  { id: 'tratamento', label: 'Tratamento Capilar' },
  { id: 'alisamento', label: 'Alisamento / Queratina' },
  { id: 'outro', label: 'Outro' },
] as const

const TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
] as const

const ADMIN_TOKEN_KEY = 'rm_admin_token'

function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
}

function isClosedDay(dateStr: string) {
  if (!dateStr) return false
  const d = new Date(`${dateStr}T00:00:00`)
  const day = d.getDay()
  return day === 0 || day === 1
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function toPTDateLabel(dateISO: string) {
  if (!dateISO) return ''
  const d = new Date(`${dateISO}T00:00:00`)
  const wd = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()]
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${wd} ${day}/${month}/${year}`
}

function normalizePhone(raw: string) {
  const s = String(raw || '').trim()
  const digits = s.replace(/[^\d+]/g, '')
  if (!digits) return ''
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('351')) return `+${digits}`
  if (digits.startsWith('0')) return `+351${digits.slice(1)}`
  if (digits.length === 9) return `+351${digits}`
  return digits
}

function waLink(phoneRaw: string, message: string) {
  const phone = normalizePhone(phoneRaw).replace('+', '')
  const text = encodeURIComponent(message)
  if (!phone) return `https://wa.me/?text=${text}`
  return `https://wa.me/${phone}?text=${text}`
}

function safeParseServices(services: unknown) {
  try {
    if (Array.isArray(services)) return services.map(String)
    if (typeof services === 'string') {
      const trimmed = services.trim()
      if (!trimmed) return []
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.map(String)
      return [trimmed]
    }
    return []
  } catch {
    return typeof services === 'string' && services ? [services] : []
  }
}

function serviceLabels(ids: string[]) {
  const map = new Map(SERVICES.map((s) => [s.id, s.label] as const))
  return ids.map((id) => map.get(id) || id)
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) ? String(data.error || data.message) : `Erro (${res.status})`
    throw new Error(msg)
  }
  return data as T
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useScrollToTop()

  return (
    <div className="min-h-screen bg-brand-paper text-brand-ink">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Logo />
          <nav className="font-sans text-sm uppercase tracking-[0.25em]">
            <Link to="/marcacao" className="hover:text-brand-gold transition">
              Marcação
            </Link>
          </nav>
        </div>
      </header>

      <main className="py-20">{children}</main>

      <footer className="border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="font-serif text-xl">Rosa Maria Cabeleireiros</div>
            <div className="text-sm text-stone-500">Marcação online e gestão de agenda.</div>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="tel:+351000000000" className="flex items-center gap-2 hover:text-brand-gold">
              <Phone className="w-4 h-4" /> +351 000 000 000
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-brand-gold">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const Home: React.FC = () => (
  <div className="max-w-6xl mx-auto px-6">
    <section className="elegant-card p-14">
      <div className="max-w-2xl space-y-8">
        <div className="section-subtitle">Marcação online</div>
        <h1 className="section-title">Agende a sua visita com simplicidade</h1>
        <p className="text-lg text-stone-600 leading-relaxed">
          Escolha os serviços, o dia e a hora. Recebe confirmação e a agenda fica organizada.
        </p>
        <Link to="/marcacao" className="btn-primary">
          Fazer marcação
        </Link>
        <div className="text-sm text-stone-500">
          Encerrado aos Domingos e Segundas-feiras.
        </div>
      </div>
    </section>
  </div>
)

function Booking() {
  const navigate = useNavigate()
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    services: [] as string[],
    date: '',
    time: '',
    name: '',
    whatsapp: '',
    observation: '',
  })

  const closed = useMemo(() => isClosedDay(formData.date), [formData.date])

  useEffect(() => {
    api.getAvailability().then(setAvailability).catch(() => setAvailability([]))
  }, [])

  const isSlotTaken = (time: string) =>
    availability.some((a) => a.date === formData.date && a.time === time)

  const toggleService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter((s) => s !== id)
        : [...prev.services, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.services.length) {
      alert('Selecione pelo menos um serviço.')
      return
    }

    if (!formData.date || closed) {
      alert('Escolha uma data válida.')
      return
    }

    if (!formData.time || isSlotTaken(formData.time)) {
      alert('Escolha um horário disponível.')
      return
    }

    if (!formData.name || !formData.whatsapp) {
      alert('Preencha nome e WhatsApp.')
      return
    }

    try {
      setLoading(true)
      await api.createAppointment({
        name: formData.name,
        whatsapp: formData.whatsapp,
        services: JSON.stringify(formData.services),
        date: formData.date,
        time: formData.time,
        observation: formData.observation,
        status: 'por_confirmar',
      })
      navigate('/')
    } catch {
      alert('Erro ao criar marcação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6">
      <form onSubmit={handleSubmit} className="elegant-card p-12 space-y-12">
        <div>
          <div className="section-subtitle">Escolha os serviços</div>
          <div className="grid md:grid-cols-2 gap-4">
            {SERVICES.map((s) => {
              const active = formData.services.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`border p-6 text-left transition ${active ? 'border-brand-gold bg-brand-pink-soft' : 'border-stone-200 hover:border-brand-gold'
                    }`}
                >
                  <div className="font-serif text-lg">{s.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <input
            type="date"
            min={todayISO()}
            value={formData.date}
            onChange={(e) =>
              setFormData((p) => ({ ...p, date: e.target.value, time: '' }))
            }
            className="input-field"
          />

          <div>
            <div className="grid grid-cols-3 gap-3">
              {TIMES.map((t) => {
                const taken = isSlotTaken(t)
                const disabled = !formData.date || taken || closed
                const active = formData.time === t

                return (
                  <button
                    key={t}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setFormData((p) => ({ ...p, time: t }))
                    }
                    className={`py-4 border text-sm font-semibold transition ${active ? 'bg-brand-ink text-white border-brand-ink' : 'border-stone-200 hover:border-brand-gold'
                      } ${disabled && 'opacity-40 cursor-not-allowed'}`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>

            {closed && formData.date && (
              <div className="mt-4 text-sm text-red-600 font-semibold">
                Estamos encerrados aos Domingos e Segundas-feiras.
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <input
            placeholder="Nome completo"
            className="input-field"
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
          />
          <input
            placeholder="Telemóvel / WhatsApp"
            className="input-field"
            value={formData.whatsapp}
            onChange={(e) =>
              setFormData((p) => ({ ...p, whatsapp: e.target.value }))
            }
          />
        </div>

        <textarea
          placeholder="Observações (opcional)"
          className="input-field resize-none"
          rows={4}
          value={formData.observation}
          onChange={(e) =>
            setFormData((p) => ({ ...p, observation: e.target.value }))
          }
        />

        <button type="submit" className="btn-primary w-full">
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Agendar agora'}
        </button>
      </form>
    </div>
  )
}

function Admin() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string>(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [filter, setFilter] = useState<'todos' | 'por_confirmar' | 'confirmado' | 'bloqueado'>('por_confirmar')

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) h.Authorization = `Bearer ${token}`
    return h
  }, [token])

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchJson<any[]>('/api/admin/appointments', { headers })
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'Erro'
      if (msg.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        setToken('')
        setItems([])
        setError('')
        return
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [token])

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setAuthLoading(true)
    setError('')
    try {
      const res = await fetchJson<{ success: boolean; token: string }>('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const t = res.token || ''
      localStorage.setItem(ADMIN_TOKEN_KEY, t)
      setToken(t)
      setPassword('')
    } catch (e: any) {
      setError(e?.message ? String(e.message) : 'Erro')
    } finally {
      setAuthLoading(false)
    }
  }

  const onLogout = async () => {
    const t = token
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken('')
    setItems([])
    setError('')
    try {
      if (t) {
        await fetch('/api/admin/logout', { method: 'POST', headers: { Authorization: `Bearer ${t}` } })
      }
    } catch { }
    navigate('/')
  }

  const updateStatus = async (id: string, status: 'por_confirmar' | 'confirmado' | 'bloqueado') => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      await fetchJson<{ success: boolean }>(`/api/appointments/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (e: any) {
      setError(e?.message ? String(e.message) : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    if (!token) return
    const ok = confirm('Apagar esta marcação?')
    if (!ok) return
    setLoading(true)
    setError('')
    try {
      await fetchJson<{ success: boolean }>(`/api/appointments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      })
      await load()
    } catch (e: any) {
      setError(e?.message ? String(e.message) : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : []
    if (filter === 'todos') return list
    return list.filter((a) => String(a.status || '') === filter)
  }, [items, filter])

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6">
        <div className="elegant-card p-10 space-y-8">
          <div>
            <div className="section-subtitle">Admin</div>
            <div className="section-title">Entrar</div>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Palavra-passe"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="submit" className="btn-primary w-full">
              {authLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Entrar'}
            </button>
          </form>

          <div className="text-sm text-stone-500">
            Aceda diretamente por <span className="font-semibold">/admin</span>.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="section-subtitle">Admin</div>
          <div className="section-title">Marcações</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field py-3"
          >
            <option value="por_confirmar">Por confirmar</option>
            <option value="confirmado">Confirmadas</option>
            <option value="bloqueado">Rejeitadas/Bloqueadas</option>
            <option value="todos">Todas</option>
          </select>

          <button
            type="button"
            className="btn-primary"
            onClick={() => load()}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Atualizar'}
          </button>

          <button
            type="button"
            className="border border-stone-300 px-6 py-3 font-semibold hover:border-brand-gold transition"
            onClick={onLogout}
          >
            Sair
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-8 border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-10 space-y-6">
        {filtered.length === 0 && !loading && (
          <div className="elegant-card p-10 text-stone-600">
            Sem marcações para mostrar.
          </div>
        )}

        {filtered.map((a) => {
          const id = String(a.id || '')
          const name = String(a.name || '')
          const whatsapp = String(a.whatsapp || '')
          const date = String(a.date || '')
          const time = String(a.time || '')
          const status = String(a.status || '')
          const obs = String(a.observation || '').trim()
          const services = serviceLabels(safeParseServices(a.services))

          const msgConfirm = `Olá ${name}! A sua marcação no Rosa Maria Cabeleireiros ficou confirmada para ${toPTDateLabel(date)} às ${time}. Até breve.`
          const msgReject = `Olá ${name}! Obrigado pelo seu pedido. Infelizmente não conseguimos confirmar ${toPTDateLabel(date)} às ${time}. Pode responder com outro horário/dia para tentarmos ajustar.`
          const msgPending = `Olá ${name}! Recebemos o seu pedido de marcação para ${toPTDateLabel(date)} às ${time}. Iremos confirmar o mais rápido possível.`

          const badge =
            status === 'confirmado'
              ? 'bg-green-50 text-green-700 border-green-200'
              : status === 'bloqueado'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'

          return (
            <div key={id} className="elegant-card p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="font-serif text-xl">{name || 'Sem nome'}</div>
                    <div className={`text-xs border px-3 py-1 font-semibold uppercase tracking-[0.14em] ${badge}`}>
                      {status || 'por_confirmar'}
                    </div>
                  </div>

                  <div className="text-stone-700">
                    <span className="font-semibold">{toPTDateLabel(date)}</span>
                    <span className="mx-2 text-stone-400">·</span>
                    <span className="font-semibold">{time}</span>
                  </div>

                  <div className="text-sm text-stone-600">
                    {services.length ? services.join(' · ') : 'Serviços não indicados'}
                  </div>

                  {obs && (
                    <div className="text-sm text-stone-600">
                      <span className="font-semibold">Obs:</span> {obs}
                    </div>
                  )}

                  <div className="text-sm text-stone-600">
                    <span className="font-semibold">WhatsApp:</span> {whatsapp || '—'}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[260px]">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateStatus(id, 'confirmado')}
                      disabled={loading}
                      className="bg-brand-ink text-white px-4 py-3 font-semibold hover:opacity-95 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirmar
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(id, 'bloqueado')}
                      disabled={loading}
                      className="border border-stone-300 px-4 py-3 font-semibold hover:border-brand-gold transition"
                    >
                      Rejeitar
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      className="border border-stone-300 px-4 py-3 font-semibold hover:border-brand-gold transition text-center"
                      href={waLink(whatsapp, status === 'confirmado' ? msgConfirm : status === 'bloqueado' ? msgReject : msgPending)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>

                    <button
                      type="button"
                      onClick={() => remove(id)}
                      disabled={loading}
                      className="border border-stone-300 px-4 py-3 font-semibold hover:border-red-400 hover:text-red-700 transition"
                    >
                      Apagar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateStatus(id, 'por_confirmar')}
                    disabled={loading}
                    className="border border-stone-300 px-4 py-3 font-semibold hover:border-brand-gold transition"
                  >
                    Voltar a por confirmar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const App: React.FC = () => (
  <Router>
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marcacao" element={<Booking />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Shell>
  </Router>
)

export default App
