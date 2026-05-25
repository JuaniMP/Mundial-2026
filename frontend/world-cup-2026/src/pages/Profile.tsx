import { useEffect, useState } from 'react';
import axios from 'axios';
import { TravelSuggestionsPanel } from '../components/TravelSuggestions';
import AvatarPicker from '../components/AvatarPicker';
import {
  Settings,
  Bell,
  CalendarDays,
  Plane,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Globe2,
  Mail,
  Smartphone,
  MapPin,
  Clock,
  Flag,
  Newspaper,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/useLanguage';
import { Button, PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { TEAMS as ALBUM_TEAMS } from '../components/album/teamColors';
import {
  getPreferencias,
  savePreferencias,
  getAgenda,
  addAgendaItem,
  deleteAgendaItem,
  getViajes,
  addViaje,
  deleteViaje,
  getFeed,
  type Preferencias,
  type AgendaItem,
  type RecordatorioViaje,
  type FeedItem,
} from '../services/profileApi';
// Avatar utilities are used in the dedicated AvatarPicker component
import { WORLD_CUP_2026_STADIUMS } from '../data/worldCup2026Stadiums';

// ── Datos auxiliares para el wizard ───────────────────────────────────────────

// Usar la lista completa de 48 selecciones del álbum para el asistente de configuración.
const SELECCIONES = ALBUM_TEAMS.map((t) => t.name);

type DestinoSugerido = {
  value: string;
  ciudad: string;
  pais: string;
  estadio: string;
  zonaHoraria: string;
};

const DESTINOS_MUNDIAL: DestinoSugerido[] = Array.from(
  new Map(
    WORLD_CUP_2026_STADIUMS.map((s) => {
      const zonaHoraria =
        s.pais === 'México'
          ? 'America/Mexico_City'
          : s.ciudad === 'Vancouver' || s.ciudad === 'Los Angeles' || s.ciudad === 'Seattle'
            ? 'America/Los_Angeles'
            : s.ciudad === 'Dallas' || s.ciudad === 'Houston' || s.ciudad === 'Kansas City'
              ? 'America/Chicago'
              : 'America/New_York';

      return [
        `${s.ciudad}|${s.pais}|${s.nombre}`,
        {
          value: `${s.ciudad}|${s.pais}|${s.nombre}`,
          ciudad: s.ciudad,
          pais: s.pais === 'USA' ? 'Estados Unidos' : s.pais === 'Canada' ? 'Canadá' : s.pais,
          estadio: s.nombre,
          zonaHoraria,
        },
      ] as const;
    }),
  ).values(),
);

const ESTADIOS = [
  'MetLife Stadium',
  'SoFi Stadium',
  'AT&T Stadium',
  "Levi's Stadium",
  'Arrowhead Stadium',
  'NRG Stadium',
  'Gillette Stadium',
  'Lincoln Financial Field',
  'Bank of America Stadium',
  'Hard Rock Stadium',
  'BC Place',
  'BMO Field',
  'Estadio Azteca',
  'Estadio BBVA',
  'Estadio Akron',
];

const CANALES = [
  { key: 'APP', label: 'Notificaciones en la app', icon: Bell },
  { key: 'EMAIL', label: 'Correo electrónico', icon: Mail },
  { key: 'PUSH', label: 'Push (navegador/celular)', icon: Smartphone },
] as const;

const ZONAS = [
  'America/Bogota',
  'America/Mexico_City',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Argentina/Buenos_Aires',
  'America/Sao_Paulo',
  'Europe/Madrid',
  'Europe/London',
  'UTC',
];

type Tab = 'preferencias' | 'agenda' | 'feed' | 'viajes';

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('preferencias');
  const [error, setError] = useState<string | null>(null);

  // Datos
  const [prefs, setPrefs] = useState<Preferencias | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [viajes, setViajes] = useState<RecordatorioViaje[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard
  const [wizardStep, setWizardStep] = useState(0);
  const [draftSelecciones, setDraftSelecciones] = useState<string[]>([]);
  const [draftEstadios, setDraftEstadios] = useState<string[]>([]);
  const [draftCanales, setDraftCanales] = useState<string[]>(['APP']);
  const [draftZona, setDraftZona] = useState<string>('America/Bogota');
  const [savingPrefs, setSavingPrefs] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, a, v, f] = await Promise.allSettled([
        getPreferencias(),
        getAgenda(),
        getViajes(),
        getFeed(),
      ]);
      if (p.status === 'fulfilled') {
        const prefsData = p.value;
        setPrefs(prefsData);
        setDraftSelecciones(prefsData.seleccionesFavoritas ?? []);
        setDraftEstadios(prefsData.estadiosFavoritos ?? []);
        setDraftCanales(
          prefsData.canalesNotificacion?.length ? prefsData.canalesNotificacion : ['APP'],
        );
        setDraftZona(prefsData.zonaHorariaPreferida ?? 'America/Bogota');
      } else {
        setPrefs(null);
      }

      if (a.status === 'fulfilled') setAgenda(a.value);
      if (v.status === 'fulfilled') setViajes(v.value);
      if (f.status === 'fulfilled') setFeed(f.value);

      const failedSections = [
        p.status === 'rejected' ? 'preferencias' : null,
        a.status === 'rejected' ? 'agenda' : null,
        v.status === 'rejected' ? 'viajes' : null,
        f.status === 'rejected' ? 'feed' : null,
      ].filter(Boolean) as string[];

      if (failedSections.length > 0) {
        setError(
          failedSections.length === 4
            ? t('profile.loadError')
            : t('profile.loadPartialError', { sections: failedSections.join(', ') }),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const guardarPreferencias = async (markWizardDone: boolean) => {
    setSavingPrefs(true);
    setError(null);
    try {
      const updated = await savePreferencias({
        seleccionesFavoritas: draftSelecciones,
        estadiosFavoritos: draftEstadios,
        canalesNotificacion: draftCanales.length ? draftCanales : ['APP'],
        zonaHorariaPreferida: draftZona,
        wizardCompletado: markWizardDone ? true : prefs?.wizardCompletado,
      });
      setPrefs(updated);
      setWizardStep(0);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message as string) || 'Error guardando'
          : 'Error guardando',
      );
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <main className="pt-20 md:pt-24 pb-28 md:pb-12 px-4 md:px-8 max-w-screen-xl mx-auto w-full flex-1 flex flex-col gap-8">
      <PageHeader
        title={user?.name ? `Hola, ${user.name.split(' ')[0]}` : 'Mi perfil'}
        subtitle="Tus preferencias, tu agenda y todo lo que importa para vivir el Mundial 2026."
        badge="MI PERFIL"
        className="animate-fade-in-up"
      />

      {/* Hero perfil */}
      <section className="relative overflow-hidden rounded-2xl gradient-hero p-6 md:p-8 shadow-xl animate-fade-in-up delay-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full mix-blend-screen blur-[80px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/4" />
        <div className="relative z-10 flex items-center gap-4">
          <AvatarPicker />
          <div className="flex-1 min-w-0">
            <h2 className="font-headline font-bold text-2xl text-white tracking-tight truncate">
              {user?.name ?? user?.email}
            </h2>
            <p className="text-white/70 text-sm truncate">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {prefs?.seleccionesFavoritas?.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white/10 text-white/90 text-xs uppercase tracking-widest backdrop-blur-md"
                >
                  <Flag className="w-3 h-3" /> {s}
                </span>
              ))}
              {prefs?.wizardCompletado && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/30 text-white text-xs uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" /> Setup completo
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-secondary/30 bg-secondary/5 text-secondary-dim animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap bg-bg-elevated rounded-xl p-1 border border-border self-start gap-1">
        {(
          [
            { key: 'preferencias', label: t('profile.tabPreferences'), icon: Settings },
            { key: 'agenda', label: t('profile.tabAgenda'), icon: CalendarDays },
            { key: 'feed', label: t('profile.tabFeed'), icon: Newspaper },
            { key: 'viajes', label: t('profile.tabTrips'), icon: Plane },
          ] as const
        ).map((tabItem) => {
          const Active = tabItem.icon;
          return (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                tab === tabItem.key
                  ? 'bg-bg-card text-text-primary shadow-sm border border-border'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Active className="w-3.5 h-3.5" />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {loading && <div className="card-base p-12 text-center text-text-muted">Cargando…</div>}

      {!loading && tab === 'preferencias' && (
        <PreferenciasPanel
          prefs={prefs}
          wizardStep={wizardStep}
          setWizardStep={setWizardStep}
          draftSelecciones={draftSelecciones}
          setDraftSelecciones={setDraftSelecciones}
          draftEstadios={draftEstadios}
          setDraftEstadios={setDraftEstadios}
          draftCanales={draftCanales}
          setDraftCanales={setDraftCanales}
          draftZona={draftZona}
          setDraftZona={setDraftZona}
          toggle={toggle}
          guardar={guardarPreferencias}
          saving={savingPrefs}
        />
      )}

      {!loading && tab === 'agenda' && (
        <AgendaPanel
          agenda={agenda}
          reload={async () => setAgenda(await getAgenda())}
          setError={setError}
        />
      )}

      {!loading && tab === 'feed' && <FeedPanel feed={feed} />}

      {!loading && tab === 'viajes' && (
        <ViajesPanel
          viajes={viajes}
          reload={async () => setViajes(await getViajes())}
          setError={setError}
        />
      )}
    </main>
  );
}

// ─── Preferencias ─────────────────────────────────────────────────────────────

function PreferenciasPanel(props: {
  prefs: Preferencias | null;
  wizardStep: number;
  setWizardStep: (n: number) => void;
  draftSelecciones: string[];
  setDraftSelecciones: (l: string[]) => void;
  draftEstadios: string[];
  setDraftEstadios: (l: string[]) => void;
  draftCanales: string[];
  setDraftCanales: (l: string[]) => void;
  draftZona: string;
  setDraftZona: (z: string) => void;
  toggle: (list: string[], v: string) => string[];
  guardar: (markWizardDone: boolean) => Promise<void>;
  saving: boolean;
}) {
  const { t } = useTranslation();
  const {
    prefs,
    wizardStep,
    setWizardStep,
    draftSelecciones,
    setDraftSelecciones,
    draftEstadios,
    setDraftEstadios,
    draftCanales,
    setDraftCanales,
    draftZona,
    setDraftZona,
    toggle,
    guardar,
    saving,
  } = props;

  const showWizard = !prefs?.wizardCompletado || wizardStep > 0;

  if (showWizard) {
    return (
      <section className="card-base p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-headline font-bold text-xl text-text-primary">
              Asistente de configuración
            </h3>
            <p className="text-sm text-text-secondary">Personalizamos tu experiencia en 4 pasos.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= wizardStep ? 'bg-primary' : 'bg-bg-hover'
              }`}
            />
          ))}
        </div>

        {wizardStep === 0 && (
          <WizardSelections
            title={t('profile.wizardTeamsTitle')}
            subtitle={t('profile.wizardTeamsSubtitle')}
            options={SELECCIONES}
            value={draftSelecciones}
            onToggle={(v) => setDraftSelecciones(toggle(draftSelecciones, v))}
            max={5}
          />
        )}

        {wizardStep === 1 && (
          <WizardSelections
            title="Tus estadios favoritos"
            subtitle="Marca los estadios donde planeas ver partidos."
            options={ESTADIOS}
            value={draftEstadios}
            onToggle={(v) => setDraftEstadios(toggle(draftEstadios, v))}
          />
        )}

        {wizardStep === 2 && (
          <div className="flex flex-col gap-3">
            <h4 className="font-headline font-bold text-lg text-text-primary">
              ¿Cómo te avisamos?
            </h4>
            <p className="text-sm text-text-secondary">
              Marca los canales para recordatorios de partido, predicciones bloqueadas y noticias
              del torneo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {CANALES.map((c) => {
                const active = draftCanales.includes(c.key);
                const Icon = c.icon;
                return (
                  <button
                    key={c.key}
                    onClick={() => setDraftCanales(toggle(draftCanales, c.key))}
                    className={`card-base p-4 flex flex-col items-start gap-2 text-left ${
                      active ? 'border-primary/50 bg-primary-subtle' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-text-muted'}`} />
                    <span className="font-headline font-bold text-text-primary">{c.label}</span>
                    {active && (
                      <span className="text-xs text-primary-dim inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Activado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="flex flex-col gap-3">
            <h4 className="font-headline font-bold text-lg text-text-primary">
              {t('profile.wizardTimezone')}
            </h4>
            <p className="text-sm text-text-secondary">
              Mostramos las horas de los partidos en tu zona. Si viajas, te avisamos al cambiar.
            </p>
            <select
              value={draftZona}
              onChange={(e) => setDraftZona(e.target.value)}
              aria-label="Zona horaria preferida"
              className="w-full px-4 py-3 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {ZONAS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xs uppercase tracking-widest text-text-muted">
            Paso {wizardStep + 1} de 4
          </span>
          <div className="flex gap-2">
            {wizardStep > 0 && (
              <Button
                variant="ghost"
                onClick={() => setWizardStep(wizardStep - 1)}
                disabled={saving}
              >
                Atrás
              </Button>
            )}
            {wizardStep < 3 ? (
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => setWizardStep(wizardStep + 1)}
                disabled={saving}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={CheckCircle2}
                iconPosition="left"
                onClick={() => guardar(true)}
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Terminar setup'}
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Vista resumen — preferencias guardadas
  return (
    <section className="flex flex-col gap-5 animate-fade-in">
      <LanguageSwitcherCard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PrefCard
          icon={Flag}
          title={t('profile.favoriteTeams')}
          values={prefs?.seleccionesFavoritas ?? []}
          empty="Aún no eliges equipos."
        />
        <PrefCard
          icon={MapPin}
          title={t('profile.favoriteStadiums')}
          values={prefs?.estadiosFavoritos ?? []}
          empty="Sin estadios marcados."
        />
        <PrefCard
          icon={Bell}
          title={t('profile.notificationChannels')}
          values={(prefs?.canalesNotificacion ?? []).map(
            (c) => CANALES.find((x) => x.key === c)?.label ?? c,
          )}
          empty="Solo en la app."
        />
        <PrefCard
          icon={Globe2}
          title={t('profile.timezone')}
          values={prefs?.zonaHorariaPreferida ? [prefs.zonaHorariaPreferida] : []}
          empty="Sin definir"
        />
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          icon={Settings}
          iconPosition="left"
          onClick={() => setWizardStep(0)}
        >
          {t('profile.editPreferences')}
        </Button>
      </div>
    </section>
  );
}

function WizardSelections({
  title,
  subtitle,
  options,
  value,
  onToggle,
  max,
}: {
  title: string;
  subtitle: string;
  options: string[];
  value: string[];
  onToggle: (v: string) => void;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h4 className="font-headline font-bold text-lg text-text-primary">{title}</h4>
        <p className="text-sm text-text-secondary">{subtitle}</p>
        {max && (
          <p className="text-xs text-text-muted mt-1">
            {value.length}/{max} seleccionadas
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value.includes(o);
          const disabled = !active && max !== undefined && value.length >= max;
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              disabled={disabled}
              className={`px-3.5 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                active
                  ? 'bg-primary text-ink border-ink'
                  : disabled
                    ? 'bg-bg-hover text-text-muted border-transparent opacity-50 cursor-not-allowed'
                    : 'bg-bg-elevated text-text-primary border-border hover:border-ink'
              }`}
            >
              {active && <Check className="w-3.5 h-3.5 inline mr-1" />}
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PrefCard({
  icon: Icon,
  title,
  values,
  empty,
}: {
  icon: typeof Settings;
  title: string;
  values: string[];
  empty: string;
}) {
  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="font-headline font-bold text-text-primary">{title}</h4>
      </div>
      {values.length === 0 ? (
        <p className="text-sm text-text-muted italic">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-subtle text-primary-dim"
            >
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── AvatarPicker ────────────────────────────────────────────────────────────
// AvatarPicker moved to components/AvatarPicker.tsx

// --- Agenda ---------------------------------------------------------------

function AgendaPanel({
  agenda,
  reload,
  setError,
}: {
  agenda: AgendaItem[];
  reload: () => Promise<void>;
  setError: (s: string | null) => void;
}) {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<{
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    tipo: AgendaItem['tipo'];
    prioridad: AgendaItem['prioridad'];
    ubicacion: string;
  }>({
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    tipo: 'CUSTOM',
    prioridad: 'MEDIA',
    ubicacion: '',
  });
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!form.titulo.trim() || !form.fechaInicio) return;
    setBusy(true);
    setError(null);
    try {
      await addAgendaItem({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        prioridad: form.prioridad,
        fechaInicio: form.fechaInicio,
        ubicacion: form.ubicacion.trim(),
      });
      await reload();
      setShowAdd(false);
      setForm({
        titulo: '',
        descripcion: '',
        fechaInicio: '',
        tipo: 'CUSTOM',
        prioridad: 'MEDIA',
        ubicacion: '',
      });
    } catch {
      setError('No se pudo crear el item.');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    setError(null);
    try {
      await deleteAgendaItem(id);
      await reload();
    } catch {
      setError('No se pudo eliminar.');
    }
  };

  return (
    <section className="flex flex-col gap-5 animate-fade-in">
      <div className="flex justify-between items-end">
        <h3 className="font-headline font-bold text-2xl text-text-primary">Mi agenda</h3>
        <Button
          variant="primary"
          icon={Plus}
          iconPosition="left"
          size="sm"
          onClick={() => setShowAdd(true)}
        >
          Agregar evento
        </Button>
      </div>

      {showAdd && (
        <div className="card-base p-5 flex flex-col gap-3 animate-scale-in">
          <input
            type="text"
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={2}
            className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">
                Fecha y hora
              </span>
              <input
                type="datetime-local"
                value={form.fechaInicio}
                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">
                Tipo
              </span>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as AgendaItem['tipo'] })}
                className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="CUSTOM">Personalizado</option>
                <option value="PARTIDO">Partido</option>
                <option value="VIAJE">Viaje</option>
                <option value="ENTRADA">Entrada</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">
                Prioridad
              </span>
              <select
                value={form.prioridad}
                onChange={(e) =>
                  setForm({ ...form, prioridad: e.target.value as AgendaItem['prioridad'] })
                }
                className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </label>
          </div>
          <input
            type="text"
            placeholder="Ubicación (opcional)"
            value={form.ubicacion}
            onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={busy || !form.titulo.trim() || !form.fechaInicio}
            >
              {busy ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      )}

      {agenda.length === 0 ? (
        <div className="card-base p-10 text-center text-text-muted">
          {t('profile.agendaEmpty')}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {agenda.map((a) => (
            <div key={a.id} className="card-base p-4 flex items-center gap-4">
              <PriorityDot prioridad={a.prioridad} />
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-text-primary truncate">{a.titulo}</p>
                <p className="text-xs text-text-muted truncate">
                  {fmtDateTime(a.fechaInicio)}
                  {a.ubicacion ? ` · ${a.ubicacion}` : ''}
                </p>
                {a.descripcion && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{a.descripcion}</p>
                )}
              </div>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-bg-hover text-text-muted">
                {a.tipo}
              </span>
              <button
                onClick={() => onDelete(a.id)}
                className="p-2 rounded-lg text-text-muted hover:text-secondary hover:bg-secondary/10 transition-colors"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PriorityDot({ prioridad }: { prioridad: AgendaItem['prioridad'] }) {
  const color =
    prioridad === 'ALTA' ? 'bg-secondary' : prioridad === 'MEDIA' ? 'bg-primary' : 'bg-text-muted';
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />;
}

// ─── Feed ────────────────────────────────────────────────────────────────────

function FeedPanel({ feed }: { feed: FeedItem[] }) {
  const { t } = useTranslation();
  if (feed.length === 0) {
    return (
      <section className="card-base p-10 text-center text-text-muted animate-fade-in">
        {t('profile.feedEmpty')}
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-2 animate-fade-in">
      {feed.map((f) => (
        <div key={f.id} className="card-base p-4 flex items-center gap-4">
          <FeedIcon origen={f.origen} />
          <div className="flex-1 min-w-0">
            <p className="font-headline font-bold text-text-primary truncate">{f.titulo}</p>
            <p className="text-sm text-text-secondary line-clamp-2">{f.detalle}</p>
            {f.cuando && (
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {fmtDateTime(f.cuando)}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              f.prioridad === 'ALTA'
                ? 'bg-secondary/10 text-secondary-dim'
                : f.prioridad === 'MEDIA'
                  ? 'bg-primary-subtle text-primary-dim'
                  : 'bg-bg-hover text-text-muted'
            }`}
          >
            {f.prioridad}
          </span>
        </div>
      ))}
    </section>
  );
}

function FeedIcon({ origen }: { origen: FeedItem['origen'] }) {
  const map = {
    AGENDA: { Icon: CalendarDays, color: 'text-primary bg-primary-subtle' },
    VIAJE: { Icon: Plane, color: 'text-accent bg-accent/10' },
    NOTIFICACION: { Icon: Bell, color: 'text-secondary bg-secondary/10' },
    POLLA: { Icon: Sparkles, color: 'text-primary bg-primary-subtle' },
  } as const;
  const { Icon, color } = map[origen] ?? map.NOTIFICACION;
  return (
    <span
      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
    >
      <Icon className="w-5 h-5" />
    </span>
  );
}

// ─── Viajes ──────────────────────────────────────────────────────────────────

function ViajesPanel({
  viajes,
  reload,
  setError,
}: {
  viajes: RecordatorioViaje[];
  reload: () => Promise<void>;
  setError: (s: string | null) => void;
}) {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedSugerencias, setExpandedSugerencias] = useState<Record<number, boolean>>({});
  const [destinoSugerido, setDestinoSugerido] = useState('');
  const [form, setForm] = useState({
    ciudadDestino: '',
    paisDestino: '',
    zonaHorariaDestino: 'America/New_York',
    fechaInicio: '',
    fechaFin: '',
    estadioDestino: '',
    notas: '',
  });
  const [busy, setBusy] = useState(false);

  const aplicarDestinoSugerido = (value: string) => {
    setDestinoSugerido(value);
    const destino = DESTINOS_MUNDIAL.find((d) => d.value === value);
    if (!destino) return;

    setForm((prev) => ({
      ...prev,
      ciudadDestino: destino.ciudad,
      paisDestino: destino.pais,
      zonaHorariaDestino: destino.zonaHoraria,
      estadioDestino: destino.estadio,
    }));
  };

  const onSubmit = async () => {
    if (
      !form.ciudadDestino.trim() ||
      !form.paisDestino.trim() ||
      !form.fechaInicio ||
      !form.fechaFin
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await addViaje({
        ciudadDestino: form.ciudadDestino.trim(),
        paisDestino: form.paisDestino.trim(),
        zonaHorariaDestino: form.zonaHorariaDestino,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        estadioDestino: form.estadioDestino.trim(),
        notas: form.notas.trim(),
      });
      await reload();
      setShowAdd(false);
      setDestinoSugerido('');
      setForm({
        ciudadDestino: '',
        paisDestino: '',
        zonaHorariaDestino: 'America/New_York',
        fechaInicio: '',
        fechaFin: '',
        estadioDestino: '',
        notas: '',
      });
    } catch {
      setError('No se pudo registrar el viaje.');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    setError(null);
    try {
      await deleteViaje(id);
      await reload();
    } catch {
      setError('No se pudo eliminar.');
    }
  };

  return (
    <section className="flex flex-col gap-5 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-headline font-bold text-2xl text-text-primary">
            Recordatorios de viaje
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Te avisamos sobre zonas horarias y ventanas de acceso a estadios.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          iconPosition="left"
          size="sm"
          onClick={() => setShowAdd(true)}
        >
          Agregar viaje
        </Button>
      </div>

      {showAdd && (
        <div className="card-base p-5 flex flex-col gap-3 animate-scale-in">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-text-muted font-bold">
              Sede sugerida
            </label>
            <select
              value={destinoSugerido}
              onChange={(e) => aplicarDestinoSugerido(e.target.value)}
              aria-label="Sede sugerida del Mundial"
              className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Elige una ciudad o estadio del Mundial</option>
              {DESTINOS_MUNDIAL.map((destino) => (
                <option key={destino.value} value={destino.value}>
                  {destino.ciudad} · {destino.estadio} ({destino.pais})
                </option>
              ))}
            </select>
            <p className="text-xs text-text-muted">
              Al elegir una sede, completamos ciudad, país, zona horaria y estadio para el
              recordatorio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ciudad destino"
              value={form.ciudadDestino}
              onChange={(e) => {
                setDestinoSugerido('');
                setForm({ ...form, ciudadDestino: e.target.value });
              }}
              className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="text"
              placeholder="País"
              value={form.paisDestino}
              onChange={(e) => {
                setDestinoSugerido('');
                setForm({ ...form, paisDestino: e.target.value });
              }}
              className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">
                Inicio
              </span>
              <input
                type="date"
                value={form.fechaInicio}
                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">
                Fin
              </span>
              <input
                type="date"
                value={form.fechaFin}
                onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">
                Zona horaria
              </span>
              <select
                value={form.zonaHorariaDestino}
                onChange={(e) => {
                  setDestinoSugerido('');
                  setForm({ ...form, zonaHorariaDestino: e.target.value });
                }}
                className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {ZONAS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <input
            type="text"
            placeholder="Estadio destino (opcional)"
            value={form.estadioDestino}
            onChange={(e) => {
              setDestinoSugerido('');
              setForm({ ...form, estadioDestino: e.target.value });
            }}
            className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <textarea
            placeholder="Notas (vuelos, hotel…)"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            rows={2}
            className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={
                busy ||
                !form.ciudadDestino ||
                !form.paisDestino ||
                !form.fechaInicio ||
                !form.fechaFin
              }
            >
              {busy ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      )}

      {viajes.length === 0 ? (
        <div className="card-base p-10 text-center text-text-muted">
          {t('profile.tripsEmpty')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {viajes.map((v) => {
            const sugsOpen = expandedSugerencias[v.id] ?? false;
            const hasEstadio = Boolean(v.estadioDestino?.trim());
            return (
              <div
                key={v.id}
                className={`card-base p-5 flex flex-col gap-4 ${
                  v.enCurso ? 'border-primary/40 bg-primary-subtle/30' : ''
                }`}
              >
                {/* Top row */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-lg text-text-primary truncate">
                      {v.ciudadDestino}
                      <span className="text-text-muted font-normal text-sm">, {v.paisDestino}</span>
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {v.fechaInicio} → {v.fechaFin}
                      {v.offsetHoras && ` · ${v.offsetHoras} vs tu zona`}
                      {v.estadioDestino && ` · ${v.estadioDestino}`}
                    </p>
                    {v.duracionEstimada && (
                      <p className="text-xs text-text-secondary mt-1">
                        Estancia estimada: {v.duracionEstimada}
                      </p>
                    )}
                    {v.alerta && (
                      <p
                        className={`text-sm mt-2 ${v.enCurso ? 'text-primary-dim font-semibold' : 'text-text-secondary'}`}
                      >
                        {v.alerta}
                      </p>
                    )}
                    {v.notas && <p className="text-xs text-text-muted mt-1 italic">{v.notas}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasEstadio && (
                      <button
                        onClick={() =>
                          setExpandedSugerencias((prev) => ({
                            ...prev,
                            [v.id]: !sugsOpen,
                          }))
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/30 bg-primary-subtle text-primary-dim hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        ✈️ {sugsOpen ? 'Ocultar' : 'Ver sugerencias'}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(v.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-secondary hover:bg-secondary/10 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sugerencias expandidas */}
                {sugsOpen && hasEstadio && (
                  <div className="border-t border-border pt-4">
                    <TravelSuggestionsPanel key={v.estadioDestino} estadio={v.estadioDestino!} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Language switcher card ─────────────────────────────────────────────────

function LanguageSwitcherCard() {
  const { t } = useTranslation();
  const { lang, setLang, syncing } = useLanguage();
  return (
    <div className="card-base p-5 md:p-6 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <Globe2 className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <h4 className="font-headline font-bold text-base text-text-primary">
            {t('profile.language')}
          </h4>
          <p className="text-xs text-text-secondary mt-1">{t('profile.languageHint')}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { code: 'es', flag: '🇪🇸', label: t('common.spanish') },
            { code: 'en', flag: '🇺🇸', label: t('common.english') },
            { code: 'fr', flag: '🇫🇷', label: t('common.french') },
          ] as const
        ).map((l) => (
          <button
            key={l.code}
            onClick={() => void setLang(l.code)}
            disabled={syncing}
            aria-label={`${t('profile.selectLanguage')}: ${l.label}`}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer ${
              lang === l.code
                ? 'bg-primary text-ink border-ink'
                : 'bg-bg-elevated text-text-primary border-border hover:border-ink'
            } ${syncing ? 'opacity-60 cursor-wait' : ''}`}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-CO', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
