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
      <div className="max-w-3xl mx-auto text-center">

        <h1 className="text-5xl font-serif mb-6">
          MA-Code
        </h1>

        <p className="text-lg text-stone-600 mb-16">
          Desenvolvimento de websites e aplicações modernas para empresas.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 text-left"
        >

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
