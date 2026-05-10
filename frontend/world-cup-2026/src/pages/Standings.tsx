import { useState, useEffect } from 'react';
import type { FdStandingsGroup, FdTableEntry } from '../types';
import { fetchStandings, groupLabel } from '../services/footballApi';
import { RefreshCw, AlertCircle, TrendingUp, BarChart3, Grid3X3 } from 'lucide-react';

// ── FIFA WC 2026 Official Groups (A–L) ────────────────────────────────────────
interface GroupTeam {
  name: string;
  flag: string;
  tbd?: boolean;
}
interface WC2026Group {
  id: string;
  teams: GroupTeam[];
}

const WC2026_GROUPS: WC2026Group[] = [
  {
    id: 'A',
    teams: [
      { name: 'México', flag: '🇲🇽' },
      { name: 'Sudáfrica', flag: '🇿🇦' },
      { name: 'Corea del Sur', flag: '🇰🇷' },
      { name: 'Repesca', flag: '🔁', tbd: true },
    ],
  },
  {
    id: 'B',
    teams: [
      { name: 'Canadá', flag: '🇨🇦' },
      { name: 'Repesca', flag: '🔁', tbd: true },
      { name: 'Qatar', flag: '🇶🇦' },
      { name: 'Suiza', flag: '🇨🇭' },
    ],
  },
  {
    id: 'C',
    teams: [
      { name: 'Brasil', flag: '🇧🇷' },
      { name: 'Marruecos', flag: '🇲🇦' },
      { name: 'Haití', flag: '🇭🇹' },
      { name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    ],
  },
  {
    id: 'D',
    teams: [
      { name: 'USA', flag: '🇺🇸' },
      { name: 'Paraguay', flag: '🇵🇾' },
      { name: 'Australia', flag: '🇦🇺' },
      { name: 'Repesca', flag: '🔁', tbd: true },
    ],
  },
  {
    id: 'E',
    teams: [
      { name: 'Alemania', flag: '🇩🇪' },
      { name: 'Curazao', flag: '🇨🇼' },
      { name: 'Costa de Marfil', flag: '🇨🇮' },
      { name: 'Ecuador', flag: '🇪🇨' },
    ],
  },
  {
    id: 'F',
    teams: [
      { name: 'Países Bajos', flag: '🇳🇱' },
      { name: 'Japón', flag: '🇯🇵' },
      { name: 'Repesca', flag: '🔁', tbd: true },
      { name: 'Túnez', flag: '🇹🇳' },
    ],
  },
  {
    id: 'G',
    teams: [
      { name: 'Bélgica', flag: '🇧🇪' },
      { name: 'Egipto', flag: '🇪🇬' },
      { name: 'Irán', flag: '🇮🇷' },
      { name: 'Nueva Zelanda', flag: '🇳🇿' },
    ],
  },
  {
    id: 'H',
    teams: [
      { name: 'España', flag: '🇪🇸' },
      { name: 'Cabo Verde', flag: '🇨🇻' },
      { name: 'Arabia Saudí', flag: '🇸🇦' },
      { name: 'Uruguay', flag: '🇺🇾' },
    ],
  },
  {
    id: 'I',
    teams: [
      { name: 'Francia', flag: '🇫🇷' },
      { name: 'Senegal', flag: '🇸🇳' },
      { name: 'Repesca', flag: '🔁', tbd: true },
      { name: 'Noruega', flag: '🇳🇴' },
    ],
  },
  {
    id: 'J',
    teams: [
      { name: 'Argentina', flag: '🇦🇷' },
      { name: 'Argelia', flag: '🇩🇿' },
      { name: 'Austria', flag: '🇦🇹' },
      { name: 'Jordania', flag: '🇯🇴' },
    ],
  },
  {
    id: 'K',
    teams: [
      { name: 'Portugal', flag: '🇵🇹' },
      { name: 'Repesca', flag: '🔁', tbd: true },
      { name: 'Uzbekistán', flag: '🇺🇿' },
      { name: 'Colombia', flag: '🇨🇴' },
    ],
  },
  {
    id: 'L',
    teams: [
      { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { name: 'Croacia', flag: '🇭🇷' },
      { name: 'Ghana', flag: '🇬🇭' },
      { name: 'Panamá', flag: '🇵🇦' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
type Tab = 'general' | 'grupos';

export function Standings() {
  const [groups, setGroups] = useState<FdStandingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('general');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStandings();
      const groupStage = data.filter((g) => g.stage === 'GROUP_STAGE' && g.type === 'TOTAL');
      setGroups(groupStage);
    } catch {
      setError('No se pudo cargar la tabla. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-2xl mx-auto w-full pb-28 md:pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Tabla <span className="gradient-text">Posiciones</span>
          </h1>
          <p className="text-text-muted mt-1">FIFA World Cup 2026 · México / EE.UU. / Canadá</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-lg glass hover:bg-bg-elevated transition-all text-text-secondary disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Mobile tabs ── */}
      <div className="flex lg:hidden gap-2 mb-6">
        <button
          onClick={() => setTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'general'
              ? 'gradient-primary text-white shadow-md'
              : 'glass text-text-secondary hover:bg-bg-elevated'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Tabla General
        </button>
        <button
          onClick={() => setTab('grupos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'grupos'
              ? 'gradient-primary text-white shadow-md'
              : 'glass text-text-secondary hover:bg-bg-elevated'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          Grupos A–L
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-6 p-4 glass rounded-xl flex items-center gap-3 text-accent">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ── Two-column layout (desktop) / Tabs (mobile) ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ══════════════════════════════════════════════════════
            LEFT — Tabla General de Posiciones
        ══════════════════════════════════════════════════════ */}
        <section className={`flex-1 min-w-0 ${tab === 'grupos' ? 'hidden lg:block' : ''}`}>
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-headline text-lg font-bold text-text-primary tracking-tight">
              Tabla General de Posiciones
            </h2>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl h-52 animate-pulse" />
              ))}
            </div>
          )}

          {/* Tournament not started yet — show all groups flat */}
          {!loading && !error && groups.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">⏳</p>
              <h3 className="text-lg font-bold text-text-primary mb-1">
                ¡El torneo aún no ha comenzado!
              </h3>
              <p className="text-sm text-text-muted mb-5">
                La fase de grupos arranca el{' '}
                <span className="text-primary font-semibold">11 de junio de 2026</span>. La tabla
                general se actualizará automáticamente con cada partido.
              </p>
              <div className="flex justify-center gap-8 text-sm text-text-muted">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-primary">48</span>
                  <span>Selecciones</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-primary">12</span>
                  <span>Grupos</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-primary">104</span>
                  <span>Partidos</span>
                </div>
              </div>
            </div>
          )}

          {/* API data — groups grid */}
          {!loading && groups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <ApiGroupTable key={group.group} group={group} />
              ))}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════
            RIGHT — Grupos A–L (FIFA WC 2026)
        ══════════════════════════════════════════════════════ */}
        <aside
          className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 ${tab === 'general' ? 'hidden lg:block' : ''}`}
        >
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
              <Grid3X3 className="w-4 h-4 text-secondary" />
            </div>
            <h2 className="font-headline text-lg font-bold text-text-primary tracking-tight">
              Grupos A – L
            </h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              FIFA WC 2026
            </span>
          </div>

          {/* Scrollable groups list */}
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-thin">
            {WC2026_GROUPS.map((group) => (
              <StaticGroupCard key={group.id} group={group} />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

// ── API-based group table (used when tournament data is live) ─────────────────
function ApiGroupTable({ group }: { group: FdStandingsGroup }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="gradient-primary px-4 py-2.5 flex items-center justify-between">
        <h3 className="font-headline font-bold text-white tracking-wide text-sm">
          {groupLabel(group.group)}
        </h3>
        <TrendingUp className="w-4 h-4 text-white/70" />
      </div>
      <div className="grid grid-cols-[auto_1fr_repeat(5,auto)] gap-x-3 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border">
        <span>#</span>
        <span>Equipo</span>
        <span className="text-center">PJ</span>
        <span className="text-center">G</span>
        <span className="text-center">E</span>
        <span className="text-center">P</span>
        <span className="text-center text-primary">Pts</span>
      </div>
      {group.table.map((entry, idx) => (
        <ApiStandingRow key={entry.team.id} entry={entry} qualify={idx < 2} />
      ))}
    </div>
  );
}

function ApiStandingRow({ entry, qualify }: { entry: FdTableEntry; qualify: boolean }) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr_repeat(5,auto)] gap-x-3 px-4 py-2 items-center border-b border-border/50 last:border-0 hover:bg-bg-elevated/50 transition-colors text-sm ${qualify ? 'bg-primary/5' : ''}`}
    >
      <span className={`w-5 text-center font-bold ${qualify ? 'text-primary' : 'text-text-muted'}`}>
        {entry.position}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={entry.team.crest}
          alt={entry.team.name}
          className="w-5 h-5 object-contain shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="font-medium text-text-primary truncate">
          {entry.team.shortName || entry.team.tla}
        </span>
      </div>
      <span className="text-xs text-text-secondary text-center">{entry.playedGames}</span>
      <span className="text-xs text-text-secondary text-center">{entry.won}</span>
      <span className="text-xs text-text-secondary text-center">{entry.draw}</span>
      <span className="text-xs text-text-secondary text-center">{entry.lost}</span>
      <span className="text-sm font-black text-primary text-center">{entry.points}</span>
    </div>
  );
}

