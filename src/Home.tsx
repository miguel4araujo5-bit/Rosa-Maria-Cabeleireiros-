import { Link } from 'react-router-dom'
import Logo from './Logo'
import visaIcon from './assets/icons/visa.svg'
import applePayIcon from './assets/icons/applepay.svg'
import mbwayIcon from './assets/icons/mbway-seeklogo.png'

export default function Home() {
  return (
    <div className="bg-brand-paper">
      <section className="relative min-h-[100dvh] pt-32 flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/IMG_6695.jpg"
            alt="Rosa Maria Cabeleireiros"
            className="absolute inset-0 w-full h-full object-cover object-center md:object-top opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto translate-y-14 md:translate-y-20 animate-fade-in">
          <span className="section-subtitle text-white/70 tracking-[0.5em]">
            Marcação online
          </span>

          <div className="mt-10 mb-16 relative transition-transform duration-700 hover:scale-[1.02]">
            <div className="absolute inset-0 blur-3xl opacity-30 bg-brand-gold scale-75"></div>
            <div className="relative">
              <Logo />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif text-white/90 italic tracking-wide mb-12">
            Confiança de gerações desde 1982
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <Link
              to="/marcacao"
              className="btn-primary text-sm tracking-[0.4em] px-24 py-7 w-full md:w-auto shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-[1.02]"
            >
              MARCAR A MINHA VISITA
            </Link>

            <Link
              to="/servicos"
              className="text-xs uppercase tracking-[0.45em] font-bold text-white/60 hover:text-white transition-colors duration-300"
            >
              Ver serviços
            </Link>
          </div>
        </div>

        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-px h-28 bg-gradient-to-b from-brand-gold to-transparent opacity-80"></div>
        </div>
      </section>

      <section className="px-6 py-4 md:py-5">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-3">
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] font-bold text-stone-500 text-center">
            Também aceitamos pagamento por:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 rounded-full bg-white px-4 py-2.5 shadow-md border border-stone-200">
            <img
              src={visaIcon}
              alt="Visa"
              className="h-6 md:h-7 w-auto object-contain"
            />

            <div className="hidden sm:block h-6 w-px bg-stone-300"></div>

            <img
              src={applePayIcon}
              alt="Apple Pay"
              className="h-6 md:h-7 w-auto object-contain"
            />

            <div className="hidden sm:block h-6 w-px bg-stone-300"></div>

            <img
              src={mbwayIcon}
              alt="MB WAY"
              className="h-6 md:h-7 w-auto object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
