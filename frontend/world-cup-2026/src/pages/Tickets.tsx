import { useState, useEffect, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import type { PartidoApi } from '../types';
import {
  Ticket,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Minus,
  Plus,
  RefreshCw,
  Calendar,
  Users,
  Filter,
} from 'lucide-react';

// ── Stripe init ───────────────────────────────────────────────────────────────
const STRIPE_PK = import.meta.env.VITE_STRIPE_PK as string | undefined;
const stripePromise = STRIPE_PK && !STRIPE_PK.includes('REEMPLAZA') ? loadStripe(STRIPE_PK) : null;

const API = 'http://localhost:8082/api/v1';

function getHeaders() {
  const t = sessionStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ── Tribuna definition ────────────────────────────────────────────────────────
interface Tribuna {
  id: string;
  nombre: string;
  categoria: 'GENERAL' | 'VIP' | 'PALCO';
  precio: number;
  capacidad: number;
  emoji: string;
  color: string;
}

const TRIBUNAS: Tribuna[] = [
  {
    id: 'NORTE',
    nombre: 'Tribuna Norte',
    categoria: 'GENERAL',
    precio: 80,
    capacidad: 18500,
    emoji: '🏟️',
    color: '#006847',
  },
  {
    id: 'SUR',
    nombre: 'Tribuna Sur',
    categoria: 'GENERAL',
    precio: 80,
    capacidad: 17200,
    emoji: '🏟️',
    color: '#006847',
  },
  {
    id: 'ESTE',
    nombre: 'Tribuna Este',
    categoria: 'GENERAL',
    precio: 80,
    capacidad: 14800,
    emoji: '🏟️',
    color: '#006847',
  },
  {
    id: 'OESTE',
    nombre: 'Tribuna Oeste',
    categoria: 'GENERAL',
    precio: 80,
    capacidad: 14800,
    emoji: '🏟️',
    color: '#006847',
  },
  {
    id: 'VIP',
    nombre: 'VIP Lounge',
    categoria: 'VIP',
    precio: 250,
    capacidad: 3500,
    emoji: '⭐',
    color: '#002868',
  },
  {
    id: 'PALCO',
    nombre: 'Palco Presidencial',
    categoria: 'PALCO',
    precio: 500,
    capacidad: 800,
    emoji: '👑',
    color: '#C8102E',
  },
];

/** Deterministic % sold based on partido ID + sector index */
function pctVendido(partidoId: number, sectorIdx: number): number {
  const raw = Math.abs(Math.sin(partidoId * 7.3 + sectorIdx * 13.1)) * 100;
  return Math.round(raw);
}

function availColor(pct: number) {
  if (pct >= 85) return '#C8102E';
  if (pct >= 60) return '#d97706';
  return '#006847';
}

function availLabel(pct: number) {
  if (pct >= 95) return 'AGOTADO';
  if (pct >= 85) return 'CASI LLENO';
  if (pct >= 60) return 'DISPONIBLE';
  return 'AMPLIA DISPONIBILIDAD';
}

// ── Date formatting ───────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
}

function dateKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

/** Extract group letter from ronda string, e.g. "GRUPO_A" → "A" */
function extractGroup(ronda: string): string | null {
  const m = ronda?.match(/[A-L]$/i);
  return m ? m[0].toUpperCase() : null;
}

// ── Stripe card styles ────────────────────────────────────────────────────────
const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0d1b2a',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#94a3b8' },
      iconColor: '#006847',
    },
    invalid: { color: '#C8102E', iconColor: '#C8102E' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Payment form
// ─────────────────────────────────────────────────────────────────────────────
interface PaymentFormProps {
  clientSecret: string;
  total: number;
  onSuccess: (piId: string) => void;
  onError: (msg: string) => void;
}

function PaymentForm({ clientSecret, total, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setPaying(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      onError(error.message ?? 'Error al procesar el pago');
      setPaying(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid rgba(0,0,0,.1)',
          borderRadius: 14,
          padding: '16px 18px',
          marginBottom: 16,
        }}
      >
        <CardElement options={CARD_STYLE} />
      </div>
      <p
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: '#94a3b8',
          fontFamily: 'Inter, sans-serif',
          marginBottom: 16,
        }}
      >
        🧪 Sandbox — usa{' '}
        <span style={{ fontFamily: 'monospace', color: '#006847', fontWeight: 600 }}>
          4242 4242 4242 4242
        </span>
        , cualquier fecha futura, cualquier CVC
      </p>
      <button
        type="submit"
        disabled={!stripe || paying}
        style={{
          width: '100%',
          padding: '14px 0',
          background: 'linear-gradient(135deg, #006847, #004d33)',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: 15,
          cursor: paying ? 'not-allowed' : 'pointer',
          opacity: paying ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all .15s',
        }}
      >
        {paying ? (
          <>
            <RefreshCw size={16} className="animate-spin" /> Procesando…
          </>
        ) : (
          <>
            <CreditCard size={16} /> Pagar ${total.toFixed(2)} USD
          </>
        )}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export function Tickets() {
  const [partidos, setPartidos] = useState<PartidoApi[]>([]);
  const [loadingP, setLoadingP] = useState(true);
  const [selectedMatch, setMatch] = useState<PartidoApi | null>(null);
  const [selectedTribuna, setTribuna] = useState<Tribuna | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('');

  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [clientSecret, setCS] = useState('');
  const [piId, setPiId] = useState('');
  const [loadingCO, setLoadingCO] = useState(false);
  const [errorMsg, setError] = useState('');

  const categoria = selectedTribuna?.categoria ?? 'GENERAL';
  const precio = selectedTribuna?.precio ?? 80;
  const total = precio * cantidad;

  // Fetch matches
  useEffect(() => {
    axios
      .get(`${API}/partidos`, { headers: getHeaders() })
      .then((r) => {
        const data: PartidoApi[] = r.data?.data ?? [];
        setPartidos(data);
        if (data.length > 0) setMatch(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingP(false));
  }, []);

  // Available unique dates & groups for filters
  const uniqueDates = useMemo(() => {
    const keys = Array.from(new Set(partidos.map((p) => dateKey(p.fechaHora)))).sort();
    return keys;
  }, [partidos]);

  const uniqueGroups = useMemo(() => {
    const groups = partidos
      .map((p) => extractGroup(p.ronda))
      .filter((g): g is string => g !== null);
    return Array.from(new Set(groups)).sort();
  }, [partidos]);

  // Filtered match list
  const filteredPartidos = useMemo(() => {
    return partidos.filter((p) => {
      if (filterDate && dateKey(p.fechaHora) !== filterDate) return false;
      if (filterGroup) {
        const g = extractGroup(p.ronda);
        if (g !== filterGroup) return false;
      }
      return true;
    });
  }, [partidos, filterDate, filterGroup]);

  const handleCheckout = async () => {
    if (!selectedMatch || !selectedTribuna) return;
    setLoadingCO(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${API}/entradas/checkout`,
        {
          partidoId: selectedMatch.id,
          categoria,
          cantidad,
          seleccionLocal: selectedMatch.seleccionLocal,
          seleccionVisitante: selectedMatch.seleccionVisitante,
          estadioNombre: selectedMatch.estadioNombre,
          ronda: selectedMatch.ronda,
        },
        { headers: getHeaders() },
      );
      setCS(data.data.clientSecret);
      setStep('payment');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? 'Error al iniciar el pago');
    } finally {
      setLoadingCO(false);
    }
  };

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f0f2f5',
          paddingTop: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 24px 60px',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            background: '#fff',
            borderRadius: 24,
            padding: 48,
            textAlign: 'center',
            boxShadow: '0 8px 48px rgba(0,0,0,.1)',
          }}
        >
          <CheckCircle2 size={64} style={{ color: '#006847', margin: '0 auto 20px' }} />
          <h2
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: '#0d1b2a',
              margin: '0 0 12px',
            }}
          >
            ¡Pago exitoso!
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#64748b',
              fontSize: 15,
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Tus <strong style={{ color: '#0d1b2a' }}>{cantidad}</strong> entrada(s){' '}
            <strong>{selectedTribuna?.nombre}</strong> han sido confirmadas. Recibirás los códigos
            QR en tu correo.
          </p>
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 28,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 6,
              }}
            >
              Confirmación Stripe
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#006847',
                wordBreak: 'break-all',
              }}
            >
              {piId}
            </div>
          </div>
          <button
            onClick={() => {
              setStep('form');
              setCantidad(1);
              setTribuna(null);
            }}
            style={{
              padding: '12px 28px',
              background: 'transparent',
              border: '1.5px solid rgba(0,0,0,.12)',
              borderRadius: 12,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              color: '#0d1b2a',
            }}
          >
            Comprar más entradas
          </button>
        </div>
      </main>
    );
  }

  // ── Payment step ─────────────────────────────────────────────────────────────
  if (step === 'payment' && clientSecret) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f0f2f5',
          paddingTop: 80,
        }}
      >
        {/* Header */}
        <section
          style={{
            borderBottom: '1px solid rgba(0,0,0,.08)',
            background: '#fff',
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin: '0 auto',
              padding: '40px 36px 0',
            }}
          >
            <h1
              style={{
                fontFamily: '"Bebas Neue", "Anton", sans-serif',
                fontSize: 64,
                lineHeight: 0.9,
                fontWeight: 900,
                margin: '0 0 24px',
                color: '#0d1b2a',
              }}
            >
              CONFIRMAR <span style={{ color: '#006847' }}>PAGO</span>
            </h1>
          </div>
        </section>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 36px 80px' }}>
          {/* Summary */}
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '24px 28px',
              marginBottom: 24,
              boxShadow: '0 2px 12px rgba(0,0,0,.06)',
            }}
          >
            {[
              {
                label: 'Partido',
                value: `${selectedMatch?.seleccionLocal} vs ${selectedMatch?.seleccionVisitante}`,
              },
              {
                label: 'Tribuna',
                value: `${selectedTribuna?.emoji} ${selectedTribuna?.nombre}`,
              },
              { label: 'Cantidad', value: String(cantidad) },
              {
                label: 'Precio unitario',
                value: `$${precio} USD`,
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(0,0,0,.05)',
                }}
              >
                <span style={{ color: '#64748b' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: '#0d1b2a' }}>{row.value}</span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: 18,
                fontWeight: 800,
                paddingTop: 16,
                color: '#0d1b2a',
              }}
            >
              <span>Total</span>
              <span style={{ color: '#006847' }}>${total.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Stripe form */}
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <PaymentForm
                clientSecret={clientSecret}
                total={total}
                onSuccess={(id) => {
                  setPiId(id);
                  setStep('success');
                }}
                onError={(msg) => setError(msg)}
              />
            </Elements>
          ) : (
            <div
              style={{
                background: 'rgba(200,16,46,.06)',
                border: '1px solid rgba(200,16,46,.2)',
                borderRadius: 14,
                padding: '20px 24px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={20} style={{ color: '#C8102E', flexShrink: 0, marginTop: 2 }} />
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: '#0d1b2a',
                  margin: 0,
                }}
              >
                Stripe no está configurado. Agrega{' '}
                <code
                  style={{
                    background: '#f1f5f9',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  VITE_STRIPE_PK
                </code>{' '}
                en tu archivo{' '}
                <code
                  style={{
                    background: '#f1f5f9',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  .env.local
                </code>
                .
              </p>
            </div>
          )}

          <button
            onClick={() => setStep('form')}
            style={{
              marginTop: 16,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#94a3b8',
              display: 'block',
              textAlign: 'center',
              width: '100%',
            }}
          >
            ← Volver a seleccionar
          </button>
        </div>
      </main>
    );
  }

  // ── FORM STEP ─────────────────────────────────────────────────────────────
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f0f2f5',
        paddingTop: 80,
      }}
    >
      {/* ── HERO HEADER ── */}
      <section
        style={{
          borderBottom: '1px solid rgba(0,0,0,.08)',
          background: '#fff',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 36px 0' }}>
          <h1
            style={{
              fontFamily: '"Bebas Neue", "Oswald", "Anton", sans-serif',
              fontSize: 'clamp(56px, 9vw, 112px)',
              lineHeight: 0.9,
              fontWeight: 900,
              margin: '0 0 16px',
              color: '#0d1b2a',
            }}
          >
            ENTRADAS <span style={{ color: '#C8102E' }}>2026</span>
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              color: '#64748b',
              marginBottom: 0,
              lineHeight: 1.6,
            }}
          >
            Compra tus entradas para el FIFA World Cup — pago seguro con Stripe
          </p>

          {/* Stats strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, auto) 1fr',
              marginTop: 36,
              borderTop: '1px solid rgba(0,0,0,.06)',
            }}
          >
            {[
              {
                icon: <Calendar size={14} />,
                label: 'Partidos disponibles',
                value: partidos.length,
              },
              { icon: <Users size={14} />, label: 'Tribunas por partido', value: TRIBUNAS.length },
              { icon: <Filter size={14} />, label: 'Grupos', value: uniqueGroups.length || '12' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '18px 28px',
                  borderRight: '1px solid rgba(0,0,0,.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: '#006847' }}>{s.icon}</span>
                <div>
                  <div
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 22,
                      fontWeight: 800,
                      color: '#0d1b2a',
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginTop: 3,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '36px 36px 100px',
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 28,
          alignItems: 'flex-start',
        }}
      >
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Error banner */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(200,16,46,.06)',
                border: '1px solid rgba(200,16,46,.2)',
                borderRadius: 14,
                padding: '14px 18px',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <AlertCircle size={18} style={{ color: '#C8102E', flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  color: '#0d1b2a',
                }}
              >
                {errorMsg}
              </span>
            </div>
          )}

          {/* ── STEP 1: Match selector ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '24px 28px',
              boxShadow: '0 2px 12px rgba(0,0,0,.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #006847, #004d33)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <h2
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                  color: '#0d1b2a',
                }}
              >
                Seleccionar Partido
              </h2>
            </div>

            {/* Filters */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 18,
                flexWrap: 'wrap',
              }}
            >
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(0,0,0,.1)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  background: '#f8fafc',
                  color: '#0d1b2a',
                  cursor: 'pointer',
                }}
              >
                <option value="">📅 Todas las fechas</option>
                {uniqueDates.map((d) => (
                  <option key={d} value={d}>
                    {new Date(d + 'T12:00:00').toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>

              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(0,0,0,.1)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  background: '#f8fafc',
                  color: '#0d1b2a',
                  cursor: 'pointer',
                }}
              >
                <option value="">🏆 Todos los grupos</option>
                {uniqueGroups.map((g) => (
                  <option key={g} value={g}>
                    Grupo {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Match list */}
            {loadingP ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 60,
                      borderRadius: 12,
                      background: '#f1f5f9',
                      animation: 'shimmer 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            ) : filteredPartidos.length === 0 ? (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#94a3b8',
                  fontSize: 14,
                  textAlign: 'center',
                  padding: '24px 0',
                }}
              >
                No hay partidos para los filtros seleccionados.
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 8,
                  maxHeight: 320,
                  overflowY: 'auto',
                }}
              >
                {filteredPartidos.map((p) => {
                  const active = selectedMatch?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setMatch(p);
                        setTribuna(null);
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: active ? '2px solid #006847' : '1px solid rgba(0,0,0,.08)',
                        background: active ? 'rgba(0,104,71,.05)' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 700,
                          fontSize: 13,
                          color: active ? '#006847' : '#0d1b2a',
                          lineHeight: 1.3,
                        }}
                      >
                        {p.seleccionLocal} vs {p.seleccionVisitante}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 11,
                          color: '#94a3b8',
                          marginTop: 4,
                        }}
                      >
                        {p.ronda} · {p.estadioNombre} · {fmtDate(p.fechaHora)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── STEP 2: Tribuna selector ── */}
          {selectedMatch && (
            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: '24px 28px',
                boxShadow: '0 2px 12px rgba(0,0,0,.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #006847, #004d33)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <h2
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    margin: 0,
                    color: '#0d1b2a',
                  }}
                >
                  Seleccionar Tribuna
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 12,
                }}
              >
                {TRIBUNAS.map((t, idx) => {
                  const pct = pctVendido(selectedMatch.id, idx);
                  const agotado = pct >= 95;
                  const active = selectedTribuna?.id === t.id;
                  const col = availColor(pct);

                  return (
                    <button
                      key={t.id}
                      onClick={() => !agotado && setTribuna(active ? null : t)}
                      disabled={agotado}
                      style={{
                        textAlign: 'left',
                        padding: '16px 18px',
                        borderRadius: 14,
                        border: active ? `2px solid ${t.color}` : '1px solid rgba(0,0,0,.08)',
                        background: active ? `${t.color}12` : agotado ? '#f1f5f9' : '#fafbfc',
                        cursor: agotado ? 'not-allowed' : 'pointer',
                        opacity: agotado ? 0.55 : 1,
                        transition: 'all .18s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Availability bar */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          height: 3,
                          width: `${pct}%`,
                          background: col,
                          borderRadius: '0 0 0 14px',
                          transition: 'width .4s',
                        }}
                      />

                      <div
                        style={{
                          fontSize: 24,
                          marginBottom: 8,
                        }}
                      >
                        {t.emoji}
                      </div>
                      <div
                        style={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 700,
                          fontSize: 13,
                          color: active ? t.color : '#0d1b2a',
                          marginBottom: 4,
                        }}
                      >
                        {t.nombre}
                      </div>
                      <div
                        style={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontSize: 18,
                          fontWeight: 800,
                          color: active ? t.color : '#0d1b2a',
                          marginBottom: 6,
                        }}
                      >
                        ${t.precio}{' '}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: '#94a3b8',
                          }}
                        >
                          USD
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 4,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 10,
                            color: '#94a3b8',
                          }}
                        >
                          {t.capacidad.toLocaleString()} cap.
                        </span>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 9,
                            fontWeight: 700,
                            color: col,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {availLabel(pct)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 3: Quantity ── */}
          {selectedTribuna && (
            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: '24px 28px',
                boxShadow: '0 2px 12px rgba(0,0,0,.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #006847, #004d33)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  3
                </div>
                <h2
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    margin: 0,
                    color: '#0d1b2a',
                  }}
                >
                  Cantidad (máx. 4)
                </h2>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                <button
                  onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                  disabled={cantidad <= 1}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1px solid rgba(0,0,0,.12)',
                    background: '#f8fafc',
                    cursor: cantidad <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: cantidad <= 1 ? 0.4 : 1,
                    transition: 'all .15s',
                  }}
                >
                  <Minus size={16} style={{ color: '#0d1b2a' }} />
                </button>

                <span
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 40,
                    fontWeight: 900,
                    color: '#006847',
                    lineHeight: 1,
                    minWidth: 48,
                    textAlign: 'center',
                  }}
                >
                  {cantidad}
                </span>

                <button
                  onClick={() => setCantidad((q) => Math.min(4, q + 1))}
                  disabled={cantidad >= 4}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1px solid rgba(0,0,0,.12)',
                    background: '#f8fafc',
                    cursor: cantidad >= 4 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: cantidad >= 4 ? 0.4 : 1,
                    transition: 'all .15s',
                  }}
                >
                  <Plus size={16} style={{ color: '#0d1b2a' }} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '24px 24px',
              boxShadow: '0 4px 24px rgba(0,0,0,.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20,
              }}
            >
              <Ticket size={16} style={{ color: '#006847' }} />
              <h2
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  margin: 0,
                  color: '#0d1b2a',
                }}
              >
                Resumen del Pedido
              </h2>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: 'Partido',
                  value: selectedMatch
                    ? `${selectedMatch.seleccionLocal} vs ${selectedMatch.seleccionVisitante}`
                    : '—',
                },
                {
                  label: 'Tribuna',
                  value: selectedTribuna
                    ? `${selectedTribuna.emoji} ${selectedTribuna.nombre}`
                    : '—',
                },
                {
                  label: 'Precio',
                  value: selectedTribuna ? `$${precio} USD` : '—',
                },
                { label: 'Cantidad', value: String(cantidad) },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: '#94a3b8' }}>{row.label}</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#0d1b2a',
                      textAlign: 'right',
                      maxWidth: 160,
                      lineHeight: 1.3,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              <div
                style={{
                  borderTop: '1px solid rgba(0,0,0,.07)',
                  paddingTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#0d1b2a',
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 900,
                    fontSize: 26,
                    color: '#006847',
                  }}
                >
                  ${total} USD
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!selectedMatch || !selectedTribuna || loadingCO}
              style={{
                width: '100%',
                padding: '15px 0',
                background:
                  !selectedMatch || !selectedTribuna
                    ? '#e2e8f0'
                    : 'linear-gradient(135deg, #006847, #004d33)',
                color: !selectedMatch || !selectedTribuna ? '#94a3b8' : '#fff',
                border: 'none',
                borderRadius: 14,
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: 15,
                cursor: !selectedMatch || !selectedTribuna || loadingCO ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all .15s',
              }}
            >
              {loadingCO ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Preparando pago…
                </>
              ) : (
                <>
                  <CreditCard size={16} /> Continuar al pago
                </>
              )}
            </button>

            {(!selectedMatch || !selectedTribuna) && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  color: '#94a3b8',
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                {!selectedMatch
                  ? 'Selecciona un partido para continuar'
                  : 'Selecciona una tribuna para continuar'}
              </p>
            )}

            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#cbd5e1',
                textAlign: 'center',
                marginTop: 14,
              }}
            >
              🔒 Pago seguro mediante Stripe · Entorno sandbox
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
