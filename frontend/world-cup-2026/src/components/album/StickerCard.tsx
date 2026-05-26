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
  /** Si true, dispara la animación del check que se esfuma (1.5s) */
  justPasted?: boolean;
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

function getSpecialEmoji(name: string): string {
  if (/trofeo|copa/i.test(name)) return '🏆';
  if (/balón/i.test(name)) return '⚽';
  if (/mascota|tezcat/i.test(name)) return '🎭';
  if (/logo/i.test(name)) return '🌍';
  if (/carta especial.*gold|gold|holo/i.test(name)) return '✨';
  if (/debut/i.test(name)) return '⭐';
  if (/historia/i.test(name)) return '📖';
  if (/sede/i.test(name)) return '📍';
  return '🌟';
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
  justPasted = false,
}: StickerCardProps) {
  // Check ✅ que se esfuma a los 1.5 s tras pegar — patrón state-reset-on-prop-change
  // para evitar setState dentro de useEffect (regla react-hooks/set-state-in-effect).
  const [showCheck, setShowCheck] = useState(false);
  const [prevJustPasted, setPrevJustPasted] = useState(justPasted);
  if (prevJustPasted !== justPasted) {
    setPrevJustPasted(justPasted);
    if (justPasted) setShowCheck(true);
  }
  useEffect(() => {
    if (!showCheck) return;
    const t = setTimeout(() => setShowCheck(false), 1500);
    return () => clearTimeout(t);
  }, [showCheck]);

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

  // Special card type detection (by name prefix — no type field in API)
  const isFormacion = nombreJugador.startsWith('Formación');
  const isEstadio = nombreJugador.startsWith('Estadio') || nombreJugador.startsWith('Sede');
  const isEspecial = /^(Trofeo|Balón|Mascota|Logo|Carta Especial|Debut|Historia)/.test(
    nombreJugador,
  );
  const isSpecialCard = isFormacion || isEstadio || isEspecial;

  // Don't fetch player photos for formation/stadium/special cards
  const shouldResolvePhoto = useMemo(
    () => !isSpecialCard && isGenericImage(imagenUrl),
    [imagenUrl, isSpecialCard],
  );
  const rawPhoto = !imageFailed ? (resolvedPhoto ?? imagenUrl ?? null) : null;
  // El sentinel __no_photo__ proviene de fetchPlayerPhoto cuando ninguna fuente
  // (Wikipedia, TheSportsDB) tuvo foto. Lo tratamos como "sin foto" para activar
  // la silueta profesional en lugar del cartoon DiceBear.
  const effectivePhoto = rawPhoto === '__no_photo__' ? null : rawPhoto;

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
          background: isSpecialCard
            ? 'transparent'
            : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        {/* ── Formación card: green pitch ── */}
        {isFormacion && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(180deg, #14532d 0%, #166534 40%, #15803d 70%, #166534 100%)',
            }}
          >
            <svg
              viewBox="0 0 100 60"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0.2,
              }}
              aria-hidden="true"
            >
              <rect
                x="2"
                y="2"
                width="96"
                height="56"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
              />
              <rect
                x="12"
                y="10"
                width="76"
                height="40"
                fill="none"
                stroke="white"
                strokeWidth="0.8"
              />
              <rect
                x="22"
                y="18"
                width="56"
                height="24"
                fill="none"
                stroke="white"
                strokeWidth="0.6"
              />
              <line x1="50" y1="2" x2="50" y2="58" stroke="white" strokeWidth="1" />
              <circle cx="50" cy="30" r="9" fill="none" stroke="white" strokeWidth="0.8" />
              <circle cx="50" cy="30" r="1.5" fill="white" />
            </svg>
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <span style={{ fontSize: dim.dorsal * 0.55, lineHeight: 1 }}>{team.flag}</span>
              <span
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 900,
                  fontSize: dim.name + 1,
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                FORM.
              </span>
            </div>
          </div>
        )}

        {/* ── Estadio / Sede card: dark navy ── */}
        {isEstadio && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: dim.dorsal * 0.75,
                lineHeight: 1,
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
              }}
            >
              🏟️
            </span>
            <span
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 700,
                fontSize: dim.sub,
                color: 'rgba(255,255,255,0.8)',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              ESTADIO
            </span>
          </div>
        )}

        {/* ── Especial card: golden ── */}
        {isEspecial && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, #92400e 0%, #b45309 35%, #d97706 65%, #fbbf24 100%)',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: dim.dorsal * 0.8,
                lineHeight: 1,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
              }}
            >
              {getSpecialEmoji(nombreJugador)}
            </span>
            <span
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 700,
                fontSize: dim.sub,
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              ESPECIAL
            </span>
          </div>
        )}

        {/* ── Player cards: watermark + photo or silhouette ── */}
        {!isSpecialCard && (
          <>
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
              /* SILUETA PANINI — fallback profesional sin cartoon */
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  overflow: 'hidden',
                  background: `linear-gradient(180deg, ${team.primary}dd 0%, ${team.secondary}aa 70%, ${team.primary}cc 100%)`,
                }}
              >
                <svg
                  viewBox="0 0 64 90"
                  style={{
                    width: '78%',
                    height: '78%',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    opacity: 0.32,
                  }}
                  aria-hidden="true"
                >
                  <circle cx="32" cy="20" r="11" fill="#ffffff" />
                  <path d="M 8 90 C 10 60, 22 48, 32 48 C 42 48, 54 60, 56 90 Z" fill="#ffffff" />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    top: '32%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: 900,
                    fontSize: dim.name + 10,
                    color: '#ffffff',
                    textShadow: '0 2px 6px rgba(0,0,0,0.55)',
                    letterSpacing: -1,
                    zIndex: 2,
                  }}
                >
                  {initials || 'WC'}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 6,
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: 900,
                    fontSize: dim.dorsal,
                    color: '#ffffff',
                    lineHeight: 1,
                    textShadow: '0 3px 8px rgba(0,0,0,0.4)',
                    opacity: 0.92,
                    zIndex: 2,
                  }}
                >
                  {slot}
                </div>
              </div>
            )}
          </>
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

      {/*  ───────────────────────────────────────────────────────────────────
           Check ✅ con animación que se esfuma a los 1.5 s tras pegar.
           Para láminas ya pegadas (no recién), se muestra solo un sutil
           borde verde + checkmark esquina en lugar del overlay grande.
           ─────────────────────────────────────────────────────────────────── */}
      {showCheck && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9,
            pointerEvents: 'none',
            animation: 'checkFadeOut 1.5s ease-out forwards',
          }}
        >
          <span
            style={{
              fontSize: 32,
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
              animation: 'checkBounce 0.4s ease-out',
            }}
          >
            ✅
          </span>
        </div>
      )}

      {/* Marca permanente sutil para láminas ya pegadas (sin el ✅ grande) */}
      {estaPegada && !showCheck && !showRepeatBadge && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: `2.5px solid ${team.primary}`,
              borderRadius: 14,
              boxShadow: `inset 0 0 14px ${team.primary}33`,
              pointerEvents: 'none',
              zIndex: 7,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: team.primary,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          >
            ✓
          </div>
        </>
      )}

      {/* Animation keyframes locales para este componente */}
      <style>{`
        @keyframes checkFadeOut {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes checkBounce {
          0%   { transform: scale(0) rotate(-15deg); }
          60%  { transform: scale(1.4) rotate(8deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
