import { useState } from 'react'

export default function MACode() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subject = encodeURIComponent("Pedido de orçamento - MA-Code")

    const body = encodeURIComponent(
`Nome: ${form.name}

Email: ${form.email}

Mensagem:
${form.message}`
    )

    window.location.href = `mailto:YOUR_EMAIL_HERE?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen bg-brand-paper pt-40 pb-32 px-6">

      <div className="max-w-5xl mx-auto text-center mb-24">

        <h1 className="text-6xl font-serif mb-6">
          MA-Code
        </h1>

        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Criamos websites e aplicações modernas para empresas que querem
          uma presença digital profissional e eficiente. (A partir de 19€/mês)
        </p>

      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 mb-32">

        <div className="p-8 border border-stone-200 text-center">
          <h3 className="text-xl font-serif mb-4">
            Websites Profissionais
          </h3>

          <p className="text-stone-600">
            Websites rápidos, modernos e otimizados para telemóvel.
          </p>
        </div>

        <div className="p-8 border border-stone-200 text-center">
          <h3 className="text-xl font-serif mb-4">
            Sistemas de Marcação
          </h3>

          <p className="text-stone-600">
            Sistemas de reservas online para salões, clínicas e serviços.
          </p>
        </div>

        <div className="p-8 border border-stone-200 text-center">
          <h3 className="text-xl font-serif mb-4">
            Aplicações Web
          </h3>

          <p className="text-stone-600">
            Plataformas personalizadas para automatizar o seu negócio.
          </p>
        </div>

      </div>

      <div className="max-w-3xl mx-auto">

        <h2 className="text-4xl font-serif text-center mb-12">
          Pedir Orçamento
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">

          <div>
            <label className="input-label">
              Nome
            </label>

            <input
              className="input-field"
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
              required
            />
          </div>

          <div>
            <label className="input-label">
              Email
            </label>

            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e)=>setForm({...form,email:e.target.value})}
              required
            />
          </div>

          <div>
            <label className="input-label">
              Descreva o projeto
            </label>

            <textarea
              className="input-field h-32 resize-none"
              value={form.message}
              onChange={(e)=>setForm({...form,message:e.target.value})}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Pedir orçamento
          </button>

        </form>

      </div>

    </div>
  )
}
