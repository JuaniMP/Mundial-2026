import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
  imageUrl?: string;
  badge?: string;
  stat?: { label: string; value: string };
  progress?: { value: number; label: string };
  /** 'dark' = ink bg, 'gold' = gold bg, 'green' = MX green bg,
   *  'cream' = cream bg, 'image' = photo bg, 'solid' = paper bg */
  variant?: 'image' | 'solid' | 'accent' | 'dark' | 'gold' | 'green' | 'cream';
  className?: string;
}

const BG: Record<string, string> = {
  dark: '#0e1a2b',
  gold: '#e5b449',
  green: '#006847',
  cream: '#f6efe2',
  solid: '#fbf7ee',
  accent: '#fbf7ee',
  image: '#fbf7ee',
};
const FG: Record<string, string> = {
  dark: '#f6efe2',
  gold: '#0e1a2b',
  green: '#f6efe2',
  cream: '#0e1a2b',
  solid: '#0e1a2b',
  accent: '#0e1a2b',
  image: '#0e1a2b',
};
const EYEBROW: Record<string, string> = {
  dark: '#e5b449',
  gold: '#0e1a2b',
  green: 'rgba(246,239,226,.75)',
  cream: '#6b6356',
  solid: '#6b6356',
  accent: '#006847',
  image: '#6b6356',
};

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
  const bg = BG[variant] ?? '#fbf7ee';
  const fg = FG[variant] ?? '#0e1a2b';
  const eyebrowColor = EYEBROW[variant] ?? '#6b6356';
  const isImage = variant === 'image' && imageUrl;

  return (
    <Link
      to={to}
      className={`group relative overflow-hidden flex flex-col min-h-[260px]
        border-[1.5px] border-ink transition-all duration-200
        hover:-translate-x-[3px] hover:-translate-y-[3px]
        hover:shadow-[8px_8px_0_#0e1a2b] ${className}`}
      style={{ background: bg, color: fg }}
    >
      {/* Image background */}
      {isImage && (
        <div className="absolute inset-0 z-0">
          <img
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={imageUrl}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #0e1a2bdd 40%, transparent)' }}
          />
        </div>
      )}

      <div className={`relative z-10 flex flex-col justify-between flex-1 p-7`}>
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 10,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: isImage ? '#e5b449' : eyebrowColor,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon size={14} />
            <span>{badge ?? title}</span>
          </div>
          {badge && (
            <span
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 10,
                letterSpacing: '0.18em',
                padding: '3px 8px',
                background: variant === 'dark' ? '#e5b449' : '#0e1a2b',
                color: variant === 'dark' ? '#0e1a2b' : '#e5b449',
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div className="mt-auto">
          <h3
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 38,
              lineHeight: 0.92,
              margin: '16px 0 10px',
              color: isImage ? '#f6efe2' : fg,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.5,
              opacity: 0.82,
              maxWidth: 300,
              margin: 0,
              color: isImage ? 'rgba(246,239,226,.8)' : fg,
            }}
          >
            {description}
          </p>

          {stat && (
            <div
              style={{
                marginTop: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                border: `1px solid ${variant === 'dark' ? 'rgba(246,239,226,.15)' : 'rgba(14,26,43,.15)'}`,
              }}
            >
              <span
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.65,
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 18,
                  color: variant === 'dark' ? '#e5b449' : 'var(--color-secondary)',
                }}
              >
                {stat.value}
              </span>
            </div>
          )}

          {progress && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  height: 6,
                  background: variant === 'dark' ? 'rgba(246,239,226,.12)' : 'rgba(14,26,43,.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${progress.value}%`,
                    background: 'linear-gradient(90deg, #00432d, #e5b449)',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  opacity: 0.65,
                  fontFamily: 'Archivo, sans-serif',
                }}
              >
                <span>Completado</span>
                <span style={{ fontWeight: 700 }}>{progress.label}</span>
              </div>
            </div>
          )}

          <div
            className="flex items-center gap-2 mt-4"
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 13,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderBottom: `2px solid ${isImage ? '#e5b449' : fg}`,
              width: 'fit-content',
              paddingBottom: 3,
              color: isImage ? '#e5b449' : fg,
            }}
          >
            VER MÁS →
          </div>
        </div>
      </div>
    </Link>
  );
}
