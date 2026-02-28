import React, { memo } from 'react'
import { Link } from 'react-router-dom'

const Logo: React.FC = () => {
  return (
    <Link
      to="/"
      className="logo-container"
      aria-label="Rosa Maria Cabeleireiros - Página inicial"
    >
      <h1 className="logo-rosa-maria text-4xl md:text-5xl">
        Rosa Maria
      </h1>
      <span className="logo-cabeleireiros text-sm md:text-base">
        Cabeleireiros
      </span>
    </Link>
  )
}

export default memo(Logo)
