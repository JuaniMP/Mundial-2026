import { useEffect, useState } from 'react';
import { fetchTravelSuggestions, type TravelSuggestions } from '../services/travelApi';

interface TravelSuggestionsProps {
  estadio: string;
}

const STAR_COLORS: Record<number, string> = {
  5: '#f59e0b',
  4: '#3b82f6',
  3: '#10b981',
  2: '#6b7280',
  1: '#6b7280',
};

function Stars({ n }: { n: number }) {
  const color = STAR_COLORS[n] ?? '#6b7280';
  return (
    <span style={{ color, fontSize: 12, letterSpacing: 1 }}>
      {'★'.repeat(Math.min(n, 5))}
      {'☆'.repeat(Math.max(0, 5 - n))}
    </span>
  );
}

function ExternalLink({
  href,
  children,
  color = '#3b82f6',
}: {
  href: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 12px',
        borderRadius: 8,
        background: color + '18',
        border: `1px solid ${color}44`,
        color,
        fontSize: 12,
        fontWeight: 700,
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
    >
      {children} ↗
    </a>
  );
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; data: TravelSuggestions };

export function TravelSuggestionsPanel({ estadio }: TravelSuggestionsProps) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    fetchTravelSuggestions(estadio)
      .then((d) => {
        if (alive) setState({ status: 'ok', data: d });
      })
      .catch(() => {
        if (alive)
          setState({
            status: 'error',
            message: 'No se pudieron cargar las sugerencias de viaje.',
          });
      });
    return () => {
      alive = false;
    };
  }, [estadio]);

  const loading = state.status === 'loading';
  const error = state.status === 'error' ? state.message : null;
  const data = state.status === 'ok' ? state.data : null;

  if (loading) {
    return (
      <div
        style={{
          padding: '20px 0',
          color: '#64748b',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        <span style={{ marginRight: 8 }}>✈️</span>Cargando sugerencias de viaje…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 10,
          color: '#b91c1c',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
        }}
      >
        ⚠️ {error ?? 'Sin datos'}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: '16px 0 0',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header ciudad */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)',
          borderRadius: 14,
          padding: '16px 20px',
          color: '#fff',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 32 }}>✈️</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: 0.75, margin: 0 }}>
            SUGERENCIAS DE VIAJE
          </p>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              margin: '2px 0 4px',
              fontFamily: 'Oswald, sans-serif',
            }}
          >
            {data.ciudad}
            <span style={{ opacity: 0.7, fontWeight: 400, fontSize: 15 }}> · {data.pais}</span>
          </h3>
          <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>📍 {data.estadio}</p>
          <p
            style={{
              fontSize: 10,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 6,
              padding: '3px 8px',
              marginTop: 6,
              display: 'inline-block',
            }}
          >
            {data.apiFuncional
              ? '🌐 Atracciones via OpenStreetMap · Booking.com · Google Flights'
              : '🔗 Links directos a Booking.com · Google Flights · Skyscanner'}
          </p>
        </div>
      </div>

      {/* Vuelos */}
      <section>
        <h4
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
            color: '#94a3b8',
            margin: '0 0 10px',
            textTransform: 'uppercase',
          }}
        >
          🛫 Buscar vuelos
        </h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ExternalLink href={data.googleFlightsUrl} color="#4285f4">
            Google Flights
          </ExternalLink>
          <ExternalLink href={data.skyscannerUrl} color="#0770e3">
            Skyscanner
          </ExternalLink>
          <ExternalLink href={data.bookingCiudadUrl} color="#003580">
            Booking.com
          </ExternalLink>
        </div>
      </section>

      {/* Hoteles */}
      <section>
        <h4
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
            color: '#94a3b8',
            margin: '0 0 10px',
            textTransform: 'uppercase',
          }}
        >
          🏨 Hoteles sugeridos
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.hoteles.map((h, i) => (
            <div
              key={h.hotelId ?? i}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>🏨</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {h.nombre}
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {h.estrellas > 0 && <Stars n={h.estrellas} />}
                  <span style={{ fontSize: 11, color: '#64748b' }}>{h.distanciaEstadio}</span>
                </div>
              </div>
              <ExternalLink href={h.bookingUrl} color="#003580">
                Reservar
              </ExternalLink>
            </div>
          ))}
        </div>
      </section>

      {/* Atracciones */}
      {data.atracciones.length > 0 && (
        <section>
          <h4
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              color: '#94a3b8',
              margin: '0 0 10px',
              textTransform: 'uppercase',
            }}
          >
            🗺️ Qué visitar
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.atracciones.map((a) => (
              <div
                key={a.nombre}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.3 }}>{a.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: 0,
                      }}
                    >
                      {a.nombre}
                    </p>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: 1,
                        color: '#64748b',
                        background: '#e2e8f0',
                        borderRadius: 4,
                        padding: '1px 5px',
                      }}
                    >
                      {a.tipo}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#475569', margin: '0 0 6px' }}>
                    {a.descripcion}
                  </p>
                  <ExternalLink href={a.mapsUrl} color="#10b981">
                    Ver en Maps
                  </ExternalLink>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
