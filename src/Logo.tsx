import React, { memo } from 'react'
import { Link } from 'react-router-dom'

const Logo: React.FC = () => {
  return (
    <Link
      to="/"
      className="flex flex-col justify-center py-2 select-none"
      aria-label="Rosa Maria Cabeleireiros - Página inicial"
    >
      <h1 className="logo-rosa-maria text-4xl md:text-5xl leading-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]">
        Rosa Maria
      </h1>
      <span className="logo-cabeleireiros text-sm md:text-base tracking-[0.3em] uppercase">
        Cabeleireiros
      </span>
    </Link>
  )
}

export default memo(Logo)
