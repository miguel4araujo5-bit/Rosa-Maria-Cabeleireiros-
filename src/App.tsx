import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Phone,
  Instagram,
  CheckCircle2,
  Loader2,
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
  return new Date().toISOString().split('T')[0]
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
                  className={`border p-6 text-left transition ${
                    active
                      ? 'border-brand-gold bg-brand-pink-soft'
                      : 'border-stone-200 hover:border-brand-gold'
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
                    className={`py-4 border text-sm font-semibold transition ${
                      active
                        ? 'bg-brand-ink text-white border-brand-ink'
                        : 'border-stone-200 hover:border-brand-gold'
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
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="section-title">Admin em construção</div>
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
