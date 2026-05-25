import { useEffect, useMemo, useState } from 'react';
import { parseRareza, RARITY, type Rareza } from './rarityUtils';
import { getTeamForLamina, getTeamBySeleccion, getSlotInTeam } from './teamColors';
import { fetchPlayerPhoto } from '../../services/imageApi';

interface StickerCardProps {
  idLamina: number;
  nombreJugador: string;
  imagenUrl?: string | null;
  seleccionNombre?: string | null;
  rareza: string;
  estaPegada?: boolean;
  cantidadRepetidas?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dimmed?: boolean;
  onClick?: () => void;
  showRepeatBadge?: boolean;
}

const SZ = {
  xs: { w: 68, h: 96, name: 8, sub: 7, dorsal: 24, star: 7 },
  sm: { w: 96, h: 136, name: 10, sub: 8, dorsal: 40, star: 9 },
  md: { w: 128, h: 180, name: 12, sub: 9, dorsal: 60, star: 11 },
  lg: { w: 168, h: 232, name: 14, sub: 10, dorsal: 84, star: 13 },
} as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function isGenericImage(url?: string | null): boolean {
  if (!url) return true;
  const u = url.toLowerCase();
  return (
    u.includes('crests.football-data.org') ||
    u.includes('flagsapi.com') ||
    u.includes('flagcdn.com')
  );
}

function normalizePlayerKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function StickerCard({
  idLamina,
  nombreJugador,
  imagenUrl,
  seleccionNombre,
  rareza,
  estaPegada = false,
  cantidadRepetidas = 0,
  size = 'sm',
  dimmed = false,
  onClick,
  showRepeatBadge = false,
}: StickerCardProps) {
  const [resolvedPhoto, setResolvedPhoto] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  // "State reset on prop change" pattern (React docs) — avoids setState-in-effect
  const [prevImagenUrl, setPrevImagenUrl] = useState(imagenUrl);
  const [prevIdLamina, setPrevIdLamina] = useState(idLamina);
  if (prevImagenUrl !== imagenUrl || prevIdLamina !== idLamina) {
    setPrevImagenUrl(imagenUrl);
    setPrevIdLamina(idLamina);
    setImageFailed(false);
  }
  const rz: Rareza = parseRareza(rareza);
  const rc = RARITY[rz];
  // Prefer seleccionNombre for correct team colors; fall back to ID-based mapping
  const team = seleccionNombre ? getTeamBySeleccion(seleccionNombre) : getTeamForLamina(idLamina);
  const slot = getSlotInTeam(idLamina);
  const dim = SZ[size];
  const special = rz === 'EPICO' || rz === 'LEGENDARIO';
  const repeated = cantidadRepetidas > 1;
  const initials = getInitials(nombreJugador);
  const selectionLabel = seleccionNombre?.trim() || team.name;
  const shouldResolvePhoto = useMemo(() => isGenericImage(imagenUrl), [imagenUrl]);
  const effectivePhoto = !imageFailed ? (resolvedPhoto ?? imagenUrl ?? null) : null;

  useEffect(() => {
    let cancelled = false;

    async function resolvePhoto() {
      if (!shouldResolvePhoto || !nombreJugador?.trim()) {
        setResolvedPhoto(null);
        return;
      }

      const cacheKey = `wc2026_player_photo_${normalizePlayerKey(nombreJugador)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setResolvedPhoto(cached);
        return;
      }

      try {
        const photo = await fetchPlayerPhoto(nombreJugador);
        if (!cancelled && photo) {
          setResolvedPhoto(photo);
          localStorage.setItem(cacheKey, photo);
        }
      } catch {
        if (!cancelled) setResolvedPhoto(null);
      }
    }

    void resolvePhoto();
    return () => {
      cancelled = true;
    };
  }, [nombreJugador, shouldResolvePhoto]);

  // (reset handled during render above via prevImagenUrl/prevIdLamina)

  return (
    <div
      onClick={onClick}
      title={`${nombreJugador} · ${selectionLabel} · ${rc.label}`}
      style={{
        width: dim.w,
        height: dim.h,
        borderRadius: 14,
        background: '#ffffff',
        border: `2px solid ${team.primary}`,
        boxShadow: `0 10px 26px rgba(15,23,42,0.12), 0 0 ${special ? 18 : 8}px ${rc.glow}`,
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 6px 3px',
          background: `linear-gradient(90deg, ${team.primary} 0%, ${team.secondary} 100%)`,
        }}
      >
        <span style={{ fontSize: dim.sub - 1, lineHeight: 1 }}>{team.flag}</span>
        <span
          style={{
            fontSize: dim.sub - 2,
            color: '#ffffff',
            fontWeight: 800,
            fontFamily: 'Oswald, sans-serif',
            lineHeight: 1,
          }}
        >
          {String(idLamina).padStart(3, '0')}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 900,
            fontSize: dim.dorsal,
            color: team.secondary,
            opacity: 0.08,
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {slot}
        </span>

        {effectivePhoto ? (
          <img
            src={effectivePhoto}
            alt={nombreJugador}
            draggable={false}
            loading="lazy"
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              filter: special
                ? 'drop-shadow(0 2px 10px rgba(15,23,42,0.2))'
                : 'drop-shadow(0 1px 4px rgba(15,23,42,0.12))',
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              setImageFailed(true);
            }}
          />
        ) : (
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '76%',
              height: '76%',
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${team.secondary} 0%, ${team.primary} 55%, #0f172a 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              fontSize: dim.name + 6,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {initials || 'WC'}
          </div>
        )}
      </div>

      <div
        style={{
          background: '#ffffff',
          padding: '4px 6px 5px',
          borderTop: `1px solid ${team.secondary}55`,
        }}
      >
        <div
          style={{
            fontSize: dim.name,
            fontWeight: 700,
            color: '#0f172a',
            fontFamily: 'Oswald, sans-serif',
            lineHeight: 1.15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {nombreJugador}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: dim.sub - 1,
              color: '#475569',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectionLabel}
          </span>
          <span style={{ fontSize: dim.star, lineHeight: 1, color: rc.color }}>
            {'★'.repeat(rc.stars)}
          </span>
        </div>
      </div>

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

      {showRepeatBadge && repeated && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            background: '#ef4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            borderRadius: 99,
            padding: '1px 5px',
            fontFamily: 'Inter, sans-serif',
            zIndex: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        >
          ×{cantidadRepetidas}
        </div>
      )}

      {estaPegada && !showRepeatBadge && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 8,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 20, filter: 'drop-shadow(0 1px 3px #fff)' }}>✅</span>
        </div>
      )}
    </div>
  );
}
