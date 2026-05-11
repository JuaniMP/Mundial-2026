import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matches } from '../data/mockData';
import { MatchCard } from '../components/features/MatchCard';
import { FeatureCard } from '../components/features/FeatureCard';
import { Badge, Button } from '../components/ui';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFcm } from '../hooks/useFcm';
import { Hero3D } from '../components/features/Hero3D';
import type { PartidoApi } from '../types';
import { fetchSeleccionByCode } from '../services/footballApi';
import { getTeamByShortName } from '../components/album/teamColors';

export function Dashboard() {
  const nextMatch = matches[0];
  const { token, user } = useAuth();
  const { permission, registered, foregroundMessage, isConfigured, requestAndRegister, disable } =
    useFcm(token);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // User's favourite team code (e.g. 'ARG', 'BRA', 'COL', …)
  const favCode = (user as { seleccionFavorita?: string } | null)?.seleccionFavorita ?? null;
  const favTeam = favCode ? (getTeamByShortName(favCode) ?? null) : null;

  // Next match for the favourite team
  const [nextFavMatch, setNextFavMatch] = useState<PartidoApi | null>(null);

  useEffect(() => {
    if (!favCode || !token) return;
    let cancelled = false;
    fetchSeleccionByCode(favCode)
      .then((seleccion) => {
        if (!seleccion || cancelled) return;
        const authHeader = { Authorization: `Bearer ${token}` };
        const url =
          `http://localhost:8082/api/v1/selecciones/` + `${seleccion.id}/partidos/proximos`;
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
    <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-2xl mx-auto w-full pb-28 md:pb-12">
      {/* ══════ Foreground Push Toast ══════ */}
      {foregroundMessage && (
        <div className="fixed top-20 right-4 z-[200] max-w-sm w-full animate-fade-in-up">
          <div className="glass border border-primary/30 rounded-xl p-4 shadow-lg flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-sm">{foregroundMessage.title}</p>
              <p className="text-text-secondary text-sm mt-0.5">{foregroundMessage.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════ Notification Permission Banner ══════ */}
      {showBanner && (
        <div className="mb-6 glass border border-primary/20 rounded-2xl p-4 flex items-center gap-4 animate-fade-in-up">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary text-sm">
              Activa las notificaciones push
            </p>
            <p className="text-text-muted text-xs mt-0.5">
              Recibe resultados de partidos y confirmaciones de entradas en tiempo real.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
              className="text-text-muted hover:text-text-secondary transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════ Notification Status Chip (when granted) ══════ */}
      {isConfigured && permission === 'granted' && (
        <div className="mb-4 flex items-center justify-end gap-2">
          {registered ? (
            <button
              onClick={disable}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors"
            >
              <BellOff className="w-3.5 h-3.5" />
              Desactivar notificaciones
            </button>
          ) : (
            <button
              onClick={handleEnable}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              Registrar dispositivo
            </button>
          )}
        </div>
      )}

      {/* ══════ Mascot Banner ══════ */}
      <section className="mb-10 animate-fade-in-up">
        <div
          style={{
            background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(37,99,235,0.12))',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 20,
            padding: '24px 16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 3,
              margin: '0 0 18px',
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
            <Hero3D />
          </div>
        </div>
      </section>

      {/* ══════ Favourite Team Section (any team) ══════ */}
      {favTeam && (
        <section className="mb-10 animate-fade-in-up">
          <div
            style={{
              background: `linear-gradient(135deg,${favTeam.primary}22,${favTeam.secondary}18)`,
              border: `1.5px solid ${favTeam.primary}55`,
              borderRadius: 20,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap' as const,
            }}
          >
            {/* Flag */}
            <span style={{ fontSize: 48, lineHeight: 1 }}>{favTeam.flag}</span>

            {/* Team info */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <p
                style={{
                  color: favTeam.primary,
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 20,
                  fontWeight: 800,
                  margin: '0 0 4px',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                ¡Vamos {favTeam.name}!
              </p>

              {nextFavMatch ? (
                <p
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  Próximo:{' '}
                  <strong style={{ color: '#fff' }}>
                    {nextFavMatch.seleccionLocal} vs {nextFavMatch.seleccionVisitante}
                  </strong>{' '}
                  — {nextFavMatch.estadioNombre}
                </p>
              ) : (
                <p
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  Grupo {favTeam.group} · FIFA World Cup 2026
                </p>
              )}
            </div>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 8,
              }}
            >
              <Link
                to="/album"
                style={{
                  padding: '10px 22px',
                  borderRadius: 999,
                  background: `linear-gradient(135deg,${favTeam.primary},${favTeam.secondary})`,
                  color: favTeam.text,
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textDecoration: 'none',
                  textTransform: 'uppercase' as const,
                  whiteSpace: 'nowrap' as const,
                  textAlign: 'center' as const,
                }}
              >
                📔 Ir al Álbum
              </Link>
              <Link
                to="/teams"
                style={{
                  padding: '8px 22px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  textDecoration: 'none',
                  textAlign: 'center' as const,
                }}
              >
                Ver plantel 🏴
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════ Hero Section: Next Match ══════ */}
      <section className="mb-12 md:mb-16 relative rounded-3xl overflow-hidden group animate-fade-in-up">
        {/* Background */}
        <div className="absolute inset-0 z-0 gradient-hero noise">
          <img
            alt="Stadium atmosphere"
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiIMYdM6-PbXJI8K0dRF2iUv_cxCAb-auD5ug2oeud28B0JYmRhTpCC95XS4emTnWScf_XR9eC9ZbTBZj1gkYdLAZ4__BUUfiDUQfcbVlWenaCB19kxsnVOPOfmyFJmhCXg7fSLEswe6Qsh78MQmzj26BvlcJCmL78ac_3Cq69D9ZyPM9RgOwJRv6H45OVgQOTYyFzo6k--aE6ZAOB8qDPQFcOHWUIoWO8PSp8slA4rn0iqjLa69KuKI0TeU6yZnNWEgGHVap88q8"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
        </div>

        <div className="relative z-10 p-6 md:p-12 lg:p-16 flex flex-col lg:flex-row justify-between items-end gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 animate-fade-in-up delay-100">
            <Badge variant="danger" dot className="mb-6">
              Upcoming Fixture
            </Badge>
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-5">
              <span className="text-white">El Gran</span>
              <br />
              <span className="gradient-text">Comienzo</span>
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-xl leading-relaxed mb-8">
              The opening match of the 2026 FIFA World Cup. Witness history as the host nations take
              center stage.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={ArrowRight} size="lg">
                View Match Details
              </Button>
              <Button variant="ghost" icon={Play} iconPosition="left" size="lg">
                Watch Teaser
              </Button>
            </div>
          </div>

          {/* Match Card */}
          <div className="w-full lg:w-auto lg:min-w-[380px] animate-fade-in-up delay-300">
            <MatchCard match={nextMatch} />
          </div>
        </div>
      </section>

      {/* ══════ Bento Grid: Quick Links & Stats ══════ */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12 md:mb-16">
        <FeatureCard
          to="/stadiums"
          title="Stadiums"
          description="Explore the 16 architectural marvels across North America."
          icon={Landmark}
          variant="image"
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAfE5Vb07Lq20RL2Swb3E-l6mzOGewnk7TfeWxz1us0c3BulSAU0XByUDvYHfCm4Prb8co-SeSwmQSSa1sqbPkzLbwqmCqC9fTaa1Ma3pJ3LA4KJhgz6fASTerBk3-zoJ72copmi2GQgcJ-QdRoaSAYXy-Ou7xhSVRI2NvVVxKKE7lysro6UHrJRf0CMCQo-qECVSzI7im4UXKmtYNwZ6FeUj80F0eeSHrFJheEVkspSFx_pTQJZTCzTs78t_OsS-nOAeebiSn2Z64"
          className="animate-fade-in-up delay-200"
        />
        <FeatureCard
          to="/superpolla"
          title="Superpolla"
          description="Make your predictions. Climb the global leaderboard."
          icon={Trophy}
          variant="accent"
          badge="Live"
          stat={{ label: 'Current Rank', value: '#4,209' }}
          className="animate-fade-in-up delay-300 bg-bg-surface"
        />
        <FeatureCard
          to="/album"
          title="Digital Album"
          description="Collect, trade, and complete your digital sticker album."
          icon={BookOpen}
          variant="solid"
          progress={{ value: 45, label: '45%' }}
          className="animate-fade-in-up delay-400 bg-bg-surface"
        />
        <FeatureCard
          to="/teams"
          title="Selecciones"
          description="Explora las 32 selecciones y sus plantillas completas."
          icon={Users}
          variant="accent"
          className="animate-fade-in-up delay-500 bg-bg-surface"
        />
        <FeatureCard
          to="/pack-opening"
          title="Abrir Sobre"
          description="Abre sobres y descubre nuevos cromos para tu álbum."
          icon={BookOpen}
          variant="solid"
          className="animate-fade-in-up delay-600 bg-bg-surface"
        />
      </section>

      {/* ══════ Upcoming Matches Row ══════ */}
      <section className="mb-12 md:mb-16 animate-fade-in-up delay-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              Upcoming Matches
            </h2>
            <p className="text-sm text-text-muted mt-1">Group stage fixtures</p>
          </div>
          <Button variant="ghost" icon={ArrowRight} size="sm">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    </main>
  );
}
