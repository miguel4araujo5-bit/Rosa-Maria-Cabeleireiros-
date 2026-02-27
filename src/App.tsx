import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Check, MessageSquare, Menu, X, RefreshCw, Phone, Instagram, LogOut } from 'lucide-react'
import { api } from './services/api'
import type { Appointment } from './types'
import Logo from './Logo'

type AvailabilitySlot = {
  date: string
  time: string
  status: 'por_confirmar' | 'confirmado' | 'bloqueado'
}

const ADMIN_PATH = '/admin'
const MANAGER_WHATSAPP = '351932939817'

const SERVICES = [
  { id: 'corte_mulher', label: 'Corte Mulher', category: 'Cortes' },
  { id: 'corte_homem', label: 'Corte Homem', category: 'Cortes' },
  { id: 'brushing', label: 'Brushing', category: 'Styling' },
  { id: 'tratamento', label: 'Tratamento Capilar', category: 'Tratamentos' },
  { id: 'coloracao', label: 'Coloração', category: 'Cor' },
  { id: 'madeixas', label: 'Madeixas', category: 'Cor' },
  { id: 'alisamento', label: 'Alisamento / Queratina', category: 'Tratamentos' },
  { id: 'outro', label: 'Outro', category: 'Outros' },
] as const

const SERVICE_CATEGORIES = Array.from(new Set(SERVICES.map(s => s.category)))

const TIMES = [
  '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00',
] as const

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function isClosedDayISO(dateISO: string) {
  if (!dateISO) return false
  const d = new Date(`${dateISO}T00:00:00`)
  const day = d.getDay()
  return day === 0 || day === 1
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

function toPTDateLabel(dateISO: string) {
  if (!dateISO) return ''
  const d = new Date(`${dateISO}T00:00:00`)
  const fmt = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  return fmt.format(d).replace('.', '')
}

function monthTitle(d: Date) {
  const fmt = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' })
  const s = fmt.format(d)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth()+1, 0)
}

function startOfWeekMonday(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  return addDays(x, diff)
}

function endOfWeekMonday(d: Date) {
  return addDays(startOfWeekMonday(d), 6)
}

