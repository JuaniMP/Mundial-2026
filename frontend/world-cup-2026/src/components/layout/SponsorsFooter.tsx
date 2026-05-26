import React from 'react';

interface Sponsor {
  name: string;
  url: string;
  color: string;
  textColor: string;
  abbr: string;
}

const SPONSORS: Sponsor[] = [
  {
    name: 'Adidas',
    url: 'https://www.adidas.com',
    color: '#000000',
    textColor: '#ffffff',
    abbr: 'ADS',
  },
  {
    name: 'Coca-Cola',
    url: 'https://www.coca-cola.com',
    color: '#F40009',
    textColor: '#ffffff',
    abbr: 'CC',
  },
  {
    name: 'Hyundai',
    url: 'https://www.hyundai.com',
    color: '#003087',
    textColor: '#ffffff',
    abbr: 'HYN',
  },
  {
    name: 'Qatar Airways',
    url: 'https://www.qatarairways.com',
    color: '#5C0632',
    textColor: '#ffffff',
    abbr: 'QA',
  },
  {
    name: 'Visa',
    url: 'https://www.visa.com',
    color: '#1A1F71',
    textColor: '#F7B600',
    abbr: 'VISA',
  },
  {
    name: "McDonald's",
    url: 'https://www.mcdonalds.com',
    color: '#DA291C',
    textColor: '#FFC72C',
    abbr: 'MCD',
  },
  {
    name: 'Budweiser',
    url: 'https://www.budweiser.com',
    color: '#CC0000',
    textColor: '#ffffff',
    abbr: 'BUD',
  },
  {
    name: 'Hisense',
    url: 'https://www.hisense.com',
    color: '#0056A2',
    textColor: '#ffffff',
    abbr: 'HIS',
  },
  { name: 'Nike', url: 'https://www.nike.com', color: '#111111', textColor: '#ffffff', abbr: '✓' },
  {
    name: 'Wanda Group',
    url: 'https://www.wanda.com',
    color: '#8B0000',
    textColor: '#ffffff',
    abbr: 'WG',
  },
];

export function SponsorsFooter(): React.JSX.Element {
  return (
    <footer
      style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1a2d45 50%, #0D1B2A 100%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 24px 28px',
        marginTop: 'auto',
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            marginBottom: 6,
          }}
        >
          Patrocinadores Oficiales
        </p>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: '0.05em',
          }}
        >
          FIFA World Cup 2026™
        </h3>
      </div>

      {/* Sponsors grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          maxWidth: 900,
          margin: '0 auto 28px',
        }}
      >
        {SPONSORS.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = 'rgba(255,255,255,0.12)';
              el.style.borderColor = 'rgba(255,255,255,0.22)';
              el.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = 'rgba(255,255,255,0.06)';
              el.style.borderColor = 'rgba(255,255,255,0.1)';
              el.style.transform = 'translateY(0)';
            }}
          >
            {/* Color badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 5,
                background: s.color,
                color: s.textColor,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.03em',
                flexShrink: 0,
              }}
            >
              {s.abbr}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {s.name}
            </span>
          </a>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          width: 60,
          height: 1,
          background: 'rgba(255,255,255,0.1)',
          margin: '0 auto 16px',
        }}
      />

      {/* Copyright */}
      <p
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          letterSpacing: '0.03em',
        }}
      >
        © 2026 FIFA World Cup™ · Hub Oficial · Todos los derechos reservados
      </p>
    </footer>
  );
}
