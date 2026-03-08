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
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#25D366] text-[10px] font-black">
          WA
        </span>

        WhatsApp
      </button>

      <button
        onClick={handleNavigation}
        aria-label="Navegar até ao salão"
        className="flex items-center gap-3 bg-[#33ccff] text-black px-5 py-4 rounded-full shadow-xl font-bold text-sm hover:scale-105 transition-all"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black text-[10px] font-black">
          W
        </span>

        Navegar
      </button>

    </div>
  )
}
