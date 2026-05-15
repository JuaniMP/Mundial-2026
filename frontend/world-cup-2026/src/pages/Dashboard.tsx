import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllMatches, fetchStandings } from '../services/footballApi';
import type { FdMatch, FdStandingsGroup } from '../types';
import { ExternalLink, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

// ─── Flag helper ─────────────────────────────────────────────────────────────

function getFlagUrl(tla: string): string {
  const map: Record<string, string> = {
    MEX: 'mx',
    USA: 'us',
    CAN: 'ca',
    ARG: 'ar',
    BRA: 'br',
    FRA: 'fr',
    ESP: 'es',
    GER: 'de',
    ENG: 'gb-eng',
    POR: 'pt',
    NED: 'nl',
    COL: 'co',
    URU: 'uy',
    ECU: 'ec',
    CHI: 'cl',
    PER: 'pe',
    MAR: 'ma',
    SEN: 'sn',
    GHA: 'gh',
    CMR: 'cm',
    JPN: 'jp',
    KOR: 'kr',
    AUS: 'au',
    SAU: 'sa',
    IRN: 'ir',
    QAT: 'qa',
    BEL: 'be',
    SUI: 'ch',
    CRO: 'hr',
    DEN: 'dk',
    SWE: 'se',
    POL: 'pl',
    SRB: 'rs',
    WAL: 'gb-wls',
    SCO: 'gb-sct',
    CRC: 'cr',
    PAN: 'pa',
    HON: 'hn',
    JAM: 'jm',
    TRI: 'tt',
  };
  const code = map[tla?.toUpperCase()] ?? tla?.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/w40/${code}.png`;
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

/* Photo collage positions: each photo is placed absolutely to create the
   overlapping montage seen in the reference design. */
const HERO_PHOTOS: {
  src: string;
  left: string;
  top: string;
  w: number;
  h: number;
  rotate: number;
  z: number;
}[] = [
  /* far left */
  { src: '/assets/hero/action1.jpg', left: '-2%', top: '8%', w: 220, h: 310, rotate: -5, z: 1 },
  { src: '/assets/hero/action2.jpg', left: '8%', top: '22%', w: 200, h: 300, rotate: 2, z: 2 },
  /* center-left */
  { src: '/assets/hero/action3.jpg', left: '19%', top: '5%', w: 210, h: 320, rotate: -3, z: 3 },
  { src: '/assets/hero/action4.jpg', left: '28%', top: '28%', w: 190, h: 280, rotate: 4, z: 2 },
  /* center-right */
  { src: '/assets/hero/action5.jpg', left: '58%', top: '6%', w: 210, h: 310, rotate: 3, z: 3 },
  { src: '/assets/hero/action6.jpg', left: '67%', top: '25%', w: 195, h: 290, rotate: -2, z: 2 },
  /* far right */
  { src: '/assets/hero/action7.jpg', left: '78%', top: '4%', w: 215, h: 320, rotate: 5, z: 1 },
  { src: '/assets/hero/action8.jpg', left: '88%', top: '18%', w: 200, h: 300, rotate: -4, z: 2 },
];

function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: 560,
        backgroundColor: '#F4F1EA',
      }}
    >
      {/* ── BG: FIFA brand art (faded) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.45,
          zIndex: 0,
        }}
      />

      {/* ── LAYER 1: Photo collage ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        {HERO_PHOTOS.map((photo, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: photo.left,
              top: photo.top,
              width: photo.w,
              height: photo.h,
              borderRadius: 12,
              overflow: 'hidden',
              transform: `rotate(${photo.rotate}deg)`,
              zIndex: photo.z,
              boxShadow:
                '0 8px 30px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
              border: '3px solid rgba(255,255,255,0.7)',
            }}
          >
            <img
              src={photo.src}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>

      {/* ── LAYER 2 (TOP): Headline + CTA ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
        }}
      >
        {/* Frosted glass backdrop */}
        <div
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '28px 48px 24px',
            borderRadius: 10,
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          <h1
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(34px, 5.6vw, 68px)',
              lineHeight: 0.96,
              color: '#0D1B2A',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            The World's Game.
          </h1>
          <h1
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(34px, 5.6vw, 68px)',
              lineHeight: 0.96,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              margin: '4px 0',
              color: '#0D1B2A',
            }}
          >
            <span style={{ color: '#C8102E' }}>Your</span> Tournament.
          </h1>
          <h1
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(34px, 5.6vw, 68px)',
              lineHeight: 0.96,
              color: '#0D1B2A',
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            2026.
          </h1>
        </div>

        {/* CTA pill */}
        <Link
          to="/matches"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            color: '#0D1B2A',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.06em',
            padding: '10px 26px',
            borderRadius: 9999,
            textDecoration: 'none',
            pointerEvents: 'auto',
            marginTop: 22,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            transition: 'transform 0.18s, background 0.18s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = '#0D1B2A';
            el.style.color = '#ffffff';
            el.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = '#ffffff';
            el.style.color = '#0D1B2A';
            el.style.transform = '';
          }}
        >
          Celebrasvera <ChevronRight size={14} />
        </Link>
      </div>
    </section>
  );
}

// ─── Match Center Section ─────────────────────────────────────────────────────

function MatchCenterSection({ matches }: { matches: FdMatch[] }) {
  const upcoming = matches
    .filter((m) => m.status === 'TIMED' || m.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 3);
  const live = matches.find((m) => m.status === 'LIVE' || m.status === 'IN_PLAY');
  const featured =
    live ??
    matches
      .filter((m) => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())[0];

  return (
    <section style={{ padding: '24px' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: '#0D1B2A',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              MATCH CENTER
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: '#6b7280',
                margin: '2px 0 0',
              }}
            >
              Live scores, fixtures & standings
            </p>
          </div>
          <Link
            to="/matches"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#006847',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 12,
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            VIEW ALL <ExternalLink size={12} />
          </Link>
        </div>

        {/* 3-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            minHeight: 200,
          }}
        >
          {/* Col 1: Upcoming fixtures */}
          <div
            style={{
              padding: '16px',
              borderRight: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#6b7280',
                margin: '0 0 12px',
              }}
            >
              UPCOMING FIXT.
            </p>
            {upcoming.length === 0 ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9ca3af' }}>
                No upcoming matches
              </p>
            ) : (
              upcoming.map((m) => {
                const d = new Date(m.utcDate);
                const dateStr = d.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'America/Bogota',
                });
                return (
                  <div
                    key={m.id}
                    style={{
                      marginBottom: 12,
                      padding: '8px 10px',
                      background: '#f8f9fa',
                      borderRadius: 8,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 10,
                        color: '#9ca3af',
                        margin: '0 0 4px',
                      }}
                    >
                      {dateStr}
                      {m.group ? ` · ${m.group.replace('GROUP_', 'G')}` : ''}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <img
                          src={getFlagUrl(m.homeTeam.tla)}
                          alt={m.homeTeam.tla}
                          style={{
                            width: 16,
                            height: 11,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "'Space Grotesk', system-ui, sans-serif",
                            fontWeight: 700,
                            fontSize: 11,
                            color: '#0D1B2A',
                          }}
                        >
                          {m.homeTeam.tla}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 10,
                          color: '#6b7280',
                        }}
                      >
                        vs
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            fontFamily: "'Space Grotesk', system-ui, sans-serif",
                            fontWeight: 700,
                            fontSize: 11,
                            color: '#0D1B2A',
                          }}
                        >
                          {m.awayTeam.tla}
                        </span>
                        <img
                          src={getFlagUrl(m.awayTeam.tla)}
                          alt={m.awayTeam.tla}
                          style={{
                            width: 16,
                            height: 11,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Col 2: Featured live/recent score */}
          <div
            style={{
              padding: '16px',
              borderRight: '1px solid rgba(0,0,0,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: live ? '#C8102E' : '#6b7280',
                margin: '0 0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {live && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#C8102E',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
              )}
              {live ? 'LIVE SCORE' : 'LAST RESULT'}
            </p>

            {featured ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <img
                    src={getFlagUrl(featured.homeTeam.tla)}
                    alt={featured.homeTeam.tla}
                    style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
                  />
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontWeight: 800,
                      fontSize: 40,
                      color: '#0D1B2A',
                      lineHeight: 1,
                    }}
                  >
                    {featured.score.fullTime.home ?? '-'}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontWeight: 400,
                      fontSize: 22,
                      color: '#6b7280',
                    }}
                  >
                    VS
                  </span>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontWeight: 800,
                      fontSize: 40,
                      color: '#0D1B2A',
                      lineHeight: 1,
                    }}
                  >
                    {featured.score.fullTime.away ?? '-'}
                  </span>
                  <img
                    src={getFlagUrl(featured.awayTeam.tla)}
                    alt={featured.awayTeam.tla}
                    style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
                  />
                </div>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#374151',
                    margin: '2px 0 0',
                    textAlign: 'center',
                  }}
                >
                  {featured.homeTeam.shortName} · {featured.awayTeam.shortName}
                </p>
                {featured.venue && (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      color: '#9ca3af',
                      margin: '2px 0 0',
                      textAlign: 'center',
                    }}
                  >
                    {featured.venue}
                  </p>
                )}
              </>
            ) : (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9ca3af' }}>
                No match data
              </p>
            )}
          </div>

          {/* Col 3: Group standings snippet */}
          <GroupSnippet />
        </div>
      </div>
    </section>
  );
}

function GroupSnippet() {
  const [group, setGroup] = useState<FdStandingsGroup | null>(null);

  useEffect(() => {
    fetchStandings()
      .then((groups) => {
        if (groups.length > 0) setGroup(groups[0]);
      })
      .catch(() => null);
  }, []);

  return (
    <div style={{ padding: '16px' }}>
      <p
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#6b7280',
          margin: '0 0 12px',
        }}
      >
        {group ? `GROUP ${group.group?.replace('GROUP_', '') ?? ''}` : 'GROUP'}
      </p>
      {!group ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9ca3af' }}>
          Loading...
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#', 'Team', 'P', 'Pts'].map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    color: '#9ca3af',
                    fontWeight: 600,
                    textAlign: h === 'Team' ? 'left' : 'center',
                    padding: '0 4px 6px',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.table.slice(0, 4).map((entry) => (
              <tr key={entry.team.id}>
                <td
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '4px',
                  }}
                >
                  {entry.position}
                </td>
                <td
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#0D1B2A',
                    fontWeight: 600,
                    padding: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <img
                      src={getFlagUrl(entry.team.tla)}
                      alt={entry.team.tla}
                      style={{ width: 14, height: 10, objectFit: 'cover', borderRadius: 1 }}
                    />
                    {entry.team.tla}
                  </div>
                </td>
                <td
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '4px',
                  }}
                >
                  {entry.playedGames}
                </td>
                <td
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#006847',
                    textAlign: 'center',
                    padding: '4px',
                  }}
                >
                  {entry.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Gamification Section ─────────────────────────────────────────────────────

function GamificationSection() {
  return (
    <section style={{ padding: '0 24px 32px' }}>
      <div
        style={{
          background: '#002868',
          borderRadius: 12,
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          boxShadow: '0 4px 24px rgba(0,40,104,0.22)',
          flexWrap: 'wrap',
        }}
      >
        {/* Graphic */}
        <div
          style={{
            fontSize: 64,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          📔
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <span
            style={{
              display: 'inline-block',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#006847',
              background: 'rgba(0,104,71,0.18)',
              border: '1px solid rgba(0,104,71,0.4)',
              padding: '3px 10px',
              borderRadius: 3,
              marginBottom: 10,
            }}
          >
            COLECCIONA & GANA
          </span>
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: '#ffffff',
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}
          >
            ÁLBUM VIRTUAL 2026
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: 'rgba(255,255,255,0.65)',
              margin: '0 0 16px',
              lineHeight: 1.5,
            }}
          >
            Colecciona láminas de todos los jugadores del Mundial. Intercambia, completa tu álbum y
            compite con hinchas de todo el mundo.
          </p>
          <Link
            to="/album"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#006847',
              color: '#ffffff',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '10px 22px',
              borderRadius: 9999,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background = '#005038')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background = '#006847')
            }
          >
            IR AL ÁLBUM <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Fan Hub Panel (right aside) ──────────────────────────────────────────────

function FanHubPanel() {
  const LEADERBOARD = [
    { pos: 1, name: 'San José', pts: 1240, trend: 'up' as const },
    { pos: 2, name: 'Argentina', pts: 1180, trend: 'up' as const },
    { pos: 3, name: 'Colombia', pts: 1050, trend: 'down' as const },
    { pos: 4, name: 'United States', pts: 980, trend: 'up' as const },
    { pos: 5, name: 'Mexico', pts: 940, trend: 'down' as const },
  ];

  const PREDICTION_MATCHES = [
    { home: 'MEX', away: 'USA', homeFl: 'mx', awayFl: 'us' },
    { home: 'ARG', away: 'BRA', homeFl: 'ar', awayFl: 'br' },
    { home: 'COL', away: 'CAN', homeFl: 'co', awayFl: 'ca' },
  ];

  const [selectedPred, setSelectedPred] = useState<number | null>(0);

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Header */}
      <div>
        {/* Score chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'MEX 3 - 0 CAN', color: '#006847' },
            { label: 'USA 1 - 1 ARG', color: '#002868' },
          ].map((chip) => (
            <span
              key={chip.label}
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: '0.1em',
                color: chip.color,
                background: `${chip.color}22`,
                border: `1px solid ${chip.color}44`,
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              {chip.label}
            </span>
          ))}
        </div>
        <h2
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 44,
            color: '#ffffff',
            margin: '0 0 8px',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
          }}
        >
          FAN HUB
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Gamificación — interactúa con millones de hinchas en la experiencia definitiva.
        </p>
      </div>

      {/* Widget 1: Virtual Trading Card Album */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', minHeight: 140 }}>
          {/* Left: gradient preview */}
          <div
            style={{
              width: 110,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #002868 0%, #006847 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span style={{ position: 'relative', zIndex: 2 }}>📔</span>
            {/* Mini sticker faces */}
            {['😎', '⚽', '🏆', '🌟'].map((emoji, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  fontSize: 14,
                  top: `${15 + i * 20}%`,
                  right: 8,
                  opacity: 0.75,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
          {/* Right: content */}
          <div style={{ padding: '14px 14px 14px 14px', flex: 1 }}>
            <p
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#6b7280',
                margin: '0 0 4px',
              }}
            >
              VIRTUAL TRADING CARD ALBUM
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: '#0D1B2A',
                margin: '0 0 8px',
              }}
            >
              COLLECT &amp; SWAP
            </p>
            {/* Progress bar */}
            <div
              style={{
                height: 5,
                background: '#eef0f3',
                borderRadius: 99,
                marginBottom: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '62%',
                  background: 'linear-gradient(90deg, #005038, #006847)',
                  borderRadius: 99,
                }}
              />
            </div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#6b7280',
                margin: '0 0 10px',
              }}
            >
              178 / 288 láminas coleccionadas
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <Link
                to="/pack-opening"
                style={{
                  flex: 1,
                  background: '#002868',
                  color: '#fff',
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.05em',
                  padding: '7px 8px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Open Pack
              </Link>
              <Link
                to="/album"
                style={{
                  flex: 1,
                  background: '#f0f2f5',
                  color: '#0D1B2A',
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.05em',
                  padding: '7px 8px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                My Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Widget 2: Community Challenges */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <p
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 12,
              color: '#0D1B2A',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            COMMUNITY CHALLENGES
          </p>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#006847',
              background: 'rgba(0,104,71,0.1)',
              padding: '2px 7px',
              borderRadius: 3,
            }}
          >
            LEADERBOARD
          </span>
        </div>
        {LEADERBOARD.map((entry) => (
          <div
            key={entry.pos}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 0',
              borderBottom: entry.pos < 5 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color: entry.pos <= 2 ? '#006847' : '#9ca3af',
                width: 16,
                textAlign: 'center',
              }}
            >
              {entry.pos}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: '#0D1B2A',
                flex: 1,
                fontWeight: 500,
              }}
            >
              {entry.name}
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: '#374151',
              }}
            >
              {entry.pts.toLocaleString()}
            </span>
            {entry.trend === 'up' ? (
              <ArrowUp size={12} color="#006847" />
            ) : (
              <ArrowDown size={12} color="#C8102E" />
            )}
          </div>
        ))}
      </div>

      {/* Widget 3: Predictor Game */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <p
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 12,
            color: '#0D1B2A',
            margin: '0 0 2px',
            letterSpacing: '-0.01em',
          }}
        >
          PREDICTOR GAME
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: '#6b7280',
            margin: '0 0 12px',
          }}
        >
          Predict today's results and earn points
        </p>
        {PREDICTION_MATCHES.map((pm, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedPred(idx)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              marginBottom: 6,
              background: selectedPred === idx ? 'rgba(0,104,71,0.07)' : '#f8f9fa',
              border:
                selectedPred === idx ? '1.5px solid #006847' : '1.5px solid transparent',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: `2px solid ${selectedPred === idx ? '#006847' : '#d1d5db'}`,
                background: selectedPred === idx ? '#006847' : 'transparent',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            />
            <img
              src={`https://flagcdn.com/w40/${pm.homeFl}.png`}
              alt={pm.home}
              style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 1 }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color: '#0D1B2A',
              }}
            >
              {pm.home}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#9ca3af',
                flex: 1,
                textAlign: 'center',
              }}
            >
              vs
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color: '#0D1B2A',
              }}
            >
              {pm.away}
            </span>
            <img
              src={`https://flagcdn.com/w40/${pm.awayFl}.png`}
              alt={pm.away}
              style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 1 }}
            />
          </button>
        ))}
        <Link
          to="/superpolla"
          style={{
            display: 'block',
            width: '100%',
            marginTop: 10,
            background: '#002868',
            color: '#ffffff',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '11px',
            borderRadius: 8,
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'background 0.15s',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background = '#001a4a')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background = '#002868')
          }
        >
          Log Prediction
        </Link>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function Dashboard() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<FdMatch[]>([]);

  useEffect(() => {
    if (!token) return;
    fetchAllMatches()
      .then((data) => setMatches(data))
      .catch(() => null);
  }, [token]);

  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: 64,
        background: '#ffffff',
      }}
    >
      <HeroSection />
      <MatchCenterSection matches={matches} />
      <GamificationSection />
    </main>
  );
}
