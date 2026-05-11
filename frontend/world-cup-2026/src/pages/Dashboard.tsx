import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matches } from '../data/mockData';
import { MatchCard } from '../components/features/MatchCard';
import { FeatureCard } from '../components/features/FeatureCard';
import { Button } from '../components/ui';
import {
  ArrowRight,
  Play,
  Landmark,
  Trophy,
  BookOpen,
  Bell,
  BellOff,
  X,
  Users,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFcm } from '../hooks/useFcm';
import { MascotAnimation } from '../components/features/MascotAnimation';
import type { PartidoApi } from '../types';
import { fetchSeleccionByCode } from '../services/footballApi';
import { getTeamByShortName } from '../components/album/teamColors';

// Pitch lines SVG for hero background
function PitchLines() {
  return (
    <svg
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '-10%',
        transform: 'translateX(-50%)',
        width: 1400,
        height: 700,
        pointerEvents: 'none',
        opacity: 0.3,
      }}
      viewBox="0 0 1400 700"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id="pitch-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0)" />
          <stop offset="1" stopColor="rgba(255,255,255,.55)" />
        </linearGradient>
      </defs>
      <g stroke="url(#pitch-fade)" strokeWidth="2" fill="none">
        <ellipse cx="700" cy="700" rx="900" ry="500" />
        <ellipse cx="700" cy="700" rx="600" ry="320" />
        <ellipse cx="700" cy="700" rx="320" ry="170" />
        <line x1="0" y1="700" x2="1400" y2="700" />
        <line x1="700" y1="200" x2="700" y2="700" />
      </g>
    </svg>
  );
}

