import { useState } from 'react';

const MASCOTS = [
  {
    id: 'maple',
    label: 'MAPLE',
    country: 'CAN',
    emoji: '🦌',
    color: '#C8102E',
    secondary: '#FF6B6B',
    bg: 'linear-gradient(135deg,#C8102E22,#C8102E08)',
    desc: 'Canada',
  },
  {
    id: 'zayu',
    label: 'ZAYU',
    country: 'MEX',
    emoji: '🦎',
    color: '#006847',
    secondary: '#00A86B',
    bg: 'linear-gradient(135deg,#00684722,#00684708)',
    desc: 'México',
  },
  {
    id: 'clutch',
    label: 'CLUTCH',
    country: 'USA',
    emoji: '🦅',
    color: '#002868',
    secondary: '#BF0A30',
    bg: 'linear-gradient(135deg,#00286822,#BF0A3008)',
    desc: 'USA',
  },
] as const;

type MascotId = (typeof MASCOTS)[number]['id'];

export function MascotShowcase() {
  const [active, setActive] = useState<MascotId>('maple');
  const mascot = MASCOTS.find((m) => m.id === active)!;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: '32px 0',
      }}
    >
      {/* Mascot display */}
      <div
        style={{
          position: 'relative',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: mascot.bg,
          border: `2px solid ${mascot.color}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s ease',
          boxShadow: `0 0 60px ${mascot.color}22`,
        }}
      >
        {/* Rotating ring */}
        <div
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: `2px solid transparent`,
            borderTopColor: mascot.color,
            borderRightColor: `${mascot.color}44`,
            animation: 'spin 3s linear infinite',
          }}
        />
        {/* Emoji mascot */}
        <span style={{ fontSize: 96, lineHeight: 1, userSelect: 'none' }}>{mascot.emoji}</span>

        {/* Country badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: mascot.color,
            color: '#fff',
            fontFamily: 'Anton, sans-serif',
            fontSize: 11,
            letterSpacing: '0.15em',
            padding: '3px 8px',
            borderRadius: 4,
          }}
        >
          {mascot.country}
        </div>
      </div>

      {/* Mascot name */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 28,
            letterSpacing: '0.12em',
            color: mascot.color,
            margin: 0,
            lineHeight: 1,
          }}
        >
          {mascot.label}
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: 'rgba(246,239,226,0.45)',
            margin: '6px 0 0',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Mascota · {mascot.desc}
        </p>
      </div>

      {/* Selector */}
      <div style={{ display: 'flex', gap: 10 }}>
        {MASCOTS.map((m) => {
          const on = active === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              style={{
                background: on ? m.color : 'transparent',
                color: on ? '#fff' : 'rgba(246,239,226,.6)',
                border: `1.5px solid ${on ? m.color : 'rgba(246,239,226,.2)'}`,
                fontFamily: 'Anton, sans-serif',
                fontSize: 11,
                letterSpacing: '0.16em',
                padding: '6px 16px',
                cursor: 'pointer',
                borderRadius: 4,
                transition: 'all 0.18s',
                textTransform: 'uppercase',
              }}
            >
              {m.emoji} {m.label}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
