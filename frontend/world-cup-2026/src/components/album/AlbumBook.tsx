import { useState, useEffect, useCallback, useRef } from 'react';
import { StickerCard } from './StickerCard';
import { TEAMS, type Team, getTeamBySeleccion } from './teamColors';
import type { LaminaAlbum } from '../../services/albumApi';

// ─── Constants ────────────────────────────────────────────────────────────────
const SLOTS_PER_TEAM = 14;
const TEAMS_PER_SPREAD = 2; // left page + right page

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLaminasForTeam(laminas: LaminaAlbum[], team: Team): LaminaAlbum[] {
  return laminas.filter((l) => {
    if (l.seleccionNombre) {
      const t = getTeamBySeleccion(l.seleccionNombre);
      return t.shortName === team.shortName;
    }
    return false;
  });
}

function teamProgress(laminas: LaminaAlbum[], team: Team) {
  const tl = getLaminasForTeam(laminas, team);
  const pasted = tl.filter((l) => l.estaPegada).length;
  const owned = tl.filter((l) => l.cantidadRepetidas > 0).length;
  return { pasted, owned, total: SLOTS_PER_TEAM };
}

// ─── Sticker Slot (Panini style) ──────────────────────────────────────────────

function StickerSlot({
  lamina,
  team,
  slotNum,
  onPegar,
  pegandoId,
}: {
  lamina: LaminaAlbum;
  team: Team;
  slotNum: number;
  onPegar: (id: number) => void;
  pegandoId: number | null;
}) {
  const owned = lamina.cantidadRepetidas > 0;
  const pasted = lamina.estaPegada;
  const isAnimating = pegandoId === lamina.idLamina;

  const label = `${team.shortName} ${slotNum}`;

  if (!owned) {
    // Empty slot — show name label like Panini
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <div
          style={{
            width: 64,
            height: 90,
            borderRadius: 8,
            border: '1.5px dashed #c7d2e0',
            background: 'rgba(255,255,255,0.55)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            position: 'relative',
          }}
        >
          {/* Corner marks like real album */}
          {[
            ['top', 'left'],
            ['top', 'right'],
            ['bottom', 'left'],
            ['bottom', 'right'],
          ].map(([v, h]) => (
            <div
              key={`${v}${h}`}
              style={{
                position: 'absolute',
                [v]: 3,
                [h]: 3,
                width: 6,
                height: 6,
                borderTop: v === 'top' ? `1.5px solid ${team.primary}66` : 'none',
                borderBottom: v === 'bottom' ? `1.5px solid ${team.primary}66` : 'none',
                borderLeft: h === 'left' ? `1.5px solid ${team.primary}66` : 'none',
                borderRight: h === 'right' ? `1.5px solid ${team.primary}66` : 'none',
              }}
            />
          ))}
          <span
            style={{
              fontSize: 9,
              color: '#94a3b8',
              fontFamily: 'Oswald,sans-serif',
              fontWeight: 700,
            }}
          >
            {label}
          </span>
        </div>
        <span
          style={{
            fontSize: 8,
            color: '#64748b',
            fontFamily: 'Inter,sans-serif',
            textAlign: 'center',
            maxWidth: 64,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {lamina.nombreJugador.split(' ').slice(-1)[0].toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <div
        style={{
          position: 'relative',
          animation: isAnimating ? 'stampPaste 0.7s cubic-bezier(.36,.07,.19,.97) both' : undefined,
          cursor: pasted ? 'default' : 'pointer',
        }}
        onClick={() => !pasted && onPegar(lamina.idLamina)}
        title={pasted ? 'Pegada' : 'Clic para pegar'}
      >
        <StickerCard
          idLamina={lamina.idLamina}
          nombreJugador={lamina.nombreJugador}
          imagenUrl={lamina.imagenUrl}
          seleccionNombre={lamina.seleccionNombre}
          rareza={lamina.rareza}
          estaPegada={pasted}
          cantidadRepetidas={lamina.cantidadRepetidas}
          size="xs"
        />
        {/* PEGAR badge */}
        {!pasted && (
          <div
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: '#1d4ed8',
              color: '#fff',
              fontSize: 7,
              fontWeight: 800,
              borderRadius: 99,
              padding: '2px 5px',
              fontFamily: 'Inter,sans-serif',
              boxShadow: '0 0 8px rgba(29,78,216,0.7)',
              animation: 'slotPulse 1.5s ease-in-out infinite',
            }}
          >
            PEGAR
          </div>
        )}
        {/* Stamp animation overlay */}
        {isAnimating && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(34,197,94,0.35)',
              animation: 'stampFlash 0.7s ease both',
              zIndex: 20,
            }}
          >
            <span style={{ fontSize: 28, animation: 'stampBounce 0.5s ease both' }}>✅</span>
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 8,
          color: pasted ? '#006847' : '#64748b',
          fontFamily: 'Inter,sans-serif',
          fontWeight: pasted ? 700 : 400,
          textAlign: 'center',
          maxWidth: 64,
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {lamina.nombreJugador.split(' ').slice(-1)[0].toUpperCase()}
      </span>
    </div>
  );
}

