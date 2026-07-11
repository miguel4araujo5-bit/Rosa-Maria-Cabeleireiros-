import React, { memo } from 'react'

type LogoProps = {
  variant?: 'default' | 'navbar'
}

const Logo: React.FC<LogoProps> = ({ variant = 'default' }) => {
  const isNavbar = variant === 'navbar'

  return (
    <div className={`flex items-center select-none ${isNavbar ? 'py-2' : 'py-4'}`}>
      <img
        src="/logo.svg"
        alt="Rosa Maria Cabeleireiros"
        className={`block w-auto ${
          isNavbar
            ? 'h-[58px] md:h-[72px]'
            : 'h-[84px] md:h-[108px] drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]'
        }`}
        draggable={false}
      />
    </div>
  )
}

export default memo(Logo)
