import React from 'react'

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
        className="flex items-center gap-3 bg-[#25D366] text-white px-5 py-4 rounded-full shadow-xl font-bold text-sm hover:scale-105 transition-all"
      >
        <svg className="w-6 h-6" viewBox="0 0 32 32">
          <path
            fill="white"
            d="M19.11 17.35c-.29-.14-1.71-.84-1.98-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.9 1.13-.17.19-.33.21-.62.07-.29-.14-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48-.17-.01-.36-.01-.55-.01-.19 0-.5.07-.76.36-.26.29-1 1-.99 2.43.01 1.43 1.03 2.81 1.17 3.01.14.19 2.01 3.07 4.87 4.3.68.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.71-.7 1.95-1.38.24-.68.24-1.27.17-1.38-.07-.12-.26-.19-.55-.33z"
          />
          <path
            fill="white"
            d="M16 3C8.82 3 3 8.82 3 16c0 2.82.92 5.42 2.47 7.54L4 29l5.61-1.47A12.93 12.93 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.5c-2.27 0-4.37-.7-6.1-1.9l-.44-.3-3.33.87.89-3.24-.32-.47A10.43 10.43 0 015.5 16c0-5.79 4.71-10.5 10.5-10.5S26.5 10.21 26.5 16 21.79 26.5 16 26.5z"
          />
        </svg>

        WhatsApp
      </button>

      <button
        onClick={handleNavigation}
        aria-label="Navegar até ao salão"
        className="flex items-center gap-3 bg-[#33ccff] text-black px-5 py-4 rounded-full shadow-xl font-bold text-sm hover:scale-105 transition-all"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#33CCFF" d="M12 2c-5.5 0-10 3.8-10 8.5C2 14 4.8 17 8.5 17H9l-.8 2 3.5-2h1.8c5.5 0 10-3.8 10-8.5S17.5 2 12 2z"/>
        </svg>

        Navegar
      </button>

    </div>
  )
}
