import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  Scissors,
  Shield,
  Phone,
  Instagram,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Pencil,
  X,
  Loader2,
  Lock,
} from 'lucide-react'
import { api } from './services/api'
import type { Appointment } from './types'
import Logo from './Logo'

type AvailabilitySlot = {
  date: string
  time: string
  status: 'por_confirmar' | 'confirmado' | 'bloqueado'
}

const SERVICES = [
  { id: 'corte_mulher', label: 'Corte Mulher', icon: Scissors },
  { id: 'corte_homem', label: 'Corte Homem', icon: Scissors },
  { id: 'coloracao', label: 'Coloração', icon: Scissors },
  { id: 'madeixas', label: 'Madeixas', icon: Scissors },
  { id: 'brushing', label: 'Brushing', icon: Scissors },
  { id: 'tratamento', label: 'Tratamento Capilar', icon: Scissors },
  { id: 'alisamento', label: 'Alisamento / Queratina', icon: Scissors },
  { id: 'outro', label: 'Outro', icon: Scissors },
] as const

const TIMES = [
  '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'
] as const

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
  const d = new Date()
  return d.toISOString().split('T')[0]
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useScrollToTop()

  return (
    <div className="min-h-screen bg-brand-paper text-brand-ink">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-8 font-sans text-sm uppercase tracking-[0.25em]">
            <Link to="/marcacao" className="hover:text-brand-gold transition">
              Marcação
            </Link>
            <Link to="/admin" className="hover:text-brand-gold inline-flex items-center gap-2 transition">
              <Shield className="w-4 h-4" />
              Admin
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
          Escolha o serviço, o dia e a hora. Recebe confirmação e a agenda fica organizada.
        </p>
        <div className="flex gap-4">
          <Link to="/marcacao" className="btn-primary">
            Fazer marcação
          </Link>
          <Link to="/admin" className="btn-outline">
            Área administrativa
          </Link>
        </div>
        <div className="text-sm text-stone-500">
          Encerrado aos Domingos e Segundas-feiras.
        </div>
      </div>
    </section>
  </div>
)

function Booking() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    service: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.createAppointment({
        ...formData,
        status: 'por_confirmar',
      })
      setStep(3)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar marcação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      {step === 3 ? (
        <div className="text-center space-y-6">
          <CheckCircle2 className="w-16 h-16 mx-auto text-brand-gold" />
          <h2 className="section-title">Pedido enviado</h2>
          <Link to="/" className="btn-outline">Voltar ao início</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="elegant-card p-10 space-y-8">
          <div className="section-subtitle">Escolha o serviço</div>

          <div className="grid sm:grid-cols-2 gap-4">
            {SERVICES.map((s) => {
              const Icon = s.icon
              const active = formData.service === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, service: s.id }))}
                  className={`border p-6 text-left transition ${
                    active ? 'border-brand-gold bg-brand-pink-soft' : 'border-stone-200 hover:border-brand-gold'
                  }`}
                >
                  <div className="flex items-center gap-3 font-serif text-lg">
                    <Icon className="w-5 h-5" />
                    {s.label}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="date"
              min={todayISO()}
              value={formData.date}
              onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              className="input-field"
            />
            <select
              value={formData.time}
              onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
              className="input-field"
            >
              <option value="">Escolha horário</option>
              {TIMES.map((t) => (
                <option key={t} value={t} disabled={isSlotTaken(t)}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <input
            placeholder="Nome"
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            placeholder="WhatsApp"
            className="input-field"
            value={formData.whatsapp}
            onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
          />

          <button type="submit" className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Confirmar marcação'}
          </button>
        </form>
      )}
    </div>
  )
}

function Admin() {
  return <div className="max-w-4xl mx-auto px-6"><div className="section-title">Admin em construção</div></div>
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
