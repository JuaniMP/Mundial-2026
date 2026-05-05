import { Link } from 'react-router-dom';
import React from 'react';

interface FeatureCardProps {
  to: string;
  title: string;
  description: string;
  icon: React.ElementType;
  imageUrl?: string;
  badge?: string;
  stat?: { label: string; value: string };
  progress?: { value: number; label: string };
  variant?: 'image' | 'solid' | 'accent';
  className?: string;
}

export function FeatureCard({
  to,
  title,
  description,
  icon: Icon,
  imageUrl,
  badge,
  stat,
  progress,
  variant = 'solid',
  className = '',
}: FeatureCardProps) {
  return (
    <Link
      to={to}
      className={`
        group relative overflow-hidden rounded-2xl flex flex-col min-h-[280px]
        border border-border transition-all duration-500
        hover:border-border-hover hover:shadow-xl hover:-translate-y-1
        ${variant === 'image' ? 'justify-end' : 'justify-between p-6'}
        ${className}
      `}
    >
      {/* Image background variant */}
      {variant === 'image' && imageUrl && (
        <>
          <div className="absolute inset-0 z-0">
            <img
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/60 to-transparent" />
          </div>
          <div className="relative z-10 p-6">
            <div className="w-10 h-10 rounded-xl bg-bg-card/80 backdrop-blur-md flex items-center justify-center mb-4 border border-border">
              <Icon className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
          </div>
        </>
      )}

      {/* Solid / accent variant */}
      {variant !== 'image' && (
        <>
          <div className="flex justify-between items-start">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border ${
                variant === 'accent' ? 'bg-primary-subtle' : 'bg-bg-elevated'
              }`}
            >
              <Icon
                className={`w-6 h-6 ${variant === 'accent' ? 'text-primary' : 'text-secondary'}`}
              />
            </div>
            {badge && <span className="badge badge-primary">{badge}</span>}
          </div>

          <div>
            <h3 className="font-headline font-bold text-xl text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary mb-4">{description}</p>

            {stat && (
              <div className="glass-light rounded-lg p-3 flex justify-between items-center">
                <span className="text-[0.65rem] uppercase text-text-muted tracking-wider">
                  {stat.label}
                </span>
                <span className="font-headline font-bold text-base text-primary">{stat.value}</span>
              </div>
            )}

            {progress && (
              <div>
                <div className="w-full bg-bg-hover rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${progress.value}%`,
                      background:
                        'linear-gradient(90deg, var(--color-secondary-dim), var(--color-secondary))',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[0.65rem] text-text-muted">
                  <span>Completion</span>
                  <span className="font-bold text-text-secondary">{progress.label}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Link>
  );
}
