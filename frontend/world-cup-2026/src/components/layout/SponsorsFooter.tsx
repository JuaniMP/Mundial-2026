import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_V1 } from '../../config';

interface Aliado {
  nombre: string;
  tipo: string;
  sitioWeb: string;
}

// Color badge mapping by aliado name (fallback palette)
const BRAND_COLORS: Record<string, { bg: string; text: string; abbr: string }> = {
  adidas: { bg: '#000000', text: '#ffffff', abbr: 'ADS' },
  'coca-cola': { bg: '#F40009', text: '#ffffff', abbr: 'CC' },
  hyundai: { bg: '#003087', text: '#ffffff', abbr: 'HYN' },
  'qatar airways': { bg: '#5C0632', text: '#ffffff', abbr: 'QA' },
  visa: { bg: '#1A1F71', text: '#F7B600', abbr: 'VISA' },
  "mcdonald's": { bg: '#DA291C', text: '#FFC72C', abbr: 'MCD' },
  budweiser: { bg: '#CC0000', text: '#ffffff', abbr: 'BUD' },
  hisense: { bg: '#0056A2', text: '#ffffff', abbr: 'HIS' },
  nike: { bg: '#111111', text: '#ffffff', abbr: '✓' },
  'wanda group': { bg: '#8B0000', text: '#ffffff', abbr: 'WG' },
};

function getBrand(nombre: string) {
  const key = nombre.toLowerCase();
  return (
    BRAND_COLORS[key] ?? {
      bg: '#1a3a5c',
      text: '#ffffff',
      abbr: nombre.substring(0, 2).toUpperCase(),
    }
  );
}

export function SponsorsFooter(): React.JSX.Element {
  const [aliados, setAliados] = useState<Aliado[]>([]);

  useEffect(() => {
    axios
      .get<{ data: Aliado[] }>(`${API_V1}/aliados/publico`)
      .then((r) => setAliados(r.data.data ?? []))
      .catch(() => {
        /* silencioso — el footer simplemente no muestra logos */
      });
  }, []);

  if (aliados.length === 0) return <></>;

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
        {aliados.map((a) => {
          const brand = getBrand(a.nombre);
          return (
            <a
              key={a.nombre}
              href={a.sitioWeb}
              target="_blank"
              rel="noopener noreferrer"
              title={`${a.nombre} — ${a.tipo}`}
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
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 5,
                  background: brand.bg,
                  color: brand.text,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  flexShrink: 0,
                }}
              >
                {brand.abbr}
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
                {a.nombre}
              </span>
            </a>
          );
        })}
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
