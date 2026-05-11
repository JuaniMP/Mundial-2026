import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const variants: Record<string, string> = {
  primary:
    'bg-primary text-ink border-[1.5px] border-ink hover:bg-primary-light active:translate-x-[2px] active:translate-y-[2px]',
  secondary: 'bg-bg-card text-text-primary border-[1.5px] border-ink hover:bg-bg-elevated',
  ghost:
    'bg-transparent text-text-secondary border-[1.5px] border-transparent hover:border-ink hover:text-text-primary',
  outline:
    'bg-transparent text-primary border-[1.5px] border-primary hover:bg-primary hover:text-ink',
};

const sizes: Record<string, string> = {
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
        inline-flex items-center justify-center gap-2
        font-headline tracking-widest uppercase
        transition-all duration-150 cursor-pointer focus-ring
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
}
