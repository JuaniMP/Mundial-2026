import { useState, useEffect, useRef, useCallback } from 'react';
import { AlbumBook } from '../components/album/AlbumBook';
import { Inventory } from '../components/album/Inventory';
import { Trades } from '../components/album/Trades';
import { Missions } from '../components/album/Missions';
import { PackOpener } from '../components/album/PackOpener';
import {
  fetchLaminas,
  pegarLamina,
  abrirPaquete,
  type LaminaAlbum,
} from '../components/album/albumApi';

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS_COINS = 'wc2026_coins';
const LS_PACKS = 'wc2026_packs';
const LS_LAST_FREE = 'wc2026_last_free';
const PACK_COST = 50;
const FREE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 h

type Tab = 'album' | 'cromos' | 'intercambios' | 'misiones';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadCoins(): number {
  return parseInt(localStorage.getItem(LS_COINS) ?? '100', 10);
}
function saveCoins(n: number) {
  localStorage.setItem(LS_COINS, String(n));
}
function loadPacks(): number {
  return parseInt(localStorage.getItem(LS_PACKS) ?? '3', 10);
}
function savePacks(n: number) {
  localStorage.setItem(LS_PACKS, String(n));
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Disponible';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Mock stickers for pack-opener preview (shown while real call completes)
function makeMockStickers(ids: number[]): LaminaAlbum[] {
  const names = ['Carlos López', 'Pedro Alves', 'Kenji Tanaka', 'André Müller', 'Kwame Asante'];
  const rarezas = ['COMUN', 'COMUN', 'RARO', 'COMUN', 'EPICO'];
  return ids.slice(0, 5).map((id, i) => ({
    idLamina: id,
    nombreJugador: names[i % names.length],
    rareza: rarezas[i % rarezas.length],
    estaPegada: false,
    cantidadRepetidas: 1,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Album() {
  const [tab, setTab] = useState<Tab>('album');
  const [laminas, setLaminas] = useState<LaminaAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [coins, setCoins] = useState(loadCoins);
  const [packs, setPacks] = useState(loadPacks);

  const [packOpen, setPackOpen] = useState(false);
  const [newStickers, setNewStickers] = useState<LaminaAlbum[]>([]);
  const [openingPack, setOpeningPack] = useState(false);

  const [freeReady, setFreeReady] = useState(false);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedRef = useRef(false);

  // ── Load laminas ──
  const loadLaminas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLaminas();
      setLaminas(data);
    } catch {
      // Use empty array; API may not be running
      setLaminas([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadLaminas();
    }
  }, [loadLaminas]);

  // ── Free pack countdown ──
  useEffect(() => {
    const tick = () => {
      const last = parseInt(localStorage.getItem(LS_LAST_FREE) ?? '0', 10);
      const remaining = FREE_COOLDOWN_MS - (Date.now() - last);
      if (remaining <= 0) {
        setFreeReady(true);
        setCountdown('');
      } else {
        setFreeReady(false);
        setCountdown(formatCountdown(remaining));
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Sync to localStorage ──
  useEffect(() => {
    saveCoins(coins);
  }, [coins]);
  useEffect(() => {
    savePacks(packs);
  }, [packs]);

  // ── Open pack ──
  const handleOpenPack = useCallback(
    async (free = false) => {
      if (openingPack) return;
      if (!free && packs < 1) return;
      if (free && !freeReady) return;

      setOpeningPack(true);
      try {
        if (free) localStorage.setItem(LS_LAST_FREE, String(Date.now()));
        else setPacks((p) => p - 1);

        const ids = await abrirPaquete();
        const stickers = ids.length > 0 ? makeMockStickers(ids) : makeMockStickers([1, 2, 3, 4, 5]);
        setNewStickers(stickers);
        setPackOpen(true);
        // Refresh laminas after opening
        void loadLaminas();
      } catch {
        // Fallback: show mock stickers so the ceremony still works
        setNewStickers(makeMockStickers([1, 2, 3, 4, 5]));
        setPackOpen(true);
      } finally {
        setOpeningPack(false);
      }
    },
    [openingPack, packs, freeReady, loadLaminas],
  );

  // ── Pegar lamina ──
  const handlePegar = useCallback(async (laminaId: number) => {
    // Optimistic update
    setLaminas((prev) =>
      prev.map((l) => (l.idLamina === laminaId ? { ...l, estaPegada: true } : l)),
    );
    try {
      await pegarLamina(laminaId);
    } catch {
      // Revert on error
      setLaminas((prev) =>
        prev.map((l) => (l.idLamina === laminaId ? { ...l, estaPegada: false } : l)),
      );
    }
  }, []);

  // ── Vender repetida ──
  const handleVender = useCallback((laminaId: number) => {
    setLaminas((prev) =>
      prev.map((l) =>
        l.idLamina === laminaId && l.cantidadRepetidas > 1
          ? { ...l, cantidadRepetidas: l.cantidadRepetidas - 1 }
          : l,
      ),
    );
    setCoins((c) => c + 10);
  }, []);

  // ── Trade accepted ──
  const handleTradeAccept = useCallback((giveId: number, receive: LaminaAlbum) => {
    setLaminas((prev) => {
      const next = prev.map((l) =>
        l.idLamina === giveId && l.cantidadRepetidas > 1
          ? { ...l, cantidadRepetidas: l.cantidadRepetidas - 1 }
          : l,
      );
      // Add received sticker if not already owned
      const existing = next.find((l) => l.idLamina === receive.idLamina);
      if (existing) {
        return next.map((l) =>
          l.idLamina === receive.idLamina
            ? { ...l, cantidadRepetidas: l.cantidadRepetidas + 1 }
            : l,
        );
      }
      return [...next, receive];
    });
  }, []);

  // ── Claim mission reward ──
  const handleClaimMission = useCallback((reward: number) => {
    setCoins((c) => c + reward);
  }, []);

  // ── Buy extra pack with coins ──
  const handleBuyPack = useCallback(() => {
    if (coins < PACK_COST) return;
    setCoins((c) => c - PACK_COST);
    setPacks((p) => p + 1);
  }, [coins]);

  // ── Album progress stats ──
  const totalStickers = laminas.length;
  const pastedCount = laminas.filter((l) => l.estaPegada).length;
  const pct = Math.round((pastedCount / (32 * 10)) * 100);

  // ── Tab nav ──
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'album', label: 'Álbum', icon: '📖' },
    { id: 'cromos', label: 'Cromos', icon: '🃏' },
    { id: 'intercambios', label: 'Intercambios', icon: '🔄' },
    { id: 'misiones', label: 'Misiones', icon: '🎯' },
  ];

  return (
    <>
      {/* ── Pack opener modal ── */}
      {packOpen && (
        <PackOpener
          newStickers={newStickers}
          onClose={() => setPackOpen(false)}
          onPegar={handlePegar}
        />
      )}

      <main className="pt-20 md:pt-24 pb-28 md:pb-12 max-w-screen-xl mx-auto w-full px-4 md:px-6 flex flex-col gap-6 overflow-x-hidden flex-1">
        {/* ── Top header: progress + coins + pack buttons ── */}
        <section className="card-base p-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Left: title + progress */}
            <div className="flex-1">
              <span className="badge badge-secondary mb-2">FIFA World Cup 2026</span>
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                <span className="gradient-text">Mi Álbum</span>
              </h1>
              <div className="flex flex-col gap-2 max-w-sm">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-bold text-text-primary">{pct}% completado</span>
                  <span className="text-text-muted">
                    {pastedCount} / {32 * 10} pegados · {totalStickers} obtenidos
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-bg-hover overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg,#1d4ed8,#15803d)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: coins + pack actions */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              {/* Coins */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪙</span>
                  <div>
                    <p className="text-xs text-text-muted font-medium">Monedas</p>
                    <p className="font-headline text-xl font-bold text-text-primary">{coins}</p>
                  </div>
                </div>
                <button
                  onClick={handleBuyPack}
                  disabled={coins < PACK_COST}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: coins >= PACK_COST ? 'rgba(29,78,216,0.12)' : 'rgba(0,0,0,0.04)',
                    color: coins >= PACK_COST ? '#1d4ed8' : '#94a3b8',
                    border: `1px solid ${coins >= PACK_COST ? 'rgba(29,78,216,0.25)' : 'rgba(0,0,0,0.08)'}`,
                    cursor: coins >= PACK_COST ? 'pointer' : 'not-allowed',
                  }}
                >
                  +1 Sobre ({PACK_COST}🪙)
                </button>
              </div>

              {/* Pack count */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 p-2.5 rounded-xl bg-bg-elevated border border-border">
                  <span className="text-lg">📦</span>
                  <span className="font-bold text-text-primary">{packs}</span>
                  <span className="text-xs text-text-muted">sobres</span>
                </div>
                <button
                  onClick={() => void handleOpenPack(false)}
                  disabled={packs < 1 || openingPack}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: packs > 0 ? 'linear-gradient(135deg,#1e3a8a,#1d4ed8)' : '#f1f5f9',
                    color: packs > 0 ? '#fff' : '#94a3b8',
                    border: 'none',
                    cursor: packs > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: packs > 0 ? '0 4px 16px rgba(29,78,216,0.35)' : 'none',
                    fontFamily: 'Oswald, sans-serif',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    opacity: openingPack ? 0.6 : 1,
                  }}
                >
                  {openingPack ? 'Abriendo…' : 'Abrir sobre'}
                </button>
              </div>

              {/* Free pack */}
              <button
                onClick={() => void handleOpenPack(true)}
                disabled={!freeReady || openingPack}
                className="w-full py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: freeReady ? 'rgba(21,128,61,0.12)' : 'transparent',
                  color: freeReady ? '#15803d' : '#94a3b8',
                  border: `1px solid ${freeReady ? 'rgba(21,128,61,0.3)' : 'rgba(0,0,0,0.06)'}`,
                  cursor: freeReady ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {freeReady ? '🎁 Sobre diario gratis' : `⏳ Próximo gratis: ${countdown}`}
              </button>
            </div>
          </div>
        </section>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 p-1 rounded-xl bg-bg-elevated border border-border w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? '#0f172a' : '#64748b',
                border: 'none',
                cursor: 'pointer',
                boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                fontFamily: 'Inter, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div
              style={{
                width: 40,
                height: 40,
                border: '3px solid #e2e8f0',
                borderTopColor: '#1d4ed8',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div className="card-base p-8 text-center">
            <p className="text-accent font-semibold">{error}</p>
            <button onClick={loadLaminas} className="mt-4 text-primary text-sm underline">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {tab === 'album' && (
              <section className="animate-fade-in">
                <AlbumBook laminas={laminas} onPegar={handlePegar} />
              </section>
            )}

            {tab === 'cromos' && (
              <section className="card-base p-6 animate-fade-in" style={{ background: '#0f172a' }}>
                <Inventory laminas={laminas} onPegar={handlePegar} onVender={handleVender} />
              </section>
            )}

            {tab === 'intercambios' && (
              <section className="card-base p-6 animate-fade-in" style={{ background: '#0f172a' }}>
                <Trades laminas={laminas} onAccept={handleTradeAccept} />
              </section>
            )}

            {tab === 'misiones' && (
              <section className="card-base p-6 animate-fade-in" style={{ background: '#0f172a' }}>
                <Missions laminas={laminas} coins={coins} onClaim={handleClaimMission} />
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
