import { useState, useRef } from 'react';
import type { LaminaAlbumResponse } from '../../services/albumApi';
import { SFX } from './sfx';

const RARITY_COLOR: Record<string, string> = {
  COMUN: '#64748b',
  RARO: '#15803d',
  EPICO: '#1d4ed8',
  LEGENDARIO: '#e53935',
};

const RARITY_LABEL: Record<string, string> = {
  COMUN: 'Común',
  RARO: 'Raro',
  EPICO: 'Épico',
  LEGENDARIO: 'Legendario',
};

interface Props {
  lamina: LaminaAlbumResponse;
  size?: 'sm' | 'md' | 'lg';
  onPegar?: (id: number) => void;
}

export function StickerCardFlip({ lamina, size = 'md', onPegar }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const rarityColor = RARITY_COLOR[lamina.rareza] ?? '#64748b';
  const isSpecial = lamina.rareza === 'EPICO' || lamina.rareza === 'LEGENDARIO';

  const sizeClass = size === 'sm' ? 'w-24 h-32' : size === 'lg' ? 'w-48 h-64' : 'w-36 h-48';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (flipped) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const handleClick = () => {
    SFX.flip();
    setFlipped((f) => !f);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`${sizeClass} relative cursor-pointer select-none`}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Tilt wrapper (only when not flipped) */}
      <div
        className="w-full h-full"
        style={{
          transform: flipped ? 'none' : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.1s ease',
        }}
      >
        {/* Flip container */}
        <div
          className="w-full h-full relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${flipped ? 180 : 0}deg)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* ── Front ── */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden border-2 flex flex-col"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderColor: rarityColor,
              background: 'linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)',
            }}
          >
            {isSpecial && (
              <div
                className="absolute inset-0 rounded-xl pointer-events-none z-10 opacity-20"
                style={{
                  background:
                    'conic-gradient(from 0deg, #ff000044, #ffff0044, #00ff0044, #0000ff44, #ff000044)',
                  mixBlendMode: 'color-dodge',
                }}
              />
            )}

            <div className="h-1.5 w-full shrink-0" style={{ background: rarityColor }} />

            <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
                style={{ background: rarityColor }}
              >
                {lamina.nombreJugador.charAt(0)}
              </div>
              <span
                className="text-center font-semibold leading-tight text-text-primary"
                style={{ fontSize: size === 'sm' ? '0.6rem' : '0.75rem' }}
              >
                {lamina.nombreJugador}
              </span>
              {size !== 'sm' && lamina.seleccion && (
                <span className="text-text-muted" style={{ fontSize: '0.65rem' }}>
                  {lamina.seleccion}
                </span>
              )}
            </div>

            <div
              className="text-center text-white font-bold py-1 shrink-0"
              style={{
                background: rarityColor,
                fontSize: size === 'sm' ? '0.55rem' : '0.65rem',
              }}
            >
              {RARITY_LABEL[lamina.rareza]}
            </div>

            {lamina.cantidadRepetidas > 1 && (
              <div className="absolute top-2 right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-20">
                {lamina.cantidadRepetidas}
              </div>
            )}
            {lamina.estaPegada && (
              <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center z-20">
                <span className="bg-secondary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  ✓
                </span>
              </div>
            )}
          </div>

          {/* ── Back ── */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center gap-2 p-3"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderColor: rarityColor,
              background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 100%)',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="text-white font-bold text-center" style={{ fontSize: '0.7rem' }}>
              {lamina.nombreJugador}
            </span>
            {lamina.posicion && (
              <span className="text-primary-light" style={{ fontSize: '0.65rem' }}>
                {lamina.posicion}
              </span>
            )}
            {lamina.dorsal != null && (
              <span className="text-white/70 text-2xl font-black">#{lamina.dorsal}</span>
            )}
            <div
              className="px-2 py-0.5 rounded-full text-white font-semibold"
              style={{ background: rarityColor, fontSize: '0.6rem' }}
            >
              {RARITY_LABEL[lamina.rareza]}
            </div>
            {onPegar && !lamina.estaPegada && (
              <button
                className="mt-1 px-3 py-1 rounded-lg text-white font-bold transition-opacity hover:opacity-80 active:scale-95"
                style={{ background: '#15803d', fontSize: '0.65rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  SFX.snap();
                  onPegar(lamina.idLamina);
                }}
              >
                Pegar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StickerMini({ lamina }: { lamina: LaminaAlbumResponse }) {
  const rarityColor = RARITY_COLOR[lamina.rareza] ?? '#64748b';
  return (
    <div
      className="w-10 h-14 rounded-lg border flex flex-col overflow-hidden"
      style={{ borderColor: rarityColor }}
      title={lamina.nombreJugador}
    >
      <div className="h-1 w-full shrink-0" style={{ background: rarityColor }} />
      <div className="flex-1 flex items-center justify-center bg-white">
        <span
          className="font-bold text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{ background: rarityColor }}
        >
          {lamina.nombreJugador.charAt(0)}
        </span>
      </div>
    </div>
  );
}
