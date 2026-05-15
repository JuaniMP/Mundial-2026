import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  getMyAlbum,
  createMyAlbum,
  getMyLaminas,
  getPacketesHoy,
  abrirPaquete,
  pegarLamina,
} from '../services/albumApi';
import type { AlbumResponse, LaminaAlbumResponse, PacketesHoyResponse } from '../services/albumApi';
import { PackOpener } from '../components/album/PackOpener';
import { AlbumBook } from '../components/album/AlbumBook';

function PackCounter({ abiertos, limite }: { abiertos: number; limite: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-muted">Sobres hoy:</span>
      <div className="flex gap-1.5">
        {Array.from({ length: limite }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border-2 transition-colors ${
              i < abiertos ? 'bg-primary border-primary' : 'bg-transparent border-border'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-text-muted">
        {limite - abiertos} restante{limite - abiertos !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4 text-center flex-1 min-w-0">
      <div className="font-headline text-3xl font-extrabold text-primary">{value}</div>
      <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function Album() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState<AlbumResponse | null>(null);
  const [laminas, setLaminas] = useState<LaminaAlbumResponse[]>([]);
  const [paquetes, setPaquetes] = useState<PacketesHoyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sobres' | 'coleccion'>('sobres');

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      let albumData: AlbumResponse;
      try {
        albumData = await getMyAlbum(token);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          albumData = await createMyAlbum(token);
        } else {
          throw err;
        }
      }
      const [laminasData, paquetesData] = await Promise.all([
        getMyLaminas(token),
        getPacketesHoy(token),
      ]);
      setAlbum(albumData);
      setLaminas(laminasData);
      setPaquetes(paquetesData);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) || 'Error al cargar el álbum'
        : 'Error al cargar el álbum';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleAbrirPaquete = async (): Promise<LaminaAlbumResponse[]> => {
    if (!token) throw new Error('Sin sesión');
    const { laminas: nuevas } = await abrirPaquete(token);
    await load();
    return nuevas;
  };

  const handlePegar = async (laminaId: number) => {
    if (!token) return;
    try {
      const updated = await pegarLamina(token, laminaId);
      setAlbum(updated);
      setLaminas((prev) =>
        prev.map((l) => (l.idLamina === laminaId ? { ...l, estaPegada: true } : l)),
      );
    } catch {
      // silently ignore — the card will not update if backend rejected
    }
  };

  if (!token) {
    return (
      <main className="pt-20 pb-28 flex items-center justify-center min-h-[60vh]">
        <p className="text-text-muted">Inicia sesión para ver tu álbum.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pt-20 pb-28 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Cargando álbum...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-20 pb-28 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-accent font-semibold">{error}</p>
          <button
            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
            onClick={() => {
              setError(null);
              setLoading(true);
              load();
            }}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  const completado = album ? Math.round(album.porcentajeCompletado) : 0;

  return (
    <main className="pt-20 md:pt-24 pb-28 md:pb-12 max-w-screen-lg mx-auto w-full px-4 md:px-6 flex flex-col gap-8 flex-1">
      {/* Header */}
      <section className="card-base p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between animate-fade-in-up">
        <div>
          <span className="badge badge-secondary mb-2">Álbum Mundial 2026</span>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-text-primary">
            Mi <span className="gradient-text">Colección</span>
          </h1>
        </div>

        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <StatBox label="Completado" value={`${completado}%`} />
          <StatBox label="Pegadas" value={album?.laminasPegadas ?? 0} />
          <StatBox label="Obtenidas" value={laminas.length} />
        </div>
      </section>

      {/* Progress bar */}
      {album && (
        <div className="w-full h-2.5 bg-bg-elevated rounded-full border border-border overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${completado}%` }}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-elevated rounded-xl p-1 border border-border self-start">
        {(['sobres', 'coleccion'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab === 'sobres' ? '📦 Sobres' : '📖 Colección'}
          </button>
        ))}
      </div>

      {/* Sobres tab */}
      {activeTab === 'sobres' && (
        <section className="card-base p-6 md:p-10 flex flex-col items-center gap-8 animate-fade-in-up">
          {paquetes && <PackCounter abiertos={paquetes.abiertos} limite={paquetes.limite} />}
          <PackOpener
            paquetesRestantes={paquetes?.restantes ?? 0}
            onOpen={handleAbrirPaquete}
            onPegar={handlePegar}
          />
        </section>
      )}

      {/* Colección tab */}
      {activeTab === 'coleccion' && (
        <section className="card-base p-6 md:p-8 animate-fade-in-up">
          <h2 className="font-headline text-xl font-bold text-text-primary mb-4">Mis figuritas</h2>
          <AlbumBook laminas={laminas} onPegar={handlePegar} />
        </section>
      )}
    </main>
  );
}
