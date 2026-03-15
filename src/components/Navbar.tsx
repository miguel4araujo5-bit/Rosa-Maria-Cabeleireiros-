import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { api } from '../services/api'
import Logo from '../Logo'

const ADMIN_PATH = '/admin'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8f4ee]/92 backdrop-blur-md border-b border-[#e9dfd1] shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-28 items-center">

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center py-3"
          >
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-16">

            <Link
              to="/"
              className="text-sm uppercase tracking-[0.25em] font-bold text-stone-700 hover:text-brand-ink transition-colors"
            >
              Início
            </Link>

            <Link
              to="/servicos"
              className="text-sm uppercase tracking-[0.25em] font-bold text-stone-700 hover:text-brand-ink transition-colors"
            >
              Serviços
            </Link>

            <Link
              to="/marcacao"
              className="btn-primary py-4 px-10 text-xs"
            >
              Agendar Agora
            </Link>

            {isAdmin ? (
              <button
                onClick={async () => {
                  try {
                    await api.adminLogout()
                  } catch {}
                  window.location.href = '/'
                }}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-red-600 font-bold hover:text-red-800 transition-colors"
              >
                <LogOut size={16} /> Sair
              </button>
            ) : (
              <Link
                to={ADMIN_PATH}
                className="text-stone-400 hover:text-stone-600 text-[10px] uppercase tracking-[0.2em] font-bold"
              >
                Admin
              </Link>
            )}

          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-brand-ink p-2 border-2 border-[#e9dfd1] bg-white/20"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#f8f4ee] border-b border-[#e9dfd1] overflow-hidden">
          <div className="px-8 py-16 space-y-10 text-center">

            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-lg uppercase tracking-[0.3em] text-stone-700 font-bold"
            >
              Início
            </Link>

            <Link
              to="/servicos"
              onClick={() => setIsOpen(false)}
              className="block text-lg uppercase tracking-[0.3em] text-stone-700 font-bold"
            >
              Serviços
            </Link>

            <Link
              to="/marcacao"
              onClick={() => setIsOpen(false)}
              className="block text-lg uppercase tracking-[0.3em] text-brand-ink font-black"
            >
              Agendar Agora
            </Link>

            <Link
              to={ADMIN_PATH}
              onClick={() => setIsOpen(false)}
              className="block text-xs uppercase tracking-[0.3em] text-stone-400 font-bold"
            >
              Admin
            </Link>

          </div>
        </div>
      )}
    </nav>
  )
}
