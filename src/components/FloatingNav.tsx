import React from 'react'

export default function FloatingNav() {

  const handleNavigation = () => {

    const address = "Rua de Cinco de Outubro 5498 São Mamede de Infesta Portugal"

    const google =
      "https://maps.app.goo.gl/V1zjmbgj3yFsqsbS8"

    const apple =
      "https://maps.apple.com/?address=Rua%20de%20Cinco%20de%20Outubro%205498%20São%20Mamede%20de%20Infesta"

    const waze =
      "https://waze.com/ul?q=Rua%20de%20Cinco%20de%20Outubro%205498%20São%20Mamede%20de%20Infesta"

    const ua = navigator.userAgent || navigator.vendor

    if (/iPad|iPhone|iPod/.test(ua)) {
      window.open(apple, "_blank")
      return
    }

    if (/android/i.test(ua)) {
      window.open(google, "_blank")
      return
    }

    window.open(google, "_blank")
  }

  return (
    <button
      onClick={handleNavigation}
      aria-label="Navegar até ao salão"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#33ccff] text-black px-5 py-4 rounded-full shadow-xl font-bold text-sm hover:scale-105 transition-all"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black text-[10px] font-black">
        W
      </span>

      Navegar
    </button>
  )
}
