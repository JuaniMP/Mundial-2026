import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { abrirPaquete, pegarLamina } from '../components/album/albumApi';
import type { LaminaAlbum } from '../components/album/albumApi';
import { CromoCard } from '../components/album/CromoCard';
import { getTeamForLamina, getSlotInTeam } from '../components/album/teamColors';
import { parseRareza } from '../components/album/rarityUtils';

// ── helpers ───────────────────────────────────────────────────────────────────

const RARITIES = ['COMUN', 'COMUN', 'RARO', 'COMUN', 'EPICO', 'LEGENDARIO'];

/** Convert raw IDs returned by abrirPaquete() into displayable LaminaAlbum. */
function idsToLaminas(ids: number[]): LaminaAlbum[] {
  return ids.map((id) => {
    const team = getTeamForLamina(id);
    const slot = getSlotInTeam(id);
    return {
      idLamina: id,
      nombreJugador: `${team.name} ${slot}`,
      rareza: RARITIES[(id * 7 + 3) % RARITIES.length],
      estaPegada: false,
      cantidadRepetidas: 0,
    };
  });
}

// ── confetti ──────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  '#fbbf24',
  '#60a5fa',
  '#34d399',
  '#f87171',
  '#a78bfa',
  '#fb923c',
  '#e879f9',
  '#fff',
];

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
}

/** Deterministic pseudo-random confetti (avoids Math.random in render). */
function buildConfetti(): ConfettiPiece[] {
  return Array.from({ length: 52 }, (_, i) => ({
    id: i,
    left: (i * 127 + 11) % 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (i * 0.055) % 1.8,
    size: 6 + (i % 7),
    rotation: (i * 43) % 360,
  }));
}

// ── sound ─────────────────────────────────────────────────────────────────────

function playPackSound() {
  try {
    const ctx = new AudioContext();

    // Whoosh sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);

    // Pop
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(600, ctx.currentTime + 0.3);
    osc2.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.55);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.3);
    gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    osc2.start(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.6);

    setTimeout(() => void ctx.close(), 1000);
  } catch {
    // AudioContext not available — silent fallback
  }
}

// ── types ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'shake' | 'burst' | 'reveal';

// ── transitions (const so framer doesn't re-parse) ───────────────────────────

const SHAKE_TRANS: Transition = { duration: 0.45, ease: 'easeInOut' };
const BURST_TRANS: Transition = { duration: 0.35, ease: 'backOut' };
const CARD_TRANS = (i: number): Transition => ({
  delay: 0.1 + i * 0.1,
  duration: 0.4,
  ease: 'backOut',
});

// ── component ─────────────────────────────────────────────────────────────────

const PACKS_KEY = 'wc2026_packs';
const COINS_KEY = 'wc2026_coins';
const PACK_COST = 50;

