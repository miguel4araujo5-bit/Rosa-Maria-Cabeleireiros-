import { Link } from 'react-router-dom'
import Logo from './Logo'
import visaIcon from './assets/icons/visa.svg'
import applePayIcon from './assets/icons/applepay.svg'
import mbwayIcon from './assets/icons/mbway-seeklogo.png'

export default function Home() {
  return (
    <div className="bg-brand-paper">
      <section className="relative min-h-[100dvh] pt-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/IMG_6695.jpg"
            alt="Rosa Maria Cabeleireiros"
            className="absolute inset-0 w-full h-full object-cover object-center md:object-top opacity-90 scale-[1.02]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,162,74,0.16),transparent_38%)]"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto translate-y-12 md:translate-y-16 animate-fade-in">
          <h1 className="text-[30px] md:text-[40px] font-serif text-white/90 italic tracking-[0.04em] leading-tight">
            Confiança de gerações desde 1982
          </h1>

          <div className="mt-8 mb-14 relative transition-transform duration-700 hover:scale-[1.015]">
            <div className="absolute inset-0 blur-3xl opacity-25 bg-brand-gold scale-75"></div>
            <div className="relative">
              <Logo />
            </div>
          </div>

          <p className="max-w-2xl mx-auto text-white/65 text-sm md:text-[15px] leading-7 font-medium mb-12">
            Um espaço de beleza, cuidado e confiança, onde a experiência se encontra com a elegância.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-8">
            <Link
              to="/marcacao"
              className="btn-primary text-sm tracking-[0.38em] px-20 md:px-24 py-6 md:py-7 w-full md:w-auto shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-[1.02]"
            >
              MARCAR A MINHA VISITA
            </Link>

            <Link
              to="/servicos"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-[11px] uppercase tracking-[0.32em] font-bold text-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/60 hover:bg-white/[0.07] hover:text-white"
            >
              Ver serviços
            </Link>
          </div>
        </div>

        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-px h-24 bg-gradient-to-b from-brand-gold to-transparent opacity-80"></div>
        </div>
      </section>

      <section className="px-6 pt-2 md:pt-3 pb-0 -mt-1">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-4 md:gap-5 text-stone-500">
            <div className="hidden sm:block w-12 md:w-16 h-px bg-gradient-to-r from-transparent to-stone-200"></div>

            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.32em] font-bold text-center whitespace-nowrap">
              Também aceitamos pagamento por:
            </p>

            <div className="hidden sm:block w-12 md:w-16 h-px bg-gradient-to-l from-transparent to-stone-200"></div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <img
              src={visaIcon}
              alt="Visa"
              className="h-8 md:h-9 w-auto object-contain opacity-85 transition-all duration-300 hover:opacity-100 hover:scale-[1.03]"
            />

            <div className="hidden sm:block h-5 w-px bg-stone-200"></div>

            <img
              src={applePayIcon}
              alt="Apple Pay"
              className="h-8 md:h-9 w-auto object-contain opacity-85 transition-all duration-300 hover:opacity-100 hover:scale-[1.03]"
            />

            <div className="hidden sm:block h-5 w-px bg-stone-200"></div>

            <img
              src={mbwayIcon}
              alt="MB WAY"
              className="h-8 md:h-9 w-auto object-contain opacity-85 transition-all duration-300 hover:opacity-100 hover:scale-[1.03]"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
