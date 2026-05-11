import type { Match } from '../../types';

interface MatchCardProps {
  match: Match;
  className?: string;
}

export function MatchCard({ match, className = '' }: MatchCardProps) {
  return (
    <article
      className={`bg-bg-card border-[1.5px] border-ink relative overflow-hidden
        transition-all duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px]
        hover:shadow-[8px_8px_0_#0e1a2b] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-[18px] py-[14px] border-b-[1.5px] border-ink bg-bg-elevated">
        <span
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 12,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Matchday {match.matchday} · Grupo {match.group}
        </span>
        <span
          className="flex items-center gap-1.5"
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'inline-block',
            }}
          />
          {match.date}
        </span>
      </div>

      {/* Teams */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 16,
          alignItems: 'center',
          padding: '28px 24px',
        }}
      >
        {/* Home */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '2px solid var(--color-ink)',
              background: 'var(--color-bg-elevated)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 18,
                letterSpacing: '0.04em',
                color: 'var(--color-ink)',
              }}
            >
              {match.homeTeam.code}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 18,
              letterSpacing: '0.03em',
              textAlign: 'center',
            }}
          >
            {match.homeTeam.name}
          </span>
        </div>

        {/* VS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 36,
              color: 'var(--color-ink)',
            }}
          >
            VS
          </span>
          <span
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            {match.venue}
          </span>
        </div>

        {/* Away */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '2px solid var(--color-ink)',
              background: 'var(--color-bg-elevated)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 18,
                letterSpacing: '0.04em',
                color: 'var(--color-secondary)',
              }}
            >
              {match.awayTeam.code}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 18,
              letterSpacing: '0.03em',
              textAlign: 'center',
            }}
          >
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-[1.5px] border-ink flex">
        <div
          className="flex-1 border-r-[1.5px] border-ink px-[18px] py-[12px]"
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-primary-dim)',
            fontWeight: 700,
          }}
        >
          🏟 {match.time}
        </div>
        <div
          className="flex-1 px-[18px] py-[12px]"
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          Ver detalles →
        </div>
      </div>
    </article>
  );
}
