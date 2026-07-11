import { Link } from 'react-router-dom'
import { SERVICES } from './servicesData'

const cortesBrushingServices = SERVICES.filter(service => service.category === 'Cabelo / Cortes / Brushing')

export default function CortesBrushing() {
  return (
    <div className="bg-brand-paper pt-40 pb-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <span className="section-subtitle tracking-[0.38em]">
            Cortes e Brushing
          </span>

          <h1 className="section-title">
            Cortes e finalizações com leveza, elegância e detalhe
          </h1>

          <p className="mt-6 text-stone-500 text-[15px] md:text-[17px] leading-7 md:leading-8 font-medium">
            No Rosa Maria Cabeleireiros, em São Mamede de Infesta, cada corte e brushing é pensado para valorizar a expressão, o movimento e a naturalidade do cabelo. Procuramos um resultado cuidado, harmonioso e ajustado ao estilo de cada cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-12 items-start">
          <div className="rounded-[32px] border border-stone-200/70 bg-white px-8 py-10 md:px-10 md:py-12 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
            <h2 className="text-[30px] md:text-[36px] font-serif text-brand-ink leading-tight">
              Um cuidado pensado para o dia a dia e para ocasiões especiais
            </h2>

            <div className="mt-6 space-y-5 text-stone-500 text-[15px] md:text-[16px] leading-7 font-medium">
              <p>
                Um bom corte é a base de um cabelo bonito, equilibrado e fácil de cuidar. O mesmo acontece com o brushing e com as finalizações, que dão forma, movimento e presença ao resultado final.
              </p>

              <p>
                Seja para manter um estilo clássico, renovar a imagem ou preparar um momento especial, o nosso trabalho procura sempre respeitar a textura, o comprimento e a identidade de cada cabelo.
              </p>

              <p>
                Entre cortes, brushing, prancha e penteados, cada detalhe é tratado com atenção para que o resultado seja leve, elegante e natural.
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/marcacao"
                className="inline-flex items-center justify-center rounded-full border border-brand-gold/70 bg-[linear-gradient(135deg,rgba(210,175,84,0.98),rgba(168,132,44,0.96))] px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-semibold text-black/85 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
              >
                Marcar visita
              </Link>

              <Link
                to="/servicos"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-ink transition-all duration-200 hover:border-brand-gold hover:text-brand-gold"
              >
                Ver preçário
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-stone-200/70 bg-white px-8 py-10 md:px-10 md:py-12 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-brand-gold/50"></div>
              <h2 className="text-[11px] uppercase tracking-[0.35em] text-brand-gold font-bold">
                Serviços disponíveis
              </h2>
            </div>

            <div className="space-y-4">
              {cortesBrushingServices.map(service => (
                <div key={service.id} className="price-item">
                  <span className="price-name">
                    {service.label}
                  </span>

                  <div className="flex-1 border-b border-dotted border-stone-200 mx-6 mb-2 opacity-40"></div>

                  <span className="price-value">
                    {service.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-[28px] border border-stone-200/70 bg-white px-8 py-8 shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] uppercase tracking-[0.35em] text-brand-gold font-bold mb-4">
              Estilo e naturalidade
            </p>

            <h2 className="text-[28px] md:text-[32px] font-serif text-brand-ink leading-tight">
              Um resultado pensado para si
            </h2>

            <p className="mt-5 text-stone-500 text-[15px] leading-7 font-medium">
              Em São Mamede de Infesta, criamos cortes e finalizações pensados para acompanhar o seu ritmo, a sua imagem e o seu conforto no dia a dia.
            </p>
          </div>

          <div className="rounded-[28px] border border-stone-200/70 bg-brand-ink px-8 py-8 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] uppercase tracking-[0.35em] text-brand-gold font-bold mb-4">
              Cuidado e presença
            </p>

            <p className="text-stone-300 text-[15px] leading-7 font-medium">
              Um corte bem pensado e uma finalização cuidada fazem toda a diferença na forma como o cabelo cai, se move e valoriza o rosto. O objetivo é sempre um resultado bonito e equilibrado.
            </p>

            <div className="mt-8">
              <Link
                to="/marcacao"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-[11px] uppercase tracking-[0.3em] font-semibold text-white transition-all duration-200 hover:border-brand-gold hover:text-brand-gold"
              >
                Agendar agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
