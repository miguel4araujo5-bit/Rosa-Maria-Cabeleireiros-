import React, { memo } from 'react'
import { Link } from 'react-router-dom'

const Logo: React.FC = () => {
  return (
    <Link
      to="/"
      className="flex flex-col justify-center py-3 select-none"
      aria-label="Rosa Maria Cabeleireiros - Página inicial"
    >
      <h1 className="logo-rosa-maria text-4xl md:text-5xl leading-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)] [text-shadow:0_0_18px_rgba(212,175,55,0.28)]">
        Rosa Maria
      </h1>

      <span className="logo-cabeleireiros text-sm md:text-base tracking-[0.35em] uppercase text-brand-gold/90">
        Cabeleireiros
      </span>
    </Link>
  )
}

export default memo(Logo)
