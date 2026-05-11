import type { LucideIcon } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  progress?: number;
  progressColor?: string;
  subtitle?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-secondary',
  progress,
  progressColor,
  subtitle,
  className = '',
}: StatCardProps) {
  return (
    <div className={`card-base p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.68rem] uppercase tracking-[0.12em] font-semibold text-text-muted">
          {label}
        </span>
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
      </div>
      <div className="font-headline font-bold text-2xl text-text-primary">{value}</div>
      {progress !== undefined && (
        <div className="mt-3">
          <ProgressBar value={progress} color={progressColor} height="h-1.5" />
        </div>
      )}
      {subtitle && <p className="mt-2 text-xs text-text-muted font-medium">{subtitle}</p>}
    </div>
  );
}
