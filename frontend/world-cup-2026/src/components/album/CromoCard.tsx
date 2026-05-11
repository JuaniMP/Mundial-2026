import { useState, useEffect, useCallback } from 'react';
import { diceBearUrl, fetchPlayerPhoto } from '../../services/imageApi';
import type { Team } from './teamColors';
import { RARITY, parseRareza } from './rarityUtils';
import type { Rareza } from './rarityUtils';

export interface CromoCardProps {
  id: number;
  nombre: string;
  posicion: string;
  dorsal: number;
  popularidad?: number;
  rareza: Rareza | string;
  team: Team;
  /** Pre-fetched photo URL. Falls back to Wikipedia then DiceBear. */
  fotoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const SIZE = {
  sm: { w: 110, h: 154, font: 9, photo: '60%' },
  md: { w: 148, h: 208, font: 11, photo: '65%' },
  lg: { w: 188, h: 264, font: 13, photo: '68%' },
};

export function CromoCard({
  nombre,
  posicion,
  dorsal,
  popularidad = 50,
  rareza,
  team,
  fotoUrl,
  size = 'md',
  onClick,
}: CromoCardProps) {
  const parsed = parseRareza(rareza as string);
  const info = RARITY[parsed as Rareza];
  const dim = SIZE[size];

  // Initialize from fotoUrl prop; only fetch asynchronously when not provided.
  const [photo, setPhoto] = useState<string>(() => fotoUrl ?? diceBearUrl(nombre));

  useEffect(() => {
    // When a direct URL is supplied, nothing to fetch.
    if (fotoUrl) return;
    let cancelled = false;
    void fetchPlayerPhoto(nombre).then((url) => {
      if (!cancelled) setPhoto(url);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre]); // fotoUrl intentionally excluded: initial state handles it

  const handleImgError = useCallback(() => {
    setPhoto(diceBearUrl(nombre));
  }, [nombre]);

  const lastName = nombre.split(' ').at(-1)?.toUpperCase() ?? nombre;
  const starStr = '★'.repeat(info.stars) + '☆'.repeat(4 - info.stars);

  return (
    <div
      onClick={onClick}
      title={nombre}
      style={{
        width: dim.w,
        height: dim.h,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        border: `2px solid ${info.border}`,
        boxShadow: `0 0 18px ${info.glow}, 0 4px 12px rgba(0,0,0,0.4)`,
        position: 'relative',
        flexShrink: 0,
        transition: 'transform 0.18s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
    >
      {/* ── Top: team gradient + player photo ── */}
      <div
        style={{
          height: '56%',
          background: `linear-gradient(160deg, ${team.primary} 0%, ${team.secondary} 100%)`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Foil shimmer for EPICO / LEGENDARIO */}
        {info.foil && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(135deg,' +
                'rgba(255,255,255,0) 30%,' +
                'rgba(255,255,255,0.18) 50%,' +
                'rgba(255,255,255,0) 70%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 2.5s linear infinite',
            }}
          />
        )}

        <img
          src={photo}
          alt={nombre}
          onError={handleImgError}
          style={{
            width: dim.photo,
            height: '95%',
            objectFit: 'cover',
            objectPosition: 'top',
            borderRadius: '50% 50% 0 0',
            zIndex: 1,
          }}
        />

        {/* Dorsal badge */}
        <span
          style={{
            position: 'absolute',
            top: 5,
            left: 6,
            background: 'rgba(0,0,0,0.65)',
            color: '#fff',
            fontSize: dim.font - 1,
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: 4,
            zIndex: 2,
          }}
        >
          #{dorsal}
        </span>

        {/* Team flag */}
        <span
          style={{
            position: 'absolute',
            top: 4,
            right: 6,
            fontSize: dim.font + 6,
            zIndex: 2,
          }}
        >
          {team.flag}
        </span>
      </div>

      {/* ── Bottom: player info ── */}
      <div
        style={{
          height: '44%',
          background: info.gradient,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '4px 6px',
        }}
      >
        {/* Last name */}
        <p
          style={{
            color: '#fff',
            fontFamily: 'Oswald, sans-serif',
            fontSize: dim.font + 3,
            fontWeight: 800,
            margin: 0,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '92%',
            letterSpacing: 0.5,
          }}
        >
          {lastName}
        </p>

        {/* Position */}
        <p
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Inter, sans-serif',
            fontSize: dim.font - 1,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {posicion}
        </p>

        {/* Stars */}
        <p
          style={{
            color: info.color,
            fontSize: dim.font - 1,
            fontFamily: 'Inter, sans-serif',
            margin: 0,
            letterSpacing: 2,
          }}
        >
          {starStr}
        </p>

        {/* Popularity bar */}
        <div
          style={{
            width: '80%',
            height: 3,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.15)',
            marginTop: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(popularidad, 100)}%`,
              background: info.color,
              borderRadius: 99,
            }}
          />
        </div>
      </div>
    </div>
  );
}
