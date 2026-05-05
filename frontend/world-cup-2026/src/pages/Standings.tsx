import { useState, useEffect } from 'react';
import type { FdStandingsGroup, FdTableEntry } from '../types';
import { fetchStandings, groupLabel } from '../services/footballApi';
import { RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

export function Standings() {
  const [groups, setGroups] = useState<FdStandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStandings();
      // Solo mostrar grupos de fase de grupos con tipo TOTAL
      const groupStage = data.filter(g => g.stage === 'GROUP_STAGE' && g.type === 'TOTAL');
      setGroups(groupStage);
    } catch {
      setError('No se pudo cargar la tabla. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-xl mx-auto w-full pb-28 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Tabla <span className="gradient-text">Grupos</span>
          </h1>
          <p className="text-text-muted mt-1">FIFA World Cup 2026 — Fase de Grupos</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-lg glass hover:bg-bg-elevated transition-all text-text-secondary disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 glass rounded-xl flex items-center gap-3 text-accent">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      )}

      {/* Tournament not started yet */}
      {!loading && !error && groups.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center max-w-md mx-auto">
          <p className="text-5xl mb-4">⏳</p>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            ¡El torneo aún no ha comenzado!
          </h3>
          <p className="text-text-muted mb-4">
            La fase de grupos arranca el{' '}
            <span className="text-primary font-semibold">11 de junio de 2026</span>.
            La tabla de posiciones se actualizará automáticamente cuando se jueguen los primeros partidos.
          </p>
          <div className="flex justify-center gap-6 text-sm text-text-muted mt-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary">32</span>
              <span>Selecciones</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary">8</span>
              <span>Grupos</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary">104</span>
              <span>Partidos</span>
            </div>
          </div>
        </div>
      )}

      {/* Groups grid */}
      {!loading && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map(group => (
            <GroupTable key={group.group} group={group} />
          ))}
        </div>
      )}
    </main>
  );
}

function GroupTable({ group }: { group: FdStandingsGroup }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Group header */}
      <div className="gradient-primary px-5 py-3 flex items-center justify-between">
        <h2 className="font-headline font-bold text-text-inverse tracking-wide">
          {groupLabel(group.group)}
        </h2>
        <TrendingUp className="w-4 h-4 text-white/70" />
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_repeat(5,auto)] gap-x-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border">
        <span>#</span>
        <span>Equipo</span>
        <span className="text-center">PJ</span>
        <span className="text-center">G</span>
        <span className="text-center">E</span>
        <span className="text-center">P</span>
        <span className="text-center font-black text-primary">Pts</span>
      </div>

      {/* Rows */}
      {group.table.map((entry, idx) => (
        <StandingRow key={entry.team.id} entry={entry} qualify={idx < 2} />
      ))}
    </div>
  );
}

function StandingRow({ entry, qualify }: { entry: FdTableEntry; qualify: boolean }) {
  return (
    <div className={`grid grid-cols-[auto_1fr_repeat(5,auto)] gap-x-3 px-4 py-2.5 items-center border-b border-border/50 last:border-0 hover:bg-bg-elevated/50 transition-colors ${qualify ? 'bg-primary/5' : ''}`}>
      {/* Position */}
      <span className={`w-5 text-center text-sm font-bold ${qualify ? 'text-primary' : 'text-text-muted'}`}>
        {entry.position}
      </span>

      {/* Team */}
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={entry.team.crest}
          alt={entry.team.name}
          className="w-5 h-5 object-contain shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span className="text-sm font-medium text-text-primary truncate">
          {entry.team.shortName || entry.team.tla}
        </span>
      </div>

      {/* Stats */}
      <span className="text-xs text-text-secondary text-center">{entry.playedGames}</span>
      <span className="text-xs text-text-secondary text-center">{entry.won}</span>
      <span className="text-xs text-text-secondary text-center">{entry.draw}</span>
      <span className="text-xs text-text-secondary text-center">{entry.lost}</span>
      <span className="text-sm font-black text-primary text-center">{entry.points}</span>
    </div>
  );
}
