import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Copy,
  Share2,
  Trophy,
  Lock,
  Save,
  AlertCircle,
  Medal,
  Users,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Button, PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import {
  getPollaById,
  getRanking,
  getMisPredicciones,
  guardarPrediccion,
  type Polla,
  type RankingEntry,
  type Prediccion,
} from '../services/pollasApi';
import { fetchAllMatches, formatMatchDate } from '../services/footballApi';
import type { FdMatch } from '../types';

type Tab = 'ranking' | 'predicciones';

const LOCK_MINUTES = 10;

function isLocked(utcDate: string): boolean {
  const kickoff = new Date(utcDate).getTime();
  return kickoff - Date.now() < LOCK_MINUTES * 60 * 1000;
}

function isUpcomingOrLive(m: FdMatch): boolean {
  return m.status !== 'FINISHED' && m.status !== 'CANCELLED' && m.status !== 'POSTPONED';
}

export function PollaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const pollaId = Number(id);

  const [polla, setPolla] = useState<Polla | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [misPredicciones, setMisPredicciones] = useState<Prediccion[]>([]);
  const [matches, setMatches] = useState<FdMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('ranking');
  const [copied, setCopied] = useState(false);

  const [drafts, setDrafts] = useState<Record<number, { home: number; away: number }>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [savedFlash, setSavedFlash] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Carga principal: si esto falla, no podemos renderizar.
      const p = await getPollaById(pollaId);
      setPolla(p);

      // Cargas secundarias en paralelo, tolerantes a fallos individuales.
      const [r, mp, allMatches] = await Promise.all([
        getRanking(pollaId).catch((e) => {
          console.error('Error cargando ranking:', e);
          return [] as RankingEntry[];
        }),
        getMisPredicciones(pollaId).catch((e) => {
          console.error('Error cargando mis predicciones:', e);
          return [] as Prediccion[];
        }),
        fetchAllMatches().catch(() => [] as FdMatch[]),
      ]);
      setRanking(r);
      setMisPredicciones(mp);
      setMatches(allMatches);

      const initial: Record<number, { home: number; away: number }> = {};
      mp.forEach((pred) => {
        initial[pred.apiPartidoId] = { home: pred.golesLocal, away: pred.golesVisitante };
      });
      setDrafts(initial);
    } catch (e) {
      console.error('Error cargando polla:', e);
      const msg =
        axios.isAxiosError(e)
          ? (e.response?.data?.message as string) || `${e.response?.status ?? ''} ${e.message}`
          : 'No se pudo cargar la polla.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(pollaId)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    load();
  }, [pollaId]);

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter(isUpcomingOrLive)
        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
        .slice(0, 30),
    [matches],
  );

  const compartirCodigo = async () => {
    if (!polla) return;
    const link = `${window.location.origin}/pollas?codigo=${polla.codigoAcceso}`;
    const texto = `¡Únete a mi polla "${polla.nombre}"! Código: ${polla.codigoAcceso}\n${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: polla.nombre, text: texto });
        return;
      } catch {
        // cancelado
      }
    }
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const setDraft = (matchId: number, field: 'home' | 'away', value: number) => {
    setDrafts((d) => ({
      ...d,
      [matchId]: {
        home: field === 'home' ? value : d[matchId]?.home ?? 0,
        away: field === 'away' ? value : d[matchId]?.away ?? 0,
      },
    }));
  };

  const guardar = async (m: FdMatch) => {
    if (!polla) return;
    const draft = drafts[m.id] ?? { home: 0, away: 0 };
    if (isLocked(m.utcDate)) {
      setError(`Las predicciones se bloquean ${LOCK_MINUTES} min antes del partido.`);
      return;
    }
    setSaving(m.id);
    setError(null);
    try {
      await guardarPrediccion({
        idPolla: polla.id,
        apiPartidoId: m.id,
        golesLocal: Math.max(0, Math.floor(draft.home)),
        golesVisitante: Math.max(0, Math.floor(draft.away)),
        fechaPartido: m.utcDate,
      });
      const refreshed = await getMisPredicciones(polla.id);
      setMisPredicciones(refreshed);
      setSavedFlash(m.id);
      setTimeout(() => setSavedFlash((v) => (v === m.id ? null : v)), 1500);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) || 'No se pudo guardar'
        : 'No se pudo guardar';
      setError(msg);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-xl mx-auto w-full">
        <div className="card-base p-12 text-center text-text-muted mt-8">Cargando polla…</div>
      </main>
    );
  }

  if (!polla) {
    return (
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-xl mx-auto w-full">
        <div className="card-base p-12 text-center mt-8">
          <AlertCircle className="w-10 h-10 mx-auto text-text-muted/50" />
          <p className="text-text-secondary mt-3">No se encontró la polla.</p>
          <Button className="mt-4" variant="outline" icon={ArrowLeft} iconPosition="left" onClick={() => navigate('/pollas')}>
            Volver a Pollas
          </Button>
        </div>
      </main>
    );
  }

  const miEntry = ranking.find((r) => r.email === user?.email) ?? null;
  const totalParticipantes = ranking.length;
  const miPosicion = miEntry?.posicion ?? null;
  const misPuntos = miEntry?.puntos ?? 0;

  return (
    <main className="pt-20 md:pt-24 pb-28 md:pb-12 px-4 md:px-8 max-w-screen-xl mx-auto w-full flex-1 flex flex-col gap-8">
      <button
        onClick={() => navigate('/pollas')}
        className="self-start inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a mis pollas
      </button>

      <PageHeader
        title={polla.nombre}
        subtitle={`Creada por ${polla.nombreCreador}`}
        badge="POLLA ACTIVA"
        className="animate-fade-in-up"
      />

      {/* Hero compartir */}
      <section className="relative overflow-hidden rounded-2xl gradient-hero p-6 md:p-8 shadow-xl animate-fade-in-up delay-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full mix-blend-screen blur-[80px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/4" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-white/10 text-white/80 text-xs uppercase tracking-widest backdrop-blur-md">
              Código de invitación
            </span>
            <div className="mt-3 flex items-center gap-3">
              <div className="font-headline font-extrabold text-3xl md:text-4xl text-white tracking-[0.3em]">
                {polla.codigoAcceso}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(polla.codigoAcceso);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Copiar"
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-white/70 mt-2 text-sm max-w-md">
              Comparte este código con tus amigos para que se unan. Tienen que ir a
              <span className="text-white font-semibold"> Pollas → Unirme con código</span>.
            </p>
          </div>
          <div className="flex flex-col gap-3 justify-end">
            <Button variant="primary" icon={Share2} iconPosition="left" onClick={compartirCodigo}>
              Compartir invitación
            </Button>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {totalParticipantes}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> {polla.pozoPuntos} pts pozo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mis stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up delay-150">
        <div className="card-base p-5">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Mis puntos</p>
          <p className="font-headline font-extrabold text-3xl text-text-primary mt-1">{misPuntos}</p>
        </div>
        <div className="card-base p-5">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Mi posición</p>
          <p className="font-headline font-extrabold text-3xl text-text-primary mt-1">
            {miPosicion ? `#${miPosicion}` : '—'}
            {miPosicion && (
              <span className="text-base text-text-muted font-normal">/{totalParticipantes}</span>
            )}
          </p>
        </div>
        <div className="card-base p-5">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Mis predicciones</p>
          <p className="font-headline font-extrabold text-3xl text-text-primary mt-1">
            {misPredicciones.length}
          </p>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-secondary/30 bg-secondary/5 text-secondary-dim animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-bg-elevated rounded-xl p-1 border border-border self-start">
        {[
          { key: 'ranking', label: 'Ranking', icon: Trophy },
          { key: 'predicciones', label: 'Predicciones', icon: Calendar },
        ].map((t) => {
          const Active = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                tab === t.key
                  ? 'bg-bg-card text-text-primary shadow-sm border border-border'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Active className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'ranking' && (
        <section className="flex flex-col gap-2 animate-fade-in">
          {ranking.length === 0 ? (
            <div className="card-base p-8 text-center text-text-muted">
              Aún no hay participantes ni puntos. ¡Comparte el código!
            </div>
          ) : (
            ranking.map((r) => (
              <div
                key={r.idUsuario}
                className={`card-base px-5 py-4 flex items-center gap-4 ${
                  r.posicion === 1 ? 'border-primary/40' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg font-headline font-extrabold ${
                    r.premio === 'ORO'
                      ? 'bg-yellow-100 text-yellow-700'
                      : r.premio === 'PLATA'
                      ? 'bg-gray-200 text-gray-700'
                      : r.premio === 'BRONCE'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-bg-hover text-text-secondary'
                  }`}
                >
                  {r.premio ? <Medal className="w-5 h-5" /> : `#${r.posicion}`}
                </div>
                <img
                  alt={r.nombreUsuario}
                  className="w-10 h-10 rounded-full border border-border"
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.nombreUsuario)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-text-primary truncate">
                    {r.nombreUsuario}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {r.seleccionFavorita ? `🏳️ ${r.seleccionFavorita} · ` : ''}
                    {r.totalPredicciones} predicciones · {r.aciertosExactos} exactas
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-headline font-extrabold text-xl text-text-primary">{r.puntos}</p>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">puntos</p>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {tab === 'predicciones' && (
        <section className="flex flex-col gap-3 animate-fade-in">
          {upcomingMatches.length === 0 ? (
            <div className="card-base p-8 text-center text-text-muted">
              No hay partidos próximos por ahora.
            </div>
          ) : (
            upcomingMatches.map((m) => {
              const draft = drafts[m.id] ?? { home: 0, away: 0 };
              const locked = isLocked(m.utcDate);
              const yaPredijo = misPredicciones.find((p) => p.apiPartidoId === m.id);
              const { date, time } = formatMatchDate(m.utcDate);
              const justSaved = savedFlash === m.id;
              return (
                <div key={m.id} className="card-base p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="md:w-44 flex-shrink-0">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
                      {date}
                    </p>
                    <p className="text-sm font-bold text-text-primary">{time}</p>
                    {m.venue && <p className="text-xs text-text-muted mt-0.5 truncate">{m.venue}</p>}
                  </div>

                  <div className="flex-1 flex items-center justify-center gap-3">
                    <TeamSide name={m.homeTeam.name} crest={m.homeTeam.crest} side="home" />
                    <div className="flex items-center gap-2">
                      <NumInput
                        value={draft.home}
                        onChange={(v) => setDraft(m.id, 'home', v)}
                        disabled={locked}
                      />
                      <span className="font-headline font-bold text-text-muted">–</span>
                      <NumInput
                        value={draft.away}
                        onChange={(v) => setDraft(m.id, 'away', v)}
                        disabled={locked}
                      />
                    </div>
                    <TeamSide name={m.awayTeam.name} crest={m.awayTeam.crest} side="away" />
                  </div>

                  <div className="md:w-40 flex flex-col items-end gap-1">
                    {locked ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-hover text-text-muted text-xs font-bold uppercase tracking-widest">
                        <Lock className="w-3.5 h-3.5" />
                        Bloqueada
                      </span>
                    ) : (
                      <Button
                        variant={justSaved ? 'outline' : 'primary'}
                        size="sm"
                        icon={justSaved ? CheckCircle2 : Save}
                        iconPosition="left"
                        onClick={() => guardar(m)}
                        disabled={saving === m.id}
                      >
                        {saving === m.id ? 'Guardando…' : justSaved ? 'Guardada' : yaPredijo ? 'Actualizar' : 'Guardar'}
                      </Button>
                    )}
                    {yaPredijo && yaPredijo.puntosObtenidos > 0 && (
                      <span className="text-xs text-primary-dim font-bold">
                        +{yaPredijo.puntosObtenidos} pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}
    </main>
  );
}

function NumInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value || 0))}
      className="w-14 h-12 text-center font-headline font-extrabold text-2xl border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function TeamSide({
  name,
  crest,
  side,
}: {
  name: string;
  crest?: string | null;
  side: 'home' | 'away';
}) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${side === 'home' ? '' : 'flex-row-reverse text-right'}`}>
      {crest ? (
        <img src={crest} alt={name} className="w-8 h-8 object-contain flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-bg-hover flex-shrink-0" />
      )}
      <span className="font-bold text-sm text-text-primary truncate max-w-[120px]">{name}</span>
    </div>
  );
}
