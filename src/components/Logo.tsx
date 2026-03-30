import React from 'react';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-bold ${size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : 'text-5xl'} text-amber-500`}>
        Tubosu
      </span>
    </div>
  );
}