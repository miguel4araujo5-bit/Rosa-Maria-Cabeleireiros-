import React, { memo } from 'react'

type LogoProps = {
  variant?: 'navbar' | 'hero' | 'footer'
}

const Logo: React.FC<LogoProps> = ({ variant = 'hero' }) => {
  const imageClass =
    variant === 'navbar'
      ? 'w-[210px] md:w-[250px]'
      : variant === 'footer'
        ? 'w-[270px] md:w-[300px]'
        : 'w-[275px] md:w-[340px]'

  const containerClass =
    variant === 'footer'
      ? 'w-full justify-center md:justify-start py-2'
      : variant === 'navbar'
        ? 'justify-start py-0'
        : 'w-full justify-center py-2'

  return (
    <div className={`flex items-center select-none ${containerClass}`}>
      <img
        src="/logo.svg?v=2"
        alt="Rosa Maria Cabeleireiros"
        className={`block h-auto max-w-full object-contain ${imageClass}`}
        draggable={false}
      />
    </div>
  )
}

export default memo(Logo)
