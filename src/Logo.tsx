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
                backgroundImage: 'linear-gradient(180deg, #e4c15d 0%, #c99712 48%, #9b6f00 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextStroke: '0.2px rgba(146,106,0,0.18)',
              }
            : undefined
        }
      >
        Rosa Maria
      </h1>

      <span
        className={`logo-cabeleireiros uppercase ${
          isNavbar
            ? 'mt-1 text-[13px] md:text-[14px] tracking-[0.42em] text-[#c8a13a]'
            : 'mt-2 text-xs md:text-sm tracking-[0.45em] text-brand-gold'
        }`}
      >
        Cabeleireiros
      </span>
    </Link>
  )
}

export default memo(Logo)