// ─── Team Page (Panini style) ─────────────────────────────────────────────────

function TeamPage({
  team,
  laminas,
  isLeft,
  pageNum,
  onPegar,
  pegandoId,
}: {
  team: Team;
  laminas: LaminaAlbum[];
  isLeft: boolean;
  pageNum: number;
  onPegar: (id: number) => void;
  pegandoId: number | null;
}) {
  const teamLaminas = getLaminasForTeam(laminas, team);
  const { pasted, owned } = teamProgress(laminas, team);
  const pct = (pasted / SLOTS_PER_TEAM) * 100;

  // Sort: escudo first, formacion second, then players by id
  const sorted = [...teamLaminas].sort((a, b) => {
    const typeOrder = (l: LaminaAlbum) => {
      if (l.nombreJugador.startsWith('Escudo')) return 0;
      if (l.nombreJugador.startsWith('Formaci')) return 1;
      return 2;
    };
    const to = typeOrder(a) - typeOrder(b);
    return to !== 0 ? to : a.idLamina - b.idLamina;
  });

  // Pad to SLOTS_PER_TEAM with empty placeholders
  const slots: LaminaAlbum[] = Array.from({ length: SLOTS_PER_TEAM }, (_, i) => {
    return (
      sorted[i] ?? {
        idLamina: -(team.shortName.charCodeAt(0) * 100 + i),
        nombreJugador: `${team.shortName} ${i + 1}`,
        rareza: 'COMUN',
        estaPegada: false,
        cantidadRepetidas: 0,
        seleccionNombre: team.name,
        imagenUrl: null,
      }
    );
  });

  return (
    <div
      style={{
        flex: 1,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: isLeft ? '8px 0 0 8px' : '0 8px 8px 0',
        boxShadow: isLeft
          ? 'inset -6px 0 16px rgba(0,0,0,0.06)'
          : 'inset  6px 0 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 520,
        position: 'relative',
      }}
    >
      {/* Big team abbreviation watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'Oswald,sans-serif',
          fontWeight: 900,
          fontSize: 160,
          color: team.primary,
          opacity: 0.04,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          letterSpacing: -4,
        }}
      >
        {team.shortName}
      </div>

      {/* Team header — colorful Panini style */}
      <div
        style={{
          background: `linear-gradient(135deg, ${team.primary} 0%, ${team.secondary} 100%)`,
          padding: '10px 14px 8px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 28,
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {team.flag}
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: 'Oswald,sans-serif',
                fontWeight: 900,
                fontSize: 16,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: 1,
                lineHeight: 1,
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              {team.name}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 9,
                fontFamily: 'Inter,sans-serif',
                marginTop: 2,
              }}
            >
              Grupo {team.group} · {owned}/{SLOTS_PER_TEAM} obtenidos · {pasted}/{SLOTS_PER_TEAM}{' '}
              pegados
            </div>
          </div>
          {/* Completion circle */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: '#fff',
                fontFamily: 'Oswald,sans-serif',
                fontWeight: 800,
                fontSize: 10,
              }}
            >
              {Math.round(pct)}%
            </span>
          </div>
        </div>

        {/* Progress strip */}
        <div
          style={{
            height: 3,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 99,
            marginTop: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 99,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Sticker grid 7×2 */}
      <div
        style={{
          flex: 1,
          padding: '10px 8px 8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px 4px',
          placeItems: 'center',
          alignContent: 'start',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {slots.map((lamina, i) => (
          <StickerSlot
            key={lamina.idLamina}
            lamina={lamina}
            team={team}
            slotNum={i + 1}
            onPegar={onPegar}
            pegandoId={pegandoId}
          />
        ))}
      </div>

      {/* Page number */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          [isLeft ? 'left' : 'right']: 12,
          fontSize: 11,
          color: '#94a3b8',
          fontFamily: 'Oswald,sans-serif',
          fontWeight: 700,
          zIndex: 1,
        }}
      >
        {pageNum}
      </div>

      <style>{`
        @keyframes slotPulse {
          0%,100% { box-shadow: 0 0 8px rgba(29,78,216,0.7); }
          50%      { box-shadow: 0 0 18px rgba(29,78,216,1); }
        }
        @keyframes stampPaste {
          0%   { transform: scale(1.0); }
          30%  { transform: scale(1.18) rotate(-3deg); }
          60%  { transform: scale(0.93) rotate(1deg); }
          100% { transform: scale(1.0) rotate(0deg); }
        }
        @keyframes stampFlash {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes stampBounce {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.3); }
          100% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}

// ─── Album Cover (Panini FIFA 2026 style) ─────────────────────────────────────

function AlbumCover({ laminas, onOpen }: { laminas: LaminaAlbum[]; onOpen: () => void }) {
  const pasted = laminas.filter((l) => l.estaPegada).length;
  const total = laminas.length || 320;
  const pct = Math.round((pasted / total) * 100);

  return (
    <div
      onClick={onOpen}
      style={{
        width: '100%',
        minHeight: 520,
        cursor: 'pointer',
        background:
          'linear-gradient(160deg, #1a472a 0%, #006847 25%, #002868 55%, #C8102E 80%, #8B0000 100%)',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}
    >
      {/* Geometric shapes background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.15 }}>
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: '#FFD700',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: '#C8102E',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '10%',
            width: 120,
            height: 120,
            background: '#002868',
            transform: 'rotate(45deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '8%',
            width: 80,
            height: 80,
            background: '#006847',
            transform: 'rotate(30deg)',
          }}
        />
      </div>

      {/* "OFFICIAL STICKER COLLECTION" */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          fontFamily: 'Inter,sans-serif',
          fontSize: 9,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 600,
        }}
      >
        OFFICIAL STICKER COLLECTION
      </div>

      {/* Host flags */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 22, zIndex: 1 }}>
        🇺🇸 🇲🇽 🇨🇦
      </div>

      {/* Big "26" like real cover */}
      <div
        style={{
          fontFamily: 'Oswald,sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(80px,18vw,160px)',
          color: '#fff',
          lineHeight: 0.85,
          textShadow: '0 8px 40px rgba(0,0,0,0.5), 0 2px 0 rgba(0,0,0,0.3)',
          zIndex: 1,
          letterSpacing: -4,
          filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.4))',
        }}
      >
        26
      </div>

      {/* FIFA WORLD CUP */}
      <div style={{ textAlign: 'center', zIndex: 1, marginTop: 4 }}>
        <div
          style={{
            fontFamily: 'Oswald,sans-serif',
            fontWeight: 400,
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          FIFA WORLD CUP
        </div>
        <div
          style={{
            fontFamily: 'Oswald,sans-serif',
            fontWeight: 800,
            fontSize: 28,
            color: '#FFD700',
            letterSpacing: 2,
            textTransform: 'uppercase',
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          2026
        </div>
      </div>

      {/* Trophy */}
      <div
        style={{
          fontSize: 48,
          marginTop: 8,
          zIndex: 1,
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))',
          animation: 'trophyFloat 3s ease-in-out infinite',
        }}
      >
        🏆
      </div>

      {/* Progress pill */}
      <div
        style={{
          marginTop: 20,
          zIndex: 1,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 999,
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 120,
            height: 6,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #FFD700, #fff)',
              borderRadius: 99,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <span
          style={{
            color: '#fff',
            fontFamily: 'Oswald,sans-serif',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {pasted} / {total} pegadas
        </span>
      </div>

      {/* Panini badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          fontFamily: 'Inter,sans-serif',
          fontSize: 9,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        PANINI · COLECCIÓN OFICIAL
      </div>

      {/* Click hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          color: 'rgba(255,255,255,0.65)',
          fontSize: 11,
          fontFamily: 'Inter,sans-serif',
          letterSpacing: 1,
          animation: 'hintPulse 2s ease-in-out infinite',
        }}
      >
        Toca para abrir →
      </div>

      <style>{`
        @keyframes trophyFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes hintPulse {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Navigation arrows ────────────────────────────────────────────────────────

function PageArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Anterior' : 'Siguiente'}
      style={{
        width: 44,
        height: 80,
        background: disabled ? 'transparent' : 'rgba(255,255,255,0.85)',
        border: disabled ? 'none' : '1px solid rgba(0,0,0,0.1)',
        borderRadius: direction === 'left' ? '8px 0 0 8px' : '0 8px 8px 0',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: disabled ? '#e2e8f0' : '#475569',
        transition: 'all 0.15s',
        flexShrink: 0,
        backdropFilter: 'blur(4px)',
      }}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );
}

// ─── Main AlbumBook ───────────────────────────────────────────────────────────

// Teams grouped into spreads of 2 (left + right)
const TOTAL_SPREADS = 1 + Math.ceil(TEAMS.length / TEAMS_PER_SPREAD); // 1 cover + team spreads

interface AlbumBookProps {
  laminas: LaminaAlbum[];
  onPegar: (laminaId: number) => void;
  pegandoId?: number | null;
}

export function AlbumBook({ laminas, onPegar, pegandoId = null }: AlbumBookProps) {
  const [spreadIdx, setSpreadIdx] = useState(0);
  const [flipDir, setFlipDir] = useState<'next' | 'prev' | null>(null);
  const [flipKey, setFlipKey] = useState(0);
  const [indexOpen, setIndexOpen] = useState(false);
  const flipping = useRef(false);

  const goNext = useCallback(() => {
    if (flipping.current || spreadIdx >= TOTAL_SPREADS - 1) return;
    flipping.current = true;
    setFlipDir('next');
    setFlipKey((k) => k + 1);
    setTimeout(() => {
      setSpreadIdx((i) => i + 1);
      setFlipDir(null);
      flipping.current = false;
    }, 320);
  }, [spreadIdx]);

  const goPrev = useCallback(() => {
    if (flipping.current || spreadIdx <= 0) return;
    flipping.current = true;
    setFlipDir('prev');
    setFlipKey((k) => k + 1);
    setTimeout(() => {
      setSpreadIdx((i) => i - 1);
      setFlipDir(null);
      flipping.current = false;
    }, 320);
  }, [spreadIdx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev]);

  // Current teams on this spread
  const leftTeamIdx = spreadIdx > 0 ? (spreadIdx - 1) * TEAMS_PER_SPREAD : -1;
  const rightTeamIdx = leftTeamIdx + 1;
  const leftTeam = leftTeamIdx >= 0 ? TEAMS[leftTeamIdx] : undefined;
  const rightTeam = rightTeamIdx < TEAMS.length ? TEAMS[rightTeamIdx] : undefined;

  const animClass =
    flipDir === 'next' ? 'book-flip-next' : flipDir === 'prev' ? 'book-flip-prev' : undefined;

  const pasted = laminas.filter((l) => l.estaPegada).length;
  const total = laminas.length || 320;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Overall progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          background: '#fff',
          borderRadius: 12,
          padding: '10px 16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 16 }}>🏆</span>
        <div
          style={{
            flex: 1,
            height: 8,
            background: '#e2e8f0',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(pasted / total) * 100}%`,
              background: 'linear-gradient(90deg, #002868, #006847, #C8102E)',
              borderRadius: 99,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <span
          style={{
            fontFamily: 'Oswald,sans-serif',
            fontWeight: 700,
            fontSize: 13,
            color: '#0f172a',
            whiteSpace: 'nowrap',
          }}
        >
          {pasted} / {total} pegadas
        </span>
      </div>

      {/* Book */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', maxWidth: 820 }}>
        <PageArrow direction="left" onClick={goPrev} disabled={spreadIdx === 0} />

        <div
          key={flipKey}
          className={animClass}
          style={{
            flex: 1,
            display: 'flex',
            boxShadow: '0 16px 48px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {spreadIdx === 0 ? (
            <AlbumCover laminas={laminas} onOpen={goNext} />
          ) : (
            <>
              {/* Left page */}
              {leftTeam ? (
                <TeamPage
                  team={leftTeam}
                  laminas={laminas}
                  isLeft={true}
                  pageNum={(spreadIdx - 1) * 2 + 1}
                  onPegar={onPegar}
                  pegandoId={pegandoId}
                />
              ) : (
                <div
                  style={{
                    flex: 1,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px 0 0 8px',
                    minHeight: 520,
                  }}
                />
              )}

              {/* Spine */}
              <div
                style={{
                  width: 14,
                  flexShrink: 0,
                  background: 'linear-gradient(90deg, #c8b99a, #e8dfc8, #c8b99a)',
                }}
              />

              {/* Right page */}
              {rightTeam ? (
                <TeamPage
                  team={rightTeam}
                  laminas={laminas}
                  isLeft={false}
                  pageNum={(spreadIdx - 1) * 2 + 2}
                  onPegar={onPegar}
                  pegandoId={pegandoId}
                />
              ) : (
                <div
                  style={{
                    flex: 1,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0 8px 8px 0',
                    minHeight: 520,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#e2e8f0',
                    fontSize: 48,
                  }}
                >
                  ⚽
                </div>
              )}
            </>
          )}
        </div>

        <PageArrow direction="right" onClick={goNext} disabled={spreadIdx >= TOTAL_SPREADS - 1} />
      </div>

      {/* Bottom nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Dots */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {Array.from({ length: Math.min(TOTAL_SPREADS, 13) }).map((_, i) => {
            const half = 6;
            const start = Math.max(0, Math.min(spreadIdx - half, TOTAL_SPREADS - 13));
            const dotIdx = start + i;
            return (
              <button
                key={dotIdx}
                onClick={() => setSpreadIdx(dotIdx)}
                style={{
                  width: dotIdx === spreadIdx ? 24 : 8,
                  height: 8,
                  borderRadius: 99,
                  background: dotIdx === spreadIdx ? '#002868' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>

        <span
          style={{
            fontSize: 12,
            color: '#64748b',
            fontFamily: 'Inter,sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {spreadIdx === 0
            ? 'Portada'
            : `${TEAMS[leftTeamIdx]?.name ?? ''} / ${TEAMS[rightTeamIdx]?.name ?? ''}`}
        </span>

        <button
          onClick={() => setIndexOpen(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: '#002868',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Oswald,sans-serif',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          INDEX 📑
        </button>
      </div>

      {/* Index Modal */}
      {indexOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '90%',
              maxWidth: 560,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                background: '#002868',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'Oswald,sans-serif',
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: 1,
                }}
              >
                ALBUM INDEX
              </span>
              <button
                onClick={() => setIndexOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <button
                onClick={() => {
                  setSpreadIdx(0);
                  setIndexOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: spreadIdx === 0 ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${spreadIdx === 0 ? '#002868' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  fontFamily: 'Oswald,sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#0f172a',
                  textAlign: 'left',
                }}
              >
                🏆 Portada — FIFA World Cup 2026
              </button>

              {TEAMS.map((t, i) => {
                const spread = 1 + Math.floor(i / TEAMS_PER_SPREAD);
                const { pasted: tp, owned: to } = teamProgress(laminas, t);
                const hasNew = getLaminasForTeam(laminas, t).some(
                  (l) => l.cantidadRepetidas > 0 && !l.estaPegada,
                );
                return (
                  <button
                    key={t.name}
                    onClick={() => {
                      setSpreadIdx(spread);
                      setIndexOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: spreadIdx === spread ? '#eff6ff' : '#fff',
                      border: `1px solid ${spreadIdx === spread ? '#002868' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{t.flag}</span>
                      <div>
                        <div
                          style={{
                            fontFamily: 'Oswald,sans-serif',
                            fontWeight: 700,
                            fontSize: 14,
                            color: '#0f172a',
                          }}
                        >
                          {t.name}
                        </div>
                        <div
                          style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, color: '#64748b' }}
                        >
                          Grupo {t.group} · {to}/{SLOTS_PER_TEAM} · {tp} pegadas
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Mini progress */}
                      <div
                        style={{
                          width: 48,
                          height: 4,
                          background: '#e2e8f0',
                          borderRadius: 99,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(tp / SLOTS_PER_TEAM) * 100}%`,
                            background: `linear-gradient(90deg, ${t.primary}, ${t.secondary})`,
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      {hasNew && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#C8102E',
                            boxShadow: '0 0 0 2px #fff',
                          }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
