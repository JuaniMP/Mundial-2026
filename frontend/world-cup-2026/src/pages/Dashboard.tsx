import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchAllMatches,
  fetchStandings,
  fetchQualifierMatches,
  fetchQualifierStandings,
  CONFEDERATIONS,
  formatMatchDate,
  statusBadge,
} from '../services/footballApi';
import type {
  FdMatch,
  FdStandingsGroup,
  QualifierFixture,
  Confederation,
} from '../types';
import {
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Globe,
  Calendar,
  Trophy,
} from 'lucide-react';

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

/* ── Carousel slides: each slide is a different photo arrangement ── */
interface HeroPhoto {
  src: string;
  left: string;
  top: string;
  w: number;
  h: number;
  rotate: number;
  z: number;
}

const CAROUSEL_SLIDES: HeroPhoto[][] = [
  /* Slide 0: Players in action */
  [
    { src: '/assets/hero/action1.jpg', left: '-3%', top: '5%', w: 280, h: 400, rotate: -5, z: 1 },
    { src: '/assets/hero/action2.jpg', left: '10%', top: '30%', w: 260, h: 380, rotate: 3, z: 2 },
    { src: '/assets/hero/action3.jpg', left: '22%', top: '2%', w: 270, h: 410, rotate: -3, z: 3 },
    { src: '/assets/hero/action4.jpg', left: '30%', top: '40%', w: 240, h: 350, rotate: 4, z: 2 },
    { src: '/assets/hero/action5.jpg', left: '56%', top: '3%', w: 270, h: 400, rotate: 3, z: 3 },
    { src: '/assets/hero/action6.jpg', left: '65%', top: '35%', w: 250, h: 370, rotate: -2, z: 2 },
    { src: '/assets/hero/action7.jpg', left: '77%', top: '2%', w: 280, h: 420, rotate: 5, z: 1 },
    { src: '/assets/hero/action8.jpg', left: '87%', top: '28%', w: 260, h: 380, rotate: -4, z: 2 },
  ],
  /* Slide 1: Stadiums & fans */
  [
    { src: '/assets/hero/stadium1.jpg', left: '-2%', top: '8%', w: 300, h: 420, rotate: -4, z: 1 },
    { src: '/assets/hero/fans1.jpg', left: '12%', top: '35%', w: 250, h: 360, rotate: 3, z: 2 },
    { src: '/assets/hero/stadium2.jpg', left: '24%', top: '0%', w: 280, h: 400, rotate: -2, z: 3 },
    { src: '/assets/hero/player1.jpg', left: '33%', top: '38%', w: 230, h: 340, rotate: 5, z: 2 },
    { src: '/assets/hero/stadium3.jpg', left: '55%', top: '4%', w: 290, h: 410, rotate: 2, z: 3 },
    { src: '/assets/hero/player2.jpg', left: '66%', top: '32%', w: 260, h: 380, rotate: -3, z: 2 },
    { src: '/assets/hero/fans2.jpg', left: '78%', top: '0%', w: 270, h: 400, rotate: 4, z: 1 },
    { src: '/assets/hero/player3.jpg', left: '88%', top: '25%', w: 250, h: 370, rotate: -5, z: 2 },
  ],
  /* Slide 2: Mix */
  [
    { src: '/assets/hero/player2.jpg', left: '-1%', top: '3%', w: 270, h: 390, rotate: -6, z: 1 },
    { src: '/assets/hero/stadium1.jpg', left: '11%', top: '32%', w: 280, h: 400, rotate: 2, z: 2 },
    { src: '/assets/hero/action5.jpg', left: '23%', top: '1%', w: 260, h: 400, rotate: -2, z: 3 },
    { src: '/assets/hero/fans2.jpg', left: '32%', top: '42%', w: 240, h: 340, rotate: 4, z: 2 },
    { src: '/assets/hero/player3.jpg', left: '57%', top: '5%', w: 280, h: 410, rotate: 3, z: 3 },
    { src: '/assets/hero/action2.jpg', left: '67%', top: '30%', w: 250, h: 370, rotate: -4, z: 2 },
    { src: '/assets/hero/stadium3.jpg', left: '79%', top: '3%', w: 270, h: 400, rotate: 5, z: 1 },
    { src: '/assets/hero/action7.jpg', left: '89%', top: '26%', w: 260, h: 380, rotate: -3, z: 2 },
  ],
];

