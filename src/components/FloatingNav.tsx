import React from 'react'

export default function FloatingNav() {
  return (
    <a
      href="https://waze.com/ul?q=Rua%20de%20Cinco%20de%20Outubro%205498%20São%20Mamede%20de%20Infesta"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir no Waze"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#33ccff] text-black px-5 py-4 rounded-full shadow-xl font-bold text-sm hover:scale-105 transition-all"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black text-[10px] font-black">
        W
      </span>

      Waze
    </a>
  )
}
