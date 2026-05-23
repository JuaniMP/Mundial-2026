import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Users,
  Plus,
  LogIn,
  Copy,
  Crown,
  Sparkles,
  Share2,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { Button, PageHeader, StatCard } from '../components/ui';
import { getMisPollas, crearPolla, unirseAPolla, type PollaResumen } from '../services/pollasApi';

export function Pollas() {
  const navigate = useNavigate();
  const [pollas, setPollas] = useState<PollaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [nombreNueva, setNombreNueva] = useState('');
  const [codigoUnirse, setCodigoUnirse] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMisPollas();
      setPollas(data);
    } catch {
      setError('No se pudieron cargar tus pollas. Verifica tu sesión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleCrear = async () => {
    if (!nombreNueva.trim()) return;
    setBusy(true);
    try {
      const p = await crearPolla(nombreNueva.trim());
      setShowCreate(false);
      setNombreNueva('');
      await load();
      navigate(`/pollas/${p.id}`);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) || 'No se pudo crear la polla'
        : 'No se pudo crear la polla';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleUnirse = async () => {
    if (!codigoUnirse.trim()) return;
    setBusy(true);
    try {
      const p = await unirseAPolla(codigoUnirse.trim().toUpperCase());
      setShowJoin(false);
      setCodigoUnirse('');
      await load();
      navigate(`/pollas/${p.id}`);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) || 'No te pudiste unir'
        : 'No te pudiste unir';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopied(codigo);
    setTimeout(() => setCopied(null), 1500);
  };

  const totalPuntos = pollas.reduce((s, p) => s + (p.misPuntos ?? 0), 0);
  const mejorPosicion = pollas.length ? Math.min(...pollas.map((p) => p.miPosicion ?? 99)) : 0;
  const totalAmigos = pollas.reduce((s, p) => s + Math.max(0, (p.totalParticipantes ?? 1) - 1), 0);

  return (
    <main className="pt-20 md:pt-24 pb-28 md:pb-12 px-4 md:px-8 max-w-screen-xl mx-auto w-full flex-1 flex flex-col gap-10">
      <PageHeader
        title="Pollas"
        subtitle="Crea grupos con tu gente, predice los partidos y compite por el podio."
        badge="JUEGO SOCIAL"
        className="animate-fade-in-up"
      />

      {/* Hero + acciones */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up delay-100">
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl gradient-hero p-8 shadow-xl flex flex-col justify-between min-h-[240px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full mix-blend-screen blur-[80px] opacity-20 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full mix-blend-screen blur-[60px] opacity-15 -translate-x-1/4 translate-y-1/4 pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-white/10 text-white/80 text-xs uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              Predicciones con amigos
            </span>
            <h2 className="mt-3 font-headline font-extrabold text-3xl md:text-4xl text-white tracking-tight">
              Juega la quiniela del Mundial con tu gente
            </h2>
            <p className="mt-2 text-white/70 max-w-xl">
              Crea una polla, comparte el código de invitación y predice los marcadores. Acierta el
              ganador para 5 puntos y el marcador exacto para 10. Al final repartimos premios: 🥇
              Oro, 🥈 Plata, 🥉 Bronce.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="primary"
              icon={Plus}
              iconPosition="left"
              onClick={() => {
                setShowCreate(true);
                setError(null);
              }}
            >
              Crear polla
            </Button>
            <Button
              variant="secondary"
              icon={LogIn}
              iconPosition="left"
              onClick={() => {
                setShowJoin(true);
                setError(null);
              }}
            >
              Unirme con código
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <StatCard
            label="Mis pollas"
            value={pollas.length}
            icon={Trophy}
            iconColor="text-primary"
            subtitle={
              pollas.length === 0 ? 'Crea o únete a una' : `${totalAmigos} compitiendo contigo`
            }
          />
          <StatCard
            label="Puntos totales"
            value={totalPuntos}
            icon={Crown}
            iconColor="text-secondary"
            subtitle={mejorPosicion === 0 ? '—' : `Mejor puesto: #${mejorPosicion}`}
          />
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-secondary/30 bg-secondary/5 text-secondary-dim animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Modal crear */}
      {showCreate && (
        <Modal title="Crear polla" onClose={() => setShowCreate(false)}>
          <p className="text-text-secondary text-sm mb-4">
            Elige un nombre claro: lo verán tus amigos cuando se unan.
          </p>
          <input
            type="text"
            value={nombreNueva}
            onChange={(e) => setNombreNueva(e.target.value)}
            placeholder="Ej: Polla de los pibes"
            maxLength={100}
            className="w-full px-4 py-3 rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-2 mt-5 justify-end">
            <Button variant="ghost" onClick={() => setShowCreate(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCrear} disabled={busy || !nombreNueva.trim()}>
              {busy ? 'Creando…' : 'Crear'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal unirse */}
      {showJoin && (
        <Modal title="Unirme con código" onClose={() => setShowJoin(false)}>
          <p className="text-text-secondary text-sm mb-4">
            Pídele a tu amigo el código de 8 caracteres.
          </p>
          <input
            type="text"
            value={codigoUnirse}
            onChange={(e) => setCodigoUnirse(e.target.value.toUpperCase())}
            placeholder="A1B2C3D4"
            maxLength={20}
            className="w-full px-4 py-3 rounded-lg border border-border bg-bg-base text-text-primary uppercase tracking-[0.4em] text-center font-headline text-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-2 mt-5 justify-end">
            <Button variant="ghost" onClick={() => setShowJoin(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleUnirse}
              disabled={busy || !codigoUnirse.trim()}
            >
              {busy ? 'Uniendo…' : 'Unirme'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Listado mis pollas */}
      <section className="flex flex-col gap-5 animate-fade-in-up delay-200">
        <div className="flex justify-between items-end">
          <h2 className="font-headline font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
            Mis pollas
          </h2>
          {pollas.length > 0 && (
            <span className="text-xs uppercase tracking-widest text-text-muted">
              {pollas.length} {pollas.length === 1 ? 'polla' : 'pollas'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="card-base p-12 text-center text-text-muted">Cargando…</div>
        ) : pollas.length === 0 ? (
          <div className="card-base p-12 flex flex-col items-center text-center gap-3">
            <Trophy className="w-12 h-12 text-text-muted/40" />
            <h3 className="font-headline font-bold text-xl text-text-primary">
              Aún no estás en ninguna polla
            </h3>
            <p className="text-text-secondary max-w-md">
              Crea una con un grupo de amigos o usa un código de invitación para unirte a una
              existente.
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="primary"
                icon={Plus}
                iconPosition="left"
                onClick={() => setShowCreate(true)}
              >
                Crear mi primera polla
              </Button>
              <Button
                variant="outline"
                icon={LogIn}
                iconPosition="left"
                onClick={() => setShowJoin(true)}
              >
                Tengo un código
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pollas.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/pollas/${p.id}`)}
                className="card-base p-6 text-left cursor-pointer group flex flex-col gap-4 relative overflow-hidden"
              >
                {p.soyCreador && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-subtle text-primary-dim text-[10px] font-bold uppercase tracking-widest">
                    <Crown className="w-3 h-3" /> Creador
                  </span>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-bold">
                    Polla
                  </p>
                  <h3 className="font-headline font-extrabold text-xl text-text-primary mt-1 leading-tight">
                    {p.nombre}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">creada por {p.nombreCreador}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted">
                      Mis puntos
                    </p>
                    <p className="font-headline font-bold text-2xl text-text-primary">
                      {p.misPuntos}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted">
                      Posición
                    </p>
                    <p className="font-headline font-bold text-2xl text-text-primary">
                      #{p.miPosicion}
                      <span className="text-sm text-text-muted font-normal">
                        /{p.totalParticipantes}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between border-t border-border pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Users className="w-3.5 h-3.5" />
                    {p.totalParticipantes}{' '}
                    {p.totalParticipantes === 1 ? 'participante' : 'participantes'}
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      copiarCodigo(p.codigoAcceso);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-primary-dim font-bold hover:underline cursor-pointer"
                  >
                    {copied === p.codigoAcceso ? (
                      <>✓ Copiado</>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        {p.codigoAcceso}
                      </>
                    )}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Cómo funciona */}
      <section className="animate-fade-in-up delay-300">
        <h2 className="font-headline font-bold text-2xl text-text-primary tracking-tight mb-4">
          Cómo funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HowCard
            icon={Share2}
            iconColor="text-primary"
            title="Invita con un código"
            text="Cada polla tiene un código único de 8 caracteres. Compártelo por WhatsApp y listo."
          />
          <HowCard
            icon={Trophy}
            iconColor="text-secondary"
            title="Acertaste = puntos"
            text="5 puntos por acertar al ganador (o empate). 10 puntos por el marcador exacto."
          />
          <HowCard
            icon={Crown}
            iconColor="text-accent"
            title="Premios al final"
            text="Al cerrar el Mundial repartimos medallas digitales para los 3 primeros puestos."
          />
        </div>
      </section>
    </main>
  );
}

// ─── Modal genérico simple ─────────────────────────────────────────────────────

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(13,27,42,0.55)' }}
      onClick={onClose}
    >
      <div
        className="card-base bg-bg-card p-6 md:p-8 w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-headline font-bold text-xl text-text-primary mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function HowCard({
  icon: Icon,
  iconColor,
  title,
  text,
}: {
  icon: typeof Trophy;
  iconColor: string;
  title: string;
  text: string;
}) {
  return (
    <div className="card-base p-5 flex flex-col gap-2">
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <h4 className="font-headline font-bold text-text-primary">{title}</h4>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}
