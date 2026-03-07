import { SERVICES, SERVICE_CATEGORIES } from './servicesData'

export default function Services() {
  return (
    <div className="bg-brand-paper py-32 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-24">
          <span className="section-subtitle tracking-[0.4em]">
            Serviços
          </span>
          <h1 className="section-title">
            Tabela de Preços
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

          {SERVICE_CATEGORIES.map((category, idx) => (
            <div key={category} className="space-y-10">

              <div className="flex items-center gap-6">
                <span className="text-4xl font-serif italic text-brand-gold">
                  0{idx + 1}
                </span>

                <h2 className="text-3xl font-serif border-b border-brand-pink-soft pb-3 flex-1">
                  {category}
                </h2>
              </div>

              <div className="space-y-4">

                {SERVICES
                  .filter(service => service.category === category)
                  .map(service => (

                    <div key={service.id} className="price-item group">

                      <span className="price-name group-hover:text-brand-ink transition-colors">
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
          ))}

        </div>

      </div>
    </div>
  )
}
