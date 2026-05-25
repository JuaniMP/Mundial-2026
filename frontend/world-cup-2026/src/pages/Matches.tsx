import { useState, useEffect } from 'react';
import type { FdMatch } from '../types';
import {
  fetchAllMatches,
  formatMatchDate,
  groupLabel,
  normalizeStage,
  stageLabel,
  statusBadge,
  type BadgeVariant,
} from '../services/footballApi';
import { Calendar, Clock, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ROUND_OF_32_MOCK } from '../data/mockData';
import { WORLD_CUP_2026_STADIUMS, findStadiumByName } from '../data/worldCup2026Stadiums';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Matches() {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<FdMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState('ALL');

  const STAGES = [
    { key: 'ALL', label: t('matches.stageAll') },
    { key: 'GROUP_STAGE', label: t('matches.stageGroups') },
    { key: 'ROUND_OF_32', label: t('matches.stageRound32') },
    { key: 'QUARTER_FINALS', label: t('matches.stageQuarters') },
    { key: 'SEMI_FINALS', label: t('matches.stageSemis') },
    { key: 'FINAL', label: t('matches.stageFinal') },
  ];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllMatches();
      setMatches(data);
    } catch {
      setError(t('matches.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const filtered =
    activeStage === 'ALL'
      ? matches
      : matches.filter((m) => normalizeStage(m.stage) === activeStage);

  // Si no hay partidos para ROUND_OF_32, usar fallback mock y avisar
  let displayedMatches: FdMatch[] = filtered;
  let usingFallback = false;
  if (activeStage === 'ROUND_OF_32' && filtered.length === 0) {
    // Console log para debugging

    console.info('Fallback activo: mostrando partidos provisionales ROUND_OF_32');
    displayedMatches = ROUND_OF_32_MOCK as unknown as FdMatch[];
    usingFallback = true;
  }

  // Agrupar por fecha para mostrar secciones
  const byDate = displayedMatches.reduce<Record<string, FdMatch[]>>((acc, m) => {
    const { date } = formatMatchDate(m.utcDate);
    acc[date] = [...(acc[date] ?? []), m];
    return acc;
  }, {});

  // navigation not used here

  return (
    <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-xl mx-auto w-full pb-28 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            {t('matches.title')} <span className="gradient-text">2026</span>
          </h1>
          <p className="text-text-muted mt-1">{t('matches.subtitle')}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-lg glass hover:bg-bg-elevated transition-all text-text-secondary disabled:opacity-50"
          title={t('common.reload') ?? 'Reload'}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stage filter tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveStage(s.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeStage === s.key
                ? 'gradient-primary text-text-inverse shadow-md'
                : 'glass text-text-secondary hover:text-text-primary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 glass rounded-xl flex items-center gap-3 text-accent">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      )}

      {/* No API key notice */}
      {!loading && !error && matches.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-4xl mb-4">🔑</p>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            {t('matches.apiKeyRequired')}
          </h3>
          <p className="text-text-muted mb-4">
            {t('matches.apiKeyBody')
              .split('football-data.org')
              .map((part, i) =>
                i === 0 ? (
                  <span key={i}>
                    {part}
                    <span className="text-primary font-semibold">football-data.org</span>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
          </p>
          <code className="text-xs bg-bg-elevated px-3 py-2 rounded-lg text-text-secondary block">
            FOOTBALL_DATA_KEY=tu_key_aqui
          </code>
        </div>
      )}

      {/* Match list grouped by date */}
      {!loading &&
        Object.entries(byDate).map(([date, dayMatches]) => (
          <section key={date} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                {date}
              </h2>
              {usingFallback && (
                <div className="mb-4">
                  <div className="inline-block bg-yellow-50 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                    {t('matches.fallbackNotice')}
                  </div>
                </div>
              )}
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dayMatches.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </div>
          </section>
        ))}
    </main>
  );
}

function MatchRow({ match }: { match: FdMatch }) {
  const navigate = useNavigate();
  const { time } = formatMatchDate(match.utcDate);
  const { label: statusLabel, color: statusColor } = statusBadge(match.status);
  const isFinished = match.status === 'FINISHED';
  const isLive = ['LIVE', 'IN_PLAY', 'PAUSED'].includes(match.status);

  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;

  return (
    <div
      className={`glass rounded-2xl p-5 transition-all hover:bg-bg-elevated ${isLive ? 'ring-1 ring-danger' : ''}`}
    >
      {/* Top row: group + status */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-text-muted font-medium">
          {match.group ? groupLabel(match.group) : stageLabel(match.stage)}
          {match.matchday ? ` • Jornada ${match.matchday}` : ''}
        </span>
        <Badge variant={statusColor as BadgeVariant}>{statusLabel}</Badge>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-3">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <img
            src={match.homeTeam.crest}
            alt={match.homeTeam.name}
            className="w-12 h-12 object-contain drop-shadow"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-sm font-bold text-text-primary text-center leading-tight">
            {match.homeTeam.shortName || match.homeTeam.tla}
          </span>
        </div>

        {/* Score / Time */}
        <div className="flex flex-col items-center shrink-0 px-2">
          {isFinished || isLive ? (
            <span
              className={`font-headline text-2xl font-black ${isLive ? 'text-danger' : 'gradient-text'}`}
            >
              {homeScore ?? 0} — {awayScore ?? 0}
            </span>
          ) : (
            <div className="flex flex-col items-center">
              <span className="font-headline text-xl font-bold text-text-primary">VS</span>
              <div className="flex items-center gap-1 text-text-muted mt-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{time}</span>
              </div>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <img
            src={match.awayTeam.crest}
            alt={match.awayTeam.name}
            className="w-12 h-12 object-contain drop-shadow"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-sm font-bold text-text-primary text-center leading-tight">
            {match.awayTeam.shortName || match.awayTeam.tla}
          </span>
        </div>
      </div>

      {/* Venue */}
      {/* No mostrar estadio/ciudad para partidos de fase de grupos */}
      {match.venue &&
        (() => {
          // Buscar el estadio en la lista oficial por nombre (coincidencia robusta)
          const found =
            findStadiumByName(match.venue ?? undefined) ??
            WORLD_CUP_2026_STADIUMS.find((s) => match.venue?.includes(s.nombre));
          const venueLabel = found ? `${found.nombre} • ${found.ciudad}` : match.venue;

          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (found) navigate('/stadiums', { state: { stadiumId: found.id } });
                else navigate('/stadiums');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (found) navigate('/stadiums', { state: { stadiumId: found.id } });
                  else navigate('/stadiums');
                }
              }}
              className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-text-muted cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs truncate">{venueLabel}</span>
            </div>
          );
        })()}
    </div>
  );
}