function daysBetweenInclusive(start: Date, end: Date) {
  const out: Date[] = []
  let cur = new Date(start)
  while (cur.getTime() <= end.getTime()) {
    out.push(new Date(cur))
    cur = addDays(cur, 1)
  }
  return out
}
function Admin() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => todayISO())
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [editForm, setEditForm] = useState({
    name: '',
    whatsapp: '',
    services: [] as string[],
    observation: '',
    date: '',
    time: ''
  })

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminAppointments()
      setAppointments(Array.isArray(data) ? data : [])
      setIsLoggedIn(true)
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      await api.adminLogin(password)
      setPassword('')
      setIsLoggedIn(true)
      await fetchAppointments()
    } catch (err: any) {
      alert(err?.message ? String(err.message) : 'Password incorreta.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await api.adminLogout()
    setIsLoggedIn(false)
    setAppointments([])
    navigate('/')
  }

  const updateStatus = async (id: string, status: 'por_confirmar' | 'confirmado' | 'bloqueado') => {
    setActionLoading(id)
    try {
      await api.updateAppointment(id, { status } as any)
      await fetchAppointments()
    } catch (err: any) {
      alert(err?.message ? String(err.message) : 'Erro ao atualizar.')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteAppointment = async (id: string) => {
    const ok = confirm('Tem a certeza que deseja apagar esta marcação?')
    if (!ok) return
    setActionLoading(id)
    try {
      await api.deleteAppointment(id)
      await fetchAppointments()
    } catch (err: any) {
      alert(err?.message ? String(err.message) : 'Erro ao apagar.')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleBlock = async (time: string) => {
    const existing = appointments.find(a => String(a.date) === selectedDate && String(a.time) === time)
    const key = `${selectedDate}-${time}`
    setActionLoading(key)

    try {
      if (existing) {
        const id = String(existing.id || '')
        if (!id) throw new Error('Marcaçāo inválida.')

        if (String(existing.status) === 'bloqueado') {
          await api.deleteAppointment(id)
          await fetchAppointments()
          return
        }

        const ok = confirm('Este horário tem uma marcação. Deseja rejeitar (bloquear) este horário?')
        if (!ok) return
        await updateStatus(id, 'bloqueado')
        return
      }

      const created = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'HORÁRIO BLOQUEADO',
          whatsapp: '-',
          services: JSON.stringify(['bloqueio_manual']),
          date: selectedDate,
          time,
          observation: '',
          status: 'por_confirmar',
        }),
      })

      const data = await created.json()
      if (!created.ok) throw new Error(data?.error || 'Erro ao criar bloqueio.')

      await api.updateAppointment(String(data.id), { status: 'bloqueado' } as any)
      await fetchAppointments()
    } catch (err: any) {
      alert(err?.message ? String(err.message) : 'Erro ao bloquear/desbloquear.')
    } finally {
      setActionLoading(null)
    }
  }

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth])
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth])
  const gridStart = useMemo(() => startOfWeekMonday(monthStart), [monthStart])
  const gridEnd = useMemo(() => endOfWeekMonday(monthEnd), [monthEnd])
  const calendarDays = useMemo(() => daysBetweenInclusive(gridStart, gridEnd), [gridStart, gridEnd])

  const dayApps = appointments.filter(a => String(a.date) === selectedDate)

  if (!isLoggedIn) {
    return (
      <div className="pt-48 pb-32 px-6 flex items-center justify-center min-h-screen bg-stone-50">
        <div className="elegant-card p-16 max-w-md w-full text-center">
          <span className="section-subtitle">Acesso da Gerente</span>
          <h2 className="text-5xl font-serif italic mb-12">Entrar no Sistema</h2>
          <form onSubmit={handleLogin} className="space-y-10">
            <input
              type="password"
              className="w-full border-b-4 border-brand-gold py-6 text-center text-5xl focus:outline-none bg-transparent"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
            />
            <button type="submit" disabled={authLoading} className="btn-primary w-full py-10 text-2xl shadow-xl disabled:opacity-50">
              {authLoading ? 'A entrar...' : 'ENTRAR AGORA'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-48 pb-32 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col items-center mb-16 text-center space-y-6">
        <span className="section-subtitle">Gestão do Salão</span>
        <h1 className="text-7xl font-serif italic">Agenda Mensal</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-8 py-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-widest transition-all"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-brand-gold">
        <div className="space-y-4">
          {TIMES.map(time => {
            const app = dayApps.find(a => String(a.time) === time)
            const key = `${selectedDate}-${time}`
            const busy = !!app
            const blocked = app?.status === 'bloqueado'

            return (
              <div key={time} className="p-6 rounded-2xl border-2 border-stone-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-serif font-black text-brand-gold">{time}</span>
                  <span className="text-xs uppercase font-black">
                    {busy ? (blocked ? 'Bloqueado' : app?.status) : 'Livre'}
                  </span>
                </div>

                {busy ? (
                  blocked ? (
                    <button
                      type="button"
                      onClick={() => toggleBlock(time)}
                      disabled={actionLoading === key}
                      className="w-full py-3 bg-stone-800 text-white rounded-xl disabled:opacity-50"
                    >
                      {actionLoading === key ? 'A processar...' : 'Desbloquear'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-bold">{app?.name}</p>
                      <p className="text-xs">{app?.whatsapp}</p>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(String(app?.id), 'confirmado')}
                          className="bg-emerald-600 text-white py-2 rounded-xl"
                        >
                          Confirmar
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStatus(String(app?.id), 'bloqueado')}
                          className="bg-red-600 text-white py-2 rounded-xl"
                        >
                          Rejeitar
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteAppointment(String(app?.id))}
                        className="w-full border border-stone-300 py-2 rounded-xl"
                      >
                        Apagar
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleBlock(time)}
                    disabled={actionLoading === key}
                    className="w-full py-3 border border-stone-200 rounded-xl disabled:opacity-50"
                  >
                    {actionLoading === key ? 'A processar...' : 'Bloquear'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
function AppShell({ children }: { children: React.ReactNode }) {
  useScrollToTop()

  return (
    <div className="min-h-screen bg-brand-paper">
      <Navbar />
      <main>{children}</main>

      <footer className="bg-brand-ink text-white py-32 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-20">

            <div className="space-y-8">
              <Link to="/" className="flex flex-col items-start">
                <Logo />
              </Link>

              <p className="text-stone-400 font-medium text-lg leading-relaxed">
                Marcação online com confirmação manual e gestão simples de agenda.
              </p>

              <div className="flex gap-8">
                <a
                  href="#"
                  className="text-stone-500 hover:text-brand-gold transition-all transform hover:scale-110"
                >
                  <Instagram size={28} />
                </a>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs uppercase tracking-[0.5em] text-brand-gold font-bold">
                Contacto
              </h4>

              <div className="space-y-6 text-stone-300 font-medium text-lg">
                <p className="flex items-start gap-4">
                  <Phone size={24} className="text-brand-gold shrink-0" />
                  +351 000 000 000
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs uppercase tracking-[0.5em] text-brand-gold font-bold">
                Horário
              </h4>

              <div className="space-y-4 text-stone-300 font-medium text-lg">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Terça — Sábado</span>
                  <span className="text-brand-gold">09:00 — 19:00</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Domingo e Segunda</span>
                  <span>Encerrado</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-600 font-bold">
              © 2026 Cabeleireiro Rosa Maria. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marcacao" element={<Booking />} />
          <Route path="/agendar" element={<Booking />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </AppShell>
    </Router>
  )
}
