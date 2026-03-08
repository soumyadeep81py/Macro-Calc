import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-bold border-4 border-black cursor-pointer transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_black]';

  const variants = {
    primary:
      'bg-[#FFD600] text-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_black] shadow-[6px_6px_0px_black]',
    danger:
      'bg-[#FF4D00] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_black] shadow-[6px_6px_0px_black]',
    secondary:
      'bg-white text-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_black] shadow-[6px_6px_0px_black]',
    accent:
      'bg-[#2979FF] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_black] shadow-[6px_6px_0px_black]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