export function Dashboard() {
  const nextMatch = matches[0];
  const { token, user } = useAuth();
  const { permission, registered, foregroundMessage, isConfigured, requestAndRegister, disable } =
    useFcm(token);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  const favCode = (user as { seleccionFavorita?: string } | null)?.seleccionFavorita ?? null;
  const favTeam = favCode ? (getTeamByShortName(favCode) ?? null) : null;

  const [nextFavMatch, setNextFavMatch] = useState<PartidoApi | null>(null);

  useEffect(() => {
    if (!favCode || !token) return;
    let cancelled = false;
    fetchSeleccionByCode(favCode)
      .then((seleccion) => {
        if (!seleccion || cancelled) return;
        const authHeader = { Authorization: `Bearer ${token}` };
        const url = `http://localhost:8082/api/v1/selecciones/${seleccion.id}/partidos/proximos`;
        return fetch(url, { headers: authHeader })
          .then((r) => r.json() as Promise<{ data: PartidoApi[] }>)
          .then((body) => {
            if (!cancelled) setNextFavMatch(body.data?.[0] ?? null);
          });
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [favCode, token]);

  const showBanner =
    isConfigured &&
    !bannerDismissed &&
    permission !== 'granted' &&
    permission !== 'denied' &&
    permission !== 'unsupported';

  const handleEnable = async () => {
    setLoading(true);
    await requestAndRegister();
    setLoading(false);
  };

  return (
    /* top padding: ticker(~37px) + nav(~78px) = ~115px */
    <main className="pt-[115px] md:pt-[115px] pb-28 md:pb-12 w-full overflow-x-hidden">
      {/* ══════ Foreground Push Toast ══════ */}
      {foregroundMessage && (
        <div className="fixed top-[120px] right-4 z-[200] max-w-sm w-full animate-fade-in-up">
          <div
            style={{
              background: 'var(--color-bg-deep)',
              border: '1.5px solid var(--color-ink)',
              boxShadow: '6px 6px 0 var(--color-ink)',
              padding: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <Bell
              size={18}
              style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }}
            />
            <div>
              <p
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 14,
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                {foregroundMessage.title}
              </p>
              <p
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 13,
                  margin: '4px 0 0',
                  color: 'var(--color-text-muted)',
                }}
              >
                {foregroundMessage.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════ Notification Permission Banner ══════ */}
      {showBanner && (
        <div
          className="animate-fade-in-up"
          style={{
            margin: '0 24px 0',
            marginBottom: 0,
            background: 'var(--color-ink)',
            border: '1.5px solid var(--color-ink)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <Bell size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 13,
                letterSpacing: '0.08em',
                color: 'var(--color-bg-base)',
                margin: 0,
              }}
            >
              ACTIVA LAS NOTIFICACIONES PUSH
            </p>
            <p
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 11,
                color: 'rgba(246,239,226,.55)',
                margin: '2px 0 0',
              }}
            >
              Recibe resultados y confirmaciones en tiempo real.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Button
              variant="primary"
              size="sm"
              icon={Bell}
              onClick={handleEnable}
              disabled={loading}
            >
              {loading ? 'Activando…' : 'Activar'}
            </Button>
            <button
              onClick={() => setBannerDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(246,239,226,.5)',
                padding: 4,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══════ Notification Status Chip (when granted) ══════ */}
      {isConfigured && permission === 'granted' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '6px 36px',
            borderBottom: '1px solid rgba(14,26,43,.08)',
          }}
        >
          {registered ? (
            <button
              onClick={disable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                letterSpacing: '0.12em',
                color: 'var(--color-text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Archivo, sans-serif',
              }}
            >
              <BellOff size={12} />
              Desactivar notificaciones
            </button>
          ) : (
            <button
              onClick={handleEnable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                letterSpacing: '0.12em',
                color: 'var(--color-primary-dim)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Archivo, sans-serif',
              }}
            >
              <Bell size={12} />
              Registrar dispositivo
            </button>
          )}
        </div>
      )}

      {/* ══════ HERO SECTION ══════ */}
      <section
        style={{
          background: 'var(--color-ink)',
          borderBottom: '1.5px solid var(--color-ink)',
          color: 'var(--color-bg-base)',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 680,
        }}
      >
        {/* Gradient backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(229,180,73,.22), transparent 70%),' +
              'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(0,104,71,.3), transparent 60%),' +
              'linear-gradient(180deg, #0a1320 0%, #0e1a2b 50%, #0a1320 100%)',
          }}
        />
        {/* Dot grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,.04) 1px, transparent 0)',
            backgroundSize: '18px 18px',
            mask: 'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)',
          }}
        />
        <PitchLines />

        <div
          style={{
            position: 'relative',
            maxWidth: 1440,
            margin: '0 auto',
            padding: '56px 36px 72px',
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 24,
            alignItems: 'stretch',
            minHeight: 680,
          }}
        >
          {/* LEFT — editorial copy */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 3,
            }}
          >
            <div>
              {/* Eyebrow */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 12,
                  letterSpacing: '0.25em',
                  color: 'var(--color-primary)',
                  paddingBottom: 12,
                  borderBottom: '1px solid rgba(229,180,73,.35)',
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--color-danger)',
                    animation: 'pulse 1.6s infinite',
                    display: 'inline-block',
                  }}
                />
                EN VIVO · TEMPORADA 2026
              </span>

              {/* Title */}
              <h1
                style={{
                  fontFamily: 'Anton, sans-serif',
                  letterSpacing: '0.005em',
                  lineHeight: 0.85,
                  textTransform: 'uppercase',
                  margin: '0 0 20px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: 'clamp(80px,10vw,148px)',
                    color: 'var(--color-bg-base)',
                  }}
                >
                  EL{' '}
                  <span
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontStyle: 'italic',
                      textTransform: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '0.82em',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    gran
                  </span>
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 'clamp(80px,10vw,148px)',
                    WebkitTextStroke: '2px var(--color-bg-base)',
                    color: 'transparent',
                  }}
                >
                  MUN
                  <span style={{ color: 'var(--color-primary)', WebkitTextStroke: '0' }}>·</span>
                  DIAL
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'DM Serif Display, serif',
                    fontStyle: 'italic',
                    textTransform: 'none',
                    color: 'var(--color-primary)',
                    fontSize: 'clamp(40px,5.5vw,80px)',
                    lineHeight: 1.1,
                    marginTop: 6,
                  }}
                >
                  vuelve a casa.
                </span>
              </h1>

              <p
                style={{
                  maxWidth: 500,
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: 'rgba(246,239,226,.78)',
                  marginBottom: 28,
                  fontFamily: 'Archivo, sans-serif',
                }}
              >
                Tres países. Dieciséis sedes. Cuarenta y ocho selecciones. Una sola fiebre. Sigue
                cada gol, cada cromo, cada celebración — desde el saque inicial hasta el trofeo
                dorado.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  to="/matches"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'var(--color-ink)',
                    fontFamily: 'Anton, sans-serif',
                    letterSpacing: '0.05em',
                    fontSize: 16,
                    padding: '14px 26px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    textDecoration: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translate(-2px,-2px)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '6px 6px 0 #b58523';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = '';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '';
                  }}
                >
                  VIVE EL MUNDIAL <ArrowRight size={16} />
                </Link>
                <Link
                  to="/album"
                  style={{
                    background: 'transparent',
                    color: 'var(--color-bg-base)',
                    border: '1.5px solid var(--color-bg-base)',
                    fontFamily: 'Anton, sans-serif',
                    letterSpacing: '0.05em',
                    fontSize: 14,
                    padding: '13px 22px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    textDecoration: 'none',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      'var(--color-bg-base)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-ink)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-bg-base)';
                  }}
                >
                  <Play size={14} />
                  VER TRÁILER
                </Link>
              </div>
            </div>

            {/* Stats strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderTop: '1px solid rgba(246,239,226,.15)',
                paddingTop: 20,
                marginTop: 32,
              }}
            >
              {[
                { n: '48', l: 'Selecciones' },
                { n: '16', l: 'Sedes' },
                { n: '104', l: 'Partidos' },
                { n: '31', l: 'Días al saque', accent: true },
              ].map((s) => (
                <div key={s.l} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span
                    style={{
                      fontFamily: 'Anton, sans-serif',
                      fontSize: 36,
                      color: 'var(--color-bg-base)',
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                    {s.accent && (
                      <span
                        style={{
                          fontFamily: 'DM Serif Display, serif',
                          fontStyle: 'italic',
                          color: 'var(--color-primary)',
                          fontSize: '0.85em',
                        }}
                      >
                        d
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(246,239,226,.5)',
                      fontFamily: 'Archivo, sans-serif',
                    }}
                  >
                    {s.l}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — mascot stage */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 560,
            }}
          >
            <MascotAnimation size="md" rotateSpeed={5} />
          </div>
        </div>
      </section>

      {/* ══════ Scoreboard Bar ══════ */}
      <div
        style={{
          background: 'var(--color-ink)',
          borderBottom: '1.5px solid #000',
          color: 'var(--color-bg-base)',
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '16px 36px',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            overflowX: 'auto',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-danger)',
              color: 'white',
              fontFamily: 'Anton, sans-serif',
              fontSize: 12,
              letterSpacing: '0.15em',
              padding: '5px 10px',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'white',
                animation: 'blink 1s infinite',
                display: 'inline-block',
              }}
            />
            EN VIVO
          </span>
          {matches.slice(0, 4).map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0,
                padding: '0 12px',
                borderRight: '1px solid rgba(246,239,226,.12)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 14,
                  letterSpacing: '0.04em',
                }}
              >
                {m.homeTeam.code}
              </span>
              <span
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 18,
                  color: 'var(--color-primary)',
                }}
              >
                {m.time}
              </span>
              <span
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 14,
                  letterSpacing: '0.04em',
                }}
              >
                {m.awayTeam.code}
              </span>
              <span
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  color: 'rgba(246,239,226,.5)',
                  textTransform: 'uppercase',
                }}
              >
                {m.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ Favourite Team Section ══════ */}
      {favTeam && (
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            borderBottom: '1.5px solid var(--color-ink)',
          }}
        >
          <div
            style={{
              maxWidth: 1440,
              margin: '0 auto',
              padding: '20px 36px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 40, lineHeight: 1 }}>{favTeam.flag}</span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 18,
                  fontWeight: 800,
                  margin: '0 0 3px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: favTeam.primary,
                }}
              >
                ¡Vamos {favTeam.name}!
              </p>
              {nextFavMatch ? (
                <p
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontSize: 13,
                    margin: 0,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Próximo:{' '}
                  <strong style={{ color: 'var(--color-ink)' }}>
                    {nextFavMatch.seleccionLocal} vs {nextFavMatch.seleccionVisitante}
                  </strong>{' '}
                  — {nextFavMatch.estadioNombre}
                </p>
              ) : (
                <p
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontSize: 13,
                    margin: 0,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Grupo {favTeam.group} · FIFA World Cup 2026
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Link
                to="/album"
                style={{
                  padding: '10px 20px',
                  background: favTeam.primary,
                  color: favTeam.text,
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  border: '1.5px solid var(--color-ink)',
                  whiteSpace: 'nowrap',
                }}
              >
                📔 Ir al Álbum
              </Link>
              <Link
                to="/teams"
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: 'var(--color-ink)',
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 12,
                  textDecoration: 'none',
                  border: '1.5px solid var(--color-ink)',
                  whiteSpace: 'nowrap',
                }}
              >
                Ver plantel 🏴
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════ Feature Grid ══════ */}
      <section
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '60px 36px',
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 32,
            borderBottom: '1.5px solid var(--color-ink)',
            paddingBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 11,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 2,
                  background: 'var(--color-primary)',
                  display: 'inline-block',
                }}
              />
              Explora · cada rincón del Mundial
            </div>
            <h2
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(42px,5vw,68px)',
                lineHeight: 0.9,
                margin: 0,
              }}
            >
              VIVE LA{' '}
              <span
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontStyle: 'italic',
                  color: 'var(--color-secondary)',
                  fontSize: '0.85em',
                }}
              >
                fiesta
              </span>
            </h2>
          </div>
        </div>

        {/* 3-col bento grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr',
            gap: 18,
          }}
        >
          {/* Stadiums — spans 2 rows */}
          <div style={{ gridRow: 'span 2' }}>
            <FeatureCard
              to="/stadiums"
              title="Estadios"
              description="16 catedrales, 3 países. Del Azteca hasta MetLife Stadium — recorre cada sede donde se escribirá la historia."
              icon={Landmark}
              variant="dark"
              className="h-full"
            />
          </div>
          <FeatureCard
            to="/tickets"
            title="Entradas"
            description="Boletas desde US$60. Venta Fase 2 abre el 27 de mayo."
            icon={Trophy}
            variant="gold"
            badge="Fase 2"
          />
          <FeatureCard
            to="/album"
            title="Álbum Digital"
            description="Abre tu sobre diario y completa tu colección."
            icon={BookOpen}
            variant="green"
            progress={{ value: 45, label: '45%' }}
          />
          <FeatureCard
            to="/superpolla"
            title="Superpolla"
            description="Haz tus pronósticos. Escala el ranking global."
            icon={Trophy}
            variant="cream"
            stat={{ label: 'Tu ranking', value: '#4,209' }}
          />
          <FeatureCard
            to="/teams"
            title="Selecciones"
            description="Plantillas completas de las 48 selecciones."
            icon={Users}
            variant="solid"
          />
        </div>

        {/* Second row of features */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 18,
            marginTop: 18,
          }}
        >
          <FeatureCard
            to="/pack-opening"
            title="Abrir Sobre"
            description="Abre sobres y descubre nuevos cromos para tu álbum digital."
            icon={Package}
            variant="dark"
          />
          <FeatureCard
            to="/matches"
            title="Partidos"
            description="104 partidos en 16 sedes. Calendario completo con fixtures y resultados."
            icon={Trophy}
            variant="gold"
          />
        </div>
      </section>

      {/* ══════ Upcoming Matches ══════ */}
      <section
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 36px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 24,
            marginBottom: 24,
            borderBottom: '1.5px solid var(--color-ink)',
            paddingBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 11,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 2,
                  background: 'var(--color-primary)',
                  display: 'inline-block',
                }}
              />
              Calendario · jornada 1
            </div>
            <h2
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(36px,4vw,58px)',
                lineHeight: 0.9,
                margin: 0,
              }}
            >
              PRÓXIMOS{' '}
              <span
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontStyle: 'italic',
                  color: 'var(--color-secondary)',
                  fontSize: '0.85em',
                }}
              >
                partidos
              </span>
            </h2>
          </div>
          <Link
            to="/matches"
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-ink)',
              textDecoration: 'none',
              borderBottom: '2px solid var(--color-primary)',
              paddingBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Ver calendario completo <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18,
          }}
        >
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* ══════ Next Match Feature (legacy card — compact) ══════ */}
      <section
        style={{
          background: 'var(--color-ink)',
          borderTop: '1.5px solid var(--color-ink)',
          padding: '60px 0',
          color: 'var(--color-bg-base)',
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '0 36px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 48,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 11,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                marginBottom: 12,
              }}
            >
              ◆ EL OBJETIVO · 19 JULIO 2026
            </div>
            <h2
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(56px,7vw,120px)',
                lineHeight: 0.88,
                margin: '0 0 20px',
              }}
            >
              UN{' '}
              <span
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontStyle: 'italic',
                  color: 'var(--color-primary)',
                  fontSize: '0.88em',
                }}
              >
                solo
              </span>
              <br />
              TROFEO.
              <br />
              <span
                style={{
                  WebkitTextStroke: '2px var(--color-bg-base)',
                  color: 'transparent',
                }}
              >
                48
              </span>{' '}
              SUEÑOS.
            </h2>
            <p
              style={{
                maxWidth: 480,
                fontSize: 15,
                lineHeight: 1.5,
                opacity: 0.75,
                fontFamily: 'Archivo, sans-serif',
              }}
            >
              6.1 kilos de oro macizo. 36.8 cm de altura. El premio más codiciado del fútbol regresa
              al continente que lo vio nacer.
            </p>
            <Link
              to="/standings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 28,
                background: 'var(--color-primary)',
                color: 'var(--color-ink)',
                fontFamily: 'Anton, sans-serif',
                fontSize: 15,
                letterSpacing: '0.08em',
                padding: '14px 24px',
                textDecoration: 'none',
                border: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translate(-2px,-2px)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '6px 6px 0 #b58523';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = '';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '';
              }}
            >
              EL CAMINO AL TROFEO <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ position: 'relative', maxWidth: 340, margin: '0 auto' }}>
            <MatchCard match={nextMatch} />
          </div>
        </div>
      </section>
    </main>
  );
}
