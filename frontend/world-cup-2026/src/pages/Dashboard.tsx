import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import type { FdMatch, FdStandingsGroup, QualifierFixture, Confederation } from '../types';
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

const COVER_FLOW_IMAGES = [
  '/assets/hero/action1.jpg',
  '/assets/hero/action2.jpg',
  '/assets/hero/action3.jpg',
  '/assets/hero/action4.jpg',
  '/assets/hero/action5.jpg',
  '/assets/hero/action6.jpg',
  '/assets/hero/action7.jpg',
  '/assets/hero/action8.jpg',
  '/assets/hero/player1.jpg',
];

// ─── Hero backdrop image (host countries flag-art) ───────────────────────────

function HeroBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: '#f5f1e8',
        overflow: 'hidden',
      }}
    >
      <img
        src="/assets/hosts-backdrop.png"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          imageRendering: 'auto',
        }}
        onError={(e) => {
          // Hide cleanly if user hasn't dropped the file yet
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Soft vignette so center cards/title pop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0) 80%)',
        }}
      />
    </div>
  );
}

function HeroSection() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(2); // Start with center image
  const total = COVER_FLOW_IMAGES.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

  const goNext = () => setCurrentIndex((s) => (s + 1) % total);
  const goPrev = () => setCurrentIndex((s) => (s - 1 + total) % total);

  // Helper to calculate styles for cover flow
  const getCardStyle = (index: number) => {
    // Relative offset from current index, wrapped to shortest path around the ring
    let offset = index - currentIndex;
    const half = Math.floor(total / 2);
    if (offset > half) offset -= total;
    if (offset < -half) offset += total;

    const absOffset = Math.abs(offset);
    const sign = Math.sign(offset);

    // Continuous scaling for any number of cards
    let scale = 1;
    let translateX = 0;
    let zIndex = 10;
    let opacity = 1;
    let brightness = 1;

    if (absOffset === 0) {
      scale = 1;
      translateX = 0;
      zIndex = 20;
    } else if (absOffset === 1) {
      scale = 0.94;
      translateX = sign * 38;
      zIndex = 15;
      opacity = 0.95;
      brightness = 0.82;
    } else if (absOffset === 2) {
      scale = 0.84;
      translateX = sign * 70;
      zIndex = 10;
      opacity = 0.9;
      brightness = 0.68;
    } else if (absOffset === 3) {
      scale = 0.72;
      translateX = sign * 98;
      zIndex = 5;
      opacity = 0.75;
      brightness = 0.55;
    } else {
      scale = 0.6;
      translateX = sign * 122;
      zIndex = 1;
      opacity = 0.6;
      brightness = 0.45;
    }

    return {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      width: '380px',
      height: '520px',
      marginLeft: '-190px',
      marginTop: '-260px',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: `translateX(${translateX}%) scale(${scale})`,
      zIndex,
      opacity,
      filter: `brightness(${brightness})`,
      boxShadow: offset === 0 ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 20px rgba(0,0,0,0.3)',
      border: offset === 0 ? '3px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.4)',
    };
  };

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '680px',
        height: 'calc(100vh - 120px)',
        maxHeight: 820,
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Colorful flag-inspired background ── */}
      <HeroBackdrop />

      {/* ── Cover Flow Carousel ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        {COVER_FLOW_IMAGES.map((src, i) => (
          <div key={i} style={getCardStyle(i)}>
            <img
              src={src}
              alt={`Player ${i}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {/* ── Navigation arrows ── */}
      <button
        aria-label="Previous"
        onClick={goPrev}
        style={{
          position: 'absolute',
          left: 30,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0D1B2A',
          zIndex: 20,
          transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(-50%)')}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        aria-label="Next"
        onClick={goNext}
        style={{
          position: 'absolute',
          right: 30,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0D1B2A',
          zIndex: 20,
          transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(-50%)')}
      >
        <ChevronRight size={24} />
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
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(28px, 3.4vw, 44px)',
            lineHeight: 1.05,
            color: '#ffffff',
            letterSpacing: '0.015em',
            textTransform: 'uppercase',
            margin: 0,
            background: '#000000',
            padding: '12px 18px',
            borderRadius: '4px',
            display: 'inline-block',
            width: 'auto',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {t('dashboard.heroTitle1')}
          <br />
          {t('dashboard.heroTitle2')}
          <br />
          {t('dashboard.heroTitle3')}
        </h1>

        {/* Celebravoxia: thumbnail link to official song */}
        <a
          href="https://youtu.be/fcnDmrtj6Sk?si=TBrddS6S26mHZGKv"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir canción oficial del Mundial"
          style={{
            display: 'inline-block',
            marginTop: 20,
            borderRadius: 9999,
            overflow: 'hidden',
            textDecoration: 'none',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 220,
              height: 48,
              backgroundImage: 'url(https://img.youtube.com/vi/fcnDmrtj6Sk/hqdefault.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(0,0,0,0.4)',
                padding: '8px 16px',
                borderRadius: 9999,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 3v18l15-9L5 3z" fill="#fff" />
              </svg>
              <span style={{ fontSize: 12, letterSpacing: '0.04em' }}>
                Video musical del Mundial
              </span>
            </div>
          </div>
        </a>

        {/* Carousel dots */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 24,
            pointerEvents: 'auto',
          }}
        >
          {COVER_FLOW_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: i === currentIndex ? 30 : 10,
                height: 10,
                borderRadius: 5,
                background: i === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
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
  const { t } = useTranslation();
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
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}
      >
        {/* Green accent bar */}
        <div
          style={{
            height: 4,
            background: 'linear-gradient(90deg, #006847 0%, #009c3b 50%, #006847 100%)',
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
              {t('dashboard.matchCenter')}
            </h2>
            <p
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 11,
                color: '#9ca3af',
                margin: '2px 0 0',
              }}
            >
              {t('dashboard.matchCenterSubtitle')}
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
            {t('common.viewAll').toUpperCase()} <ExternalLink size={12} />
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
              {t('dashboard.upcomingFixt')}
            </p>
            {upcoming.length === 0 ? (
              <p
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                {t('dashboard.noUpcoming')}
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
              {live ? t('dashboard.liveScore') : t('dashboard.lastResult')}
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
                      fontFamily: 'var(--font-display)',
                      fontSize: 84,
                      color: '#0D1B2A',
                      lineHeight: 0.9,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {featured.score.fullTime.home ?? '-'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 32,
                      color: '#9ca3af',
                      letterSpacing: '0.08em',
                    }}
                  >
                    VS
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 84,
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
                {t('dashboard.noFeatured')}
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
  const { t } = useTranslation();
  const [group, setGroup] = useState<FdStandingsGroup | null>(null);

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
          ? `${t('dashboard.group')} ${group.group?.replace('GROUP_', '') ?? ''}`
          : t('dashboard.group')}
      </p>
      {!group ? (
        <p
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 12,
            color: '#9ca3af',
          }}
        >
          {t('common.loading')}
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

export function QualifiersSection() {
  const [conf, setConf] = useState<Confederation>('CONMEBOL');
  const [fixtures, setFixtures] = useState<QualifierFixture[]>([]);
  const [standings, setStandings] = useState<FdStandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'matches' | 'standings'>('matches');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchQualifierMatches(conf).catch(() => []),
      fetchQualifierStandings(conf).catch(() => []),
    ]).then(([m, s]) => {
      if (!cancelled) {
        setFixtures(m);
        setStandings(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [conf]);

  /* Split fixtures into recent results + upcoming */
  const finished = fixtures
    .filter((f) => f.status === 'FINISHED')
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 6);

  const upcoming = fixtures
    .filter((f) => f.status === 'SCHEDULED' || f.status === 'TIMED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 6);

  const live = fixtures.filter((f) => f.status === 'IN_PLAY' || f.status === 'PAUSED');

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
            background: 'linear-gradient(90deg, #C8102E 0%, #002868 50%, #006847 100%)',
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
                  border: tab === t.id ? '1.5px solid #002868' : '1.5px solid rgba(0,0,0,0.1)',
                  background: tab === t.id ? '#002868' : 'transparent',
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
              onClick={() => {
                setLoading(true);
                setConf(c.id);
              }}
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.06em',
                padding: '10px 18px',
                border: 'none',
                borderBottom: conf === c.id ? '3px solid #006847' : '3px solid transparent',
                background: conf === c.id ? 'rgba(0,104,71,0.06)' : 'transparent',
                color: conf === c.id ? '#006847' : '#6b7280',
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
                  Asegúrate de que la API key de API-Football esté configurada.
                </span>
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 10,
                }}
              >
                {displayMatches.map((fix) => {
                  const { date, time } = formatMatchDate(fix.utcDate);
                  const badge = statusBadge(fix.status);
                  const isLive = fix.status === 'IN_PLAY' || fix.status === 'PAUSED';
                  const isFinished = fix.status === 'FINISHED';

                  return (
                    <div
                      key={fix.id}
                      style={{
                        background: isLive ? 'rgba(200,16,46,0.04)' : '#f8f9fa',
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
                              fontFamily: "'Oswald', sans-serif",
                              fontWeight: 700,
                              fontSize: 14,
                              color: '#0D1B2A',
                              letterSpacing: '0.03em',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fix.homeTeam.shortName ?? fix.homeTeam.name}
                          </span>
                        </div>

                        {/* Score */}
                        <div
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontWeight: 700,
                            fontSize: isFinished || isLive ? 22 : 14,
                            color: isLive ? '#C8102E' : '#0D1B2A',
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
                              fontFamily: "'Oswald', sans-serif",
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
                            {fix.awayTeam.shortName ?? fix.awayTeam.name}
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
          ) : /* ── Standings view ── */
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
                  standings.length > 1 ? 'repeat(auto-fill, minmax(340px, 1fr))' : '1fr',
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
                    {grp.group?.replace('GROUP_', 'GRUPO ') ?? `GRUPO ${gIdx + 1}`}
                  </p>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                    }}
                  >
                    <thead>
                      <tr>
                        {['#', 'EQUIPO', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'PTS'].map((h) => (
                          <th
                            key={h}
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              fontSize: 10,
                              color: '#9ca3af',
                              fontWeight: 700,
                              textAlign: h === 'EQUIPO' ? 'left' : 'center',
                              padding: '0 3px 6px',
                              letterSpacing: '0.08em',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grp.table.map((entry) => (
                        <tr
                          key={entry.team.id}
                          style={{
                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                          }}
                        >
                          <td
                            style={{
                              fontFamily: "'Oswald', sans-serif",
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
                                  fontFamily: "'Oswald', sans-serif",
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: '#0D1B2A',
                                  letterSpacing: '0.03em',
                                }}
                              >
                                {entry.team.shortName ?? entry.team.name}
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
                                fontFamily: "'Oswald', sans-serif",
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
                              fontFamily: "'Oswald', sans-serif",
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
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Gamification Section ─────────────────────────────────────────────────────

export function GamificationSection() {
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
              border: selectedPred === idx ? '1.5px solid #006847' : '1.5px solid transparent',
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

import { NewsSection } from '../components/NewsSection';
import { FanHubSection } from '../components/FanHubSection';

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
        backgroundColor: '#f0f2f5',
      }}
    >
      {/* ── Content layers on top ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />

        {/* ── Dashboard Two-Column Layout ── */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            padding: '24px',
            maxWidth: '1440px',
            margin: '0 auto',
            alignItems: 'flex-start',
          }}
        >
          {/* Left/Center Column */}
          <div style={{ flex: '1 1 70%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <MatchCenterSection matches={matches} />
            <div style={{ padding: '24px 0 0 0' }}>
              <NewsSection />
            </div>
          </div>

          {/* Right Column (Fan Hub) */}
          <div style={{ flex: '1 1 30%', minWidth: '320px' }}>
            {token ? (
              <FanHubSection />
            ) : (
              <section
                style={{
                  borderRadius: 16,
                  padding: 24,
                  background: 'rgba(255,255,255,0.78)',
                  border: '1px solid rgba(13,27,42,0.12)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: '#0D1B2A',
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                  }}
                >
                  FAN HUB BLOQUEADO
                </h3>
                <p style={{ marginTop: 12, marginBottom: 16, color: '#374151', lineHeight: 1.6 }}>
                  Inicia sesión para ver tu álbum, tus pollas, el predictor y tu ranking.
                </p>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-block',
                    textDecoration: 'none',
                    background: '#002868',
                    color: '#fff',
                    padding: '10px 18px',
                    borderRadius: 999,
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                  }}
                >
                  INICIAR SESIÓN
                </Link>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
