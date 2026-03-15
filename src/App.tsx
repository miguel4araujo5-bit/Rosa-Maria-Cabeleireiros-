import Home from './Home'
import Services from './Services'
import Admin from './Admin'
import Navbar from './components/Navbar'
import FloatingNav from './components/FloatingNav'
import React, { useEffect, useMemo, useState } from 'react'
import { SERVICES, SERVICE_CATEGORIES } from './servicesData'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Check, MessageSquare, Menu, X, Phone, Instagram, Facebook, LogOut } from 'lucide-react'
import { api } from './services/api'
import type { Appointment } from './types'
import Logo from './Logo'
import googleMapsIcon from './assets/icons/googlemaps.svg'
import wazeIcon from './assets/icons/waze.svg'
import appleIcon from './assets/icons/apple.svg'
import MACode from './MACode'

type AvailabilitySlot = {
  date: string
  time: string
  status: 'por_confirmar' | 'confirmado' | 'bloqueado'
}

const ADMIN_PATH = '/admin'
const MANAGER_WHATSAPP = '351932939817'

const TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
] as const

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    try {
      window.scrollTo({ top: 0 })
    } catch {
      window.scrollTo(0, 0)
    }
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
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
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
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function startOfWeekMonday(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(x, diff)
}

function endOfWeekMonday(d: Date) {
  return addDays(startOfWeekMonday(d), 6)
}

function daysBetweenInclusive(start: Date, end: Date) {
  const out: Date[] = []
  let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  while (cur.getTime() <= last.getTime()) {
    out.push(new Date(cur))
    cur = addDays(cur, 1)
  }
  return out
}