// ── Static FIFA WC 2026 group card ────────────────────────────────────────────
function StaticGroupCard({ group }: { group: WC2026Group }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-elevated border-b border-border">
        <span className="font-headline font-extrabold text-primary tracking-widest text-sm uppercase">
          Grupo {group.id}
        </span>
        <TrendingUp className="w-3.5 h-3.5 text-text-muted" />
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[auto_1fr_repeat(4,auto)] gap-x-2 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted border-b border-border/50">
        <span className="w-4" />
        <span>Equipo</span>
        <span className="w-6 text-center">PJ</span>
        <span className="w-5 text-center">G</span>
        <span className="w-5 text-center">P</span>
        <span className="w-6 text-center text-primary">Pts</span>
      </div>

      {/* Team rows */}
      {group.teams.map((team, idx) => (
        <div
          key={team.name + idx}
          className={`grid grid-cols-[auto_1fr_repeat(4,auto)] gap-x-2 px-3 py-2 items-center border-b border-border/40 last:border-0 hover:bg-bg-elevated/40 transition-colors ${idx < 2 ? 'bg-primary/5' : ''}`}
        >
          {/* Position */}
          <span
            className={`w-4 text-center text-xs font-bold ${idx < 2 ? 'text-primary' : 'text-text-muted'}`}
          >
            {idx + 1}
          </span>

          {/* Flag + Name */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base leading-none">{team.flag}</span>
            <span
              className={`text-xs font-medium truncate ${team.tbd ? 'text-text-muted italic' : 'text-text-primary'}`}
            >
              {team.name}
            </span>
          </div>

          {/* Stats — all 0 pre-tournament */}
          <span className="w-6 text-[11px] text-text-muted text-center">0</span>
          <span className="w-5 text-[11px] text-text-muted text-center">0</span>
          <span className="w-5 text-[11px] text-text-muted text-center">0</span>
          <span className="w-6 text-[11px] font-black text-primary text-center">0</span>
        </div>
      ))}
    </div>
  );
}
