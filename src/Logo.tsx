import React, { memo } from 'react'
import { Link } from 'react-router-dom'

const Logo: React.FC = () => {
  return (
    <Link
      to="/"
      className="flex flex-col justify-center leading-tight select-none"
      aria-label="Rosa Maria Cabeleireiros - Página inicial"
    >
      <h1 className="logo-rosa-maria text-4xl md:text-5xl leading-none">
        Rosa Maria
      </h1>
      <span className="logo-cabeleireiros text-sm md:text-base tracking-[0.3em] uppercase">
        Cabeleireiros
      </span>
    </Link>
  )
}

export default memo(Logo)
