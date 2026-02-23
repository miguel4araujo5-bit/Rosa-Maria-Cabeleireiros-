import React from 'react'
import { Link } from 'react-router-dom'

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo-container">
      <span className="logo-rosa-maria text-4xl md:text-5xl">
        Rosa Maria
      </span>
      <span className="logo-cabeleireiros text-sm md:text-base">
        Cabeleireiros
      </span>
    </Link>
  )
}

export default Logo
