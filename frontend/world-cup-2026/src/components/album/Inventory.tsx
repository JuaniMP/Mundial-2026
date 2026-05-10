import { useState, useMemo } from 'react';
import { StickerCard } from './StickerCard';
import type { LaminaAlbum } from './albumApi';
import { parseRareza, RARITY } from './rarityUtils';
import { getTeamForLamina, TEAMS } from './teamColors';

interface InventoryProps {
  laminas: LaminaAlbum[];
  onPegar: (laminaId: number) => void;
  onVender: (laminaId: number) => void;
}

type FilterRareza = 'all' | 'COMUN' | 'RARO' | 'EPICO' | 'LEGENDARIO';
type FilterEstado = 'all' | 'pegadas' | 'no-pegadas' | 'repetidas';
type SortBy = 'id' | 'rarity' | 'team' | 'name';

const SORT_OPTS: { value: SortBy; label: string }[] = [
  { value: 'id',     label: 'Número' },
  { value: 'rarity', label: 'Rareza' },
  { value: 'team',   label: 'Equipo' },
  { value: 'name',   label: 'Nombre' },
];

const RARITY_ORDER: Record<string, number> = { LEGENDARIO: 0, EPICO: 1, RARO: 2, COMUN: 3 };

export function Inventory({ laminas, onPegar, onVender }: InventoryProps) {
  const [filterRareza, setFilterRareza] = useState<FilterRareza>('all');
  const [filterEstado, setFilterEstado] = useState<FilterEstado>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('id');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...laminas];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l => l.nombreJugador.toLowerCase().includes(q));
    }
    if (filterRareza !== 'all') {
      list = list.filter(l => parseRareza(l.rareza) === filterRareza);
    }
    if (filterEstado !== 'all') {
      if (filterEstado === 'pegadas')    list = list.filter(l => l.estaPegada);
      if (filterEstado === 'no-pegadas') list = list.filter(l => !l.estaPegada);
      if (filterEstado === 'repetidas')  list = list.filter(l => l.cantidadRepetidas > 1);
    }
    if (filterTeam !== 'all') {
      list = list.filter(l => getTeamForLamina(l.idLamina).shortName === filterTeam);
    }

    list.sort((a, b) => {
      if (sortBy === 'id')     return a.idLamina - b.idLamina;
      if (sortBy === 'rarity') return (RARITY_ORDER[parseRareza(a.rareza)] ?? 9) - (RARITY_ORDER[parseRareza(b.rareza)] ?? 9);
      if (sortBy === 'team')   return getTeamForLamina(a.idLamina).name.localeCompare(getTeamForLamina(b.idLamina).name);
      if (sortBy === 'name')   return a.nombreJugador.localeCompare(b.nombreJugador);
      return 0;
    });

    return list;
  }, [laminas, filterRareza, filterEstado, filterTeam, sortBy, search]);

  // Stats
  const totalOwned   = laminas.length;
  const totalPasted  = laminas.filter(l => l.estaPegada).length;
  const totalRepeated = laminas.filter(l => l.cantidadRepetidas > 1).length;

  const pill = (active: boolean, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: 999,
        border: `1px solid ${active ? '#3b82f6' : 'rgba(255,255,255,0.12)'}`,
        background: active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
        color: active ? '#93c5fd' : 'rgba(255,255,255,0.55)',
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Total cromos', value: totalOwned, color: '#60a5fa' },
          { label: 'Pegados',      value: totalPasted, color: '#34d399' },
          { label: 'Repetidos',    value: totalRepeated, color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '8px 14px',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'Oswald,sans-serif' }}>{s.value}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter,sans-serif' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Search + sort ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar jugador…"
          style={{
            flex: 1, minWidth: 180,
            padding: '7px 12px',
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)', color: '#fff',
            fontSize: 13, outline: 'none', fontFamily: 'Inter,sans-serif',
          }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          style={{
            padding: '7px 10px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            background: '#1e293b', color: '#fff',
            fontSize: 12, fontFamily: 'Inter,sans-serif', cursor: 'pointer',
          }}
        >
          {SORT_OPTS.map(o => <option key={o.value} value={o.value}>↕ {o.label}</option>)}
        </select>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {/* Rareza */}
        {pill(filterRareza === 'all', 'Todos', () => setFilterRareza('all'))}
        {(['COMUN','RARO','EPICO','LEGENDARIO'] as const).map(rz =>
          pill(filterRareza === rz, RARITY[rz].label, () => setFilterRareza(filterRareza === rz ? 'all' : rz))
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {/* Estado */}
        {pill(filterEstado === 'all',       'Todo',       () => setFilterEstado('all'))}
        {pill(filterEstado === 'pegadas',    'Pegadas',    () => setFilterEstado(filterEstado === 'pegadas'    ? 'all' : 'pegadas'))}
        {pill(filterEstado === 'no-pegadas', 'Sin pegar',  () => setFilterEstado(filterEstado === 'no-pegadas' ? 'all' : 'no-pegadas'))}
        {pill(filterEstado === 'repetidas',  'Repetidas',  () => setFilterEstado(filterEstado === 'repetidas'  ? 'all' : 'repetidas'))}
      </div>

      {/* Team filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 72, overflowY: 'auto' }}>
        {pill(filterTeam === 'all', '🌍 Todos', () => setFilterTeam('all'))}
        {TEAMS.map(t => pill(filterTeam === t.shortName, `${t.flag} ${t.shortName}`, () => setFilterTeam(filterTeam === t.shortName ? 'all' : t.shortName)))}
      </div>

      {/* ── Results count ── */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif', margin: 0 }}>
        {filtered.length} cromos encontrados
      </p>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,sans-serif' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🃏</div>
          <p>No hay cromos que coincidan con los filtros</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {filtered.map(l => (
            <div key={l.idLamina} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <StickerCard
                idLamina={l.idLamina}
                nombreJugador={l.nombreJugador}
                rareza={l.rareza}
                estaPegada={l.estaPegada}
                cantidadRepetidas={l.cantidadRepetidas}
                size="sm"
                showRepeatBadge
              />
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 4 }}>
                {!l.estaPegada && (
                  <button
                    onClick={() => onPegar(l.idLamina)}
                    style={{
                      padding: '3px 8px', borderRadius: 99,
                      background: 'rgba(59,130,246,0.2)',
                      border: '1px solid rgba(59,130,246,0.4)',
                      color: '#93c5fd', fontSize: 10, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                    }}
                  >
                    Pegar
                  </button>
                )}
                {l.cantidadRepetidas > 1 && (
                  <button
                    onClick={() => onVender(l.idLamina)}
                    style={{
                      padding: '3px 8px', borderRadius: 99,
                      background: 'rgba(251,191,36,0.15)',
                      border: '1px solid rgba(251,191,36,0.35)',
                      color: '#fcd34d', fontSize: 10, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                    }}
                  >
                    Vender
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
