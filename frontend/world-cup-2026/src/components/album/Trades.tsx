import { useState, useEffect } from 'react';
import { StickerCard } from './StickerCard';
import type { LaminaAlbum } from './albumApi';
import { parseRareza, RARITY } from './rarityUtils';

// ─── Bot simulation ───────────────────────────────────────────────────────────

interface TradeOffer {
  id: string;
  botName: string;
  botEmoji: string;
  theyOffer: LaminaAlbum;  // what the bot offers
  theyWant: LaminaAlbum;   // what the bot wants (must be a repeated sticker the user has)
  expiresIn: number;        // seconds
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface TradesProps {
  laminas: LaminaAlbum[];
  onAccept: (give: number, receive: LaminaAlbum) => void;
}

const BOT_NAMES = [
  { name: 'FutboleroMX',  emoji: '🇲🇽' },
  { name: 'CronistaUSA',  emoji: '🇺🇸' },
  { name: 'PaniniPro',    emoji: '🇧🇷' },
  { name: 'AlbumKing',    emoji: '👑' },
  { name: 'ColeccionistaAR', emoji: '🇦🇷' },
  { name: 'StickerHunter', emoji: '🔥' },
];

/** Generate a random bot sticker (IDs 1-320) */
function randomBotSticker(): LaminaAlbum {
  const id = Math.floor(Math.random() * 320) + 1;
  const rarezas = ['COMUN','COMUN','COMUN','RARO','RARO','EPICO','LEGENDARIO'];
  const rareza = rarezas[Math.floor(Math.random() * rarezas.length)];
  const names = ['Carlos López','Mehdi Rahimi','Luca Ferrari','Hiroshi Tanaka','André Silva','Kwame Asante','James O\'Brien','Pablo García'];
  const name = names[id % names.length];
  return { idLamina: id, nombreJugador: name, rareza, estaPegada: false, cantidadRepetidas: 1 };
}

/** Generate a trade offer requesting one of the user's repeated stickers */
function generateOffer(repeated: LaminaAlbum[]): TradeOffer | null {
  if (repeated.length === 0) return null;
  const want = repeated[Math.floor(Math.random() * repeated.length)];
  const bot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  return {
    id: `${Date.now()}-${Math.random()}`,
    botName: bot.name,
    botEmoji: bot.emoji,
    theyOffer: randomBotSticker(),
    theyWant: want,
    expiresIn: 60 + Math.floor(Math.random() * 120), // 1-3 min
    status: 'pending',
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Trades({ laminas, onAccept }: TradesProps) {
  const repeated = laminas.filter(l => l.cantidadRepetidas > 1);
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [log, setLog] = useState<string[]>([]);

  // Generate initial offers
  useEffect(() => {
    if (repeated.length === 0) return;
    const initial: TradeOffer[] = [];
    for (let i = 0; i < Math.min(3, repeated.length); i++) {
      const o = generateOffer(repeated);
      if (o) initial.push(o);
    }
    setOffers(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown + expiry timer
  useEffect(() => {
    const t = setInterval(() => {
      setOffers(prev => prev.map(o => {
        if (o.status !== 'pending') return o;
        const next = o.expiresIn - 1;
        if (next <= 0) return { ...o, expiresIn: 0, status: 'expired' };
        return { ...o, expiresIn: next };
      }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleAccept = (offer: TradeOffer) => {
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'accepted' } : o));
    onAccept(offer.theyWant.idLamina, offer.theyOffer);
    setLog(prev => [`✅ Intercambiaste ${offer.theyWant.nombreJugador} por ${offer.theyOffer.nombreJugador} con ${offer.botName}`, ...prev.slice(0, 9)]);
  };

  const handleReject = (offer: TradeOffer) => {
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'rejected' } : o));
    setLog(prev => [`❌ Rechazaste la oferta de ${offer.botName}`, ...prev.slice(0, 9)]);
  };

  const handleNewOffers = () => {
    if (repeated.length === 0) return;
    const newOff: TradeOffer[] = [];
    const count = Math.min(2 + Math.floor(Math.random() * 2), repeated.length);
    for (let i = 0; i < count; i++) {
      const o = generateOffer(repeated);
      if (o) newOff.push(o);
    }
    setOffers(prev => [...prev.filter(o => o.status === 'pending'), ...newOff]);
  };

  const pendingOffers = offers.filter(o => o.status === 'pending');

  const statusColor = (s: TradeOffer['status']) => {
    if (s === 'accepted') return '#34d399';
    if (s === 'rejected') return '#f87171';
    if (s === 'expired')  return '#94a3b8';
    return '#60a5fa';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '4px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ color: '#fff', fontFamily: 'Oswald,sans-serif', fontWeight: 700, fontSize: 20, margin: 0 }}>
            Intercambios 🔄
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '4px 0 0', fontFamily: 'Inter,sans-serif' }}>
            {repeated.length} cromos repetidos disponibles para intercambiar
          </p>
        </div>
        <button
          onClick={handleNewOffers}
          disabled={repeated.length === 0}
          style={{
            padding: '8px 20px', borderRadius: 999,
            background: repeated.length > 0 ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${repeated.length > 0 ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: repeated.length > 0 ? '#93c5fd' : 'rgba(255,255,255,0.3)',
            fontSize: 13, fontWeight: 600, cursor: repeated.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter,sans-serif',
          }}
        >
          🔄 Buscar ofertas
        </button>
      </div>

      {/* Empty state */}
      {repeated.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,sans-serif' }}>
          <div style={{ fontSize: 36 }}>🔄</div>
          <p style={{ marginTop: 12 }}>Necesitas cromos repetidos para intercambiar.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>¡Abre más sobres!</p>
        </div>
      )}

      {/* Pending offers */}
      {pendingOffers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0, fontFamily: 'Inter,sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
            Ofertas activas ({pendingOffers.length})
          </p>
          {pendingOffers.map(offer => {
            const offerRz = parseRareza(offer.theyOffer.rareza);
            const offerRc = RARITY[offerRz];
            const wantRz  = parseRareza(offer.theyWant.rareza);
            const wantRc  = RARITY[wantRz];
            const urgent  = offer.expiresIn < 20;

            return (
              <div key={offer.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 16,
                display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
              }}>
                {/* Bot info */}
                <div style={{ minWidth: 80, textAlign: 'center' }}>
                  <span style={{ fontSize: 28 }}>{offer.botEmoji}</span>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: '4px 0 0', fontFamily: 'Inter,sans-serif' }}>{offer.botName}</p>
                  <p style={{ color: urgent ? '#f87171' : 'rgba(255,255,255,0.4)', fontSize: 10, margin: 0, fontFamily: 'Inter,sans-serif' }}>
                    ⏱ {offer.expiresIn}s
                  </p>
                </div>

                {/* They offer */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, margin: 0, fontFamily: 'Inter,sans-serif' }}>Te ofrezco</p>
                  <StickerCard
                    idLamina={offer.theyOffer.idLamina}
                    nombreJugador={offer.theyOffer.nombreJugador}
                    rareza={offer.theyOffer.rareza}
                    size="sm"
                  />
                  <span style={{ fontSize: 10, color: offerRc.color, fontFamily: 'Inter,sans-serif' }}>{offerRc.label}</span>
                </div>

                {/* Arrow */}
                <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }}>⇄</div>

                {/* They want */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, margin: 0, fontFamily: 'Inter,sans-serif' }}>Me das</p>
                  <StickerCard
                    idLamina={offer.theyWant.idLamina}
                    nombreJugador={offer.theyWant.nombreJugador}
                    rareza={offer.theyWant.rareza}
                    cantidadRepetidas={offer.theyWant.cantidadRepetidas}
                    size="sm"
                    showRepeatBadge
                  />
                  <span style={{ fontSize: 10, color: wantRc.color, fontFamily: 'Inter,sans-serif' }}>{wantRc.label}</span>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 'auto' }}>
                  <button
                    onClick={() => handleAccept(offer)}
                    style={{
                      padding: '8px 20px', borderRadius: 999,
                      background: 'rgba(52,211,153,0.2)',
                      border: '1px solid rgba(52,211,153,0.5)',
                      color: '#6ee7b7', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Oswald,sans-serif', letterSpacing: 1,
                    }}
                  >
                    ✓ Aceptar
                  </button>
                  <button
                    onClick={() => handleReject(offer)}
                    style={{
                      padding: '8px 20px', borderRadius: 999,
                      background: 'rgba(248,113,113,0.1)',
                      border: '1px solid rgba(248,113,113,0.3)',
                      color: '#fca5a5', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Oswald,sans-serif', letterSpacing: 1,
                    }}
                  >
                    ✗ Rechazar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past trades log */}
      {offers.filter(o => o.status !== 'pending').length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0, fontFamily: 'Inter,sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
            Historial
          </p>
          {offers.filter(o => o.status !== 'pending').map(o => (
            <div key={o.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${statusColor(o.status)}22`,
              borderRadius: 8, padding: '8px 12px',
            }}>
              <span style={{ fontSize: 14 }}>{o.botEmoji}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter,sans-serif', flex: 1 }}>
                <b style={{ color: statusColor(o.status) }}>
                  {o.status === 'accepted' ? '✅' : o.status === 'rejected' ? '❌' : '⏰'}{' '}
                </b>
                {o.botName} · {o.theyWant.nombreJugador} ⇄ {o.theyOffer.nombreJugador}
              </span>
              <span style={{ fontSize: 10, color: statusColor(o.status), fontFamily: 'Inter,sans-serif' }}>
                {o.status === 'accepted' ? 'Aceptado' : o.status === 'rejected' ? 'Rechazado' : 'Expirado'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Activity log */}
      {log.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, margin: '0 0 6px', fontFamily: 'Inter,sans-serif', textTransform: 'uppercase' }}>Actividad reciente</p>
          {log.map((l, i) => (
            <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '2px 0', fontFamily: 'Inter,sans-serif' }}>{l}</p>
          ))}
        </div>
      )}

      {/* Repeated stickers preview */}
      {repeated.length > 0 && (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 8px', fontFamily: 'Inter,sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>
            Mis repetidos ({repeated.length})
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {repeated.slice(0, 12).map(l => (
              <StickerCard
                key={l.idLamina}
                idLamina={l.idLamina}
                nombreJugador={l.nombreJugador}
                rareza={l.rareza}
                cantidadRepetidas={l.cantidadRepetidas}
                size="xs"
                showRepeatBadge
              />
            ))}
            {repeated.length > 12 && (
              <div style={{ width: 60, height: 84, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Inter,sans-serif' }}>
                +{repeated.length - 12}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
