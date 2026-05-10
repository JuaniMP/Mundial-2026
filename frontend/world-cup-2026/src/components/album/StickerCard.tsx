import { parseRareza, RARITY, type Rareza } from './rarityUtils';
import { getTeamForLamina, getSlotInTeam } from './teamColors';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StickerCardProps {
  idLamina: number;
  nombreJugador: string;
  rareza: string;
  estaPegada?: boolean;
  cantidadRepetidas?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dimmed?: boolean;
  onClick?: () => void;
  showRepeatBadge?: boolean;
}

// ─── Size table ──────────────────────────────────────────────────────────────

const SZ = {
  xs: { w: 60, h: 84, name: 8, sub: 7, dorsal: 32, star: 7 },
  sm: { w: 88, h: 123, name: 9, sub: 7, dorsal: 46, star: 9 },
  md: { w: 120, h: 168, name: 11, sub: 8, dorsal: 64, star: 11 },
  lg: { w: 160, h: 224, name: 13, sub: 9, dorsal: 88, star: 13 },
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function StickerCard({
  idLamina,
  nombreJugador,
  rareza,
  estaPegada = false,
  cantidadRepetidas = 0,
  size = 'sm',
  dimmed = false,
  onClick,
  showRepeatBadge = false,
}: StickerCardProps) {
  const rz: Rareza = parseRareza(rareza);
  const rc = RARITY[rz];
  const team = getTeamForLamina(idLamina);
  const slot = getSlotInTeam(idLamina);
  const dim = SZ[size];
  const special = rz === 'EPICO' || rz === 'LEGENDARIO';
  const repeated = cantidadRepetidas > 1;

  const lastName = nombreJugador.split(' ').slice(-1)[0] ?? nombreJugador;

  return (
    <div
      onClick={onClick}
      title={`${nombreJugador} · ${team.name} · ${rc.label}`}
      style={{
        width: dim.w,
        height: dim.h,
        borderRadius: 8,
        background: `linear-gradient(180deg, ${team.primary} 0%, ${team.primary}cc 40%, #111827 100%)`,
        border: `2px solid ${rc.border}`,
        boxShadow: `0 0 ${special ? 18 : 8}px ${rc.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
        opacity: dimmed ? 0.42 : 1,
        position: 'relative',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* ── Top bar: flag + sticker ID ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '3px 5px 2px',
          background: 'rgba(0,0,0,0.38)',
        }}
      >
        <span style={{ fontSize: dim.sub - 1, lineHeight: 1 }}>{team.flag}</span>
        <span
          style={{
            fontSize: dim.sub - 2,
            color: rc.color,
            fontWeight: 800,
            fontFamily: 'Oswald, sans-serif',
            lineHeight: 1,
          }}
        >
          {String(idLamina).padStart(3, '0')}
        </span>
      </div>

      {/* ── Player image ── */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Dorsal watermark */}
        <span
          style={{
            position: 'absolute',
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 900,
            fontSize: dim.dorsal,
            color: team.secondary,
            opacity: 0.1,
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {slot}
        </span>

        {size !== 'xs' ? (
          <img
            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(nombreJugador)}&scale=85`}
            alt=""
            draggable={false}
            loading="lazy"
            style={{
              position: 'relative',
              zIndex: 1,
              width: '82%',
              height: '100%',
              objectFit: 'contain',
              filter: special
                ? 'drop-shadow(0 2px 10px rgba(0,0,0,0.65))'
                : 'drop-shadow(0 1px 4px rgba(0,0,0,0.45))',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0';
            }}
          />
        ) : (
          <span
            style={{ position: 'relative', zIndex: 1, fontSize: 22, opacity: 0.5, lineHeight: 1 }}
          >
            ⚽
          </span>
        )}
      </div>

      {/* ── Bottom name bar ── */}
      <div
        style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.52) 100%)',
          padding: '2px 5px 3px',
          borderTop: `1px solid ${rc.border}55`,
        }}
      >
        <div
          style={{
            fontSize: dim.name,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'Oswald, sans-serif',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {lastName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: dim.sub - 1,
              color: team.secondary,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              opacity: 0.9,
            }}
          >
            {team.shortName}
          </span>
          <span style={{ fontSize: dim.star, lineHeight: 1, color: rc.color }}>
            {'★'.repeat(rc.stars)}
          </span>
        </div>
      </div>

      {/* ── Legendario shimmer overlay ── */}
      {rz === 'LEGENDARIO' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg,transparent 40%,rgba(253,230,138,0.08) 60%,transparent 80%)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* ── Repeat count badge ── */}
      {showRepeatBadge && repeated && (
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
            background: '#ef4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            borderRadius: 99,
            padding: '1px 5px',
            fontFamily: 'Inter, sans-serif',
            zIndex: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
        >
          ×{cantidadRepetidas}
        </div>
      )}

      {/* ── Pasted overlay ── */}
      {estaPegada && !showRepeatBadge && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.32)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 8,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 20, filter: 'drop-shadow(0 1px 3px #000)' }}>✅</span>
        </div>
      )}
    </div>
  );
}
