import { useState, useEffect, useCallback } from 'react';
import type { SeleccionResponse, JugadorResponse } from '../types';
import { fetchSelecciones, fetchJugadoresBySeleccion } from '../services/footballApi';
import { ArrowLeft, Loader2 } from 'lucide-react';

// ── Flag image with emoji fallback ────────────────────────────────────────────
function FlagImg({ url, pais, size = 40 }: { url?: string; pais: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (url && !err) {
    return (
      <img
        src={url}
        alt={pais}
        style={{
          width: size,
          height: Math.round(size * 0.67),
          objectFit: 'cover',
          borderRadius: 4,
          boxShadow: '0 1px 6px rgba(0,0,0,.25)',
          display: 'block',
        }}
        onError={() => setErr(true)}
      />
    );
  }
  return <span style={{ fontSize: size * 0.65, lineHeight: 1 }}>🏳️</span>;
}

// ── Position sort order ───────────────────────────────────────────────────────
const POS_ORDER: Record<string, number> = { GK: 0, DF: 1, MF: 2, FW: 3 };

function sortByPos(players: JugadorResponse[]) {
  return [...players].sort((a, b) => {
    const pa = POS_ORDER[a.posicion?.toUpperCase()] ?? 9;
    const pb = POS_ORDER[b.posicion?.toUpperCase()] ?? 9;
    return pa - pb;
  });
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        height: 52,
        borderRadius: 10,
        background: 'rgba(0,0,0,.06)',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export function Teams() {
  const [selecciones, setSelecciones] = useState<SeleccionResponse[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [featured, setFeatured] = useState<SeleccionResponse | null>(null);
  const [jugadores, setJugadores] = useState<JugadorResponse[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>('ALL');
  const [showRoster, setShowRoster] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = useCallback((s: SeleccionResponse) => {
    setLoadingPlayers(true);
    setJugadores([]);
    fetchJugadoresBySeleccion(s.id)
      .then(setJugadores)
      .catch(() => setJugadores([]))
      .finally(() => setLoadingPlayers(false));
  }, []);

  useEffect(() => {
    fetchSelecciones()
      .then((data) => {
        setSelecciones(data);
        const first = data[0] ?? null;
        if (first) {
          setFeatured(first);
          loadPlayers(first);
        }
      })
      .catch(() => setError('No se pudieron cargar las selecciones.'))
      .finally(() => setLoadingTeams(false));
  }, [loadPlayers]);

  const handleSelectTeam = (s: SeleccionResponse) => {
    setFeatured(s);
    setShowRoster(false);
    loadPlayers(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derived data
  const groups = selecciones.reduce<Record<string, SeleccionResponse[]>>((acc, s) => {
    const g = s.grupo ?? 'X';
    return { ...acc, [g]: [...(acc[g] ?? []), s] };
  }, {});
  const groupKeys = Object.keys(groups).sort();
  const filteredGroups =
    activeGroup === 'ALL' ? groupKeys : groupKeys.filter((g) => g === activeGroup);
  const keySquad = sortByPos(jugadores).slice(0, 6);
  const confeds = new Set(selecciones.map((s) => s.confederacion).filter(Boolean)).size;
  const total = selecciones.length || 48;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg, #f0f2f5)',
        paddingTop: 80,
      }}
    >
      {/* ── HERO HEADER ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-bg, #f0f2f5)',
          borderBottom: '1px solid rgba(0,0,0,.08)',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '52px 36px 0',
          }}
        >
          {/* Big title */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 24,
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: '"Bebas Neue", "Oswald", "Anton", Impact, sans-serif',
                  fontSize: 'clamp(64px, 10vw, 128px)',
                  lineHeight: 0.88,
                  fontWeight: 900,
                  letterSpacing: '-0.01em',
                  margin: 0,
                  color: '#0d1b2a',
                }}
              >
                ALL <span style={{ color: '#C8102E' }}>{total}</span>
                <br />
                NATIONS.
              </h1>
              <p
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 15,
                  color: '#64748b',
                  marginTop: 20,
                  maxWidth: 540,
                  lineHeight: 1.65,
                }}
              >
                {total} nations. 12 groups. One trophy. Explore squads, historical results and the
                road to the final at the Mercedes-Benz Stadium.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          {!loadingTeams && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                marginTop: 40,
                borderTop: '1px solid rgba(0,0,0,.08)',
              }}
            >
              {[
                { label: 'Selecciones', value: total, color: '#006847' },
                { label: 'Confederaciones', value: confeds || 6, color: '#002868' },
                { label: 'Grupos', value: groupKeys.length || 12, color: '#C8102E' },
                { label: 'Edición', value: '2026', color: '#006847' },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: '22px 24px',
                    borderRight: i < 3 ? '1px solid rgba(0,0,0,.08)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Bebas Neue", "Oswald", "Anton", sans-serif',
                      fontSize: 40,
                      fontWeight: 900,
                      color: stat.color,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Inter", system-ui, sans-serif',
                      fontSize: 10,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      marginTop: 5,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '44px 36px 100px',
        }}
      >
        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(200,16,46,.08)',
              border: '1px solid rgba(200,16,46,.2)',
              borderRadius: 14,
              padding: '16px 20px',
              color: '#C8102E',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              marginBottom: 32,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loadingTeams && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 220,
              gap: 12,
            }}
          >
            <Loader2 size={26} className="animate-spin" style={{ color: '#006847' }} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#64748b',
                fontSize: 14,
              }}
            >
              Cargando selecciones…
            </span>
          </div>
        )}

        {!loadingTeams && (
          <>
            {/* ── FEATURED TEAM + KEY SQUAD ── */}
            {featured && !showRoster && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '340px 1fr',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 8px 48px rgba(0,0,0,.13)',
                  marginBottom: 52,
                }}
              >
                {/* Left: Featured card */}
                <div
                  style={{
                    background: 'linear-gradient(145deg, #002868 0%, #001a4a 100%)',
                    color: '#fff',
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 260,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 9,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      opacity: 0.6,
                      marginBottom: 22,
                    }}
                  >
                    FEATURED TEAM
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      marginBottom: 22,
                    }}
                  >
                    <FlagImg url={featured.banderaUrl} pais={featured.pais} size={52} />
                    <div>
                      <div
                        style={{
                          fontFamily: '"Space Grotesk", "Inter", sans-serif',
                          fontSize: 24,
                          fontWeight: 800,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.1,
                          textTransform: 'uppercase',
                        }}
                      >
                        {featured.pais}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          opacity: 0.7,
                          marginTop: 4,
                          fontFamily: 'Inter, sans-serif',
                          letterSpacing: '0.04em',
                        }}
                      >
                        GROUP {featured.grupo} · {featured.confederacion}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      borderTop: '1px solid rgba(255,255,255,.15)',
                      paddingTop: 20,
                      marginTop: 'auto',
                      gap: 8,
                    }}
                  >
                    {[
                      { label: 'COACH', value: '—' },
                      { label: 'APPEARANCES', value: '—' },
                      { label: 'TITLES', value: '0' },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div
                          style={{
                            fontSize: 8,
                            letterSpacing: '0.16em',
                            opacity: 0.55,
                            fontFamily: 'Inter, sans-serif',
                            marginBottom: 5,
                          }}
                        >
                          {stat.label}
                        </div>
                        <div
                          style={{
                            fontFamily: '"Space Grotesk", sans-serif',
                            fontSize: 15,
                            fontWeight: 700,
                          }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Key Squad */}
                <div
                  style={{
                    background: '#fff',
                    padding: '28px 28px 22px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 20,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#64748b',
                      }}
                    >
                      KEY SQUAD
                    </span>
                    <button
                      onClick={() => setShowRoster(true)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(0,0,0,.15)',
                        borderRadius: 20,
                        padding: '5px 14px',
                        fontSize: 11,
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        color: '#64748b',
                        letterSpacing: '0.04em',
                        transition: 'all .15s',
                      }}
                    >
                      FULL ROSTER →
                    </button>
                  </div>

                  {loadingPlayers ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                      }}
                    >
                      {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : keySquad.length > 0 ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                      }}
                    >
                      {keySquad.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: '#f8fafc',
                            borderRadius: 10,
                            padding: '10px 14px',
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#0d1b2a',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: '"Space Grotesk", sans-serif',
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {p.dorsal ?? '—'}
                          </div>
                          <div>
                            <div
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#0d1b2a',
                                lineHeight: 1.2,
                              }}
                            >
                              {p.nombreCompleto.split(' ').slice(-1)[0]}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                              }}
                            >
                              {p.posicion}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: 13,
                        fontFamily: 'Inter, sans-serif',
                        padding: '24px 0',
                        textAlign: 'center',
                      }}
                    >
                      No hay jugadores registrados aún
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── FULL ROSTER VIEW ── */}
            {showRoster && featured && (
              <div style={{ marginBottom: 52 }}>
                <button
                  onClick={() => setShowRoster(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'transparent',
                    border: '1px solid rgba(0,0,0,.12)',
                    borderRadius: 10,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: '#64748b',
                    marginBottom: 24,
                    transition: 'all .15s',
                  }}
                >
                  <ArrowLeft size={14} />
                  Volver
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 28,
                  }}
                >
                  <FlagImg url={featured.banderaUrl} pais={featured.pais} size={40} />
                  <h2
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 26,
                      fontWeight: 800,
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {featured.pais} — Plantel Completo
                  </h2>
                </div>

                {jugadores.length === 0 ? (
                  <p
                    style={{
                      color: '#94a3b8',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                    }}
                  >
                    No hay jugadores registrados aún.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {sortByPos(jugadores).map((p) => (
                      <div
                        key={p.id}
                        style={{
                          background: '#fff',
                          border: '1px solid rgba(0,0,0,.07)',
                          borderRadius: 12,
                          padding: '13px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          transition: 'box-shadow .15s',
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#0d1b2a',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: '"Space Grotesk", sans-serif',
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {p.dorsal}
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                              fontSize: 13,
                              color: '#0d1b2a',
                              lineHeight: 1.2,
                            }}
                          >
                            {p.nombreCompleto}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: '#94a3b8',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              marginTop: 2,
                            }}
                          >
                            {p.posicion}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── BROWSE BY GROUP ── */}
            {!showRoster && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      margin: 0,
                    }}
                  >
                    BROWSE BY GROUP
                  </h2>

                  {/* Group pills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['ALL', ...groupKeys].map((g) => {
                      const active = activeGroup === g;
                      return (
                        <button
                          key={g}
                          onClick={() => setActiveGroup(g)}
                          style={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: 'none',
                            background: active ? '#0d1b2a' : 'rgba(0,0,0,.07)',
                            color: active ? '#fff' : '#0d1b2a',
                            fontFamily: '"Space Grotesk", sans-serif',
                            fontWeight: 700,
                            fontSize: g === 'ALL' ? 11 : 14,
                            cursor: 'pointer',
                            transition: 'all .15s',
                            padding: '0 4px',
                          }}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Group sections */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 48,
                  }}
                >
                  {filteredGroups.map((g) => (
                    <section key={g} id={`group-${g}`}>
                      <h3
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: '#94a3b8',
                          marginBottom: 16,
                          paddingBottom: 10,
                          borderBottom: '1px solid rgba(0,0,0,.07)',
                        }}
                      >
                        GROUP {g}
                      </h3>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(176px, 1fr))',
                          gap: 12,
                        }}
                      >
                        {groups[g].map((s) => {
                          const isActive = featured?.id === s.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => handleSelectTeam(s)}
                              style={{
                                background: isActive ? '#0d1b2a' : '#fff',
                                border: isActive ? 'none' : '1px solid rgba(0,0,0,.08)',
                                borderRadius: 14,
                                padding: '18px 18px 14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all .18s',
                                boxShadow: isActive
                                  ? '0 4px 20px rgba(0,0,0,.18)'
                                  : '0 1px 4px rgba(0,0,0,.05)',
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive)
                                  (e.currentTarget as HTMLButtonElement).style.transform =
                                    'translateY(-3px)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = '';
                              }}
                            >
                              <FlagImg url={s.banderaUrl} pais={s.pais} size={38} />
                              <div
                                style={{
                                  fontFamily: '"Space Grotesk", sans-serif',
                                  fontWeight: 700,
                                  fontSize: 14,
                                  marginTop: 12,
                                  color: isActive ? '#fff' : '#0d1b2a',
                                  lineHeight: 1.2,
                                }}
                              >
                                {s.pais}
                              </div>
                              <div
                                style={{
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: 10,
                                  color: isActive ? 'rgba(255,255,255,.5)' : '#94a3b8',
                                  marginTop: 4,
                                  letterSpacing: '0.1em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {s.codigoFifa}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
