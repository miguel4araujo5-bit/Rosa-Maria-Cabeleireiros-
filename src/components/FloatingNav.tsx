import React from 'react'
import whatsappIcon from '../assets/icons/whatsapp.svg'

export default function FloatingNav() {

  const handleNavigation = () => {

    const google =
      "https://maps.app.goo.gl/V1zjmbgj3yFsqsbS8"

    const apple =
      "https://maps.apple.com/?address=Rua%20de%20Cinco%20de%20Outubro%205498%20São%20Mamede%20de%20Infesta"

    const ua = navigator.userAgent || navigator.vendor

    if (/iPad|iPhone|iPod/.test(ua)) {
      window.open(apple, "_blank")
      return
    }

    window.open(google, "_blank")
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

      <button
        onClick={handleNavigation}
        aria-label="Localização do salão"
        className="flex items-center gap-3 bg-brand-ink text-white px-6 py-4 rounded-full shadow-xl font-bold text-sm hover:scale-105 hover:bg-brand-gold transition-all"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"
          />
        </svg>

        Localização
      </button>

    </div>
  )
}
