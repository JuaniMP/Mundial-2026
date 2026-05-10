import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { StickerCard } from './StickerCard';
import type { LaminaAlbum } from './albumApi';
import { parseRareza, RARITY } from './rarityUtils';

// ─── Phases ──────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'shake' | 'flash' | 'reveal' | 'fan';

interface PackOpenerProps {
  /** New stickers from the opened pack (already fetched) */
  newStickers: LaminaAlbum[];
  onClose: () => void;
  onPegar: (laminaId: number) => void;
}

// ─── Inline styles ───────────────────────────────────────────────────────────

const overlay: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.88)',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(8px)',
};

const packStyle: CSSProperties = {
  width: 160, height: 224,
  borderRadius: 12,
  background: 'linear-gradient(135deg,#1e3a8a 0%,#15803d 50%,#c62828 100%)',
  border: '3px solid rgba(255,255,255,0.2)',
  boxShadow: '0 0 60px rgba(59,130,246,0.5), 0 16px 48px rgba(0,0,0,0.8)',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  userSelect: 'none',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PackOpener({ newStickers, onClose, onPegar }: PackOpenerProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [revealed, setRevealed] = useState<number>(0);
  const [pasted, setPasted] = useState<Set<number>>(new Set());

  // Start shake on mount
  useEffect(() => {
    const t = setTimeout(() => setPhase('shake'), 100);
    return () => clearTimeout(t);
  }, []);

  const handlePackClick = useCallback(() => {
    if (phase === 'idle' || phase === 'shake') {
      setPhase('flash');
      setTimeout(() => {
        setPhase('reveal');
        // reveal stickers one by one
        newStickers.forEach((_, i) => {
          setTimeout(() => setRevealed(i + 1), i * 280);
        });
        setTimeout(() => setPhase('fan'), newStickers.length * 280 + 400);
      }, 500);
    }
  }, [phase, newStickers]);

  const handlePegar = (laminaId: number) => {
    onPegar(laminaId);
    setPasted(prev => new Set([...prev, laminaId]));
  };

  // ── Idle / Shake ──
  if (phase === 'idle' || phase === 'shake') {
    return (
      <div style={overlay} onClick={handlePackClick}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter,sans-serif' }}>
          Toca para abrir
        </p>
        <div
          style={{
            ...packStyle,
            animation: phase === 'shake'
              ? 'packShake 0.5s cubic-bezier(.36,.07,.19,.97) infinite'
              : undefined,
          }}
        >
          <span style={{ fontSize: 48, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}>⚽</span>
          <span style={{ color: '#fff', fontFamily: 'Oswald,sans-serif', fontWeight: 700, fontSize: 16, marginTop: 12, letterSpacing: 3, textTransform: 'uppercase' }}>
            World Cup
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 2 }}>2026</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 16 }}>5 Cromos</span>
        </div>

        <style>{`
          @keyframes packShake {
            0%,100% { transform: rotate(0deg) translateX(0); }
            20% { transform: rotate(-4deg) translateX(-4px); }
            40% { transform: rotate(4deg) translateX(4px); }
            60% { transform: rotate(-3deg) translateX(-3px); }
            80% { transform: rotate(3deg) translateX(3px); }
          }
        `}</style>
      </div>
    );
  }

  // ── Flash ──
  if (phase === 'flash') {
    return (
      <div style={{ ...overlay, background: '#fff' }}>
        <span style={{ fontSize: 80, animation: 'spin 0.5s linear' }}>✨</span>
        <style>{`@keyframes spin { from { transform: scale(0) rotate(0deg); } to { transform: scale(1.5) rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Reveal (stickers fly in one by one) ──
  if (phase === 'reveal') {
    return (
      <div style={overlay} onClick={() => { if (revealed >= newStickers.length) setPhase('fan'); }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 500, padding: 24 }}>
          {newStickers.slice(0, revealed).map((s, i) => (
            <div
              key={s.idLamina}
              style={{
                animation: `flyIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both`,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <StickerCard
                idLamina={s.idLamina}
                nombreJugador={s.nombreJugador}
                rareza={s.rareza}
                size="md"
              />
            </div>
          ))}
        </div>

        {revealed >= newStickers.length && (
          <button
            onClick={() => setPhase('fan')}
            style={{
              marginTop: 24, padding: '10px 28px',
              background: '#1d4ed8', color: '#fff',
              border: 'none', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'Oswald,sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: 1.5,
              textTransform: 'uppercase',
              boxShadow: '0 0 20px rgba(59,130,246,0.5)',
            }}
          >
            Ver todos →
          </button>
        )}

        <style>{`
          @keyframes flyIn {
            from { opacity: 0; transform: translateY(60px) scale(0.6); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ── Fan (final spread, allow pasting) ──
  return (
    <div style={overlay}>
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <p style={{ color: '#fbbf24', fontFamily: 'Oswald,sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
          ¡Nuevos cromos!
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 4, fontFamily: 'Inter,sans-serif' }}>
          Pega los que quieras al álbum
        </p>
      </div>

      {/* Cards in a fan */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 560, padding: '0 16px' }}>
        {newStickers.map((s, i) => {
          const rz = parseRareza(s.rareza);
          const rc = RARITY[rz];
          const isPasted = pasted.has(s.idLamina);
          return (
            <div
              key={s.idLamina}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                animation: `fadeUp 0.4s ${i * 0.06}s both`,
              }}
            >
              <StickerCard
                idLamina={s.idLamina}
                nombreJugador={s.nombreJugador}
                rareza={s.rareza}
                estaPegada={isPasted}
                size="md"
              />
              <button
                onClick={() => !isPasted && handlePegar(s.idLamina)}
                disabled={isPasted}
                style={{
                  padding: '5px 14px',
                  background: isPasted ? '#16a34a' : rc.gradient,
                  color: '#fff', border: 'none', borderRadius: 999,
                  fontSize: 11, fontWeight: 700, cursor: isPasted ? 'default' : 'pointer',
                  fontFamily: 'Oswald,sans-serif', letterSpacing: 1,
                  textTransform: 'uppercase',
                  opacity: isPasted ? 0.8 : 1,
                  transition: 'transform 0.15s',
                }}
              >
                {isPasted ? '✓ Pegado' : 'Pegar'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          marginTop: 24, padding: '10px 32px',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 999, cursor: 'pointer',
          fontFamily: 'Inter,sans-serif', fontSize: 13,
        }}
      >
        Cerrar
      </button>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
