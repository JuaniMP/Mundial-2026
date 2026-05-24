import { useState, useEffect, useCallback } from 'react';
import type { SeleccionResponse, JugadorResponse } from '../types';
import { fetchSelecciones, fetchJugadoresBySeleccion } from '../services/footballApi';
import { ArrowLeft, Loader2 } from 'lucide-react';

// ── Static metadata: groups, confederation, coach ─────────────────────────────
// API returns empty grupo/confederacion → we fill from here using codigoFifa
interface TeamMeta {
  grupo: string;
  confederacion: string;
  coach: string;
}

const TEAM_META: Record<string, TeamMeta> = {
  // GROUP A
  MEX: { grupo: 'A', confederacion: 'CONCACAF', coach: 'Javier Aguirre' },
  RSA: { grupo: 'A', confederacion: 'CAF', coach: 'Hugo Broos' },
  KOR: { grupo: 'A', confederacion: 'AFC', coach: 'Hong Myung-bo' },
  CZE: { grupo: 'A', confederacion: 'UEFA', coach: 'Ivan Hašek' },
  // GROUP B
  CAN: { grupo: 'B', confederacion: 'CONCACAF', coach: 'Jesse Marsch' },
  BIH: { grupo: 'B', confederacion: 'UEFA', coach: 'Sergej Barbarez' },
  QAT: { grupo: 'B', confederacion: 'AFC', coach: 'Marquez Lopez' },
  SUI: { grupo: 'B', confederacion: 'UEFA', coach: 'Murat Yakin' },
  // GROUP C
  BRA: { grupo: 'C', confederacion: 'CONMEBOL', coach: 'Dorival Júnior' },
  MAR: { grupo: 'C', confederacion: 'CAF', coach: 'Walid Regragui' },
  HAI: { grupo: 'C', confederacion: 'CONCACAF', coach: 'Marc Collat' },
  SCO: { grupo: 'C', confederacion: 'UEFA', coach: 'Steve Clarke' },
  // GROUP D
  USA: { grupo: 'D', confederacion: 'CONCACAF', coach: 'Mauricio Pochettino' },
  PAR: { grupo: 'D', confederacion: 'CONMEBOL', coach: 'Gustavo Alfaro' },
  AUS: { grupo: 'D', confederacion: 'AFC', coach: 'Tony Popovic' },
  TUR: { grupo: 'D', confederacion: 'UEFA', coach: 'Vincenzo Montella' },
  // GROUP E
  GER: { grupo: 'E', confederacion: 'UEFA', coach: 'Julian Nagelsmann' },
  CUW: { grupo: 'E', confederacion: 'CONCACAF', coach: 'Remko Bicentini' },
  CIV: { grupo: 'E', confederacion: 'CAF', coach: 'Emerse Faé' },
  ECU: { grupo: 'E', confederacion: 'CONMEBOL', coach: 'Sebastián Páez' },
  // GROUP F
  NED: { grupo: 'F', confederacion: 'UEFA', coach: 'Ronald Koeman' },
  JPN: { grupo: 'F', confederacion: 'AFC', coach: 'Hajime Moriyasu' },
  SWE: { grupo: 'F', confederacion: 'UEFA', coach: 'Jon Dahl Tomasson' },
  TUN: { grupo: 'F', confederacion: 'CAF', coach: 'Khaled Ben Yahia' },
  // GROUP G
  BEL: { grupo: 'G', confederacion: 'UEFA', coach: 'Domenico Tedesco' },
  EGY: { grupo: 'G', confederacion: 'CAF', coach: 'Hossam Hassan' },
  IRN: { grupo: 'G', confederacion: 'AFC', coach: 'Amir Ghalenoei' },
  NZL: { grupo: 'G', confederacion: 'OFC', coach: 'Darren Bazeley' },
  // GROUP H
  ESP: { grupo: 'H', confederacion: 'UEFA', coach: 'Luis de la Fuente' },
  CPV: { grupo: 'H', confederacion: 'CAF', coach: 'Pedro Brito' },
  KSA: { grupo: 'H', confederacion: 'AFC', coach: 'Hervé Renard' },
  URY: { grupo: 'H', confederacion: 'CONMEBOL', coach: 'Marcelo Bielsa' },
  // GROUP I
  FRA: { grupo: 'I', confederacion: 'UEFA', coach: 'Didier Deschamps' },
  SEN: { grupo: 'I', confederacion: 'CAF', coach: 'Aliou Cissé' },
  IRQ: { grupo: 'I', confederacion: 'AFC', coach: 'Jesús Casas' },
  NOR: { grupo: 'I', confederacion: 'UEFA', coach: 'Ståle Solbakken' },
  // GROUP J
  ARG: { grupo: 'J', confederacion: 'CONMEBOL', coach: 'Lionel Scaloni' },
  ALG: { grupo: 'J', confederacion: 'CAF', coach: 'Vladimir Petković' },
  AUT: { grupo: 'J', confederacion: 'UEFA', coach: 'Ralf Rangnick' },
  JOR: { grupo: 'J', confederacion: 'AFC', coach: 'Hussein Ammouta' },
  // GROUP K
  POR: { grupo: 'K', confederacion: 'UEFA', coach: 'Roberto Martínez' },
  COD: { grupo: 'K', confederacion: 'CAF', coach: 'Sébastien Migné' },
  UZB: { grupo: 'K', confederacion: 'AFC', coach: 'Srecko Katanec' },
  COL: { grupo: 'K', confederacion: 'CONMEBOL', coach: 'Néstor Lorenzo' },
  // GROUP L
  ENG: { grupo: 'L', confederacion: 'UEFA', coach: 'Thomas Tuchel' },
  CRO: { grupo: 'L', confederacion: 'UEFA', coach: 'Zlatko Dalić' },
  GHA: { grupo: 'L', confederacion: 'CAF', coach: 'Otto Addo' },
  PAN: { grupo: 'L', confederacion: 'CONCACAF', coach: 'Thomas Christiansen' },
};

