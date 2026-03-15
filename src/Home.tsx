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
          <h1 className="mx-auto max-w-[12ch] text-[clamp(28px,5.6vw,40px)] md:text-[40px] font-serif text-white/90 italic tracking-[0.04em] leading-tight text-balance">
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

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <Link
              to="/marcacao"
              className="inline-flex min-w-[300px] md:min-w-[340px] items-center justify-center rounded-full border border-brand-gold/70 bg-[linear-gradient(135deg,rgba(210,175,84,0.98),rgba(168,132,44,0.96))] px-10 md:px-12 py-5 md:py-6 text-[11px] md:text-[12px] uppercase tracking-[0.34em] font-semibold text-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-[#ecd07f] hover:brightness-110 hover:shadow-[0_30px_90px_rgba(0,0,0,0.45),0_0_28px_rgba(198,162,74,0.32)] active:scale-[0.98] active:border-[#f2d98f] active:brightness-95 active:shadow-[0_12px_30px_rgba(0,0,0,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60"
            >
              Marque a sua visita
            </Link>

            <Link
              to="/servicos"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-9 md:px-10 py-4 md:py-5 text-[10px] md:text-[11px] uppercase tracking-[0.32em] font-semibold text-white/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-brand-gold/60 hover:bg-white/10 hover:text-white hover:shadow-[0_22px_55px_rgba(0,0,0,0.32),0_0_22px_rgba(198,162,74,0.16)] active:scale-[0.98] active:border-brand-gold/75 active:bg-brand-gold/20 active:text-white active:shadow-[0_12px_28px_rgba(0,0,0,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40"
            >
              Os nossos serviços
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
