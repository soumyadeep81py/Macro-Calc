import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export default function Card({ children, className = '', color }: CardProps) {
  return (
    <div
      className={`border-4 border-black p-6 shadow-[8px_8px_0px_black] ${className}`}
      style={{ backgroundColor: color || '#ffffff' }}
    >
      {children}
    </div>
  );
}
