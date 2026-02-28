import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Check, LogOut, MessageSquare, RefreshCw, Trash2 } from 'lucide-react'
import { api } from './services/api'
import type { Appointment } from './types'

async function createBlockAndReturnId(date: string, time: string) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'HORÁRIO BLOQUEADO',
      whatsapp: '-',
      services: JSON.stringify(['bloqueio_manual']),
      date,
      time,
      observation: '',
      status: 'por_confirmar',
    }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.error || data?.message || `Erro ${res.status}`
    throw new Error(String(msg))
  }
  const id = data?.id ? String(data.id) : ''
  if (!id) throw new Error('Falha ao criar bloqueio.')
  return id
}

export default function Admin() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => todayISO())
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

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
    const existing = (appointments as any[]).find(a => String(a.date) === selectedDate && String(a.time) === time)
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
      const createdId = await createBlockAndReturnId(selectedDate, time)
      await api.updateAppointment(createdId, { status: 'bloqueado' } as any)
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

  const hasBookingOnDay = (date: Date) => {
    const dateStr = toISODate(date)
    return (appointments as any[]).some(a =>
      String(a.date) === dateStr &&
      (String(a.status) === 'por_confirmar' || String(a.status) === 'confirmado')
    )
  }

  const hasBlockOnDay = (date: Date) => {
    const dateStr = toISODate(date)
    return (appointments as any[]).some(a =>
      String(a.date) === dateStr &&
      String(a.status) === 'bloqueado'
    )
  }

  const dayApps = useMemo(() => {
    return (appointments as any[]).filter(a => String(a.date) === selectedDate)
  }, [appointments, selectedDate])

  if (!isLoggedIn) {
    return (
      <div className="pt-48 pb-32 px-6 flex items-center justify-center min-h-screen bg-stone-50">
        <div className="elegant-card p-16 max-w-md w-full text-center">
          <span className="section-subtitle">Acesso da Gerente</span>
          <h2 className="text-5xl font-serif italic mb-12">Entrar no Sistema</h2>
          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-6">
              <label className="text-sm uppercase tracking-widest font-bold text-stone-400">Palavra-passe</label>
              <input
                type="password"
                className="w-full border-b-4 border-brand-gold py-6 text-center text-5xl focus:outline-none bg-transparent"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-stone-100">
            <div className="flex justify-between items-center mb-10">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-4 hover:bg-stone-50 rounded-full transition-colors"
              >
                <ChevronRight className="rotate-180" size={32} />
              </button>
              <h2 className="text-4xl font-serif italic capitalize">{monthTitle(currentMonth)}</h2>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-4 hover:bg-stone-50 rounded-full transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center text-xs font-black text-stone-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const dateStr = toISODate(day)
                const isSelected = selectedDate === dateStr
                const isCurrent = day.getMonth() === monthStart.getMonth()
                const booking = hasBookingOnDay(day)
                const block = hasBlockOnDay(day)
                const today = toISODate(new Date()) === dateStr
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all relative",
                      !isCurrent && "opacity-20 border-transparent",
                      isSelected && "bg-brand-ink text-white border-brand-ink scale-105 z-10 shadow-lg",
                      !isSelected && booking && "bg-red-50 border-red-200 text-red-700",
                      !isSelected && !booking && block && "bg-stone-100 border-stone-200 text-stone-400",
                      !isSelected && !booking && !block && "bg-white border-stone-50 text-stone-600 hover:border-brand-gold",
                      today && !isSelected && "ring-2 ring-brand-gold ring-offset-2"
                    )}
                  >
                    <span className="text-2xl font-serif font-bold">{day.getDate()}</span>
                    {booking && <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>}
                    {block && !booking && <div className="w-2 h-2 bg-stone-400 rounded-full mt-1"></div>}
                  </button>
                )
              })}
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-widest text-stone-400 justify-center">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div> Com pedido</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-stone-100 border border-stone-200 rounded"></div> Bloqueado</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-brand-ink rounded"></div> Selecionado</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-brand-gold rounded"></div> Hoje</div>
            </div>

            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={fetchAppointments}
                className="flex items-center gap-3 px-8 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-black uppercase tracking-widest transition-all"
              >
                <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                Atualizar Agenda
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-brand-gold sticky top-32">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.4em] font-black text-brand-gold mb-2">Horários para o dia</p>
              <h3 className="text-5xl font-serif italic">{toPTDateLabel(selectedDate)}</h3>
            </div>

            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
              {TIMES.map(time => {
                const app = (dayApps as any[]).find(a => String(a.time) === time)
                const status = app ? String(app.status || '') : ''
                const key = `${selectedDate}-${time}`
                const busy = !!app
                const blocked = status === 'bloqueado'
                const pending = status === 'por_confirmar'
                const confirmed = status === 'confirmado'
                const name = app ? String(app.name || '') : ''
                const whatsapp = app ? String(app.whatsapp || '') : ''
                const services = app ? serviceLabels(safeParseServices((app as any).services)) : []
                const obs = app ? String((app as any).observation || '').trim() : ''
                const msgConfirm = `Olá ${name}! A sua marcação no Rosa Maria Cabeleireiros ficou confirmada para ${toPTDateLabel(selectedDate)} às ${time}. Até breve.`
                const msgReject = `Olá ${name}! Obrigado pelo seu pedido. Infelizmente não conseguimos confirmar ${toPTDateLabel(selectedDate)} às ${time}. Pode responder com outro horário/dia para tentarmos ajustar.`
                const msgPending = `Olá ${name}! Recebemos o seu pedido para ${toPTDateLabel(selectedDate)} às ${time}. Iremos confirmar o mais rápido possível.`

                return (
                  <div
                    key={time}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all",
                      blocked && "bg-stone-50 border-stone-200 opacity-70",
                      !blocked && busy && "bg-white border-brand-gold shadow-md",
                      !busy && "bg-white border-stone-100"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-serif font-black text-brand-gold">{time}</span>
                      {busy ? (
                        blocked ? (
                          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Bloqueado</span>
                        ) : (
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded",
                            pending && "bg-amber-100 text-amber-800",
                            confirmed && "bg-emerald-100 text-emerald-700",
                            !pending && !confirmed && "bg-stone-100 text-stone-500"
                          )}>
                            {pending ? 'Por confirmar' : confirmed ? 'Confirmado' : status}
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-200">Livre</span>
                      )}
                    </div>

                    {busy ? (
                      blocked ? (
                        <button
                          type="button"
                          onClick={() => toggleBlock(time)}
                          disabled={actionLoading === key}
                          className="w-full py-3 text-[10px] font-black uppercase tracking-widest bg-stone-800 text-white border border-stone-800 rounded-xl hover:bg-stone-900 disabled:opacity-50"
                        >
                          {actionLoading === key ? 'A processar...' : 'Desbloquear Horário'}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xl font-serif font-bold">{name || 'Sem nome'}</p>
                            <p className="text-xs font-black text-brand-gold uppercase tracking-widest">
                              {services.length ? services.join(' · ') : '—'}
                            </p>
                            <p className="text-xs font-bold text-stone-400 mt-1">{whatsapp || '—'}</p>
                            {obs && <p className="text-xs text-stone-500 mt-2">{obs}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => updateStatus(String((app as any).id), 'confirmado')}
                              disabled={actionLoading === String((app as any).id)}
                              className="bg-emerald-600 text-white py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(String((app as any).id), 'bloqueado')}
                              disabled={actionLoading === String((app as any).id)}
                              className="bg-red-600 text-white py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 disabled:opacity-50"
                            >
                              Rejeitar
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <a
                              className="py-3 text-[10px] font-black uppercase tracking-widest border border-stone-200 rounded-xl hover:border-brand-gold text-center"
                              href={waLink(whatsapp, confirmed ? msgConfirm : status === 'bloqueado' ? msgReject : msgPending)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </a>
                            <button
                              type="button"
                              onClick={() => deleteAppointment(String((app as any).id))}
                              disabled={actionLoading === String((app as any).id)}
                              className="py-3 text-[10px] font-black uppercase tracking-widest border border-stone-200 rounded-xl hover:border-red-300 hover:text-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Trash2 size={16} /> Apagar
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleBlock(time)}
                            disabled={actionLoading === key}
                            className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-stone-300 border border-stone-100 rounded-xl hover:border-brand-gold hover:text-brand-gold disabled:opacity-50"
                          >
                            {actionLoading === key ? 'A processar...' : 'Bloquear este horário'}
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleBlock(time)}
                        disabled={actionLoading === key}
                        className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-stone-300 border border-stone-100 rounded-xl hover:border-brand-gold hover:text-brand-gold disabled:opacity-50"
                      >
                        {actionLoading === key ? 'A processar...' : 'Bloquear Horário'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="pt-10 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-stone-300 font-bold">
              <Calendar size={16} /> {loading ? 'A carregar…' : 'Atualizado'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