function HeroSection() {
  const [slide, setSlide] = useState(0);
  const total = CAROUSEL_SLIDES.length;

  /* Auto-rotate every 5s */
  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const goNext = () => setSlide((s) => (s + 1) % total);
  const goPrev = () => setSlide((s) => (s - 1 + total) % total);

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        backgroundColor: 'transparent',
      }}
    >
      {/* ── Photo slides ── */}
      {CAROUSEL_SLIDES.map((photos, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            opacity: idx === slide ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
          }}
        >
          {photos.map((photo, i) => (
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
      ))}

      {/* ── Navigation arrows ── */}
      <button
        aria-label="Previous"
        onClick={goPrev}
        style={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0D1B2A',
          zIndex: 20,
          transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            'translateY(-50%) scale(1.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            'translateY(-50%)';
        }}
      >
        <ChevronLeft size={22} />
      </button>
      <button
        aria-label="Next"
        onClick={goNext}
        style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0D1B2A',
          zIndex: 20,
          transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            'translateY(-50%) scale(1.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            'translateY(-50%)';
        }}
      >
        <ChevronRight size={22} />
      </button>

      {/* ── LAYER TOP: Headline + CTA ── */}
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
        <h1
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: 1,
            color: '#ffffff',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            margin: 0,
            textShadow:
              '0 0 4px #000, 0 0 8px #000, 0 0 16px #000, 0 0 32px #000, 0 0 64px rgba(0,0,0,0.95), 0 0 120px rgba(0,0,0,0.8)',
          }}
        >
          The World's Game.
          <br />
          <span style={{ color: '#C8102E' }}>Your</span> Tournament.
          <br />
          2026.
        </h1>

        {/* CTA pill */}
        <Link
          to="/matches"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#0D1B2A',
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.06em',
            padding: '10px 26px',
            borderRadius: 9999,
            textDecoration: 'none',
            pointerEvents: 'auto',
            marginTop: 18,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
            el.style.background = 'rgba(255,255,255,0.9)';
            el.style.color = '#0D1B2A';
            el.style.transform = '';
          }}
        >
          MATCHES <ChevronRight size={14} />
        </Link>

        {/* Carousel dots */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 16,
            pointerEvents: 'auto',
          }}
        >
          {CAROUSEL_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: i === slide ? '#ffffff' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Match Center Section ─────────────────────────────────────────────────────

function MatchCenterSection({ matches }: { matches: FdMatch[] }) {
  const upcoming = matches
    .filter((m) => m.status === 'TIMED' || m.status === 'SCHEDULED')
    .sort(
      (a, b) =>
        new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
    )
    .slice(0, 3);
  const live = matches.find(
    (m) => m.status === 'LIVE' || m.status === 'IN_PLAY',
  );
  const featured =
    live ??
    matches
      .filter((m) => m.status === 'FINISHED')
      .sort(
        (a, b) =>
          new Date(b.utcDate).getTime() -
          new Date(a.utcDate).getTime(),
      )[0];

  return (
    <section style={{ padding: '24px' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}
      >
        {/* Green accent bar */}
        <div
          style={{
            height: 4,
            background:
              'linear-gradient(90deg, #006847 0%, #009c3b 50%, #006847 100%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 22px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 26,
                color: '#0D1B2A',
                margin: 0,
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              MATCH CENTER
            </h2>
            <p
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 11,
                color: '#9ca3af',
                margin: '2px 0 0',
              }}
            >
              Real-time scores, upcoming fixtures &amp; standings
            </p>
          </div>
          <Link
            to="/matches"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#006847',
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              letterSpacing: '0.06em',
            }}
          >
            VIEW ALL <ExternalLink size={12} />
          </Link>
        </div>

        {/* 3-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 1fr',
            minHeight: 210,
          }}
        >
          {/* Col 1: Upcoming fixtures */}
          <div
            style={{
              padding: '16px 18px',
              borderRight: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <p
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '0.12em',
                color: '#0D1B2A',
                margin: '0 0 10px',
              }}
            >
              UPCOMING FIXT.
            </p>
            {upcoming.length === 0 ? (
              <p
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                No upcoming matches
              </p>
            ) : (
              upcoming.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 6,
                    padding: '7px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <img
                      src={getFlagUrl(m.homeTeam.tla)}
                      alt={m.homeTeam.tla}
                      style={{
                        width: 18,
                        height: 12,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontWeight: 700,
                        fontSize: 17,
                        color: '#0D1B2A',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {m.homeTeam.tla}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#9ca3af',
                      letterSpacing: '0.05em',
                    }}
                  >
                    0-0
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontWeight: 700,
                        fontSize: 17,
                        color: '#0D1B2A',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {m.awayTeam.tla}
                    </span>
                    <img
                      src={getFlagUrl(m.awayTeam.tla)}
                      alt={m.awayTeam.tla}
                      style={{
                        width: 18,
                        height: 12,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Col 2: Live / Featured score */}
          <div
            style={{
              padding: '16px',
              borderRight: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '0.12em',
                color: live ? '#C8102E' : '#0D1B2A',
                margin: '0 0 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {live && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: 7,
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
                {/* Big score */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 72,
                      color: '#0D1B2A',
                      lineHeight: 0.9,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {featured.score.fullTime.home ?? '-'}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 26,
                      color: '#9ca3af',
                      letterSpacing: '0.08em',
                    }}
                  >
                    VS
                  </span>
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 72,
                      color: '#0D1B2A',
                      lineHeight: 0.9,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {featured.score.fullTime.away ?? '-'}
                  </span>
                </div>
                {/* Team names */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <img
                      src={getFlagUrl(featured.homeTeam.tla)}
                      alt={featured.homeTeam.tla}
                      style={{
                        width: 20,
                        height: 14,
                        objectFit: 'cover',
                        borderRadius: 2,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: 16,
                        color: '#374151',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {featured.homeTeam.shortName}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: 16,
                        color: '#374151',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {featured.awayTeam.shortName}
                    </span>
                    <img
                      src={getFlagUrl(featured.awayTeam.tla)}
                      alt={featured.awayTeam.tla}
                      style={{
                        width: 20,
                        height: 14,
                        objectFit: 'cover',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                No match data
              </p>
            )}
          </div>

          {/* Col 3: Group standings */}
          <GroupSnippet />
        </div>
      </div>
    </section>
  );
}

function GroupSnippet() {
  const [group, setGroup] = useState<FdStandingsGroup | null>(
    null,
  );

  useEffect(() => {
    fetchStandings()
      .then((groups) => {
        if (groups.length > 0) setGroup(groups[0]);
      })
      .catch(() => null);
  }, []);

  return (
    <div style={{ padding: '16px 18px' }}>
      <p
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '0.12em',
          color: '#0D1B2A',
          margin: '0 0 10px',
        }}
      >
        {group
          ? `GROUP ${group.group?.replace('GROUP_', '') ?? ''}`
          : 'GROUP'}
      </p>
      {!group ? (
        <p
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 12,
            color: '#9ca3af',
          }}
        >
          Loading...
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Team', 'G', 'W', 'L', 'PTS'].map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 14,
                    color: '#6b7280',
                    fontWeight: 700,
                    textAlign: h === 'Team' ? 'left' : 'center',
                    padding: '0 3px 8px',
                    letterSpacing: '0.08em',
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
                    padding: '5px 3px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <img
                      src={getFlagUrl(entry.team.tla)}
                      alt={entry.team.tla}
                      style={{
                        width: 16,
                        height: 11,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#0D1B2A',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {entry.team.shortName ?? entry.team.tla}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#374151',
                    textAlign: 'center',
                    padding: '5px 3px',
                  }}
                >
                  {entry.playedGames}
                </td>
                <td
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#374151',
                    textAlign: 'center',
                    padding: '5px 3px',
                  }}
                >
                  {entry.won}
                </td>
                <td
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#374151',
                    textAlign: 'center',
                    padding: '5px 3px',
                  }}
                >
                  {entry.lost}
                </td>
                <td
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#006847',
                    textAlign: 'center',
                    padding: '5px 3px',
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

// ─── Qualifiers / Eliminatorias Section ───────────────────────────────────────

function QualifiersSection() {
  const [conf, setConf] = useState<Confederation>('CONMEBOL');
  const [fixtures, setFixtures] = useState<QualifierFixture[]>([]);
  const [standings, setStandings] = useState<FdStandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'matches' | 'standings'>('matches');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchQualifierMatches(conf).catch(() => []),
      fetchQualifierStandings(conf).catch(() => []),
    ]).then(([m, s]) => {
      setFixtures(m);
      setStandings(s);
      setLoading(false);
    });
  }, [conf]);

  /* Split fixtures into recent results + upcoming */
  const finished = fixtures
    .filter((f) => f.status === 'FINISHED')
    .sort(
      (a, b) =>
        new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime(),
    )
    .slice(0, 6);

  const upcoming = fixtures
    .filter(
      (f) =>
        f.status === 'SCHEDULED' ||
        f.status === 'TIMED',
    )
    .sort(
      (a, b) =>
        new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
    )
    .slice(0, 6);

  const live = fixtures.filter(
    (f) => f.status === 'IN_PLAY' || f.status === 'PAUSED',
  );

  const displayMatches = [...live, ...upcoming, ...finished].slice(0, 8);

  return (
    <section style={{ padding: '0 24px 24px' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}
      >
        {/* Red accent bar */}
        <div
          style={{
            height: 4,
            background:
              'linear-gradient(90deg, #C8102E 0%, #002868 50%, #006847 100%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 22px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 26,
                color: '#0D1B2A',
                margin: 0,
                letterSpacing: '0.04em',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Globe size={22} color="#C8102E" />
              ELIMINATORIAS
            </h2>
            <p
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 11,
                color: '#9ca3af',
                margin: '2px 0 0',
              }}
            >
              Clasificatorias al Mundial 2026 — todas las confederaciones
            </p>
          </div>

          {/* Matches/Standings toggle */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(
              [
                { id: 'matches' as const, label: 'PARTIDOS', icon: Calendar },
                {
                  id: 'standings' as const,
                  label: 'TABLA',
                  icon: Trophy,
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  padding: '6px 14px',
                  borderRadius: 6,
                  border:
                    tab === t.id
                      ? '1.5px solid #002868'
                      : '1.5px solid rgba(0,0,0,0.1)',
                  background:
                    tab === t.id ? '#002868' : 'transparent',
                  color: tab === t.id ? '#ffffff' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Confederation tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            overflowX: 'auto',
          }}
        >
          {CONFEDERATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setConf(c.id)}
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.06em',
                padding: '10px 18px',
                border: 'none',
                borderBottom:
                  conf === c.id
                    ? '3px solid #006847'
                    : '3px solid transparent',
                background:
                  conf === c.id
                    ? 'rgba(0,104,71,0.06)'
                    : 'transparent',
                color:
                  conf === c.id ? '#006847' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {c.emoji} {c.id}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '16px 22px', minHeight: 180 }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
              }}
            >
              <p
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 14,
                  color: '#9ca3af',
                }}
              >
                Cargando datos de {conf}...
              </p>
            </div>
          ) : tab === 'matches' ? (
            /* ── Matches view ── */
            displayMatches.length === 0 ? (
              <p
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 13,
                  color: '#9ca3af',
                  textAlign: 'center',
                  padding: 30,
                }}
              >
                No hay partidos disponibles para {conf}.
                <br />
                <span style={{ fontSize: 11 }}>
                  Asegúrate de que la API key de API-Football esté
                  configurada.
                </span>
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 10,
                }}
              >
                {displayMatches.map((fix) => {
                  const { date, time } = formatMatchDate(
                    fix.utcDate,
                  );
                  const badge = statusBadge(fix.status);
                  const isLive =
                    fix.status === 'IN_PLAY' ||
                    fix.status === 'PAUSED';
                  const isFinished = fix.status === 'FINISHED';

                  return (
                    <div
                      key={fix.id}
                      style={{
                        background: isLive
                          ? 'rgba(200,16,46,0.04)'
                          : '#f8f9fa',
                        border: isLive
                          ? '1.5px solid rgba(200,16,46,0.3)'
                          : '1px solid rgba(0,0,0,0.06)',
                        borderRadius: 10,
                        padding: '12px 14px',
                        transition: 'transform 0.15s',
                      }}
                    >
                      {/* Date + status */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: 10,
                            color: '#9ca3af',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {date} · {time}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color:
                              badge.color === 'danger'
                                ? '#C8102E'
                                : badge.color === 'primary'
                                  ? '#006847'
                                  : '#6b7280',
                            background:
                              badge.color === 'danger'
                                ? 'rgba(200,16,46,0.1)'
                                : badge.color === 'primary'
                                  ? 'rgba(0,104,71,0.1)'
                                  : 'rgba(0,0,0,0.05)',
                            padding: '2px 7px',
                            borderRadius: 4,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Teams + Score */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {/* Home */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flex: 1,
                          }}
                        >
                          {fix.homeTeam.crest && (
                            <img
                              src={fix.homeTeam.crest}
                              alt=""
                              style={{
                                width: 22,
                                height: 22,
                                objectFit: 'contain',
                              }}
                            />
                          )}
                          <span
                            style={{
                              fontFamily:
                                "'Oswald', sans-serif",
                              fontWeight: 700,
                              fontSize: 14,
                              color: '#0D1B2A',
                              letterSpacing: '0.03em',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fix.homeTeam.shortName ??
                              fix.homeTeam.name}
                          </span>
                        </div>

                        {/* Score */}
                        <div
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontWeight: 700,
                            fontSize: isFinished || isLive ? 22 : 14,
                            color: isLive
                              ? '#C8102E'
                              : '#0D1B2A',
                            letterSpacing: '0.04em',
                            padding: '0 10px',
                            textAlign: 'center',
                            minWidth: 50,
                          }}
                        >
                          {isFinished || isLive
                            ? `${fix.score.fullTime.home ?? 0} - ${fix.score.fullTime.away ?? 0}`
                            : 'vs'}
                        </div>

                        {/* Away */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flex: 1,
                            justifyContent: 'flex-end',
                          }}
                        >
                          <span
                            style={{
                              fontFamily:
                                "'Oswald', sans-serif",
                              fontWeight: 700,
                              fontSize: 14,
                              color: '#0D1B2A',
                              letterSpacing: '0.03em',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'right',
                            }}
                          >
                            {fix.awayTeam.shortName ??
                              fix.awayTeam.name}
                          </span>
                          {fix.awayTeam.crest && (
                            <img
                              src={fix.awayTeam.crest}
                              alt=""
                              style={{
                                width: 22,
                                height: 22,
                                objectFit: 'contain',
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Round info */}
                      {fix.round && (
                        <p
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: 10,
                            color: '#9ca3af',
                            margin: '6px 0 0',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {fix.round}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* ── Standings view ── */
            standings.length === 0 ? (
              <p
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 13,
                  color: '#9ca3af',
                  textAlign: 'center',
                  padding: 30,
                }}
              >
                No hay tabla de posiciones disponible para {conf}.
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    standings.length > 1
                      ? 'repeat(auto-fill, minmax(340px, 1fr))'
                      : '1fr',
                  gap: 16,
                }}
              >
                {standings.map((grp, gIdx) => (
                  <div key={gIdx}>
                    <p
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: '0.1em',
                        color: '#0D1B2A',
                        margin: '0 0 8px',
                      }}
                    >
                      {grp.group?.replace('GROUP_', 'GRUPO ') ??
                        `GRUPO ${gIdx + 1}`}
                    </p>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                      }}
                    >
                      <thead>
                        <tr>
                          {['#', 'EQUIPO', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'PTS'].map(
                            (h) => (
                              <th
                                key={h}
                                style={{
                                  fontFamily:
                                    "'Oswald', sans-serif",
                                  fontSize: 10,
                                  color: '#9ca3af',
                                  fontWeight: 700,
                                  textAlign:
                                    h === 'EQUIPO'
                                      ? 'left'
                                      : 'center',
                                  padding: '0 3px 6px',
                                  letterSpacing: '0.08em',
                                }}
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {grp.table.map((entry) => (
                          <tr
                            key={entry.team.id}
                            style={{
                              borderBottom:
                                '1px solid rgba(0,0,0,0.04)',
                            }}
                          >
                            <td
                              style={{
                                fontFamily:
                                  "'Oswald', sans-serif",
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#9ca3af',
                                textAlign: 'center',
                                padding: '5px 3px',
                              }}
                            >
                              {entry.position}
                            </td>
                            <td style={{ padding: '5px 3px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                }}
                              >
                                {entry.team.crest && (
                                  <img
                                    src={entry.team.crest}
                                    alt=""
                                    style={{
                                      width: 16,
                                      height: 16,
                                      objectFit: 'contain',
                                    }}
                                  />
                                )}
                                <span
                                  style={{
                                    fontFamily:
                                      "'Oswald', sans-serif",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: '#0D1B2A',
                                    letterSpacing: '0.03em',
                                  }}
                                >
                                  {entry.team.shortName ??
                                    entry.team.name}
                                </span>
                              </div>
                            </td>
                            {[
                              entry.playedGames,
                              entry.won,
                              entry.draw,
                              entry.lost,
                              entry.goalsFor,
                              entry.goalsAgainst,
                            ].map((val, vi) => (
                              <td
                                key={vi}
                                style={{
                                  fontFamily:
                                    "'Oswald', sans-serif",
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: '#374151',
                                  textAlign: 'center',
                                  padding: '5px 3px',
                                }}
                              >
                                {val}
                              </td>
                            ))}
                            <td
                              style={{
                                fontFamily:
                                  "'Oswald', sans-serif",
                                fontSize: 15,
                                fontWeight: 700,
                                color: '#006847',
                                textAlign: 'center',
                                padding: '5px 3px',
                              }}
                            >
                              {entry.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Gamification Section ─────────────────────────────────────────────────────

function GamificationSection() {
  const cards = [
    {
      icon: '📔',
      title: 'ÁLBUM VIRTUAL',
      desc: 'Colecciona láminas de todos los jugadores del Mundial.',
      link: '/album',
      cta: 'IR AL ÁLBUM',
      accent: '#006847',
    },
    {
      icon: '🏆',
      title: 'PREDICTOR',
      desc: 'Predice resultados y compite en el ranking global.',
      link: '/superpolla',
      cta: 'JUGAR',
      accent: '#C8102E',
    },
    {
      icon: '📦',
      title: 'ABRIR SOBRES',
      desc: 'Abre sobres, descubre jugadores y completa tu colección.',
      link: '/pack-opening',
      cta: 'ABRIR',
      accent: '#002868',
    },
  ];

  return (
    <section style={{ padding: '0 24px 32px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 14,
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = 'translateY(-4px)';
              el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = '';
              el.style.boxShadow = '';
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 4, background: card.accent }} />
            <div style={{ padding: '20px 20px 22px' }}>
              {/* Icon */}
              <span style={{ fontSize: 36, lineHeight: 1, display: 'block', marginBottom: 12 }}>
                {card.icon}
              </span>
              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#0D1B2A',
                  margin: '0 0 6px',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                {card.title}
              </h3>
              {/* Desc */}
              <p
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 13,
                  color: '#6b7280',
                  margin: '0 0 16px',
                  lineHeight: 1.5,
                }}
              >
                {card.desc}
              </p>
              {/* CTA */}
              <Link
                to={card.link}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: card.accent,
                  color: '#ffffff',
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '8px 18px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                }}
              >
                {card.cta} <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Fan Hub Panel (right aside) ──────────────────────────────────────────────

export function FanHubPanel() {
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
                fontFamily: "'Oswald', sans-serif",
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
            fontFamily: "'Oswald', sans-serif",
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
            fontFamily: "'Oswald', sans-serif",
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
                fontFamily: "'Oswald', sans-serif",
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
                fontFamily: "'Oswald', sans-serif",
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
                fontFamily: "'Oswald', sans-serif",
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
                  fontFamily: "'Oswald', sans-serif",
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
                  fontFamily: "'Oswald', sans-serif",
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
              fontFamily: "'Oswald', sans-serif",
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
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
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
                fontFamily: "'Oswald', sans-serif",
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
                fontFamily: "'Oswald', sans-serif",
                fontSize: 12,
                color: '#0D1B2A',
                flex: 1,
                fontWeight: 700,
              }}
            >
              {entry.name}
            </span>
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
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
            fontFamily: "'Oswald', sans-serif",
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
            fontFamily: "'Oswald', sans-serif",
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
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color: '#0D1B2A',
              }}
            >
              {pm.home}
            </span>
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
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
                fontFamily: "'Oswald', sans-serif",
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
            fontFamily: "'Oswald', sans-serif",
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
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      {/* ── Global BG: FIFA brand art across entire dashboard ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/assets/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.85,
          zIndex: 0,
        }}
      />

      {/* ── Content layers on top ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />
        <MatchCenterSection matches={matches} />
        <QualifiersSection />
        <GamificationSection />
      </div>
    </main>
  );
}