function getMeta(codigoFifa: string): TeamMeta {
  return (
    TEAM_META[codigoFifa] ?? {
      grupo: '?',
      confederacion: '—',
      coach: '—',
    }
  );
}

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
  return <div className="glass rounded-xl animate-pulse" style={{ height: 52 }} />;
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

  // Derived data — use static meta for grupo/confederacion
  const seleccionesConMeta = selecciones.map((s) => ({
    ...s,
    _meta: getMeta(s.codigoFifa),
  }));

  const groups = seleccionesConMeta.reduce<Record<string, typeof seleccionesConMeta>>((acc, s) => {
    const g = s._meta.grupo;
    return { ...acc, [g]: [...(acc[g] ?? []), s] };
  }, {});

  const groupKeys = Object.keys(groups)
    .filter((g) => g !== '?')
    .sort();
  const filteredGroups =
    activeGroup === 'ALL' ? groupKeys : groupKeys.filter((g) => g === activeGroup);
  const keySquad = sortByPos(jugadores).slice(0, 6);
  const confeds = new Set(
    seleccionesConMeta.map((s) => s._meta.confederacion).filter((c) => c && c !== '—'),
  ).size;
  const total = selecciones.length || 48;
  const featuredMeta = featured ? getMeta(featured.codigoFifa) : null;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-deep)', paddingTop: 80 }}>
      {/* ── HERO HEADER ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-bg-deep)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '52px 36px 0' }}>
          {/* Big title — mismo estilo que Estadios */}
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Selecciones <span className="gradient-text">{total}</span>
          </h1>
          <p className="text-text-muted mt-1">
            FIFA World Cup 2026 — {total} naciones · 12 grupos · USA, Canadá, México
          </p>

          {/* Stats strip */}
          {!loadingTeams && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                marginTop: 40,
                borderTop: '1px solid var(--color-border)',
              }}
            >
              {[
                { label: 'Selecciones', value: total, color: 'var(--color-primary)' },
                { label: 'Confederaciones', value: confeds || 6, color: 'var(--color-accent)' },
                { label: 'Grupos', value: groupKeys.length || 12, color: 'var(--color-secondary)' },
                { label: 'Edición', value: '2026', color: 'var(--color-primary)' },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: '22px 24px',
                    borderRight: i < 3 ? '1px solid var(--color-border)' : 'none',
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
                    className="text-text-muted"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: 10,
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

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '44px 36px 100px' }}>
        {/* Error */}
        {error && (
          <div
            className="glass rounded-xl"
            style={{
              padding: '16px 20px',
              color: 'var(--color-secondary)',
              fontFamily: 'var(--font-headline)',
              fontSize: 14,
              marginBottom: 32,
              borderColor: 'rgba(200,16,46,.25)',
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
            <Loader2 size={26} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            <span
              className="text-text-muted"
              style={{ fontFamily: 'var(--font-headline)', fontSize: 14 }}
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
                className="glass"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '300px 1fr',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 8px 48px rgba(0,0,0,.13)',
                  marginBottom: 52,
                  border: 'none',
                }}
              >
                {/* Left: Featured card */}
                <div
                  style={{
                    background:
                      'linear-gradient(145deg, var(--color-accent) 0%, var(--color-accent-dim) 100%)',
                    color: '#fff',
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 260,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: 9,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      opacity: 0.6,
                      marginBottom: 22,
                    }}
                  >
                    FEATURED TEAM
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                    <FlagImg url={featured.banderaUrl} pais={featured.pais} size={52} />
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-headline)',
                          fontSize: 22,
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
                          opacity: 0.65,
                          marginTop: 4,
                          fontFamily: 'var(--font-headline)',
                          letterSpacing: '0.06em',
                        }}
                      >
                        GRUPO {featuredMeta?.grupo ?? '—'} · {featuredMeta?.confederacion ?? '—'}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      borderTop: '1px solid rgba(255,255,255,.15)',
                      paddingTop: 20,
                      marginTop: 'auto',
                      gap: 8,
                    }}
                  >
                    {[
                      { label: 'DT', value: featuredMeta?.coach ?? '—' },
                      { label: 'CONFEDERACIÓN', value: featuredMeta?.confederacion ?? '—' },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div
                          style={{
                            fontSize: 8,
                            letterSpacing: '0.16em',
                            opacity: 0.5,
                            fontFamily: 'var(--font-headline)',
                            marginBottom: 5,
                            textTransform: 'uppercase',
                          }}
                        >
                          {stat.label}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-headline)',
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1.3,
                          }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Key Squad */}
                <div style={{ background: 'var(--color-bg-card)', padding: '28px 28px 22px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 20,
                    }}
                  >
                    <span
                      className="text-text-muted"
                      style={{
                        fontFamily: 'var(--font-headline)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                      }}
                    >
                      PLANTILLA CLAVE
                    </span>
                    <button
                      onClick={() => setShowRoster(true)}
                      className="glass"
                      style={{
                        borderRadius: 20,
                        padding: '5px 14px',
                        fontSize: 11,
                        fontFamily: 'var(--font-headline)',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        letterSpacing: '0.04em',
                        transition: 'all .15s',
                      }}
                    >
                      PLANTEL COMPLETO →
                    </button>
                  </div>

                  {loadingPlayers ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : keySquad.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {keySquad.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: 'var(--color-bg-surface)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'var(--color-primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-headline)',
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
                                fontFamily: 'var(--font-headline)',
                                fontSize: 12,
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                lineHeight: 1.2,
                              }}
                            >
                              {p.nombreCompleto.split(' ').slice(-1)[0]}
                            </div>
                            <div
                              className="text-text-muted"
                              style={{
                                fontSize: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontFamily: 'var(--font-headline)',
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
                      className="text-text-muted"
                      style={{
                        fontSize: 13,
                        fontFamily: 'var(--font-headline)',
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
                  className="glass"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 10,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-headline)',
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    marginBottom: 24,
                    transition: 'all .15s',
                  }}
                >
                  <ArrowLeft size={14} />
                  Volver
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                  <FlagImg url={featured.banderaUrl} pais={featured.pais} size={40} />
                  <h2
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: 26,
                      fontWeight: 800,
                      margin: 0,
                      letterSpacing: '-0.02em',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {featured.pais} — Plantel Completo
                  </h2>
                </div>

                {jugadores.length === 0 ? (
                  <p
                    className="text-text-muted"
                    style={{ fontFamily: 'var(--font-headline)', fontSize: 14 }}
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
                        className="glass card-base"
                        style={{
                          borderRadius: 12,
                          padding: '13px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-headline)',
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
                              fontFamily: 'var(--font-headline)',
                              fontWeight: 700,
                              fontSize: 13,
                              color: 'var(--color-text-primary)',
                              lineHeight: 1.2,
                            }}
                          >
                            {p.nombreCompleto}
                          </div>
                          <div
                            className="text-text-muted"
                            style={{
                              fontSize: 10,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              marginTop: 2,
                              fontFamily: 'var(--font-headline)',
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
                      fontFamily: 'var(--font-headline)',
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      margin: 0,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    BROWSE BY GROUP
                  </h2>

                  {/* Group pills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['ALL', ...groupKeys].map((g) => {
                      const isActive = activeGroup === g;
                      return (
                        <button
                          key={g}
                          onClick={() => setActiveGroup(g)}
                          style={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: isActive
                              ? '2px solid var(--color-primary)'
                              : '1px solid var(--color-border)',
                            background: isActive ? 'var(--color-primary)' : 'var(--color-bg-card)',
                            color: isActive ? '#fff' : 'var(--color-text-primary)',
                            fontFamily: 'var(--font-headline)',
                            fontWeight: 800,
                            fontSize: g === 'ALL' ? 11 : 14,
                            cursor: 'pointer',
                            transition: 'all .15s',
                            padding: '0 4px',
                            boxShadow: isActive ? '0 2px 10px rgba(0,104,71,.3)' : 'none',
                          }}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Group sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                  {filteredGroups.map((g) => (
                    <section key={g} id={`group-${g}`}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-headline)',
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          color: 'var(--color-primary)',
                          marginBottom: 16,
                          paddingBottom: 10,
                          borderBottom: '2px solid var(--color-primary-subtle)',
                        }}
                      >
                        GRUPO {g}
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
                              className={isActive ? '' : 'card-base'}
                              style={{
                                background: isActive
                                  ? 'var(--color-accent)'
                                  : 'var(--color-bg-card)',
                                border: isActive
                                  ? '2px solid var(--color-accent)'
                                  : '1px solid var(--color-border)',
                                borderRadius: 14,
                                padding: '18px 18px 14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all .18s',
                                boxShadow: isActive
                                  ? '0 4px 20px rgba(0,40,104,.25)'
                                  : '0 1px 4px rgba(0,0,0,.05)',
                              }}
                            >
                              <FlagImg url={s.banderaUrl} pais={s.pais} size={38} />
                              <div
                                style={{
                                  fontFamily: 'var(--font-headline)',
                                  fontWeight: 800,
                                  fontSize: 14,
                                  marginTop: 12,
                                  color: isActive ? '#fff' : 'var(--color-text-primary)',
                                  lineHeight: 1.2,
                                }}
                              >
                                {s.pais}
                              </div>
                              <div
                                style={{
                                  fontFamily: 'var(--font-headline)',
                                  fontSize: 10,
                                  color: isActive
                                    ? 'rgba(255,255,255,.55)'
                                    : 'var(--color-text-muted)',
                                  marginTop: 4,
                                  letterSpacing: '0.1em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {s.codigoFifa} · DT:{' '}
                                {getMeta(s.codigoFifa).coach.split(' ').slice(-1)[0]}
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
