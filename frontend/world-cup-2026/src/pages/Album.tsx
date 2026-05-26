import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumBook } from '../components/album/AlbumBook';
import { Inventory } from '../components/album/Inventory';
import { Trades } from '../components/album/Trades';
import { Missions } from '../components/album/Missions';
import { PackOpener } from '../components/album/PackOpener';
import {
  fetchLaminas,
  fetchTodasLaminas,
  fetchPaquetesAbiertos,
  pegarLamina,
  abrirPaquete,
  type LaminaAlbum,
} from '../components/album/albumApi';
import { scopedKey } from '../utils/userScope';
import { clearOldPhotoCache } from '../services/imageApi';

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS_COINS = 'wc2026_coins';
const LS_PACKS = 'wc2026_packs';
const LS_LAST_FREE = 'wc2026_last_free';
const PACK_COST = 50;
const FREE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 h

type Tab = 'album' | 'cromos' | 'intercambios' | 'misiones';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadCoins(): number {
  return parseInt(localStorage.getItem(scopedKey(LS_COINS)) ?? '100', 10);
}
function saveCoins(n: number) {
  localStorage.setItem(scopedKey(LS_COINS), String(n));
}
function loadPacks(): number {
  return parseInt(localStorage.getItem(scopedKey(LS_PACKS)) ?? '3', 10);
}
function savePacks(n: number) {
  localStorage.setItem(scopedKey(LS_PACKS), String(n));
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
  const pool: Array<
    Pick<LaminaAlbum, 'nombreJugador' | 'rareza' | 'seleccionNombre' | 'imagenUrl'>
  > = [
    {
      nombreJugador: 'Christian Pulisic',
      rareza: 'EPICO',
      seleccionNombre: 'Estados Unidos',
      imagenUrl: '/assets/players/usa.png',
    },
    {
      nombreJugador: 'Weston McKennie',
      rareza: 'RARO',
      seleccionNombre: 'Estados Unidos',
      imagenUrl: '/assets/players/usa.png',
    },
    {
      nombreJugador: 'Gio Reyna',
      rareza: 'COMUN',
      seleccionNombre: 'Estados Unidos',
      imagenUrl: '/assets/players/usa.png',
    },

    {
      nombreJugador: 'Santiago Gimenez',
      rareza: 'EPICO',
      seleccionNombre: 'México',
      imagenUrl: '/assets/players/mex.png',
    },
    {
      nombreJugador: 'Hirving Lozano',
      rareza: 'RARO',
      seleccionNombre: 'México',
      imagenUrl: '/assets/players/mex.png',
    },
    {
      nombreJugador: 'Edson Alvarez',
      rareza: 'COMUN',
      seleccionNombre: 'México',
      imagenUrl: '/assets/players/mex.png',
    },

    {
      nombreJugador: 'Alphonso Davies',
      rareza: 'EPICO',
      seleccionNombre: 'Canadá',
      imagenUrl: '/assets/players/can.png',
    },
    {
      nombreJugador: 'Jonathan David',
      rareza: 'RARO',
      seleccionNombre: 'Canadá',
      imagenUrl: '/assets/players/can.png',
    },
    {
      nombreJugador: 'Cyle Larin',
      rareza: 'COMUN',
      seleccionNombre: 'Canadá',
      imagenUrl: '/assets/players/can.png',
    },

    {
      nombreJugador: 'Lionel Messi',
      rareza: 'LEGENDARIA',
      seleccionNombre: 'Argentina',
      imagenUrl: '/assets/players/arg.png',
    },
    {
      nombreJugador: 'Julian Alvarez',
      rareza: 'EPICO',
      seleccionNombre: 'Argentina',
      imagenUrl: '/assets/players/arg.png',
    },
    {
      nombreJugador: 'Alexis Mac Allister',
      rareza: 'RARO',
      seleccionNombre: 'Argentina',
      imagenUrl: '/assets/players/arg.png',
    },

    {
      nombreJugador: 'Vinicius Jr',
      rareza: 'EPICO',
      seleccionNombre: 'Brasil',
      imagenUrl: '/assets/players/bra.png',
    },
    {
      nombreJugador: 'Rodrygo',
      rareza: 'RARO',
      seleccionNombre: 'Brasil',
      imagenUrl: '/assets/players/bra.png',
    },
    {
      nombreJugador: 'Neymar',
      rareza: 'LEGENDARIA',
      seleccionNombre: 'Brasil',
      imagenUrl: '/assets/players/bra.png',
    },
  ];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return ids.slice(0, 5).map((id, i) => {
    const pick = shuffled[i % shuffled.length];
    return {
      idLamina: id,
      nombreJugador: pick.nombreJugador,
      imagenUrl: pick.imagenUrl,
      seleccionNombre: pick.seleccionNombre,
      rareza: pick.rareza,
      estaPegada: false,
      cantidadRepetidas: 1,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Album() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('album');
  const [laminas, setLaminas] = useState<LaminaAlbum[]>([]); // sólo poseídas (inventario)
  const [todasLaminas, setTodasLaminas] = useState<LaminaAlbum[]>([]); // 320 con estado (álbum)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pegandoId, setPegandoId] = useState<number | null>(null); // para animación

  const [coins, setCoins] = useState(loadCoins);
  const [packs, setPacks] = useState(loadPacks);

  const [packOpen, setPackOpen] = useState(false);
  const [newStickers, setNewStickers] = useState<LaminaAlbum[]>([]);
  const [openingPack, setOpeningPack] = useState(false);
  const [paquetesAbiertos, setPaquetesAbiertos] = useState(0);

  const [freeReady, setFreeReady] = useState(false);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedRef = useRef(false);

  // ── Load laminas ──
  const loadLaminas = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Para ver tu álbum debes iniciar sesión.');
        setLaminas([]);
        setTodasLaminas([]);
        return;
      }
      // Carga en paralelo: poseídas (inventario) + todas (álbum completo)
      const [poseidas, todas] = await Promise.all([
        fetchLaminas(),
        fetchTodasLaminas().catch(() => [] as LaminaAlbum[]),
      ]);
      setLaminas(poseidas);
      setTodasLaminas(todas);
      setError(null);

      try {
        const stats = await fetchPaquetesAbiertos();
        setPaquetesAbiertos(stats.abiertos ?? 0);
      } catch {
        setPaquetesAbiertos(0);
      }
    } catch (err: unknown) {
      setLaminas([]);
      setTodasLaminas([]);
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('sesion') || msg.toLowerCase().includes('token')) {
        setError('Para ver tu álbum debes iniciar sesión.');
      } else {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      clearOldPhotoCache(); // clear old lorelei-style avatars
      loadLaminas();
    }
  }, [loadLaminas]);

  // ── Free pack countdown ──
  useEffect(() => {
    const tick = () => {
      const last = parseInt(localStorage.getItem(scopedKey(LS_LAST_FREE)) ?? '0', 10);
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
        if (free) localStorage.setItem(scopedKey(LS_LAST_FREE), String(Date.now()));
        else setPacks((p) => p - 1);

        const ids = await abrirPaquete();
        let stickers: LaminaAlbum[] = [];

        if (ids.length > 0) {
          try {
            // Build the opened pack with real data when backend is available.
            const latest = await fetchLaminas();
            setLaminas(latest);
            stickers = ids
              .map((id) => latest.find((l) => l.idLamina === id))
              .filter((l): l is LaminaAlbum => Boolean(l));
          } catch {
            // Ignore and use fallback below.
          }
        }

        if (stickers.length === 0) {
          stickers = makeMockStickers(ids.length > 0 ? ids : [1, 2, 3, 4, 5]);
        }

        setNewStickers(stickers);
        setPackOpen(true);
        // Refresh laminas after opening
        void loadLaminas();
      } catch {
        setError(t('album.openPackError'));
      } finally {
        setOpeningPack(false);
      }
    },
    [openingPack, packs, freeReady, loadLaminas, t],
  );

  // ── Pegar lamina ──
  const handlePegar = useCallback(
    async (laminaId: number) => {
      setPegandoId(laminaId); // inicia animación
      // Optimistic update en ambos estados
      const applyPegada = (prev: LaminaAlbum[]) =>
        prev.map((l) => (l.idLamina === laminaId ? { ...l, estaPegada: true } : l));
      setLaminas(applyPegada);
      setTodasLaminas(applyPegada);
      try {
        await pegarLamina(laminaId);
        setError(null);
      } catch {
        // Revert on error
        const revert = (prev: LaminaAlbum[]) =>
          prev.map((l) => (l.idLamina === laminaId ? { ...l, estaPegada: false } : l));
        setLaminas(revert);
        setTodasLaminas(revert);
        setError(t('album.stickerError'));
      } finally {
        setTimeout(() => setPegandoId(null), 900);
      }
    },
    [t],
  );

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
    { id: 'album', label: t('album.tabAlbum'), icon: '📖' },
    { id: 'cromos', label: t('album.tabCromos'), icon: '🃏' },
    { id: 'intercambios', label: t('album.tabIntercambios'), icon: '🔄' },
    { id: 'misiones', label: t('album.tabMisiones'), icon: '🎯' },
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
        <section
          className="animate-fade-in-up"
          style={{
            position: 'relative',
            borderRadius: 16,
            padding: 24,
            background: '#ffffff',
            border: '2px solid #0D1B2A',
            boxShadow: '0 12px 32px rgba(0,40,104,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Franja tricolor decorativa USA/MEX/CAN */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background:
                'linear-gradient(90deg, #C8102E 0%, #C8102E 33%, #FFFFFF 33%, #FFFFFF 66%, #002868 66%, #002868 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: '#006847',
            }}
          />
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Left: title + progress */}
            <div className="flex-1">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: 'Oswald, sans-serif',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  background: 'linear-gradient(90deg,#C8102E,#002868)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: 999,
                  marginBottom: 8,
                }}
              >
                🇺🇸 🇲🇽 🇨🇦 · FIFA WORLD CUP 2026
              </span>
              <h1
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 38,
                  fontWeight: 900,
                  margin: '4px 0 16px',
                  letterSpacing: 1,
                  color: '#002868',
                  textShadow: '2px 2px 0 rgba(200,16,46,0.15)',
                }}
              >
                {t('album.myAlbum')}
              </h1>
              <div className="flex flex-col gap-2 max-w-sm">
                <div className="flex justify-between items-baseline text-sm">
                  <span style={{ fontWeight: 700, color: '#002868' }}>
                    {pct}% {t('album.completed')}
                  </span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>
                    {pastedCount} / {32 * 10} {t('album.stickered')} · {totalStickers}{' '}
                    {t('album.obtained')}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 12,
                    borderRadius: 999,
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    className="transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #C8102E 0%, #FFFFFF 50%, #002868 100%)',
                      boxShadow: '0 0 12px rgba(0,40,104,0.4)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: coins + pack actions */}
            <div className="flex flex-col gap-3 min-w-[220px]">
              {/* Coins — azul USA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '2px solid #002868',
                  boxShadow: '0 2px 8px rgba(0,40,104,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>🪙</span>
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        color: '#64748b',
                        fontWeight: 600,
                        margin: 0,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {t('album.coins')}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: 22,
                        fontWeight: 800,
                        color: '#002868',
                        margin: 0,
                      }}
                    >
                      {coins}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleBuyPack}
                  disabled={coins < PACK_COST}
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: coins >= PACK_COST ? '#C8102E' : '#e2e8f0',
                    color: coins >= PACK_COST ? '#fff' : '#94a3b8',
                    border: 'none',
                    cursor: coins >= PACK_COST ? 'pointer' : 'not-allowed',
                    fontFamily: 'Oswald, sans-serif',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    boxShadow: coins >= PACK_COST ? '0 2px 8px rgba(200,16,46,0.35)' : 'none',
                  }}
                >
                  +1 {t('album.pack')} ({PACK_COST}🪙)
                </button>
              </div>

              {/* Pack count + abrir — rojo USA/MEX/CAN */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '2px solid #C8102E',
                  }}
                >
                  <span style={{ fontSize: 18 }}>📦</span>
                  <span
                    style={{
                      fontFamily: 'Oswald, sans-serif',
                      fontWeight: 800,
                      fontSize: 18,
                      color: '#C8102E',
                    }}
                  >
                    {packs}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {t('album.packs')}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                  {t('album.openedInDB')} {paquetesAbiertos}
                </div>
                <button
                  onClick={() => void handleOpenPack(false)}
                  disabled={packs < 1 || openingPack}
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    borderRadius: 10,
                    background:
                      packs > 0 ? 'linear-gradient(135deg, #C8102E 0%, #002868 100%)' : '#f1f5f9',
                    color: packs > 0 ? '#fff' : '#94a3b8',
                    border: 'none',
                    cursor: packs > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: packs > 0 ? '0 4px 14px rgba(0,40,104,0.4)' : 'none',
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    opacity: openingPack ? 0.6 : 1,
                  }}
                >
                  {openingPack ? t('album.opening') : `✨ ${t('album.openPack')}`}
                </button>
              </div>

              {/* Free pack — verde MEX */}
              <button
                onClick={() => void handleOpenPack(true)}
                disabled={!freeReady || openingPack}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: freeReady ? '#006847' : '#f1f5f9',
                  color: freeReady ? '#fff' : '#94a3b8',
                  border: freeReady ? '2px solid #006847' : '1px solid rgba(0,0,0,0.06)',
                  cursor: freeReady ? 'pointer' : 'not-allowed',
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  boxShadow: freeReady ? '0 3px 12px rgba(0,104,71,0.35)' : 'none',
                }}
              >
                {freeReady
                  ? `🎁 ${t('album.freePack')}`
                  : `⏳ ${t('album.freePack')}: ${countdown}`}
              </button>
            </div>
          </div>
        </section>

        {/* ── Tab bar — paleta tricolor ── */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            borderRadius: 12,
            background: '#ffffff',
            border: '2px solid #0D1B2A',
            width: 'fit-content',
            boxShadow: '0 4px 12px rgba(0,40,104,0.08)',
          }}
        >
          {tabs.map((t, idx) => {
            const accents = ['#002868', '#C8102E', '#006847', '#0D1B2A'];
            const accent = accents[idx % accents.length];
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  background: isActive ? accent : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: isActive ? `0 2px 8px ${accent}55` : 'none',
                  fontFamily: 'Oswald, sans-serif',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {t.icon} {t.label}
              </button>
            );
          })}
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
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '40px 32px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {error.includes('sesión') ? '🔒' : '⚠️'}
            </div>
            <p
              style={{
                color: '#0f172a',
                fontWeight: 600,
                fontSize: 16,
                fontFamily: 'Oswald, sans-serif',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              {error.includes('sesión') ? 'Sesión requerida' : 'Error de conexión'}
            </p>
            <p
              style={{
                color: '#64748b',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                marginBottom: 24,
              }}
            >
              {error}
            </p>
            <button
              onClick={() => void loadLaminas()}
              style={{
                padding: '10px 28px',
                background: 'linear-gradient(90deg, #002868, #C8102E)',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                letterSpacing: 1,
              }}
            >
              🔄 Reintentar
            </button>
          </div>
        ) : (
          <>
            {tab === 'album' && (
              <section className="animate-fade-in">
                <AlbumBook
                  laminas={todasLaminas.length > 0 ? todasLaminas : laminas}
                  onPegar={handlePegar}
                  pegandoId={pegandoId}
                />
              </section>
            )}

            {tab === 'cromos' && (
              <section
                className="card-base p-6 animate-fade-in"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                }}
              >
                <Inventory laminas={laminas} onPegar={handlePegar} onVender={handleVender} />
              </section>
            )}

            {tab === 'intercambios' && (
              <section
                className="card-base p-6 animate-fade-in"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16 }}
              >
                <Trades laminas={laminas} onAccept={handleTradeAccept} />
              </section>
            )}

            {tab === 'misiones' && (
              <section
                className="card-base p-6 animate-fade-in"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16 }}
              >
                <Missions laminas={laminas} coins={coins} onClaim={handleClaimMission} />
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
