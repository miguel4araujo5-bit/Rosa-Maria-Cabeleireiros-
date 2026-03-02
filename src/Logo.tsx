import React, { memo } from 'react'
import { Link } from 'react-router-dom'

const Logo: React.FC = () => {
  return (
    <Link
      to="/"
      className="flex flex-col justify-center py-3 select-none"
      aria-label="Rosa Maria Cabeleireiros - Página inicial"
    >
      <h1 className="logo-rosa-maria text-4xl md:text-5xl leading-[0.95] tracking-tight drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]">
        Rosa Maria
      </h1>

      <span className="logo-cabeleireiros mt-2 text-xs md:text-sm tracking-[0.45em] uppercase text-brand-gold">
        Cabeleireiros
      </span>
    </Link>
  )
}

export default memo(Logo)
