import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const variants = {
  primary:
    'gradient-primary text-text-inverse font-bold shadow-lg hover:shadow-xl hover:brightness-110',
  secondary:
    'bg-bg-elevated text-text-primary border border-border hover:border-border-hover hover:bg-bg-hover',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
  outline:
    'bg-transparent text-primary border border-primary/30 hover:bg-primary-subtle hover:border-primary/50',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-headline font-semibold
        transition-all duration-300 active:scale-[0.97] focus-ring cursor-pointer
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
    </button>
  );
}
