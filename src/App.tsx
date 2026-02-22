import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { api } from './services/api';
import type { Appointment } from './types';

type AvailabilitySlot = { date: string; time: string; status: 'pending' | 'completed' | 'blocked' | string };

const SERVICES = [
  { id: 'corte', label: 'Corte', icon: Scissors },
  { id: 'cor', label: 'Cor', icon: Scissors },
  { id: 'madeixas', label: 'Madeixas', icon: Scissors },
  { id: 'brushing', label: 'Brushing', icon: Scissors },
  { id: 'tratamento', label: 'Tratamento', icon: Scissors },
  { id: 'outro', label: 'Outro', icon: Scissors },
] as const;

const TIMES = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
] as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
}

function isClosedDay(dateStr: string) {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay(); // 0 Sunday ... 6 Saturday
  return day === 0 || day === 1;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="text-lg font-black tracking-tight">Rosa Maria</span>
            <span className="text-xs uppercase tracking-[0.25em] text-stone-500">Cabeleireiros</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link to="/marcacao" className="hover:text-stone-600">
              Marcação
            </Link>
            <Link to="/admin" className="hover:text-stone-600 inline-flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-28 pb-20">{children}</main>

      <footer className="border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="font-black">Rosa Maria Cabeleireiros</div>
            <div className="text-sm text-stone-600">Marcação online e gestão de agenda.</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900"
              href="tel:+351000000000"
            >
              <Phone className="w-4 h-4" />
              +351 000 000 000
            </a>
            <a className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900" href="#">
              <Instagram className="w-4 h-4" />
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="bg-white border border-stone-200 rounded-3xl p-8 md:p-14 shadow-sm">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-stone-500">
            <CalendarDays className="w-4 h-4" />
            Marcação online
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Agende a sua visita com simplicidade</h1>
          <p className="text-stone-600 text-lg leading-relaxed">
            Escolha o serviço, o dia e a hora. Recebe confirmação e a agenda fica organizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/marcacao"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-4 font-black bg-stone-900 text-white hover:bg-stone-800 transition"
            >
              Fazer marcação
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-4 font-black border border-stone-300 hover:bg-stone-50 transition"
            >
              Área administrativa
            </Link>
          </div>
          <div className="text-sm text-stone-500">
            Encerrado aos Domingos e Segundas-feiras.
          </div>
        </div>
      </section>
    </div>
  );
};