export function PackOpening() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [cards, setCards] = useState<LaminaAlbum[]>([]);
  const [pastedIds, setPastedIds] = useState<Set<number>>(new Set());
  const [coins, setCoins] = useState<number>(() => {
    const raw = localStorage.getItem(COINS_KEY);
    return raw ? parseInt(raw, 10) : 100;
  });
  const [packs, setPacks] = useState<number>(() => {
    const raw = localStorage.getItem(PACKS_KEY);
    return raw ? parseInt(raw, 10) : 3;
  });
  const [err, setErr] = useState<string | null>(null);
  const opening = useRef(false);

  const confetti = useMemo(() => buildConfetti(), []);

  // Sync coins/packs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(COINS_KEY, String(coins));
  }, [coins]);
  useEffect(() => {
    localStorage.setItem(PACKS_KEY, String(packs));
  }, [packs]);

  const handleOpen = useCallback(async () => {
    if (opening.current || phase !== 'idle') return;
    if (packs <= 0 && coins < PACK_COST) {
      setErr('No tienes sobres ni monedas suficientes.');
      return;
    }
    opening.current = true;
    setErr(null);

    // Deduct pack or coins
    if (packs > 0) {
      setPacks((p) => p - 1);
    } else {
      setCoins((c) => c - PACK_COST);
    }

    setPhase('shake');
    await new Promise((r) => setTimeout(r, 600));
    setPhase('burst');
    playPackSound();
    await new Promise((r) => setTimeout(r, 400));

    try {
      const ids = await abrirPaquete();
      setCards(idsToLaminas(ids));
    } catch {
      setCards([]);
      setErr('Error al abrir el sobre. Intenta de nuevo.');
    }

    setPhase('reveal');
    opening.current = false;
  }, [phase, packs, coins]);

  const handlePegar = useCallback(
    async (id: number) => {
      if (pastedIds.has(id)) return;
      try {
        await pegarLamina(id);
        setPastedIds((prev) => new Set([...prev, id]));
      } catch {
        // silent — user can retry
      }
    },
    [pastedIds],
  );

  const handleReset = useCallback(() => {
    setPhase('idle');
    setCards([]);
    setPastedIds(new Set());
  }, []);

  const canOpen = packs > 0 || coins >= PACK_COST;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-deep)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 115,
        paddingBottom: 60,
        paddingLeft: 16,
        paddingRight: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── confetti ── */}
      {phase === 'reveal' &&
        confetti.map((c) => (
          <div
            key={c.id}
            style={{
              position: 'fixed',
              top: '-10px',
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              background: c.color,
              borderRadius: c.id % 3 === 0 ? '50%' : 2,
              transform: `rotate(${c.rotation}deg)`,
              animation: `confettiFall 2.2s ${c.delay}s ease-in forwards`,
              pointerEvents: 'none',
              zIndex: 100,
            }}
          />
        ))}

      {/* ── header ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          borderBottom: '1.5px solid var(--color-ink)',
          paddingBottom: 20,
          marginBottom: 40,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: 11,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: 8,
          }}
        >
          ◆ FIFA World Cup 2026
        </div>
        <h1
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(42px,6vw,80px)',
            lineHeight: 0.9,
            color: 'var(--color-ink)',
            margin: '0 0 16px',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          ABRIR{' '}
          <span
            style={{
              fontFamily: 'DM Serif Display, serif',
              fontStyle: 'italic',
              color: 'var(--color-secondary)',
              textTransform: 'none',
              fontSize: '0.82em',
            }}
          >
            sobre
          </span>
        </h1>
        <div
          style={{
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              padding: '10px 18px',
              border: '1.5px solid var(--color-ink)',
              background: 'var(--color-primary)',
              color: 'var(--color-ink)',
              fontFamily: 'Anton, sans-serif',
              fontSize: 18,
              letterSpacing: '0.04em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span>{coins}</span>
            <span
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 9,
                letterSpacing: '0.2em',
                opacity: 0.7,
              }}
            >
              MONEDAS
            </span>
          </div>
          <div
            style={{
              padding: '10px 18px',
              border: '1.5px solid var(--color-ink)',
              background: 'var(--color-secondary)',
              color: 'var(--color-text-inverse)',
              fontFamily: 'Anton, sans-serif',
              fontSize: 18,
              letterSpacing: '0.04em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span>{packs}</span>
            <span
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 9,
                letterSpacing: '0.2em',
                opacity: 0.75,
              }}
            >
              SOBRES
            </span>
          </div>
        </div>
      </div>

      {/* ── pack card ── */}
      {phase !== 'reveal' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
          }}
        >
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div
                key="pack-idle"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={BURST_TRANS}
                style={{
                  width: 180,
                  height: 260,
                  background: 'var(--color-ink)',
                  border: '3px solid var(--color-primary)',
                  boxShadow: '10px 10px 0 var(--color-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: canOpen ? 'pointer' : 'not-allowed',
                  userSelect: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={canOpen ? () => void handleOpen() : undefined}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-linear-gradient(45deg, transparent 0 8px, rgba(229,180,73,.06) 8px 16px)',
                  }}
                />
                <span style={{ fontSize: 48, position: 'relative', zIndex: 1 }}>🎴</span>
                <p
                  style={{
                    color: 'var(--color-primary)',
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 16,
                    margin: 0,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  WC 2026
                </p>
                <p
                  style={{
                    color: 'rgba(246,239,226,.45)',
                    fontFamily: 'Archivo, sans-serif',
                    fontSize: 10,
                    margin: 0,
                    letterSpacing: '0.15em',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {canOpen ? 'Click para abrir' : 'Sin sobres'}
                </p>
              </motion.div>
            )}

            {phase === 'shake' && (
              <motion.div
                key="pack-shake"
                animate={{ rotate: [-8, 8, -6, 6, -3, 3, 0] }}
                transition={SHAKE_TRANS}
                style={{
                  width: 180,
                  height: 260,
                  background: 'var(--color-ink)',
                  border: '3px solid var(--color-primary)',
                  boxShadow: '0 0 40px rgba(229,180,73,.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 52,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-linear-gradient(45deg, transparent 0 8px, rgba(229,180,73,.06) 8px 16px)',
                  }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>🎴</span>
              </motion.div>
            )}

            {phase === 'burst' && (
              <motion.div
                key="pack-burst"
                animate={{ scale: [1, 1.4, 0], opacity: [1, 1, 0] }}
                transition={BURST_TRANS}
                style={{
                  width: 180,
                  height: 260,
                  background: 'var(--color-primary)',
                  border: '3px solid var(--color-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 60,
                }}
              >
                ✨
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'idle' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}
            >
              {canOpen && (
                <button
                  onClick={() => void handleOpen()}
                  style={{
                    padding: '14px 36px',
                    background: 'var(--color-ink)',
                    border: '1.5px solid var(--color-ink)',
                    color: 'var(--color-primary)',
                    fontSize: 15,
                    fontFamily: 'Anton, sans-serif',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px,-2px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '6px 6px 0 var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = '';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
                  }}
                >
                  {packs > 0 ? '🎴 Abrir Sobre' : `🪙 Comprar (${PACK_COST})`}
                </button>
              )}
              <button
                onClick={() => navigate('/album')}
                style={{
                  padding: '10px 24px',
                  background: 'transparent',
                  border: '1.5px solid var(--color-ink)',
                  color: 'var(--color-text-muted)',
                  fontSize: 12,
                  fontFamily: 'Archivo, sans-serif',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--color-bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                Ver álbum →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── reveal cards ── */}
      {phase === 'reveal' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(28px,4vw,52px)',
              color: 'var(--color-ink)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 0.9,
            }}
          >
            ✨ <span style={{ color: 'var(--color-secondary)' }}>{cards.length}</span> CROMOS
          </motion.h2>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'center',
            }}
          >
            {cards.map((card, i) => {
              const team = getTeamForLamina(card.idLamina);
              const slot = getSlotInTeam(card.idLamina);
              return (
                <motion.div
                  key={card.idLamina}
                  initial={{ opacity: 0, y: 60, rotate: -10 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={CARD_TRANS(i)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CromoCard
                    id={card.idLamina}
                    nombre={card.nombreJugador}
                    posicion={`Slot ${slot}`}
                    dorsal={slot}
                    rareza={parseRareza(card.rareza)}
                    team={team}
                    size="md"
                  />
                  {!pastedIds.has(card.idLamina) && !card.estaPegada && (
                    <button
                      onClick={() => void handlePegar(card.idLamina)}
                      style={{
                        padding: '6px 18px',
                        background: 'var(--color-secondary)',
                        border: '1.5px solid var(--color-ink)',
                        color: 'var(--color-text-inverse)',
                        fontSize: 11,
                        fontFamily: 'Anton, sans-serif',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      📌 Pegar
                    </button>
                  )}
                  {(pastedIds.has(card.idLamina) || card.estaPegada) && (
                    <span
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 11,
                        fontFamily: 'Anton, sans-serif',
                        letterSpacing: '0.08em',
                      }}
                    >
                      ✅ PEGADO
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {canOpen && (
              <button
                onClick={handleReset}
                style={{
                  padding: '14px 32px',
                  background: 'var(--color-ink)',
                  border: '1.5px solid var(--color-ink)',
                  color: 'var(--color-primary)',
                  fontSize: 14,
                  fontFamily: 'Anton, sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px,-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '6px 6px 0 var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = '';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
                }}
              >
                🎴 Otro sobre
              </button>
            )}
            <button
              onClick={() => navigate('/album')}
              style={{
                padding: '14px 28px',
                background: 'transparent',
                border: '1.5px solid var(--color-ink)',
                color: 'var(--color-text-muted)',
                fontSize: 12,
                fontFamily: 'Archivo, sans-serif',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              Ver álbum →
            </button>
          </div>
        </div>
      )}

      {err && (
        <p
          style={{
            color: 'var(--color-danger)',
            fontFamily: 'Archivo, sans-serif',
            fontSize: 13,
            marginTop: 16,
            textAlign: 'center',
            border: '1.5px solid var(--color-danger)',
            padding: '10px 20px',
            letterSpacing: '0.05em',
          }}
        >
          {err}
        </p>
      )}
    </main>
  );
}
