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
        background: 'radial-gradient(ellipse at 50% 0%, #1e1b4b, #0a0a14)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 16px 40px',
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
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 36,
            fontWeight: 900,
            color: '#fff',
            margin: 0,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          🎴 Abrir Sobre
        </h1>
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginTop: 12,
          }}
        >
          <span
            style={{
              color: '#fbbf24',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {coins} 🪙 monedas
          </span>
          <span
            style={{
              color: '#60a5fa',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {packs} 📦 sobres
          </span>
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
                  borderRadius: 18,
                  background: 'linear-gradient(160deg,#7c3aed,#2563eb,#0891b2)',
                  border: '3px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 0 60px rgba(124,58,237,0.6), 0 20px 40px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: canOpen ? 'pointer' : 'not-allowed',
                  userSelect: 'none',
                }}
                onClick={canOpen ? () => void handleOpen() : undefined}
              >
                <span style={{ fontSize: 52 }}>🎴</span>
                <p
                  style={{
                    color: '#fff',
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 18,
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  WC 2026
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    margin: 0,
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
                  borderRadius: 18,
                  background: 'linear-gradient(160deg,#7c3aed,#2563eb,#0891b2)',
                  border: '3px solid rgba(255,255,255,0.35)',
                  boxShadow: '0 0 80px rgba(124,58,237,0.8), 0 20px 40px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 52,
                }}
              >
                🎴
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
                  borderRadius: 18,
                  background: 'linear-gradient(160deg,#fbbf24,#f59e0b,#d97706)',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {canOpen && (
                <button
                  onClick={() => void handleOpen()}
                  style={{
                    padding: '14px 40px',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 16,
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
                  }}
                >
                  {packs > 0 ? '🎴 Abrir Sobre' : `🪙 Comprar (${PACK_COST})`}
                </button>
              )}
              <button
                onClick={() => navigate('/album')}
                style={{
                  padding: '10px 28px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Ver álbum
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
              fontFamily: 'Oswald, sans-serif',
              fontSize: 24,
              color: '#fbbf24',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            ✨ {cards.length} Cromos conseguidos!
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
                        borderRadius: 999,
                        background: 'linear-gradient(135deg,#059669,#34d399)',
                        border: 'none',
                        color: '#fff',
                        fontSize: 12,
                        fontFamily: 'Oswald, sans-serif',
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: 1,
                      }}
                    >
                      📌 Pegar
                    </button>
                  )}
                  {(pastedIds.has(card.idLamina) || card.estaPegada) && (
                    <span
                      style={{
                        color: '#34d399',
                        fontSize: 12,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      ✅ Pegado
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {canOpen && (
              <button
                onClick={handleReset}
                style={{
                  padding: '12px 32px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                }}
              >
                🎴 Otro sobre
              </button>
            )}
            <button
              onClick={() => navigate('/album')}
              style={{
                padding: '12px 28px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
              }}
            >
              Ver álbum
            </button>
          </div>
        </div>
      )}

      {err && (
        <p
          style={{
            color: '#f87171',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {err}
        </p>
      )}
    </main>
  );
}
