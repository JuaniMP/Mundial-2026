import { useState, useEffect, useCallback, useRef } from 'react';
import type { LaminaAlbumResponse } from '../../services/albumApi';
import { StickerCardFlip } from './StickerCardFlip';
import { SFX } from './sfx';

type Stage = 'sealed' | 'dragging' | 'opening' | 'reveal';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

const COLORS = ['#1d4ed8', '#15803d', '#e53935', '#f59e0b', '#8b5cf6'];

function PackArt({ tearPct }: { tearPct: number }) {
  const clipTop = `polygon(0 0, 100% 0, 100% ${50 - tearPct * 50}%, 0 ${50 - tearPct * 50}%)`;
  const clipBot = `polygon(0 ${50 + tearPct * 50}%, 100% ${50 + tearPct * 50}%, 100% 100%, 0 100%)`;

  return (
    <div className="relative w-44 h-60 mx-auto">
      {/* Bottom half */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          clipPath: clipBot,
          background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)',
          boxShadow: '0 8px 32px rgba(29,78,216,0.5)',
          transform: `translateY(${tearPct * 40}px)`,
          transition: 'transform 0.05s linear',
        }}
      >
        <div className="absolute inset-0 border-2 border-white/15 rounded-2xl m-2" />
        <div className="absolute bottom-6 left-0 right-0 text-center text-white font-bold tracking-widest uppercase text-sm opacity-80">
          Mundial 2026
        </div>
      </div>

      {/* Top half */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          clipPath: clipTop,
          background: 'linear-gradient(160deg, #3b82f6 0%, #1d4ed8 60%, #1e3a8a 100%)',
          boxShadow: '0 -4px 24px rgba(29,78,216,0.4)',
          transform: `translateY(${-tearPct * 40}px)`,
          transition: 'transform 0.05s linear',
        }}
      >
        <div className="absolute inset-0 border-2 border-white/15 rounded-2xl m-2" />
        <div className="absolute top-5 left-0 right-0 flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
            <span className="text-2xl">⚽</span>
          </div>
          <span className="text-white font-black text-lg tracking-tight">SOBRE</span>
          <span className="text-primary-light text-xs">5 figuritas</span>
        </div>
      </div>

      {/* Tear line */}
      {tearPct < 1 && (
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ top: `${50 - tearPct * 5}%` }}
        >
          <svg width="100%" height="12" viewBox="0 0 176 12">
            <path
              d="M0,6 L22,2 L44,10 L66,2 L88,10 L110,2 L132,10 L154,2 L176,6"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

interface Props {
  paquetesRestantes: number;
  onOpen: () => Promise<LaminaAlbumResponse[]>;
  onPegar: (id: number) => void;
}

export function PackOpener({ paquetesRestantes, onOpen, onPegar }: Props) {
  const [stage, setStage] = useState<Stage>('sealed');
  const [tearPct, setTearPct] = useState(0);
  const [laminas, setLaminas] = useState<LaminaAlbumResponse[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [flippedAll, setFlippedAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const particleIdRef = useRef(0);

  const spawnParticles = useCallback(() => {
    const ps: Particle[] = Array.from({ length: 30 }, () => ({
      id: particleIdRef.current++,
      x: 50,
      y: 50,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 1200);
  }, []);

  const startDrag = useCallback(
    (clientY: number) => {
      if (stage !== 'sealed' || paquetesRestantes <= 0) return;
      setDragStartY(clientY);
      setStage('dragging');
    },
    [stage, paquetesRestantes],
  );

  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (stage !== 'dragging' || dragStartY === null) return;
      const delta = dragStartY - e.clientY;
      const pct = Math.min(1, Math.max(0, delta / 120));
      setTearPct(pct);
      if (pct > 0.3) SFX.rip();
    },
    [stage, dragStartY],
  );

  const handleGlobalTouchMove = useCallback(
    (e: TouchEvent) => {
      if (stage !== 'dragging' || dragStartY === null) return;
      const delta = dragStartY - e.touches[0].clientY;
      const pct = Math.min(1, Math.max(0, delta / 120));
      setTearPct(pct);
      if (pct > 0.3) SFX.rip();
    },
    [stage, dragStartY],
  );

  const handleGlobalMouseUp = useCallback(async () => {
    if (stage !== 'dragging') return;
    if (tearPct >= 0.85) {
      setStage('opening');
      spawnParticles();
      SFX.woosh();
      try {
        const result = await onOpen();
        setLaminas(result);
        setStage('reveal');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al abrir el sobre';
        setError(msg);
        setStage('sealed');
        setTearPct(0);
      }
    } else {
      setStage('sealed');
      setTearPct(0);
    }
    setDragStartY(null);
  }, [stage, tearPct, onOpen, spawnParticles]);

  useEffect(() => {
    if (stage === 'dragging') {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [stage, handleGlobalMouseMove, handleGlobalMouseUp, handleGlobalTouchMove]);

  const reset = () => {
    setStage('sealed');
    setTearPct(0);
    setLaminas([]);
    setFlippedAll(false);
    setError(null);
    SFX.click();
  };

  if (stage === 'reveal') {
    return (
      <div className="flex flex-col items-center gap-6 py-4 animate-fade-in-up">
        <h3 className="font-headline text-xl font-bold text-text-primary">¡Figuritas obtenidas!</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {laminas.map((l) => (
            <StickerCardFlip
              key={l.idLamina}
              lamina={l}
              size="md"
              onPegar={(id) => {
                onPegar(id);
                SFX.snap();
              }}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {!flippedAll && (
            <button
              className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity"
              onClick={() => {
                setFlippedAll(true);
                SFX.sparkle();
              }}
            >
              Voltear todas
            </button>
          )}
          <button
            className="px-5 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary font-semibold hover:opacity-80 transition-opacity"
            onClick={reset}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'opening') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 relative">
        <div className="relative">
          <PackArt tearPct={1} />
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                left: `calc(50% + ${p.vx * 20}px)`,
                top: `calc(50% + ${p.vy * 20}px)`,
                animation: 'particle-pop 0.9s ease-out forwards',
              }}
            />
          ))}
        </div>
        <p className="text-text-muted text-sm animate-pulse">Abriendo sobre...</p>
      </div>
    );
  }

  const canOpen = paquetesRestantes > 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {error && (
        <div className="px-4 py-2 rounded-lg bg-accent/10 border border-accent text-accent text-sm">
          {error}
        </div>
      )}

      <div
        className={`relative ${canOpen ? 'cursor-grab active:cursor-grabbing' : 'opacity-50 cursor-not-allowed'}`}
        onMouseDown={(e) => canOpen && startDrag(e.clientY)}
        onTouchStart={(e) => canOpen && startDrag(e.touches[0].clientY)}
      >
        <PackArt tearPct={tearPct} />
        {canOpen && tearPct === 0 && (
          <div className="absolute -bottom-8 left-0 right-0 text-center text-text-muted text-xs animate-bounce">
            ↑ Arrastra hacia arriba para abrir
          </div>
        )}
      </div>

      {!canOpen && (
        <p className="text-text-muted text-sm text-center">
          Ya abriste tus 3 sobres de hoy. ¡Vuelve mañana!
        </p>
      )}
    </div>
  );
}
