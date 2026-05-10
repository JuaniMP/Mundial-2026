import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { EstadioApi } from '../types';
import { fetchEstadios } from '../services/footballApi';
import { RefreshCw, AlertCircle, MapPin, Users, Search } from 'lucide-react';

// ── Fix Leaflet default icons in Vite ────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Country flags helper ──────────────────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  USA: '🇺🇸',
  Canada: '🇨🇦',
  México: '🇲🇽',
};

function flag(pais: string) {
  return COUNTRY_FLAGS[pais] ?? '🏟️';
}

// ── Custom Leaflet marker icon ────────────────────────────────────────────────
function stadiumIcon(selected: boolean) {
  const color = selected ? '#e8572a' : '#7c3aed';
  const size = selected ? 36 : 28;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 10px rgba(0,0,0,0.45);
      transition:all .2s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// ── Fly-to helper (child of MapContainer) ────────────────────────────────────
function FlyToSelected({ stadium }: { stadium: EstadioApi | null }) {
  const map = useMap();
  useEffect(() => {
    if (stadium) {
      map.flyTo([stadium.lat, stadium.lng], 13, { duration: 1.2 });
    }
  }, [stadium, map]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

export function Stadiums() {
  const [stadiums, setStadiums] = useState<EstadioApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EstadioApi | null>(null);
  const [search, setSearch] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEstadios();
      setStadiums(data);
      if (data.length > 0) setSelected(data[0]);
    } catch {
      setError('No se pudo cargar los estadios. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = stadiums.filter(
    (s) =>
      s.nombre.toLowerCase().includes(search.toLowerCase()) ||
      s.ciudad.toLowerCase().includes(search.toLowerCase()) ||
      s.pais.toLowerCase().includes(search.toLowerCase()),
  );

  // Scroll selected stadium into view in the list
  useEffect(() => {
    if (!selected || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${selected.id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selected]);

  const totalCapacity = stadiums.reduce((acc, s) => acc + s.capacidad, 0);

  return (
    <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-xl mx-auto w-full pb-28 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Estadios <span className="gradient-text">2026</span>
          </h1>
          <p className="text-text-muted mt-1">
            FIFA World Cup — {stadiums.length} sedes • USA, Canadá, México
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-lg glass hover:bg-bg-elevated transition-all text-text-secondary disabled:opacity-50"
          title="Recargar"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats strip */}
      {!loading && stadiums.length > 0 && (
        <div className="flex gap-4 mb-6 flex-wrap">
          {[
            {
              label: 'Sedes USA',
              value: stadiums.filter((s) => s.pais === 'USA').length,
              flag: '🇺🇸',
            },
            {
              label: 'Sedes Canadá',
              value: stadiums.filter((s) => s.pais === 'Canada').length,
              flag: '🇨🇦',
            },
            {
              label: 'Sedes México',
              value: stadiums.filter((s) => s.pais === 'México').length,
              flag: '🇲🇽',
            },
            { label: 'Capacidad total', value: totalCapacity.toLocaleString('es-CO'), flag: '🏟️' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">{stat.flag}</span>
              <div>
                <p className="text-sm font-black text-primary leading-none">{stat.value}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 glass rounded-xl flex items-center gap-3 text-accent">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 glass rounded-2xl h-[480px] animate-pulse" />
          <div className="w-full lg:w-80 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Map + list layout */}
      {!loading && stadiums.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ── Leaflet Map ──────────────────────────────────────────────── */}
          <div
            className="flex-1 rounded-2xl overflow-hidden border border-border shadow-lg"
            style={{ minHeight: 480 }}
          >
            <MapContainer
              center={[39.5, -98.35]}
              zoom={4}
              style={{ width: '100%', height: '100%', minHeight: 480 }}
              scrollWheelZoom
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <FlyToSelected stadium={selected} />
              {stadiums.map((s) => (
                <Marker
                  key={s.id}
                  position={[s.lat, s.lng]}
                  icon={stadiumIcon(selected?.id === s.id)}
                  eventHandlers={{ click: () => setSelected(s) }}
                >
                  <Popup>
                    <div className="text-sm font-semibold">
                      {flag(s.pais)} {s.nombre}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {s.ciudad}, {s.pais}
                    </div>
                    <div className="text-xs mt-1">
                      <span className="font-bold">{s.capacidad.toLocaleString('es-CO')}</span>{' '}
                      espectadores
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* ── Stadium List Sidebar ─────────────────────────────────────── */}
          <div className="w-full lg:w-80 flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar estadio o ciudad…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50 bg-transparent"
              />
            </div>

            {/* List */}
            <div
              ref={listRef}
              className="flex flex-col gap-2 overflow-y-auto"
              style={{ maxHeight: 420 }}
            >
              {filtered.map((s) => (
                <StadiumCard
                  key={s.id}
                  stadium={s}
                  isSelected={selected?.id === s.id}
                  onClick={() => setSelected(s)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-text-muted text-center py-6">Sin resultados</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected stadium detail card */}
      {selected && !loading && (
        <div className="mt-6 glass rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{flag(selected.pais)}</span>
              <h2 className="font-headline text-xl font-bold text-text-primary">
                {selected.nombre}
              </h2>
            </div>
            <p className="text-text-muted text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {selected.direccion}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-3">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-sm font-black text-text-primary">
                  {selected.capacidad.toLocaleString('es-CO')}
                </p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Capacidad</p>
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-sm font-black text-text-primary">{selected.ciudad}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  {selected.pais}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ── StadiumCard ───────────────────────────────────────────────────────────────

function StadiumCard({
  stadium,
  isSelected,
  onClick,
}: {
  stadium: EstadioApi;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-id={stadium.id}
      onClick={onClick}
      className={`w-full text-left glass rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all hover:bg-bg-elevated ${
        isSelected ? 'ring-1 ring-primary bg-primary/5' : ''
      }`}
    >
      <span className="text-xl shrink-0">{flag(stadium.pais)}</span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-text-primary'}`}
        >
          {stadium.nombre}
        </p>
        <p className="text-[11px] text-text-muted truncate">
          {stadium.ciudad}, {stadium.pais}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-text-secondary">
          {(stadium.capacidad / 1000).toFixed(0)}k
        </p>
        <p className="text-[10px] text-text-muted">cap</p>
      </div>
    </button>
  );
}
