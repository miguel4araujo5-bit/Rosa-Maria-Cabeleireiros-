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
      <section className="relative h-screen pt-28 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/IMG_6695.jpg"
            alt="Rosa Maria Cabeleireiros"
            className="w-full h-full object-cover object-top opacity-75 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/25"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <span className="section-subtitle text-white/75">
            Marcação online
          </span>

          <div className="mt-8 mb-16 drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)]">
            <Logo />
          </div>

          <p className="text-lg md:text-xl text-white/80 mb-20 max-w-2xl mx-auto font-light leading-relaxed">
            Escolha serviços, dia e hora. O pedido fica pendente até confirmação do salão.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <Link
              to="/marcacao"
              className="btn-primary text-lg px-20 py-6 w-full md:w-auto shadow-[0_20px_50px_rgba(0,0,0,0.4)] tracking-[0.25em]"
            >
              Marcar a minha Visita
            </Link>

            <a
              href="#servicos"
              className="text-sm uppercase tracking-[0.4em] font-bold text-white/60 hover:text-white transition-all"
            >
              Ver serviços
            </a>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-px h-24 bg-gradient-to-b from-brand-gold to-transparent"></div>
        </div>
      </section>

      <section id="servicos" className="py-36 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="section-subtitle">Serviços</span>
            <h2 className="section-title">Seleção</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {SERVICE_CATEGORIES.map((category, idx) => (
              <div key={category} className="space-y-10">
                <div className="flex items-center gap-6">
                  <span className="text-4xl font-serif italic text-brand-gold">
                    0{idx + 1}
                  </span>
                  <h3 className="text-4xl font-serif border-b-2 border-brand-pink-soft pb-2 flex-1">
                    {category}
                  </h3>
                </div>

                <div className="space-y-2">
                  {SERVICES
                    .filter(s => s.category === category)
                    .map(service => (
                      <div key={service.id} className="price-item group">
                        <span className="price-name">{service.label}</span>
                        <div className="flex-1 border-b border-dotted border-stone-200 mx-6 mb-2 opacity-50"></div>
                        <span className="price-value">—</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-20 flex justify-center">
            <Link to="/marcacao" className="btn-primary px-16 py-6 text-lg">
              Agendar
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
