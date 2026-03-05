import { Link } from 'react-router-dom'
import Logo from './Logo'

type Service = {
  id: string
  label: string
  category: string
}

type HomeProps = {
  SERVICES: Service[]
  SERVICE_CATEGORIES: string[]
}

export default function Home({ SERVICES, SERVICE_CATEGORIES }: HomeProps) {
  return (
    <div className="bg-brand-paper">
      <section className="relative h-screen pt-32 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/IMG_6695.jpg"
            alt="Rosa Maria Cabeleireiros"
            className="w-full h-full object-cover object-top opacity-90 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto translate-y-14 md:translate-y-20">
          <span className="section-subtitle text-white/60 tracking-[0.5em]">
            Marcação online
          </span>

          <div className="mt-10 mb-20 transition-transform duration-700 hover:scale-[1.02]">
            <Logo />
          </div>

          <p className="text-base md:text-lg text-white/75 mb-24 max-w-xl mx-auto font-light leading-relaxed">
            Escolha serviços, dia e hora. Receba a confirmação do salão por WhatsApp.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <Link
              to="/marcacao"
              className="btn-primary text-sm tracking-[0.4em] px-24 py-7 w-full md:w-auto shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-[1.02]"
            >
              MARCAR A MINHA VISITA
            </Link>

            <a
              href="#servicos"
              className="text-xs uppercase tracking-[0.45em] font-bold text-white/50 hover:text-white transition-colors duration-300"
            >
              Ver serviços
            </a>
          </div>
        </div>

        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-px h-28 bg-gradient-to-b from-brand-gold to-transparent opacity-80"></div>
        </div>
      </section>

      <section id="servicos" className="py-44 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-28">
            <span className="section-subtitle tracking-[0.4em]">Serviços</span>
            <h2 className="section-title">Seleção</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {SERVICE_CATEGORIES.map((category, idx) => (
              <div key={category} className="space-y-12">
                <div className="flex items-center gap-6">
                  <span className="text-4xl font-serif italic text-brand-gold">
                    0{idx + 1}
                  </span>
                  <h3 className="text-4xl font-serif border-b border-brand-pink-soft pb-3 flex-1">
                    {category}
                  </h3>
                </div>

                <div className="space-y-4">
                  {SERVICES
                    .filter(s => s.category === category)
                    .map(service => (
                      <div key={service.id} className="price-item group">
                        <span className="price-name transition-colors duration-300 group-hover:text-brand-ink">
                          {service.label}
                        </span>
                        <div className="flex-1 border-b border-dotted border-stone-200 mx-6 mb-2 opacity-40 group-hover:opacity-70 transition-all duration-300"></div>
                        <span className="price-value">{service.price}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-24 flex justify-center">
            <Link
              to="/marcacao"
              className="btn-primary px-20 py-7 text-sm tracking-[0.4em] transition-all duration-500 hover:scale-[1.02]"
            >
              AGENDAR
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
