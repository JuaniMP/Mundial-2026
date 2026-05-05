interface BadgeProps {
  variant?: 'primary' | 'accent' | 'danger' | 'secondary';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ variant = 'primary', children, dot = false, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}
