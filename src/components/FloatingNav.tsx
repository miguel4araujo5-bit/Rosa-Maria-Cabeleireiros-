import React from 'react'
import { useLocation } from 'react-router-dom'
import whatsappIcon from '../assets/icons/whatsapp.svg'

export default function FloatingNav() {
  const location = useLocation()

  if (location.pathname === '/admin') {
    return null
  }

  const openWhatsApp = () => {
    const phone = "351932939817"

    const message =
      "Olá! Gostaria de obter informações sobre marcações no Rosa Maria Cabeleireiros."

    const url =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    window.open(url, "_blank")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <button
        onClick={openWhatsApp}
        aria-label="Contactar pelo WhatsApp"
        className="flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-full shadow-xl font-bold text-sm hover:scale-105 transition-all"
      >
        <img
          src={whatsappIcon}
          alt=""
          className="w-6 h-6"
          aria-hidden="true"
        />

        WhatsApp
      </button>
    </div>
  )
}
