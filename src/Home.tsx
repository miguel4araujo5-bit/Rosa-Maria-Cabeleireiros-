import { Link } from 'react-router-dom'

import Logo from './Logo'

import visaIcon from './assets/icons/visa.svg'

import applePayIcon from './assets/icons/applepay.svg'
import mbwayIcon from './assets/icons/mbway-seeklogo.png'

export default function Home() {
  return (
    <div className="bg-brand-paper">
      <section className="relative min-h-[92svh] md:min-h-[100dvh] pt-20 md:pt-24 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/IMG_6695.jpg"
            alt="Rosa Maria Cabeleireiros em São Mamede de Infesta"
            width={1920}
            height={1530}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-center md:object-top opacity-90 scale-[1.02]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/78 via-black/62 to-black/88"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.22),transparent_52%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,162,74,0.16),transparent_38%)]"></div>
        </div>

        <div className="relative z-10 text-center px-5 md:px-6 pb-14 md:pb-8 max-w-[340px] md:max-w-4xl mx-auto translate-y-0 animate-fade-in">
          <h1 className="text-[clamp(20px,5.4vw,28px)] md:text-[40px] font-serif text-white/92 italic tracking-[0.02em] leading-tight">
            Confiança de gerações desde 1982
          </h1>

          <p className="mt-2 md:mt-3 text-[9px] md:text-[11px] uppercase tracking-[0.26em] md:tracking-[0.34em] font-semibold text-brand-gold/90">
            São Mamede de Infesta · Matosinhos
          </p>

          <div className="mt-4 mb-7 md:mt-6 md:mb-8 relative transition-transform duration-700 hover:scale-[1.015]">
            <div className="absolute inset-0 blur-3xl opacity-20 bg-brand-gold scale-75"></div>
            <div className="relative scale-[0.92] md:scale-100">
              <Logo variant="hero" />
            </div>
          </div>

          <p className="max-w-[31ch] md:max-w-2xl mx-auto text-white/78 text-[14px] md:text-[15px] leading-6 md:leading-7 font-medium mb-6 md:mb-8">
            Situado em São Mamede de Infesta, no concelho de Matosinhos e perto da Maia e de Leça do Balio, o Rosa Maria Cabeleireiros recebe clientes que procuram cortes, coloração, madeixas e tratamentos capilares num espaço de confiança desde 1982.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-2.5 md:gap-6">
            <Link
              to="/marcacao"
              className="inline-flex w-full max-w-[300px] md:w-auto md:max-w-none md:min-w-[340px] items-center justify-center rounded-full border border-brand-gold/70 bg-[linear-gradient(135deg,rgba(210,175,84,0.98),rgba(168,132,44,0.96))] px-6 md:px-12 py-4 md:py-6 text-[10px] md:text-[12px] uppercase tracking-[0.26em] md:tracking-[0.34em] font-semibold text-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-[#ecd07f] hover:brightness-110 hover:shadow-[0_30px_90px_rgba(0,0,0,0.45),0_0_28px_rgba(198,162,74,0.32)] active:scale-[0.98] active:border-[#f2d98f] active:brightness-95 active:shadow-[0_12px_30px_rgba(0,0,0,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60"
            >
              Marque a sua visita
            </Link>

            <Link
              to="/servicos"
              className="inline-flex w-full max-w-[300px] md:w-auto md:max-w-none md:min-w-[220px] items-center justify-center rounded-full border border-white/30 bg-white/8 px-6 md:px-10 py-4 md:py-5 text-[10px] md:text-[11px] uppercase tracking-[0.25em] md:tracking-[0.32em] font-semibold text-white/92 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-brand-gold/60 hover:bg-white/12 hover:text-white hover:shadow-[0_22px_55px_rgba(0,0,0,0.32),0_0_22px_rgba(198,162,74,0.16)] active:scale-[0.98] active:border-brand-gold/75 active:bg-brand-gold/20 active:text-white active:shadow-[0_12px_28px_rgba(0,0,0,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40"
            >
              Os nossos serviços
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pt-8 md:pt-10 pb-16 md:pb-20 bg-brand-paper">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <span className="section-subtitle tracking-[0.38em]">
              Em destaque
            </span>

            <h2 className="section-title">
              Cuidado, beleza e elegância
            </h2>

            <p className="mt-5 text-stone-500 text-[15px] md:text-[16px] leading-7 font-medium">
              Uma seleção de serviços pensados para valorizar a sua imagem com elegância, técnica e atenção ao detalhe.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="group rounded-[30px] border border-stone-200/70 bg-white px-7 py-8 md:px-8 md:py-10 shadow-[0_14px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between gap-4 mb-8">
                <span className="text-[11px] uppercase tracking-[0.32em] text-brand-gold font-bold">
                  01
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-brand-gold/40 to-transparent"></div>
              </div>

              <h3 className="text-[28px] md:text-[30px] font-serif text-brand-ink leading-tight">
                Coloração
              </h3>

              <p className="mt-5 text-stone-500 text-[15px] leading-7 font-medium">
                Tons pensados com equilíbrio, cuidado e elegância para valorizar a sua imagem.
              </p>

              <div className="mt-8">
                <Link
                  to="/coloracao"
                  className="inline-flex items-center rounded-full border border-brand-ink/15 px-5 py-3 text-[11px] uppercase tracking-[0.28em] font-semibold text-brand-ink transition-all duration-200 hover:border-brand-gold hover:text-brand-gold"
                >
                  Descobrir
                </Link>
              </div>
            </div>

            <div className="group rounded-[30px] border border-stone-200/70 bg-white px-7 py-8 md:px-8 md:py-10 shadow-[0_14px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between gap-4 mb-8">
                <span className="text-[11px] uppercase tracking-[0.32em] text-brand-gold font-bold">
                  02
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-brand-gold/40 to-transparent"></div>
              </div>

              <h3 className="text-[28px] md:text-[30px] font-serif text-brand-ink leading-tight">
                Cortes e Brushing
              </h3>

              <p className="mt-5 text-stone-500 text-[15px] leading-7 font-medium">
                Cortes e finalizações que combinam sofisticação, leveza e atenção ao detalhe.
              </p>

              <div className="mt-8">
                <Link
                  to="/cortes-brushing"
                  className="inline-flex items-center rounded-full border border-brand-ink/15 px-5 py-3 text-[11px] uppercase tracking-[0.28em] font-semibold text-brand-ink transition-all duration-200 hover:border-brand-gold hover:text-brand-gold"
                >
                  Descobrir
                </Link>
              </div>
            </div>

            <div className="group rounded-[30px] border border-stone-200/70 bg-white px-7 py-8 md:px-8 md:py-10 shadow-[0_14px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between gap-4 mb-8">
                <span className="text-[11px] uppercase tracking-[0.32em] text-brand-gold font-bold">
                  03
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-brand-gold/40 to-transparent"></div>
              </div>

              <h3 className="text-[28px] md:text-[30px] font-serif text-brand-ink leading-tight">
                Madeixas e Tratamentos
              </h3>

              <p className="mt-5 text-stone-500 text-[15px] leading-7 font-medium">
                Serviços técnicos e cuidados capilares pensados para dar brilho, textura e personalidade.
              </p>

              <div className="mt-8">
                <Link
                  to="/madeixas-tratamentos"
                  className="inline-flex items-center rounded-full border border-brand-ink/15 px-5 py-3 text-[11px] uppercase tracking-[0.28em] font-semibold text-brand-ink transition-all duration-200 hover:border-brand-gold hover:text-brand-gold"
                >
                  Descobrir
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-12 text-center">
            <Link
              to="/servicos"
              className="inline-flex items-center rounded-full border border-brand-gold/60 px-7 py-4 text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-ink transition-all duration-200 hover:bg-brand-gold hover:text-black"
            >
              Ver preçário completo
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pt-0 md:pt-2 pb-12 md:pb-16 bg-brand-paper">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[30px] border border-stone-200/80 bg-white px-6 py-8 md:px-10 md:py-10 shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-center gap-4 md:gap-5 text-stone-500">
              <div className="hidden sm:block w-12 md:w-16 h-px bg-gradient-to-r from-transparent to-stone-200"></div>

              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.32em] font-bold text-center whitespace-nowrap">
                Também aceitamos pagamento por:
              </p>

              <div className="hidden sm:block w-12 md:w-16 h-px bg-gradient-to-l from-transparent to-stone-200"></div>
            </div>

            <div className="mt-6 md:mt-8 grid grid-cols-3 items-center justify-center gap-2.5 md:flex md:flex-wrap md:gap-6">
              <div className="flex h-16 md:h-auto min-w-0 md:min-w-[120px] items-center justify-center rounded-2xl border border-stone-200 bg-brand-paper/70 px-2 py-3 md:px-6 md:py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.05)]">
                <img
                  src={visaIcon}
                  alt="Visa"
                  className="h-6 sm:h-7 md:h-9 max-w-full w-auto object-contain opacity-90"
                />
              </div>

              <div className="flex h-16 md:h-auto min-w-0 md:min-w-[120px] items-center justify-center rounded-2xl border border-stone-200 bg-brand-paper/70 px-2 py-3 md:px-6 md:py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.05)]">
                <img
                  src={applePayIcon}
                  alt="Apple Pay"
                  className="h-6 sm:h-7 md:h-9 max-w-full w-auto object-contain opacity-90"
                />
              </div>

              <div className="flex h-16 md:h-auto min-w-0 md:min-w-[120px] items-center justify-center rounded-2xl border border-stone-200 bg-brand-paper/70 px-2 py-3 md:px-6 md:py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.05)]">
                <img
                  src={mbwayIcon}
                  alt="MB WAY"
                  className="h-6 sm:h-7 md:h-9 max-w-full w-auto object-contain opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
