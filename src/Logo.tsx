import React, { memo } from 'react'
import { Link } from 'react-router-dom'

type LogoProps = {
  variant?: 'default' | 'navbar'
}

const Logo: React.FC<LogoProps> = ({ variant = 'default' }) => {
  const isNavbar = variant === 'navbar'

  return (
    <Link
      to="/"
      className={`flex flex-col justify-center select-none ${isNavbar ? 'py-2' : 'py-4'}`}
      aria-label="Rosa Maria Cabeleireiros - Página inicial"
    >
      <h1
        className={`logo-rosa-maria leading-[1.05] tracking-tight ${
          isNavbar
            ? 'text-[44px] md:text-[52px] drop-shadow-none'
            : 'text-4xl md:text-5xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]'
        }`}
        style={
          isNavbar
            ? {
                backgroundImage: 'linear-gradient(180deg, #ebcb6f 0%, #cf9f1c 48%, #9b6f00 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextStroke: '0.25px rgba(146,106,0,0.22)',
              }
            : undefined
        }
      >
        Rosa Maria
      </h1>

      <span
        className={`logo-cabeleireiros uppercase ${
          isNavbar
            ? 'mt-1.5 text-[14px] md:text-[15px] tracking-[0.38em] text-[#d2af52]'
            : 'mt-2 text-xs md:text-sm tracking-[0.45em] text-[#d8b458]'
        }`}
      >
        Cabeleireiros
      </span>
    </Link>
  )
}

export default memo(Logo)
