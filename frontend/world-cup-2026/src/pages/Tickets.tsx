import { useState, useEffect } from 'react';
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
} from 'lucide-react';

// ── Stripe init ───────────────────────────────────────────────────────────────
const STRIPE_PK = import.meta.env.VITE_STRIPE_PK as string | undefined;
const stripePromise = STRIPE_PK && !STRIPE_PK.includes('REEMPLAZA') ? loadStripe(STRIPE_PK) : null;

const API = 'http://localhost:8082/api/v1';

function getHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ── Categorías y precios ──────────────────────────────────────────────────────
const CATEGORIAS = [
  {
    key: 'GENERAL',
    label: 'General',
    price: 80,
    desc: 'Vista panorámica del estadio',
    emoji: '🎫',
  },
  {
    key: 'VIP',
    label: 'VIP',
    price: 250,
    desc: 'Zona preferencial con acceso a lounge',
    emoji: '⭐',
  },
  {
    key: 'PALCO',
    label: 'Palco',
    price: 500,
    desc: 'Palco privado con servicio exclusivo',
    emoji: '👑',
  },
];

// ── Stripe CardElement styles ─────────────────────────────────────────────────
const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#64748b' },
      iconColor: '#7c3aed',
    },
    invalid: { color: '#f43f5e', iconColor: '#f43f5e' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Payment form (inside Elements context)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass rounded-xl p-4 border border-border">
        <CardElement options={CARD_STYLE} />
      </div>
      <p className="text-[11px] text-text-muted text-center">
        🧪 Sandbox — usa <span className="font-mono text-primary">4242 4242 4242 4242</span>,
        cualquier fecha futura, cualquier CVC
      </p>
      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full py-3 gradient-primary text-text-inverse font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
      >
        {paying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> Procesando…
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" /> Pagar ${total.toFixed(2)} USD
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
  const [categoria, setCategoria] = useState('GENERAL');
  const [cantidad, setCantidad] = useState(1);

  const [step, setStep] = useState<'form' | 'payment' | 'success' | 'error'>('form');
  const [clientSecret, setCS] = useState('');
  const [piId, setPiId] = useState('');
  const [loadingCO, setLoadingCO] = useState(false);
  const [errorMsg, setError] = useState('');

  const precio = CATEGORIAS.find((c) => c.key === categoria)?.price ?? 80;
  const total = precio * cantidad;

  // Fetch partidos disponibles
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

  const handleCheckout = async () => {
    if (!selectedMatch) return;
    setLoadingCO(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${API}/entradas/checkout`,
        { partidoId: selectedMatch.id, categoria, cantidad },
        { headers: getHeaders() },
      );
      setCS(data.data.clientSecret);
      setStep('payment');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Error al iniciar el pago';
      setError(msg);
    } finally {
      setLoadingCO(false);
    }
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-lg mx-auto w-full pb-28 md:pb-12">
        <div className="glass rounded-2xl p-10 text-center mt-8">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="font-headline text-2xl font-black text-text-primary mb-2">
            ¡Pago exitoso!
          </h2>
          <p className="text-text-muted mb-6">
            Tus <span className="font-bold text-primary">{cantidad}</span> entrada(s){' '}
            <span className="font-bold">{categoria}</span> han sido confirmadas.
          </p>
          <div className="glass rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              Confirmación Stripe
            </p>
            <p className="font-mono text-xs text-primary break-all">{piId}</p>
          </div>
          <p className="text-sm text-text-muted mb-6">
            Recibirás los códigos QR en tu correo electrónico.
          </p>
          <button
            onClick={() => {
              setStep('form');
              setCantidad(1);
            }}
            className="px-6 py-2.5 glass rounded-xl text-sm font-semibold text-text-primary hover:bg-bg-elevated transition-all"
          >
            Comprar más entradas
          </button>
        </div>
      </main>
    );
  }

  // ── Payment step ────────────────────────────────────────────────────────────
  if (step === 'payment' && clientSecret) {
    const CatInfo = CATEGORIAS.find((c) => c.key === categoria)!;
    return (
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-lg mx-auto w-full pb-28 md:pb-12">
        <h1 className="font-headline text-3xl font-extrabold text-text-primary mb-6">
          Confirmar <span className="gradient-text">Pago</span>
        </h1>

        {/* Summary */}
        <div className="glass rounded-2xl p-5 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Partido</span>
            <span className="font-semibold text-text-primary">
              {selectedMatch?.seleccionLocal} vs {selectedMatch?.seleccionVisitante}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Categoría</span>
            <span className="font-semibold">
              {CatInfo.emoji} {CatInfo.label}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Cantidad</span>
            <span className="font-semibold">{cantidad}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold text-text-primary">Total</span>
            <span className="font-black text-primary text-lg">${total.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Stripe Elements */}
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <PaymentForm
              clientSecret={clientSecret}
              total={total}
              onSuccess={(id) => {
                setPiId(id);
                setStep('success');
              }}
              onError={(msg) => {
                setError(msg);
                setStep('error');
              }}
            />
          </Elements>
        ) : (
          <div className="glass rounded-xl p-5 text-center text-accent">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">
              Stripe no está configurado. Agrega{' '}
              <code className="bg-bg-elevated px-1 rounded">VITE_STRIPE_PK</code> en el archivo{' '}
              <code className="bg-bg-elevated px-1 rounded">.env.local</code>.
            </p>
          </div>
        )}

        <button
          onClick={() => setStep('form')}
          className="mt-4 w-full text-center text-sm text-text-muted hover:text-text-secondary"
        >
          ← Volver a seleccionar
        </button>
      </main>
    );
  }

  // ── Form step ───────────────────────────────────────────────────────────────
  return (
    <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-lg mx-auto w-full pb-28 md:pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Entradas <span className="gradient-text">2026</span>
        </h1>
        <p className="text-text-muted mt-1">
          Compra tus entradas para el FIFA World Cup — pago seguro con Stripe
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 glass rounded-xl flex items-center gap-3 text-accent">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: selector form ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Step 1: Partido */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-headline font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full gradient-primary text-text-inverse text-xs flex items-center justify-center font-black">
                1
              </span>
              Seleccionar Partido
            </h2>
            {loadingP ? (
              <div className="h-16 glass rounded-xl animate-pulse" />
            ) : partidos.length === 0 ? (
              <p className="text-sm text-text-muted">No hay partidos disponibles.</p>
            ) : (
              <div className="space-y-2">
                {partidos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setMatch(p)}
                    className={`w-full text-left glass rounded-xl px-4 py-3 transition-all hover:bg-bg-elevated ${
                      selectedMatch?.id === p.id ? 'ring-1 ring-primary bg-primary/5' : ''
                    }`}
                  >
                    <p
                      className={`font-semibold text-sm ${selectedMatch?.id === p.id ? 'text-primary' : 'text-text-primary'}`}
                    >
                      {p.seleccionLocal} vs {p.seleccionVisitante}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {p.ronda} · {p.estadioNombre} ·{' '}
                      {new Date(p.fechaHora).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Categoría */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-headline font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full gradient-primary text-text-inverse text-xs flex items-center justify-center font-black">
                2
              </span>
              Categoría de Entrada
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoria(cat.key)}
                  className={`rounded-xl p-4 text-left transition-all border ${
                    categoria === cat.key
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border glass hover:bg-bg-elevated'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <p
                    className={`font-bold text-sm ${categoria === cat.key ? 'text-primary' : 'text-text-primary'}`}
                  >
                    {cat.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{cat.desc}</p>
                  <p className="text-sm font-black text-primary mt-2">${cat.price} USD</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Cantidad */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-headline font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full gradient-primary text-text-inverse text-xs flex items-center justify-center font-black">
                3
              </span>
              Cantidad (máx. 4)
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                disabled={cantidad <= 1}
                className="w-10 h-10 glass rounded-full flex items-center justify-center text-text-primary hover:bg-bg-elevated disabled:opacity-40 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-headline text-3xl font-black text-primary w-10 text-center">
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad((q) => Math.min(4, q + 1))}
                disabled={cantidad >= 4}
                className="w-10 h-10 glass rounded-full flex items-center justify-center text-text-primary hover:bg-bg-elevated disabled:opacity-40 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: order summary ─────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-5 sticky top-24">
            <h2 className="font-headline font-bold text-text-primary mb-5 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              Resumen del Pedido
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Partido</span>
                <span className="font-medium text-text-primary text-right max-w-[160px] leading-tight">
                  {selectedMatch
                    ? `${selectedMatch.seleccionLocal} vs ${selectedMatch.seleccionVisitante}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Categoría</span>
                <span className="font-medium">
                  {CATEGORIAS.find((c) => c.key === categoria)?.emoji}{' '}
                  {CATEGORIAS.find((c) => c.key === categoria)?.label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Precio unitario</span>
                <span className="font-medium">${precio} USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Cantidad</span>
                <span className="font-medium">{cantidad}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-text-primary">Total</span>
                <span className="font-black text-primary text-xl">${total} USD</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!selectedMatch || loadingCO}
              className="w-full py-3.5 gradient-primary text-text-inverse font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90"
            >
              {loadingCO ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Preparando pago…
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Continuar al pago
                </>
              )}
            </button>

            <p className="text-[10px] text-text-muted text-center mt-3">
              🔒 Pago seguro mediante Stripe · Entorno sandbox
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