function Booking() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    selectedServices: [] as string[],
    date: todayISO(),
    time: '',
    observation: '',
  })

  const closed = useMemo(() => isClosedDayISO(formData.date), [formData.date])

  const fetchAvailability = async () => {
    try {
      const data = await api.getAvailability()
      setAvailability(Array.isArray(data) ? data : [])
    } catch {
      setAvailability([])
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  useEffect(() => {
    if (step === 2) fetchAvailability()
  }, [step])

  const isSlotTaken = (time: string) => {
    return availability.some(a =>
      a.date === formData.date &&
      a.time === time &&
      (a.status === 'por_confirmar' || a.status === 'confirmado' || a.status === 'bloqueado')
    )
  }

  const toggleService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(id)
        ? prev.selectedServices.filter(x => x !== id)
        : [...prev.selectedServices, id],
    }))
  }

  const sendWhatsAppToManager = () => {
    const labels = serviceLabels(formData.selectedServices)
    const message =
      `Olá! Novo pedido de marcação:\n` +
      `Nome: ${formData.name}\n` +
      `WhatsApp: ${formData.whatsapp}\n` +
      `Serviços: ${labels.join(', ')}\n` +
      `Data: ${toPTDateLabel(formData.date)} às ${formData.time}\n` +
      (formData.observation ? `Obs: ${formData.observation}\n` : '') +
      `Estado: por confirmar`

    window.open(`https://wa.me/${MANAGER_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noreferrer')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    if (!formData.name.trim() || !formData.whatsapp.trim()) {
      alert('Preencha nome e WhatsApp.')
      return
    }

    if (formData.selectedServices.length === 0) {
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

    setLoading(true)

    try {
      await api.createAppointment({
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.trim(),
        services: JSON.stringify(formData.selectedServices),
        date: formData.date,
        time: formData.time,
        observation: formData.observation || '',
        status: 'por_confirmar',
      } as any)

      setStep(3)

      try {
        sendWhatsAppToManager()
      } catch {}

      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {
        window.scrollTo(0, 0)
      }
    } catch (err: any) {
      alert(err?.message ? String(err.message) : 'Erro ao agendar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-48 pb-32 px-6 bg-brand-paper min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <span className="section-subtitle">Marcação</span>
          <h1 className="section-title">Reserve o seu Momento</h1>
          <div className="flex justify-center gap-4 mt-8">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2',
                  step >= s ? 'bg-brand-gold border-brand-gold text-white' : 'bg-white border-stone-200 text-stone-300'
                )}
              >
                {s}
              </div>
            ))}
          </div>
          <p className="mt-4 text-stone-500 font-bold uppercase tracking-widest text-xs">
            {step === 1 ? 'Os seus dados' : step === 2 ? 'Data e Hora' : 'Concluído'}
          </p>
        </div>

        <div className="elegant-card p-10 md:p-20">
          {step === 1 && (
            <div className="space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="input-label">O seu Nome Completo</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Ex: Maria Silva"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <label className="input-label">O seu Telemóvel / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    placeholder="9-- --- ---"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="input-label">Escolha os Serviços</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-4 custom-scrollbar">
                  {SERVICE_CATEGORIES.map(cat => (
                    <div key={cat} className="space-y-4">
                      <h4 className="text-xs font-black text-brand-gold uppercase tracking-[0.3em] border-b border-stone-100 pb-2">
                        {cat}
                      </h4>

                      <div className="space-y-2">
                        {SERVICES.filter(s => s.category === cat).map(s => {
                          const selected = formData.selectedServices.includes(s.id)
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleService(s.id)}
                              className={cn(
                                'w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center group',
                                selected
                                  ? 'bg-brand-ink border-brand-ink text-white'
                                  : 'bg-white border-stone-50 text-stone-600 hover:border-brand-gold'
                              )}
                            >
                              <span className="font-medium">{s.label}</span>
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                                  selected ? 'bg-brand-gold border-brand-gold' : 'border-stone-200 group-hover:border-brand-gold'
                                )}
                              >
                                {selected && <Check size={14} className="text-white" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.name.trim() || !formData.whatsapp.trim() || formData.selectedServices.length === 0}
                  className="btn-primary w-full text-lg py-6 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="input-label">Escolha o Dia</label>
                  <input
                    type="date"
                    min={todayISO()}
                    className="input-field"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value, time: '' })}
                  />
                  {closed && (
                    <p className="text-red-500 font-bold text-sm">Estamos encerrados aos Domingos e Segundas.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="input-label">Escolha a Hora</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TIMES.map(t => {
                      const taken = !closed && formData.date ? isSlotTaken(t) : false
                      const selected = formData.time === t
                      const disabled = closed || !formData.date || taken

                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={disabled}
                          onClick={() => setFormData({ ...formData, time: t })}
                          className={cn(
                            'py-5 text-lg font-bold tracking-widest border-2 transition-all flex flex-col items-center justify-center',
                            selected
                              ? 'bg-brand-ink text-white border-brand-ink'
                              : disabled
                                ? 'bg-stone-100 text-stone-300 border-stone-100 cursor-not-allowed'
                                : 'border-stone-100 text-stone-500 hover:border-brand-gold'
                          )}
                        >
                          <span>{t}</span>
                          {taken && <span className="text-[10px] uppercase tracking-tighter">Ocupado</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="input-label">Alguma observação importante?</label>
                <textarea
                  className="input-field h-32 resize-none"
                  placeholder="Ex: Tenho o cabelo muito comprido..."
                  value={formData.observation}
                  onChange={e => setFormData({ ...formData, observation: e.target.value })}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6 pt-10">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-6">
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-6 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? 'A marcar...' : 'Confirmar Marcação'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-16">
              <div className="w-32 h-32 border-4 border-brand-gold rounded-full flex items-center justify-center mx-auto mb-12">
                <Check size={48} className="text-brand-gold" />
              </div>

              <h2 className="text-6xl mb-8 font-serif italic">Pedido Enviado!</h2>

              <p className="text-xl text-stone-600 font-medium mb-16 max-w-xl mx-auto leading-relaxed">
                Obrigado, <span className="text-brand-gold font-bold">{formData.name}</span>! O seu pedido ficou pendente até confirmação do salão.
                <br /><br />
                Se necessário, pode enviar a mensagem novamente.
              </p>

              <div className="space-y-8 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => sendWhatsAppToManager()}
                  className="btn-whatsapp w-full max-w-lg flex items-center justify-center gap-3"
                >
                  <MessageSquare size={28} /> Enviar WhatsApp ao Salão
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-sm uppercase tracking-[0.4em] text-stone-400 hover:text-brand-ink font-bold transition-colors"
                >
                  Voltar à Página Inicial
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-stone-300 font-bold">
          Encerrado aos Domingos e Segundas
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

      <footer className="bg-brand-ink text-white pt-20 md:pt-24 pb-14 md:pb-18">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-14 lg:gap-18 mb-12 md:mb-14">
            <div className="space-y-6">
              <Link to="/" className="inline-flex flex-col group items-start">
                <Logo />
              </Link>

              <p className="max-w-[18ch] text-stone-400 font-medium text-[clamp(17px,4.5vw,28px)] leading-[1.45] tracking-[0.01em]">
                Há mais de 40 anos a conquistar a confiança das nossas clientes.
              </p>

              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/cabeleireirorosamaria?igsh=YWh2dTh3aHd6aXNu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-brand-gold hover:text-black"
                >
                  <Instagram size={18} />
                </a>

                <a
                  href="https://www.facebook.com/rosamaria.cabeleireiro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-brand-gold hover:text-black"
                >
                  <Facebook size={18} />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-10 bg-brand-gold/50"></div>
                <h4 className="text-[11px] uppercase tracking-[0.45em] text-brand-gold font-bold">
                  Contacto
                </h4>
              </div>

              <div className="space-y-5">
                <a
                  href="tel:+351229013475"
                  className="flex items-start gap-4 text-stone-200 font-medium text-lg hover:text-brand-gold transition-colors"
                >
                  <Phone size={22} className="text-brand-gold shrink-0 mt-0.5" />
                  +351 229 013 475
                </a>

                <p className="leading-7 text-stone-400 text-[15px] md:text-[16px]">
                  Rua de Cinco de Outubro 5498<br />
                  4465-080 São Mamede de Infesta<br />
                  Portugal
                </p>

                <div className="rounded-[22px] overflow-hidden border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                  <iframe
                    src="https://www.google.com/maps?q=Rosa+Maria+Cabeleireiros+São+Mamede+de+Infesta&output=embed"
                    width="100%"
                    height="176"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa Rosa Maria Cabeleireiros"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <a
                    href="https://waze.com/ul?q=Rua%20de%20Cinco%20de%20Outubro%205498%20São%20Mamede%20de%20Infesta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/95 text-brand-ink px-5 py-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-gold hover:text-black hover:shadow-[0_14px_32px_rgba(0,0,0,0.24)] active:translate-y-0 active:scale-[0.985] active:bg-[#b68a12] active:text-black"
                  >
                    <img src={wazeIcon} className="w-5 h-5 object-contain" alt="Waze" />
                    <span className="text-[15px] font-medium tracking-[0.06em]">Waze</span>
                  </a>

                  <a
                    href="https://maps.app.goo.gl/V1zjmbgj3yFsqsbS8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/95 text-brand-ink px-5 py-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-gold hover:text-black hover:shadow-[0_14px_32px_rgba(0,0,0,0.24)] active:translate-y-0 active:scale-[0.985] active:bg-[#b68a12] active:text-black"
                  >
                    <img src={googleMapsIcon} className="w-5 h-5 object-contain" alt="Google Maps" />
                    <span className="text-[15px] font-medium tracking-[0.06em]">Google Maps</span>
                  </a>

                  <a
                    href="https://maps.apple/p/baWYLSXHXT5ELI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/95 text-brand-ink px-5 py-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-gold hover:text-black hover:shadow-[0_14px_32px_rgba(0,0,0,0.24)] active:translate-y-0 active:scale-[0.985] active:bg-[#b68a12] active:text-black"
                  >
                    <img src={appleIcon} className="w-5 h-5 object-contain" alt="Apple Maps" />
                    <span className="text-[15px] font-medium tracking-[0.06em]">Apple Maps</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-10 bg-brand-gold/50"></div>
                <h4 className="text-[11px] uppercase tracking-[0.45em] text-brand-gold font-bold">
                  Horário
                </h4>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 md:p-6 space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4 text-[16px] font-medium">
                  <span className="text-stone-200">Terça — Sábado</span>
                  <span className="text-brand-gold tracking-[0.08em]">09:00 — 19:00</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-[16px] font-medium">
                  <span className="text-stone-500">Domingo e Segunda</span>
                  <span className="text-stone-500">Encerrado</span>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-5 md:p-6">
                <p className="text-[11px] uppercase tracking-[0.35em] text-brand-gold font-bold mb-3">
                  Atendimento
                </p>
                <p className="text-stone-400 leading-7 text-[14px] md:text-[15px]">
                  Reserve a sua visita online ou contacte o salão diretamente para informações adicionais.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5 text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-stone-600 font-bold text-center md:text-left">
              <span>© 2026 Rosa Maria Cabeleireiros. Todos os direitos reservados.</span>

              <Link
                to="/ma-code"
                className="text-stone-500 hover:text-brand-gold transition-colors"
              >
                Criado por: MA-Code
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <FloatingNav />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/marcacao" element={<Booking />} />
          <Route path="/agendar" element={<Booking />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/ma-code" element={<MACode />} />
        </Routes>
      </AppShell>
    </Router>
  )
}
