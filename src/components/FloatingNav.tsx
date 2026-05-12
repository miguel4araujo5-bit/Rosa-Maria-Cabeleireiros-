import React from 'react'
import { useLocation } from 'react-router-dom'
import whatsappIcon from '../assets/icons/whatsapp.svg'

export default function FloatingNav() {
  const location = useLocation()

  if (location.pathname.startsWith('/admin')) {
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
    <div className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-50 flex flex-col gap-3">
      <button
        onClick={openWhatsApp}
        aria-label="Contactar pelo WhatsApp"
        className="flex h-14 w-14 md:h-auto md:w-auto items-center justify-center md:gap-3 rounded-full bg-[#25D366] p-0 md:px-6 md:py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-all duration-200 hover:scale-105 active:scale-[0.98]"
      >
        <img
          src={whatsappIcon}
          alt=""
          className="h-7 w-7 md:h-6 md:w-6"
          aria-hidden="true"
        />

        <span className="hidden md:inline leading-none">WhatsApp</span>
      </button>
    </div>
  )
}
