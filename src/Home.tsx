import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Logo from './Logo'

export default function Home() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(Math.min(window.scrollY * 0.3, 120))
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-brand-paper">
      <section className="relative h-screen pt-32 flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/IMG_6695.jpg"
            alt="Rosa Maria Cabeleireiros"
            style={{ transform: `translateY(${offset}px)` }}
            className="w-full h-full object-cover object-top opacity-90 scale-105 transition-transform duration-75 will-change-transform"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto translate-y-14 md:translate-y-20">
          <span className="section-subtitle text-white/70 tracking-[0.5em]">
            Marcação online
          </span>

          <div className="mt-10 mb-20 relative transition-transform duration-700 hover:scale-[1.02]">
            <div className="absolute inset-0 blur-3xl opacity-30 bg-brand-gold scale-75"></div>
            <div className="relative">
              <Logo />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif text-white/90 italic tracking-wide mb-8">
            Confiança de gerações desde 1982
          </h1>

          <p className="text-base md:text-lg text-white/85 mb-16 max-w-xl mx-auto font-light leading-relaxed">
            Escolha serviços, dia e hora. Receba a confirmação do salão por WhatsApp.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <Link
              to="/marcacao"
              className="btn-primary text-sm tracking-[0.4em] px-24 py-7 w-full md:w-auto shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-[1.02]"
            >
              MARCAR A MINHA VISITA
            </Link>

            <Link
              to="/servicos"
              className="text-xs uppercase tracking-[0.45em] font-bold text-white/50 hover:text-white transition-colors duration-300"
            >
              Ver serviços
            </Link>
          </div>
        </div>

        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-px h-28 bg-gradient-to-b from-brand-gold to-transparent opacity-80"></div>
        </div>
      </section>
    </div>
  )
}
