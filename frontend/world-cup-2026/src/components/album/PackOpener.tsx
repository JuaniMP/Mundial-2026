import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { StickerCard } from './StickerCard';
import type { LaminaAlbum } from '../../services/albumApi';
import { parseRareza, RARITY } from './rarityUtils';
import { SFX } from './sfx';

// =============================================================================
//   PACK OPENER — Estilo Panini, paleta anfitriones USA/MEX/CAN
//   Fases: idle/shake → rip → reveal → fan
// =============================================================================

type Phase = 'idle' | 'shake' | 'rip' | 'reveal' | 'fan';

interface PackOpenerProps {
  newStickers: LaminaAlbum[];
  onClose: () => void;
  onPegar: (laminaId: number) => void;
}

// ─── Paleta oficial ──────────────────────────────────────────────────────────
const C = {
  blue: '#002868', // USA azul
  red: '#C8102E', // USA/MEX/CAN rojo
  green: '#006847', // MEX verde
  white: '#FFFFFF',
  ink: '#0D1B2A',
  gold: '#FFD700',
};

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background:
    'radial-gradient(ellipse at center, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 55%, rgba(226,232,240,0.96) 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(10px)',
  padding: 24,
  overflow: 'hidden',
};

// ─── El sobre Panini ─────────────────────────────────────────────────────────
function PaniniPack({ shaking, ripping }: { shaking: boolean; ripping: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 200,
        height: 280,
        transformStyle: 'preserve-3d',
        animation: shaking ? 'packShake 0.5s cubic-bezier(.36,.07,.19,.97) infinite' : undefined,
      }}
    >
      {/* Mitad superior (se rasga hacia arriba) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          height: '52%',
          borderRadius: '14px 14px 0 0',
          background: C.white,
          overflow: 'hidden',
          border: `2px solid ${C.ink}`,
          borderBottom: 'none',
          transformOrigin: 'bottom center',
          animation: ripping ? 'ripUp 0.65s cubic-bezier(.55,-0.1,.6,1.3) forwards' : undefined,
          boxShadow: '0 -8px 32px rgba(0,40,104,0.45)',
        }}
      >
        {/* Franjas decorativas tricolor (rojo/blanco/azul + verde) */}
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, background: C.red }}
        />
        <div
          style={{
            position: 'absolute',
            top: 22,
            left: 0,
            right: 0,
            height: 8,
            background: C.white,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 0,
            right: 0,
            height: 22,
            background: C.blue,
          }}
        />

        {/* Logo central */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 40,
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            🏆
          </div>
          <div
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 800,
              fontSize: 18,
              color: C.ink,
              letterSpacing: 2,
              marginTop: 4,
            }}
          >
            FIFA
          </div>
        </div>

        {/* Borde dentado (línea de rasgado) */}
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: 8,
            background:
              'repeating-linear-gradient(90deg, transparent 0 6px, ' + C.ink + ' 6px 8px)',
          }}
        />
      </div>

      {/* Mitad inferior */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '0 0 14px 14px',
          background: C.white,
          overflow: 'hidden',
          border: `2px solid ${C.ink}`,
          borderTop: 'none',
          transformOrigin: 'top center',
          animation: ripping ? 'ripDown 0.65s cubic-bezier(.55,-0.1,.6,1.3) forwards' : undefined,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Texto "WORLD CUP 2026" */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 800,
              fontSize: 22,
              color: C.blue,
              letterSpacing: 3,
              lineHeight: 1,
            }}
          >
            WORLD CUP
          </div>
          <div
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 900,
              fontSize: 44,
              color: C.red,
              letterSpacing: 2,
              lineHeight: 1,
              textShadow: '2px 2px 0 ' + C.ink,
            }}
          >
            2026
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 8,
              fontSize: 18,
            }}
          >
            <span>🇺🇸</span>
            <span>🇲🇽</span>
            <span>🇨🇦</span>
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              color: C.ink,
              opacity: 0.55,
              marginTop: 6,
              letterSpacing: 1,
            }}
          >
            5 CROMOS OFICIALES
          </div>
        </div>

        {/* Franja verde abajo */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 14,
            background: C.green,
          }}
        />
      </div>
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────────
function Confetti({ count = 60 }: { count?: number }) {
  // useState factory runs once on mount — Math.random() is called during
  // initialization, not during render, satisfying react-hooks/purity
  const [pieces] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.5 + Math.random() * 2,
      color: [C.red, C.blue, C.green, C.gold, C.white][i % 5],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    })),
  );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s linear forwards`,
            opacity: 0.95,
          }}
        />
      ))}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export function PackOpener({ newStickers, onClose, onPegar }: PackOpenerProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [revealed, setRevealed] = useState<number>(0);
  const [pasted, setPasted] = useState<Set<number>>(new Set());

  const hasLegendaria = useMemo(
    () => newStickers.some((s) => parseRareza(s.rareza) === 'LEGENDARIO'),
    [newStickers],
  );

  // Inicia el shake
  useEffect(() => {
    const t = setTimeout(() => setPhase('shake'), 150);
    return () => clearTimeout(t);
  }, []);

  // Inicia el reveal cuando termina el rip
  const handlePackClick = useCallback(() => {
    if (phase !== 'idle' && phase !== 'shake') return;
    SFX.rip();
    setPhase('rip');
    setTimeout(() => {
      SFX.woosh();
      setPhase('reveal');
      newStickers.forEach((s, i) => {
        setTimeout(() => {
          setRevealed(i + 1);
          const r = parseRareza(s.rareza);
          if (r === 'LEGENDARIO') SFX.sparkle();
          else if (r === 'EPICO') SFX.flip();
          else SFX.click();
        }, i * 380);
      });
      setTimeout(() => setPhase('fan'), newStickers.length * 380 + 600);
    }, 650);
  }, [phase, newStickers]);

  const handlePegar = useCallback(
    (laminaId: number) => {
      SFX.snap();
      onPegar(laminaId);
      setPasted((prev) => new Set([...prev, laminaId]));
    },
    [onPegar],
  );

  // ──── Idle / shake / rip ────
  if (phase === 'idle' || phase === 'shake' || phase === 'rip') {
    return (
      <div style={overlay} onClick={handlePackClick}>
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Oswald, sans-serif',
            fontSize: 14,
            marginBottom: 28,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          {phase === 'rip' ? '✨ Abriendo… ✨' : 'Toca el sobre para abrir'}
        </p>
        <PaniniPack shaking={phase === 'shake'} ripping={phase === 'rip'} />

        <style>{`
          @keyframes packShake {
            0%,100% { transform: rotate(0) translateX(0); }
            15% { transform: rotate(-5deg) translateX(-5px); }
            35% { transform: rotate(5deg) translateX(5px); }
            55% { transform: rotate(-4deg) translateX(-4px); }
            75% { transform: rotate(4deg) translateX(4px); }
          }
          @keyframes ripUp {
            0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-180px) rotate(-25deg); opacity: 0; }
          }
          @keyframes ripDown {
            0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(180px) rotate(25deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // ──── Reveal: cromos saliendo uno a uno con 3D flip ────
  if (phase === 'reveal') {
    return (
      <div
        style={overlay}
        onClick={() => {
          if (revealed >= newStickers.length) setPhase('fan');
        }}
      >
        {hasLegendaria && revealed > 0 && <Confetti count={80} />}
        <div
          style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 720,
            padding: 24,
          }}
        >
          {newStickers.slice(0, revealed).map((s, i) => {
            const r = parseRareza(s.rareza);
            const isLeg = r === 'LEGENDARIO';
            const isEpic = r === 'EPICO';
            return (
              <div
                key={s.idLamina}
                style={{
                  animation: `cardFlip 0.7s cubic-bezier(.34,1.56,.64,1) both`,
                  animationDelay: `${i * 0.05}s`,
                  filter: isLeg
                    ? 'drop-shadow(0 0 30px rgba(255,215,0,0.85))'
                    : isEpic
                      ? 'drop-shadow(0 0 18px rgba(168,85,247,0.6))'
                      : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
                }}
              >
                <StickerCard
                  idLamina={s.idLamina}
                  nombreJugador={s.nombreJugador}
                  imagenUrl={s.imagenUrl}
                  seleccionNombre={s.seleccionNombre}
                  rareza={s.rareza}
                  size="md"
                />
              </div>
            );
          })}
        </div>

        {revealed >= newStickers.length && (
          <button
            onClick={() => setPhase('fan')}
            style={{
              marginTop: 32,
              padding: '12px 36px',
              background: `linear-gradient(90deg, ${C.red} 0%, ${C.white} 50%, ${C.blue} 100%)`,
              color: C.ink,
              border: `2px solid ${C.ink}`,
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: 'Oswald, sans-serif',
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: 'uppercase',
              boxShadow: '0 6px 24px rgba(255,255,255,0.3)',
            }}
          >
            Ver mis cromos →
          </button>
        )}

        <style>{`
          @keyframes cardFlip {
            0%   { opacity: 0; transform: perspective(600px) rotateY(180deg) scale(0.5); }
            60%  { opacity: 1; transform: perspective(600px) rotateY(-12deg) scale(1.08); }
            100% { opacity: 1; transform: perspective(600px) rotateY(0deg) scale(1); }
          }
          @keyframes confettiFall {
            0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // ──── Fan: opciones de pegar ────
  return (
    <div style={overlay}>
      {hasLegendaria && <Confetti count={50} />}

      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 16px',
            background: `linear-gradient(90deg, ${C.red}, ${C.white}, ${C.blue})`,
            borderRadius: 999,
            border: `2px solid ${C.ink}`,
          }}
        >
          <span style={{ fontSize: 20 }}>🎉</span>
          <p
            style={{
              color: C.ink,
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: 2,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            ¡Nuevos cromos!
          </p>
          <span style={{ fontSize: 20 }}>🎉</span>
        </div>
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            marginTop: 10,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Pegá los nuevos al álbum o guardalos para intercambiar
        </p>
      </div>

      {/* Grid de cards */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 720,
          padding: '0 16px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {newStickers.map((s, i) => {
          const rz = parseRareza(s.rareza);
          const rc = RARITY[rz];
          const isPasted = pasted.has(s.idLamina);
          return (
            <div
              key={s.idLamina}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                animation: `fadeUp 0.4s ${i * 0.07}s both`,
              }}
            >
              <StickerCard
                idLamina={s.idLamina}
                nombreJugador={s.nombreJugador}
                imagenUrl={s.imagenUrl}
                seleccionNombre={s.seleccionNombre}
                rareza={s.rareza}
                estaPegada={isPasted}
                size="md"
              />
              <button
                onClick={() => !isPasted && handlePegar(s.idLamina)}
                disabled={isPasted}
                style={{
                  padding: '6px 18px',
                  background: isPasted ? C.green : rc.gradient,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: isPasted ? 'default' : 'pointer',
                  fontFamily: 'Oswald, sans-serif',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  opacity: isPasted ? 0.85 : 1,
                  boxShadow: isPasted
                    ? `0 2px 8px rgba(0,104,71,0.4)`
                    : `0 4px 12px rgba(0,0,0,0.25)`,
                }}
              >
                {isPasted ? '✓ Pegado' : '+ Pegar'}
              </button>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 30,
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '11px 30px',
            background: `linear-gradient(90deg, ${C.green} 0%, ${C.blue} 100%)`,
            color: '#ffffff',
            border: `2px solid ${C.ink}`,
            borderRadius: 999,
            cursor: 'pointer',
            fontFamily: 'Oswald, sans-serif',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            boxShadow: '0 6px 20px rgba(0,40,104,0.25)',
          }}
        >
          Volver al álbum
        </button>

        <button
          onClick={onClose}
          style={{
            padding: '10px 22px',
            background: '#ffffff',
            color: C.ink,
            border: `1px solid ${C.ink}55`,
            borderRadius: 999,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            letterSpacing: 0.5,
          }}
        >
          Cerrar
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
