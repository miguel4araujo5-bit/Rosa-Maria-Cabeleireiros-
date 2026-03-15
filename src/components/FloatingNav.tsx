import React from 'react'
import { useLocation } from 'react-router-dom'
import whatsappIcon from '../assets/icons/whatsapp.svg'

export default function FloatingNav() {
  const location = useLocation()

  if (location.pathname === '/admin') {
    return null
  }

  const openWhatsApp = () => {
    const phone = '351932939817'

    const message =
      'Olá! Gostaria de obter informações sobre marcações no Rosa Maria Cabeleireiros.'

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    window.open(url, '_blank')
  }

  return (
    <div className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-50 flex flex-col gap-3">
      <button
        onClick={openWhatsApp}
        aria-label="Contactar pelo WhatsApp"
        className="flex items-center gap-2 md:gap-3 rounded-full bg-[#25D366] px-4 py-3 md:px-6 md:py-4 text-sm md:text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-all duration-200 hover:scale-105 active:scale-[0.98]"
      >
        <img
          src={whatsappIcon}
          alt=""
          className="h-5 w-5 md:h-6 md:w-6"
          aria-hidden="true"
        />

        <span className="leading-none">WhatsApp</span>
      </button>
    </div>
  )
}
