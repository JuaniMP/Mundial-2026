import { useState } from 'react';
import {
  Search,
  User,
  Mail,
  RotateCcw,
  DollarSign,
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogIn,
  FileText,
  Wrench,
  Hash,
  type LucideIcon,
} from 'lucide-react';
import {
  buscarUsuario,
  getTimeline,
  reenviarConfirmacion,
  reactivarReserva,
  procesarReembolso,
  errorMessage,
  type BusquedaResponse,
  type TimelineEvent,
  type EntradaResumen,
} from '../services/soporteApi';

// ── Paleta de estados / tipos ────────────────────────────────────────────────

const ESTADO_COLORS: Record<string, string> = {
  PAGADO: '#006847',
  PENDIENTE: '#E5B449',
  FALLIDO: '#C8102E',
  USADO: '#4A5568',
  REEMBOLSADO: '#6A0572',
};

const TIPO_META: Record<string, { icon: LucideIcon; color: string }> = {
  LOGIN: { icon: LogIn, color: '#1B2A5E' },
  RESERVA: { icon: Ticket, color: '#E5B449' },
  PAGO_OK: { icon: CheckCircle, color: '#006847' },
  PAGO_ERROR: { icon: XCircle, color: '#C8102E' },
  REEMBOLSO: { icon: DollarSign, color: '#6A0572' },
  EMAIL: { icon: Mail, color: '#1B2A5E' },
  INCIDENTE: { icon: FileText, color: '#F4A261' },
  ACCION_SOPORTE: { icon: Wrench, color: '#2A9D8F' },
  GENERICO: { icon: Clock, color: '#4A5568' },
};

const SEVERIDAD_COLORS: Record<string, string> = {
  ERROR: '#C8102E',
  WARN: '#E5B449',
  INFO: '#006847',
};

// ── Helpers de formato ───────────────────────────────────────────────────────

function fmtTime(iso: string | null): string {
  if (!iso) return '--:--:--';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '--:--:--' : d.toLocaleTimeString('es-CO', { hour12: false });
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-CO');
}

// ── Fila de la línea de tiempo ───────────────────────────────────────────────