function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    name: '',
    whatsapp: '',
    observation: '',
  });

  const closed = useMemo(() => isClosedDay(formData.date), [formData.date]);

  const fetchAvailability = async () => {
    try {
      const data = await api.getAvailability();
      setAvailability(data as AvailabilitySlot[]);
    } catch {
      setAvailability([]);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    if (step === 2) fetchAvailability();
  }, [step]);

  const isSlotTaken = (time: string) => {
    return availability.some((a) => a.date === formData.date && a.time === time);
  };

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!formData.service) {
      alert('Por favor, escolha um serviço.');
      return;
    }
    if (!formData.date) {
      alert('Por favor, escolha uma data.');
      return;
    }
    if (closed) {
      alert('Estamos encerrados aos Domingos e Segundas. Por favor escolha outro dia.');
      return;
    }
    if (!formData.time) {
      alert('Por favor, escolha um horário.');
      return;
    }
    if (!formData.name.trim()) {
      alert('Por favor, indique o seu nome.');
      return;
    }
    if (!formData.whatsapp.trim()) {
      alert('Por favor, indique o seu WhatsApp.');
      return;
    }
    if (isSlotTaken(formData.time)) {
      alert('Esse horário já está ocupado. Por favor escolha outro.');
      return;
    }

    try {
      setLoading(true);
      await api.createAppointment({
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.trim(),
        service: formData.service,
        date: formData.date,
        time: formData.time,
        observation: formData.observation.trim(),
        status: 'pending',
      });
      setStep(3);
      fetchAvailability();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar marcação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="mb-10">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Marcação</div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Agendar</h1>
          </div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">
            Passo {step}/3
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                const active = formData.service === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setFormData((p) => ({ ...p, service: s.id }))}
                    className={cn(
                      'rounded-2xl border p-5 text-left transition',
                      active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 hover:border-stone-400',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div className="font-black">{s.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!formData.service) return alert('Por favor, escolha um serviço.');
                  next();
                }}
                className="rounded-2xl px-6 py-4 font-black bg-stone-900 text-white hover:bg-stone-800 transition"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Data</div>
                <div className="relative">
                  <CalendarDays className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    min={todayISO()}
                    value={formData.date}
                    onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value, time: '' }))}
                    className="w-full rounded-2xl border border-stone-200 pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  />
                </div>
                {formData.date && closed && (
                  <div className="text-sm text-red-600 font-semibold">
                    Encerrado aos Domingos e Segundas. Escolha outra data.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Horário</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TIMES.map((t) => {
                    const taken = formData.date ? isSlotTaken(t) : false;
                    const disabled = !formData.date || taken || closed;
                    const active = formData.time === t;

                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFormData((p) => ({ ...p, time: t }))}
                        className={cn(
                          'rounded-2xl border-2 py-4 font-black tracking-wide transition flex flex-col items-center justify-center',
                          active ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-700',
                          disabled && !active && 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed',
                          !disabled && !active && 'hover:border-stone-400',
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {t}
                        </span>
                        {taken && <span className="text-[10px] uppercase tracking-[0.25em]">Ocupado</span>}
                        {closed && !taken && formData.date && (
                          <span className="text-[10px] uppercase tracking-[0.25em]">Encerrado</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Nome</div>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  placeholder="O seu nome"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">WhatsApp</div>
                <input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  placeholder="+351..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Observações (opcional)</div>
              <textarea
                value={formData.observation}
                onChange={(e) => setFormData((p) => ({ ...p, observation: e.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-stone-200 px-4 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900/20 resize-none"
                placeholder="Ex.: preferências, alergias, etc."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <button
                type="button"
                onClick={back}
                className="rounded-2xl px-6 py-4 font-black border border-stone-300 hover:bg-stone-50 transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'rounded-2xl px-6 py-4 font-black bg-stone-900 text-white hover:bg-stone-800 transition inline-flex items-center justify-center gap-2',
                  loading && 'opacity-80 cursor-not-allowed',
                )}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Confirmar marcação
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-900 text-white mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black">Pedido enviado</h2>
            <p className="text-stone-600">
              A sua marcação foi registada. Se necessário, entraremos em contacto.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-4 font-black border border-stone-300 hover:bg-stone-50 transition"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [editing, setEditing] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAppointments();
      setAppointments(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao carregar agenda');
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchAppointments();
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.adminLogin(password);
      setIsLoggedIn(true);
      setPassword('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro no login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.adminLogout();
    setIsLoggedIn(false);
    setAppointments([]);
    setEditing(null);
  };

  const filtered = useMemo(() => {
    if (!filterDate) return appointments;
    return appointments.filter((a) => a.date === filterDate);
  }, [appointments, filterDate]);

  const updateStatus = async (id: number, status: Appointment['status']) => {
    try {
      await api.updateAppointment(id, { status });
      fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar');
      setIsLoggedIn(false);
    }
  };

  const removeAppointment = async (id: number) => {
    if (!confirm('Apagar esta marcação?')) return;
    try {
      await api.deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao apagar');
      setIsLoggedIn(false);
    }
  };

  const toggleBlock = async (date: string, time: string, shouldBlock: boolean) => {
    try {
      if (shouldBlock) {
        await api.createAppointment({
          name: 'BLOQUEADO',
          whatsapp: '-',
          service: 'blocked',
          date,
          time,
          observation: '',
          status: 'blocked',
        });
      } else {
        const block = appointments.find((a) => a.date === date && a.time === time && a.status === 'blocked');
        if (block?.id) await api.deleteAppointment(Number(block.id));
      }
      fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao bloquear/desbloquear');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white inline-flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Admin</div>
              <div className="text-2xl font-black">Entrar</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 px-4 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900/20"
              placeholder="Palavra-passe"
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full rounded-2xl px-6 py-4 font-black bg-stone-900 text-white hover:bg-stone-800 transition inline-flex items-center justify-center gap-2',
                loading && 'opacity-80 cursor-not-allowed',
              )}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Entrar
            </button>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center rounded-2xl px-6 py-4 font-black border border-stone-300 hover:bg-stone-50 transition"
            >
              Voltar ao início
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Admin</div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Agenda</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900/20"
          />
          <button
            onClick={() => setFilterDate('')}
            className="rounded-2xl px-4 py-3 font-black border border-stone-300 hover:bg-stone-50 transition"
          >
            Limpar
          </button>
          <button
            onClick={fetchAppointments}
            className="rounded-2xl px-4 py-3 font-black bg-stone-900 text-white hover:bg-stone-800 transition inline-flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Atualizar
          </button>
          <button
            onClick={handleLogout}
            className="rounded-2xl px-4 py-3 font-black border border-stone-300 hover:bg-stone-50 transition inline-flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-500">
                <th className="py-3 pr-4 font-black uppercase tracking-[0.2em] text-[11px]">Data</th>
                <th className="py-3 pr-4 font-black uppercase tracking-[0.2em] text-[11px]">Hora</th>
                <th className="py-3 pr-4 font-black uppercase tracking-[0.2em] text-[11px]">Serviço</th>
                <th className="py-3 pr-4 font-black uppercase tracking-[0.2em] text-[11px]">Cliente</th>
                <th className="py-3 pr-4 font-black uppercase tracking-[0.2em] text-[11px]">WhatsApp</th>
                <th className="py-3 pr-4 font-black uppercase tracking-[0.2em] text-[11px]">Estado</th>
                <th className="py-3 pr-0 font-black uppercase tracking-[0.2em] text-[11px]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={String(a.id)} className="border-t border-stone-100">
                  <td className="py-4 pr-4 font-semibold">{a.date}</td>
                  <td className="py-4 pr-4 font-semibold">{a.time}</td>
                  <td className="py-4 pr-4 font-semibold">{a.service}</td>
                  <td className="py-4 pr-4 font-semibold">{a.name}</td>
                  <td className="py-4 pr-4 font-semibold">{a.whatsapp}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-black',
                        a.status === 'pending' && 'bg-amber-100 text-amber-900',
                        a.status === 'completed' && 'bg-emerald-100 text-emerald-900',
                        a.status === 'blocked' && 'bg-stone-200 text-stone-800',
                      )}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-4 pr-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing(a)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 hover:border-stone-400 transition font-black"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => removeAppointment(Number(a.id))}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 hover:border-red-300 hover:text-red-700 transition font-black"
                      >
                        <Trash2 className="w-4 h-4" />
                        Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-stone-500 font-semibold">
                    Sem marcações.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-stone-500">Editar</div>
                <div className="text-2xl font-black">{editing.date} • {editing.time}</div>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="w-10 h-10 rounded-2xl border border-stone-200 hover:border-stone-400 transition inline-flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => updateStatus(Number(editing.id), 'pending')}
                  className="rounded-2xl px-4 py-3 font-black bg-amber-100 text-amber-900 hover:opacity-90 transition"
                >
                  Pendente
                </button>
                <button
                  onClick={() => updateStatus(Number(editing.id), 'completed')}
                  className="rounded-2xl px-4 py-3 font-black bg-emerald-100 text-emerald-900 hover:opacity-90 transition"
                >
                  Concluída
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    const d = editing.date;
                    const t = editing.time;
                    const isBlocked = appointments.some((a) => a.date === d && a.time === t && a.status === 'blocked');
                    await toggleBlock(d, t, !isBlocked);
                    setEditing(null);
                  }}
                  className="w-full rounded-2xl px-4 py-3 font-black border border-stone-300 hover:bg-stone-50 transition"
                >
                  Alternar bloqueio deste horário
                </button>
              </div>

              <button
                onClick={() => setEditing(null)}
                className="w-full rounded-2xl px-4 py-3 font-black border border-stone-300 hover:bg-stone-50 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marcacao" element={<Booking />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Shell>
    </Router>
  );
};

export default App;