function TimelineRow({ ev }: { ev: TimelineEvent }) {
  const meta = TIPO_META[ev.tipo] ?? TIPO_META.GENERICO;
  const Icon = meta.icon;
  const sevColor = SEVERIDAD_COLORS[ev.severidad] ?? '#4A5568';

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 14px',
        background: 'var(--color-bg-elevated)',
        borderLeft: `3px solid ${sevColor}`,
        border: '1px solid rgba(14,26,43,0.1)',
        borderLeftWidth: 3,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          flexShrink: 0,
          background: meta.color,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon size={16} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 13,
              color: 'var(--color-ink)',
              letterSpacing: '0.04em',
            }}
          >
            [{fmtTime(ev.timestamp)}]
          </span>
          <span
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-ink)',
            }}
          >
            {ev.titulo}
          </span>
        </div>
        {ev.detalle && (
          <p
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              margin: '3px 0 0',
              lineHeight: 1.5,
            }}
          >
            {ev.detalle}
          </p>
        )}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}
        >
          <span
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 10,
              color: 'var(--color-text-muted)',
            }}
          >
            {fmtDate(ev.timestamp)}
          </span>
          {ev.correlationId && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontFamily: 'monospace',
                fontSize: 10,
                color: 'var(--color-text-muted)',
                background: 'rgba(14,26,43,0.05)',
                padding: '1px 6px',
              }}
              title="correlationId — traza de correlación"
            >
              <Hash size={9} />
              {ev.correlationId.length > 24
                ? `${ev.correlationId.slice(0, 24)}…`
                : ev.correlationId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de entrada con acciones correctivas ──────────────────────────────

type AccionKey = 'reenviar' | 'reactivar' | 'reembolso';

function EntradaCard({
  entrada,
  busy,
  onAccion,
}: {
  entrada: EntradaResumen;
  busy: AccionKey | null;
  onAccion: (entradaId: number, accion: AccionKey) => void;
}) {
  const estado = (entrada.estado ?? '').toUpperCase();
  const yaPagada = estado === 'PAGADO' || estado === 'USADO';
  const yaReembolsada = estado === 'REEMBOLSADO';

  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1.5px solid var(--color-ink)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.08em',
            }}
          >
            ENTRADA #{entrada.entradaId} · {entrada.categoria}
          </span>
          <p
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: '2px 0 0',
            }}
          >
            {entrada.partido || 'Partido por confirmar'}
          </p>
        </div>
        <span
          style={{
            flexShrink: 0,
            padding: '2px 8px',
            background: ESTADO_COLORS[estado] ?? '#4A5568',
            color: '#fff',
            fontFamily: 'Archivo, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}
        >
          {entrada.estado}
        </span>
      </div>

      <div
        style={{
          fontFamily: 'Archivo, sans-serif',
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px 14px',
        }}
      >
        <span>Comprador: {entrada.emailComprador ?? '—'}</span>
        {entrada.total != null && <span>Total: ${entrada.total} USD</span>}
        {entrada.stripePaymentIntentId && (
          <span style={{ fontFamily: 'monospace', fontSize: 10 }}>
            txn: {entrada.stripePaymentIntentId}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <ActionButton
          icon={Mail}
          label="Reenviar confirmación"
          color="#1B2A5E"
          loading={busy === 'reenviar'}
          disabled={busy !== null}
          onClick={() => onAccion(entrada.entradaId, 'reenviar')}
        />
        <ActionButton
          icon={RotateCcw}
          label="Reactivar reserva"
          color="#006847"
          loading={busy === 'reactivar'}
          disabled={busy !== null || yaPagada}
          title={yaPagada ? 'La entrada ya está activa' : undefined}
          onClick={() => onAccion(entrada.entradaId, 'reactivar')}
        />
        <ActionButton
          icon={DollarSign}
          label="Reembolso simulado"
          color="#6A0572"
          loading={busy === 'reembolso'}
          disabled={busy !== null || yaReembolsada}
          title={yaReembolsada ? 'La entrada ya fue reembolsada' : undefined}
          onClick={() => onAccion(entrada.entradaId, 'reembolso')}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  color,
  loading,
  disabled,
  title,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  loading: boolean;
  disabled: boolean;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: disabled ? 'rgba(14,26,43,0.06)' : color,
        color: disabled ? 'var(--color-text-muted)' : '#fff',
        border: 'none',
        fontFamily: 'Archivo, sans-serif',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <Icon size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
      {label}
    </button>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

interface Feedback {
  ok: boolean;
  text: string;
}

export function Soporte() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [data, setData] = useState<BusquedaResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadTimeline = async (usuarioId: number) => {
    setTimelineLoading(true);
    try {
      setTimeline(await getTimeline(usuarioId));
    } catch {
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearchError(null);
    setFeedback(null);
    try {
      const result = await buscarUsuario(query.trim());
      setData(result);
      await loadTimeline(result.usuarioId);
    } catch (err) {
      setData(null);
      setTimeline([]);
      setSearchError(errorMessage(err, 'No se encontró ningún aficionado'));
    } finally {
      setLoading(false);
    }
  };

  const handleAccion = async (entradaId: number, accion: AccionKey) => {
    if (!data) return;
    setBusyKey(`${entradaId}-${accion}`);
    setFeedback(null);
    try {
      const fn =
        accion === 'reenviar'
          ? reenviarConfirmacion
          : accion === 'reactivar'
            ? reactivarReserva
            : procesarReembolso;
      const res = await fn(entradaId);
      setFeedback({ ok: true, text: res.mensaje });
      // Refresca estados de entradas y la línea de tiempo
      const refreshed = await buscarUsuario(data.email);
      setData(refreshed);
      await loadTimeline(refreshed.usuarioId);
    } catch (err) {
      setFeedback({ ok: false, text: errorMessage(err, 'No se pudo completar la acción') });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        paddingTop: 100,
        paddingBottom: 60,
      }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Wrench size={20} color="var(--color-secondary)" />
            <p
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 10,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-secondary)',
                margin: 0,
              }}
            >
              Panel de soporte
            </p>
          </div>
          <h1
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(26px, 4vw, 40px)',
              margin: 0,
              color: 'var(--color-ink)',
              letterSpacing: '0.02em',
            }}
          >
            CENTRO DE ATENCIÓN AL AFICIONADO
          </h1>
        </div>

        {/* Buscador */}
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ID de aficionado, correo o ID de transacción (pi_…)"
              style={{
                width: '100%',
                padding: '12px 12px 12px 36px',
                border: '1.5px solid var(--color-ink)',
                background: 'var(--color-bg-elevated)',
                fontFamily: 'Archivo, sans-serif',
                fontSize: 14,
                color: 'var(--color-ink)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              padding: '12px 26px',
              background: 'var(--color-ink)',
              color: 'var(--color-primary)',
              border: 'none',
              fontFamily: 'Archivo, sans-serif',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !query.trim() ? 0.6 : 1,
            }}
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>
        <p
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            margin: '0 0 24px',
          }}
        >
          Busca por ID numérico, correo electrónico, ID de transacción Stripe o código QR de la
          entrada.
        </p>

        {searchError && (
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(200,16,46,0.08)',
              border: '1px solid #C8102E',
              color: '#C8102E',
              fontFamily: 'Archivo, sans-serif',
              fontSize: 13,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={16} />
            {searchError}
          </div>
        )}

        {/* Resultado */}
        {data && (
          <>
            {/* Ficha del aficionado */}
            <div
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1.5px solid var(--color-ink)',
                padding: '18px 20px',
                marginBottom: 20,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: 'var(--color-ink)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={26} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p
                  style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 22,
                    margin: 0,
                    color: 'var(--color-ink)',
                  }}
                >
                  {data.nombre}
                </p>
                <p
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    margin: '2px 0 0',
                  }}
                >
                  {data.email} · ID #{data.usuarioId} · {data.rol ?? 'AFICIONADO'}
                </p>
                <p
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    margin: '4px 0 0',
                  }}
                >
                  Registro: {fmtDate(data.fechaRegistro)} · Último acceso:{' '}
                  {data.ultimoLogin
                    ? `${fmtDate(data.ultimoLogin)} ${fmtTime(data.ultimoLogin)}`
                    : '—'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 22 }}>
                {[
                  { label: 'Entradas', value: data.totalEntradas },
                  { label: 'Incidentes', value: data.totalIncidentes },
                  { label: 'Eventos log', value: data.totalLogs },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <p
                      style={{
                        fontFamily: 'Anton, sans-serif',
                        fontSize: 26,
                        margin: 0,
                        color: 'var(--color-ink)',
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Archivo, sans-serif',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                        margin: '2px 0 0',
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {feedback && (
              <div
                style={{
                  padding: '12px 16px',
                  background: feedback.ok ? 'rgba(0,104,71,0.08)' : 'rgba(200,16,46,0.08)',
                  border: `1px solid ${feedback.ok ? '#006847' : '#C8102E'}`,
                  color: feedback.ok ? '#006847' : '#C8102E',
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {feedback.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                {feedback.text}
              </div>
            )}

            {/* Dos columnas: timeline + acciones */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
                gap: 20,
                alignItems: 'start',
              }}
              className="soporte-grid"
            >
              {/* Línea de tiempo */}
              <section>
                <h2
                  style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 16,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink)',
                    margin: '0 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Clock size={16} />
                  Línea de tiempo
                </h2>
                {timelineLoading && (
                  <p
                    style={{
                      fontFamily: 'Archivo, sans-serif',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                      padding: 20,
                      textAlign: 'center',
                    }}
                  >
                    Cargando eventos…
                  </p>
                )}
                {!timelineLoading && timeline.length === 0 && (
                  <div
                    style={{
                      padding: 30,
                      textAlign: 'center',
                      border: '1.5px dashed rgba(14,26,43,0.2)',
                      fontFamily: 'Archivo, sans-serif',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Sin actividad registrada para este aficionado.
                  </div>
                )}
                {!timelineLoading && timeline.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {timeline.map((ev, i) => (
                      <TimelineRow key={`${ev.timestamp}-${i}`} ev={ev} />
                    ))}
                  </div>
                )}
              </section>

              {/* Acciones correctivas */}
              <section>
                <h2
                  style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 16,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink)',
                    margin: '0 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Wrench size={16} />
                  Acciones correctivas
                </h2>
                {data.entradas.length === 0 && (
                  <div
                    style={{
                      padding: 30,
                      textAlign: 'center',
                      border: '1.5px dashed rgba(14,26,43,0.2)',
                      fontFamily: 'Archivo, sans-serif',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    El aficionado no tiene entradas asociadas.
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.entradas.map((entrada) => {
                    const prefix = `${entrada.entradaId}-`;
                    const busy: AccionKey | null = busyKey?.startsWith(prefix)
                      ? (busyKey.slice(prefix.length) as AccionKey)
                      : null;
                    return (
                      <EntradaCard
                        key={entrada.entradaId}
                        entrada={entrada}
                        busy={busy}
                        onAccion={handleAccion}
                      />
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}

        {!data && !searchError && !loading && (
          <div
            style={{
              padding: 50,
              textAlign: 'center',
              border: '1.5px dashed rgba(14,26,43,0.2)',
              fontFamily: 'Archivo, sans-serif',
              fontSize: 14,
              color: 'var(--color-text-muted)',
            }}
          >
            Ingresa un identificador para reconstruir la actividad de un aficionado.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .soporte-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
