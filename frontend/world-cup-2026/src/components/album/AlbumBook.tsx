import { useState, useEffect, useCallback, useRef } from 'react';
import { StickerCard } from './StickerCard';
import { StadiumCard, type Stadium } from './StadiumCard';
import { TEAMS, type Team } from './teamColors';
import type { LaminaAlbum } from './albumApi';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STADIUMS: Stadium[] = [
  {
    id: 1,
    nombre: 'MetLife Stadium',
    ciudad: 'East Rutherford, NJ',
    pais: 'USA',
    capacidad: 82500,
  },
  { id: 2, nombre: 'Rose Bowl', ciudad: 'Pasadena, CA', pais: 'USA', capacidad: 91136 },
  { id: 3, nombre: "Levi's Stadium", ciudad: 'Santa Clara, CA', pais: 'USA', capacidad: 68500 },
  { id: 4, nombre: 'AT&T Stadium', ciudad: 'Arlington, TX', pais: 'USA', capacidad: 80000 },
  { id: 5, nombre: 'SoFi Stadium', ciudad: 'Inglewood, CA', pais: 'USA', capacidad: 70240 },
  { id: 6, nombre: 'State Farm Stadium', ciudad: 'Glendale, AZ', pais: 'USA', capacidad: 72200 },
  { id: 7, nombre: 'Arrowhead Stadium', ciudad: 'Kansas City, MO', pais: 'USA', capacidad: 76416 },
  { id: 8, nombre: 'Empower Field', ciudad: 'Denver, CO', pais: 'USA', capacidad: 76125 },
  { id: 9, nombre: 'Lumen Field', ciudad: 'Seattle, WA', pais: 'USA', capacidad: 72000 },
  { id: 10, nombre: 'NRG Stadium', ciudad: 'Houston, TX', pais: 'USA', capacidad: 72220 },
  {
    id: 11,
    nombre: 'Hard Rock Stadium',
    ciudad: 'Miami Gardens, FL',
    pais: 'USA',
    capacidad: 65326,
  },
  { id: 12, nombre: 'BC Place', ciudad: 'Vancouver, BC', pais: 'Canadá', capacidad: 54500 },
  { id: 13, nombre: 'BMO Field', ciudad: 'Toronto, ON', pais: 'Canadá', capacidad: 30000 },
  {
    id: 14,
    nombre: 'Estadio Azteca',
    ciudad: 'Ciudad de México',
    pais: 'México',
    capacidad: 87523,
  },
  { id: 15, nombre: 'Estadio Akron', ciudad: 'Guadalajara', pais: 'México', capacidad: 49850 },
  { id: 16, nombre: 'Estadio BBVA', ciudad: 'Monterrey', pais: 'México', capacidad: 53500 },
];

// ─── Page model ───────────────────────────────────────────────────────────────

type ContentPage =
  | { type: 'intro' }
  | { type: 'groups' }
  | { type: 'team'; teamIdx: number }
  | { type: 'stadiums-intro' }
  | { type: 'stadium'; stadiumIdx: number };

const CONTENT_PAGES: ContentPage[] = [
  { type: 'intro' },
  { type: 'groups' },
  ...TEAMS.map((_, i): ContentPage => ({ type: 'team', teamIdx: i })),
  { type: 'stadiums-intro' },
  ...STADIUMS.map((_, i): ContentPage => ({ type: 'stadium', stadiumIdx: i })),
];

// spread 0 = cover, spreads 1..N = 2 content pages each
const TOTAL_SPREADS = 1 + Math.ceil(CONTENT_PAGES.length / 2); // 1 + 25 = 26

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLaminasForTeam(laminas: LaminaAlbum[], teamIdx: number): (LaminaAlbum | null)[] {
  const slots: (LaminaAlbum | null)[] = Array(10).fill(null);
  laminas.forEach((l) => {
    const ti = Math.floor((l.idLamina - 1) / 10) % TEAMS.length;
    const si = (l.idLamina - 1) % 10;
    if (ti === teamIdx) slots[si] = l;
  });
  return slots;
}

function teamProgress(laminas: LaminaAlbum[], teamIdx: number) {
  const slots = getLaminasForTeam(laminas, teamIdx);
  const pasted = slots.filter((s) => s?.estaPegada).length;
  const owned = slots.filter(Boolean).length;
  return { pasted, owned, total: 10 };
}

// ─── Sub‑components ───────────────────────────────────────────────────────────

// ── Album cover ──
function AlbumCover({ laminas, onOpen }: { laminas: LaminaAlbum[]; onOpen: () => void }) {
  const pasted = laminas.filter((l) => l.estaPegada).length;
  const pct = Math.round((pasted / (TEAMS.length * 10)) * 100);

  // Generate star positions once on mount using useState to avoid impurity
  const [stars] = useState(() =>
    Array.from({ length: 32 }).map((_, i) => ({
      top: `${Math.random() * 90 + 5}%`,
      left: `${Math.random() * 90 + 5}%`,
      width: 2 + (i % 3),
      height: 2 + (i % 3),
      opacity: 0.2 + (i % 5) * 0.12,
      animDuration: 2 + (i % 4),
      animDelay: (i % 3) * 0.7,
    })),
  );

  return (
    <div
      onClick={onOpen}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 480,
        background: 'linear-gradient(145deg,#0d1b2e 0%,#0a3d62 40%,#1a1a3e 80%,#0d1b2e 100%)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.width,
            height: star.height,
            background: '#fff',
            borderRadius: '50%',
            opacity: star.opacity,
            animation: `starTwinkle ${star.animDuration}s ${star.animDelay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Gold lines */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          height: 2,
          background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          right: 14,
          height: 2,
          background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
        }}
      />

      {/* Host flags */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          fontSize: 28,
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
        }}
      >
        🇺🇸 🇲🇽 🇨🇦
      </div>

      {/* Trophy */}
      <div
        style={{
          fontSize: 56,
          marginBottom: 8,
          filter: 'drop-shadow(0 4px 20px rgba(251,191,36,0.5))',
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        🏆
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(18px,4vw,32px)',
          color: '#fbbf24',
          textAlign: 'center',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: 3,
          textShadow: '0 0 30px rgba(251,191,36,0.5)',
        }}
      >
        FIFA World Cup
      </h1>
      <h2
        style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(28px,6vw,56px)',
          color: '#fff',
          margin: '0 0 4px',
          textShadow: '0 0 40px rgba(255,255,255,0.3)',
        }}
      >
        2026
      </h2>
      <p
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 11,
          letterSpacing: 4,
          textTransform: 'uppercase',
          fontFamily: 'Inter,sans-serif',
          marginBottom: 20,
        }}
      >
        Colección Oficial de Cromos
      </p>

      {/* Progress */}
      <div style={{ width: '60%', maxWidth: 200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Inter,sans-serif' }}
          >
            {pasted} pegados
          </span>
          <span
            style={{
              color: '#fbbf24',
              fontSize: 10,
              fontFamily: 'Oswald,sans-serif',
              fontWeight: 700,
            }}
          >
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'linear-gradient(90deg,#1d4ed8,#fbbf24)',
              borderRadius: 99,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      {/* Hint */}
      <p
        style={{
          position: 'absolute',
          bottom: 24,
          color: 'rgba(255,255,255,0.35)',
          fontSize: 12,
          fontFamily: 'Inter,sans-serif',
          letterSpacing: 1,
          animation: 'hintPulse 2s ease-in-out infinite',
        }}
      >
        Toca para abrir →
      </p>
    </div>
  );
}

// ── Page wrapper ──
function BookPage({
  children,
  pageNum,
  isLeft,
}: {
  children: React.ReactNode;
  pageNum?: number;
  isLeft: boolean;
}) {
  return (
    <div
      className="album-wave-bg"
      style={{
        flex: 1,
        backgroundColor: '#0D1B2A',
        borderRadius: isLeft ? '8px 0 0 8px' : '0 8px 8px 0',
        boxShadow: isLeft
          ? 'inset -12px 0 24px rgba(0,0,0,0.4)'
          : 'inset  12px 0 24px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: 480,
      }}
    >
      {/* Giant 26 Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-display)',
          fontSize: '240px',
          color: 'rgba(255,255,255,0.02)',
          pointerEvents: 'none',
          zIndex: 0,
          userSelect: 'none',
        }}
      >
        26
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {children}
      </div>
      {pageNum !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            [isLeft ? 'left' : 'right']: 16,
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: "'Oswald', sans-serif",
            zIndex: 1,
          }}
        >
          {pageNum}
        </div>
      )}
    </div>
  );
}

// ── Slot in a team page ──
function AlbumSlot({
  slotIndex,
  teamIdx,
  laminaData,
  onPegar,
}: {
  slotIndex: number;
  teamIdx: number;
  laminaData: LaminaAlbum | null;
  onPegar: (laminaId: number) => void;
}) {
  const laminaId = teamIdx * 10 + slotIndex + 1;
  const slotNum = slotIndex + 1;

  if (!laminaData) {
    // Empty slot
    return (
      <div
        style={{
          width: 72,
          height: 100,
          border: '1.5px dashed #cbd5e1',
          borderRadius: 6,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(241,245,249,0.8)',
        }}
      >
        {/* Photo corners */}
        {[
          ['top', 'left'],
          ['top', 'right'],
          ['bottom', 'left'],
          ['bottom', 'right'],
        ].map(([v, h]) => (
          <div
            key={`${v}${h}`}
            style={{
              position: 'absolute',
              [v]: 3,
              [h]: 3,
              width: 8,
              height: 8,
              borderTop: v === 'top' ? '2px solid #94a3b8' : 'none',
              borderBottom: v === 'bottom' ? '2px solid #94a3b8' : 'none',
              borderLeft: h === 'left' ? '2px solid #94a3b8' : 'none',
              borderRight: h === 'right' ? '2px solid #94a3b8' : 'none',
            }}
          />
        ))}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, color: '#cbd5e1' }}>?</div>
          <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'Inter,sans-serif' }}>
            {String(laminaId).padStart(3, '0')}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 3,
            right: 4,
            fontSize: 9,
            color: '#cbd5e1',
            fontFamily: 'Inter,sans-serif',
          }}
        >
          #{slotNum}
        </div>
      </div>
    );
  }

  if (!laminaData.estaPegada) {
    // Owned but not pasted
    return (
      <div
        onClick={() => onPegar(laminaData.idLamina)}
        title="Clic para pegar"
        style={{
          position: 'relative',
          cursor: 'pointer',
          transition: 'transform 0.15s',
        }}
      >
        <StickerCard
          idLamina={laminaData.idLamina}
          nombreJugador={laminaData.nombreJugador}
          rareza={laminaData.rareza}
          size="xs"
        />
        {/* PEGAR badge */}
        <div
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: '#1d4ed8',
            color: '#fff',
            fontSize: 7,
            fontWeight: 800,
            borderRadius: 99,
            padding: '2px 4px',
            fontFamily: 'Inter,sans-serif',
            boxShadow: '0 0 8px rgba(29,78,216,0.6)',
            animation: 'slotPulse 1.5s ease-in-out infinite',
          }}
        >
          PEGAR
        </div>
      </div>
    );
  }

  // Pasted
  return (
    <div style={{ position: 'relative' }}>
      <StickerCard
        idLamina={laminaData.idLamina}
        nombreJugador={laminaData.nombreJugador}
        rareza={laminaData.rareza}
        estaPegada
        size="xs"
      />
      <div
        style={{
          position: 'absolute',
          bottom: -4,
          right: -4,
          width: 12,
          height: 12,
          background: '#22c55e',
          borderRadius: '50%',
          border: '2px solid #faf7f0',
        }}
      />
    </div>
  );
}

// ── Team page ──
function TeamPage({
  team,
  teamIdx,
  laminas,
  onPegar,
  isLeft,
  pageNum,
}: {
  team: Team;
  teamIdx: number;
  laminas: LaminaAlbum[];
  onPegar: (id: number) => void;
  isLeft: boolean;
  pageNum: number;
}) {
  const slots = getLaminasForTeam(laminas, teamIdx);
  const { pasted, owned } = teamProgress(laminas, teamIdx);
  const pct = (pasted / 10) * 100;

  return (
    <BookPage isLeft={isLeft} pageNum={pageNum}>
      {/* Team header */}
      <div
        style={{
          background: `linear-gradient(135deg,${team.primary} 0%,${team.primary}cc 100%)`,
          padding: '10px 12px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{ fontSize: 22, lineHeight: 1, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}
        >
          {team.flag}
        </span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              color: '#fff',
              fontFamily: 'Oswald,sans-serif',
              fontWeight: 700,
              fontSize: 13,
              margin: 0,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {team.name}
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 9,
              margin: '2px 0 0',
              fontFamily: 'Inter,sans-serif',
            }}
          >
            Grupo {team.group} · {owned}/10 obtenidos · {pasted}/10 pegados
          </p>
        </div>
      </div>

      {/* Progress strip */}
      <div style={{ height: 3, background: 'rgba(0,0,0,0.06)' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: team.primary,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* Sticker grid 5×2 */}
      <div
        style={{
          flex: 1,
          padding: '10px 8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5,1fr)',
          gap: '8px 6px',
          placeItems: 'center',
          alignContent: 'start',
        }}
      >
        {slots.map((slot, i) => (
          <AlbumSlot key={i} slotIndex={i} teamIdx={teamIdx} laminaData={slot} onPegar={onPegar} />
        ))}
      </div>
    </BookPage>
  );
}

// ── Stadiums intro page ──
function StadiumsIntroPage({ isLeft, pageNum }: { isLeft: boolean; pageNum: number }) {
  return (
    <BookPage isLeft={isLeft} pageNum={pageNum}>
      <div
        style={{
          background: 'linear-gradient(135deg,#4c1d95 0%,#6d28d9 100%)',
          padding: '10px 12px 8px',
        }}
      >
        <p
          style={{
            color: '#fff',
            fontFamily: 'Oswald,sans-serif',
            fontWeight: 700,
            fontSize: 14,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          🏟️ Estadios FIFA WC 2026
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 9,
            margin: '3px 0 0',
            fontFamily: 'Inter,sans-serif',
          }}
        >
          16 sedes en 3 países anfitriones
        </p>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {['USA', 'Canadá', 'México'].map((pais) => {
          const list = STADIUMS.filter((s) => s.pais === pais);
          return (
            <div key={pais}>
              <p
                style={{
                  color: '#64748b',
                  fontSize: 9,
                  fontFamily: 'Inter,sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  margin: '6px 0 3px',
                }}
              >
                {pais === 'USA' ? '🇺🇸' : pais === 'Canadá' ? '🇨🇦' : '🇲🇽'} {pais} ({list.length})
              </p>
              {list.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '2px 4px',
                  }}
                >
                  <span style={{ fontSize: 10, color: '#334155', fontFamily: 'Inter,sans-serif' }}>
                    {s.nombre}
                  </span>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'Inter,sans-serif' }}>
                    {(s.capacidad / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </BookPage>
  );
}

// ── Stadium page ──
function StadiumPage({
  stadium,
  isLeft,
  pageNum,
}: {
  stadium: Stadium;
  isLeft: boolean;
  pageNum: number;
}) {
  const clr =
    stadium.pais === 'USA' ? '#002868' : stadium.pais === 'México' ? '#006847' : '#CC0000';
  return (
    <BookPage isLeft={isLeft} pageNum={pageNum}>
      <div
        style={{
          background: `linear-gradient(135deg,${clr} 0%,#4c1d95 100%)`,
          padding: '10px 12px 8px',
        }}
      >
        <p
          style={{
            color: '#fff',
            fontFamily: 'Oswald,sans-serif',
            fontWeight: 700,
            fontSize: 13,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          🏟️ {stadium.nombre}
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 9,
            margin: '2px 0 0',
            fontFamily: 'Inter,sans-serif',
          }}
        >
          {stadium.ciudad} · {stadium.pais}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StadiumCard stadium={stadium} size="md" />

        {/* Details grid */}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['Ciudad', stadium.ciudad],
            ['País', stadium.pais],
            ['Capacidad', `${stadium.capacidad.toLocaleString()} esp.`],
            ['ID Cromo', String(stadium.id).padStart(3, '0')],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                background: 'rgba(241,245,249,0.8)',
                borderRadius: 6,
                padding: '5px 8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 8,
                  margin: 0,
                  fontFamily: 'Inter,sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {k}
              </p>
              <p
                style={{
                  color: '#1e293b',
                  fontSize: 10,
                  margin: '1px 0 0',
                  fontFamily: 'Oswald,sans-serif',
                  fontWeight: 600,
                }}
              >
                {v}
              </p>
            </div>
          ))}
        </div>
      </div>
    </BookPage>
  );
}

// ── Render a single content page ──
function renderContentPage(
  page: ContentPage | undefined,
  isLeft: boolean,
  pageNum: number,
  laminas: LaminaAlbum[],
  onPegar: (id: number) => void,
) {
  if (!page) {
    return (
      <BookPage isLeft={isLeft} pageNum={undefined}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e2e8f0',
            fontSize: 40,
          }}
        >
          ⚽
        </div>
      </BookPage>
    );
  }
  if (page.type === 'intro') {
    return (
      <BookPage isLeft={isLeft} pageNum={pageNum}>
        <div
          style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              color: '#fbbf24',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            ROLL OF HONOUR
          </h2>
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <table
              style={{
                width: '100%',
                color: '#fff',
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <tbody>
                {[
                  ['2022', 'Argentina', '🇦🇷'],
                  ['2018', 'France', '🇫🇷'],
                  ['2014', 'Germany', '🇩🇪'],
                  ['2010', 'Spain', '🇪🇸'],
                  ['2006', 'Italy', '🇮🇹'],
                  ['2002', 'Brazil', '🇧🇷'],
                  ['1998', 'France', '🇫🇷'],
                  ['1994', 'Brazil', '🇧🇷'],
                ].map(([year, winner, flag]) => (
                  <tr key={year} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 600, color: '#fbbf24' }}>{year}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      {winner} <span style={{ fontSize: 18, marginLeft: 8 }}>{flag}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </BookPage>
    );
  }
  if (page.type === 'groups') {
    return (
      <BookPage isLeft={isLeft} pageNum={pageNum}>
        <div
          style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              color: '#fff',
              margin: 0,
              textAlign: 'center',
            }}
          >
            GROUPS A-L
          </h2>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', flex: 1 }}
          >
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((grp) => (
              <div
                key={grp}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#fbbf24',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  GROUP {grp}
                </span>
                {TEAMS.filter((t) => t.group === grp).map((t) => (
                  <div
                    key={t.name}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}
                  >
                    <span style={{ fontSize: 12 }}>{t.flag}</span>
                    <span
                      style={{ color: '#fff', fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                    >
                      {t.name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </BookPage>
    );
  }
  if (page.type === 'team') {
    return (
      <TeamPage
        team={TEAMS[page.teamIdx]}
        teamIdx={page.teamIdx}
        laminas={laminas}
        onPegar={onPegar}
        isLeft={isLeft}
        pageNum={pageNum}
      />
    );
  }
  if (page.type === 'stadiums-intro') {
    return <StadiumsIntroPage isLeft={isLeft} pageNum={pageNum} />;
  }
  if (page.type === 'stadium') {
    return <StadiumPage stadium={STADIUMS[page.stadiumIdx]} isLeft={isLeft} pageNum={pageNum} />;
  }
  return null;
}

// ─── Navigation helpers ───────────────────────────────────────────────────────

function PageArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Página anterior' : 'Página siguiente'}
      style={{
        width: 44,
        height: 88,
        background: disabled ? 'transparent' : 'rgba(255,255,255,0.7)',
        border: disabled ? 'none' : '1px solid rgba(0,0,0,0.1)',
        borderRadius: direction === 'left' ? '8px 0 0 8px' : '0 8px 8px 0',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: disabled ? '#e2e8f0' : '#475569',
        transition: 'background 0.15s, color 0.15s',
        flexShrink: 0,
        backdropFilter: 'blur(4px)',
      }}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );
}

function DotBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: active ? 24 : 8,
        height: 8,
        borderRadius: 99,
        background: active ? '#1d4ed8' : '#cbd5e1',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    />
  );
}

// ─── Main AlbumBook component ─────────────────────────────────────────────────

interface AlbumBookProps {
  laminas: LaminaAlbum[];
  onPegar: (laminaId: number) => void;
}

export function AlbumBook({ laminas, onPegar }: AlbumBookProps) {
  const [spreadIdx, setSpreadIdx] = useState(0);
  const [flipDir, setFlipDir] = useState<'next' | 'prev' | null>(null);
  const [flipKey, setFlipKey] = useState(0);
  const [indexModalOpen, setIndexModalOpen] = useState(false);
  const spreading = useRef(false);

  const goNext = useCallback(() => {
    if (spreading.current || spreadIdx >= TOTAL_SPREADS - 1) return;
    spreading.current = true;
    setFlipDir('next');
    setFlipKey((k) => k + 1);
    setTimeout(() => {
      setSpreadIdx((i) => i + 1);
      setFlipDir(null);
      spreading.current = false;
    }, 340);
  }, [spreadIdx]);

  const goPrev = useCallback(() => {
    if (spreading.current || spreadIdx <= 0) return;
    spreading.current = true;
    setFlipDir('prev');
    setFlipKey((k) => k + 1);
    setTimeout(() => {
      setSpreadIdx((i) => i - 1);
      setFlipDir(null);
      spreading.current = false;
    }, 340);
  }, [spreadIdx]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const jumpToSpread = (idx: number) => {
    setSpreadIdx(Math.max(0, Math.min(idx, TOTAL_SPREADS - 1)));
    setIndexModalOpen(false);
  };

  // Helper to check for new/unpasted stickers in a team
  const hasUnpasted = useCallback(
    (teamIdx: number) => {
      const slots = getLaminasForTeam(laminas, teamIdx);
      return slots.some((s) => s && !s.estaPegada);
    },
    [laminas],
  );

  // Current pages
  const leftPage = spreadIdx > 0 ? CONTENT_PAGES[(spreadIdx - 1) * 2] : undefined;
  const rightPage = spreadIdx > 0 ? CONTENT_PAGES[(spreadIdx - 1) * 2 + 1] : undefined;

  const animClass =
    flipDir === 'next' ? 'book-flip-next' : flipDir === 'prev' ? 'book-flip-prev' : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* ── Book ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', maxWidth: 820 }}>
        <PageArrow direction="left" onClick={goPrev} disabled={spreadIdx === 0} />

        <div
          key={flipKey}
          className={animClass}
          style={{
            flex: 1,
            display: 'flex',
            boxShadow: '0 12px 48px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {spreadIdx === 0 ? (
            // Cover
            <AlbumCover laminas={laminas} onOpen={goNext} />
          ) : (
            <>
              {/* Left page */}
              {renderContentPage(leftPage, true, (spreadIdx - 1) * 2 + 1, laminas, onPegar)}

              {/* Spine */}
              <div
                style={{
                  width: 16,
                  background: 'linear-gradient(90deg,#c8b99a,#e8dfc8,#c8b99a)',
                  flexShrink: 0,
                }}
              />

              {/* Right page */}
              {renderContentPage(rightPage, false, (spreadIdx - 1) * 2 + 2, laminas, onPegar)}
            </>
          )}
        </div>

        <PageArrow direction="right" onClick={goNext} disabled={spreadIdx >= TOTAL_SPREADS - 1} />
      </div>

      {/* ── Bottom nav ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Dots */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {Array.from({ length: Math.min(TOTAL_SPREADS, 13) }).map((_, i) => {
            // Show a window of dots around current
            const half = 6;
            const start = Math.max(0, Math.min(spreadIdx - half, TOTAL_SPREADS - 13));
            const dotIdx = start + i;
            return (
              <DotBtn
                key={dotIdx}
                active={dotIdx === spreadIdx}
                onClick={() => jumpToSpread(dotIdx)}
              />
            );
          })}
        </div>

        {/* Page indicator */}
        <span
          style={{
            fontSize: 12,
            color: '#64748b',
            fontFamily: 'Inter,sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {spreadIdx === 0
            ? 'Portada'
            : `${(spreadIdx - 1) * 2 + 1}–${Math.min((spreadIdx - 1) * 2 + 2, CONTENT_PAGES.length)}`}{' '}
          / {CONTENT_PAGES.length}
        </span>

        {/* Index Button */}
        <button
          onClick={() => setIndexModalOpen(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#0D1B2A',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Oswald', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            letterSpacing: '0.04em',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          }}
        >
          INDEX 📑
        </button>
      </div>

      {/* ── Index Modal ── */}
      {indexModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '90%',
              maxWidth: 600,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#0D1B2A',
                color: '#fff',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                ALBUM INDEX
              </h2>
              <button
                onClick={() => setIndexModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
              className="custom-scrollbar"
            >
              <button
                onClick={() => jumpToSpread(0)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: spreadIdx === 0 ? '#eff6ff' : '#f8f9fa',
                  border: '1px solid',
                  borderColor: spreadIdx === 0 ? '#1d4ed8' : '#e2e8f0',
                  cursor: 'pointer',
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  color: '#0D1B2A',
                  textAlign: 'left',
                }}
              >
                📖 Cover Page
              </button>

              {TEAMS.map((t, i) => {
                const spread = 1 + Math.floor(i / 2);
                const showBadge = hasUnpasted(i);
                return (
                  <button
                    key={t.name}
                    onClick={() => jumpToSpread(spread)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 8,
                      background: spreadIdx === spread ? '#eff6ff' : '#ffffff',
                      border: '1px solid',
                      borderColor: spreadIdx === spread ? '#1d4ed8' : '#e2e8f0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        spreadIdx === spread ? '#eff6ff' : '#ffffff')
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{t.flag}</span>
                      <div>
                        <span
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontWeight: 600,
                            fontSize: 16,
                            color: '#0D1B2A',
                            display: 'block',
                          }}
                        >
                          {t.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12,
                            color: '#64748b',
                          }}
                        >
                          Group {t.group}
                        </span>
                      </div>
                    </div>
                    {showBadge && (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#C8102E',
                          boxShadow: '0 0 0 2px #ffffff',
                        }}
                      />
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => jumpToSpread(1 + Math.floor(TEAMS.length / 2))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background:
                    spreadIdx === 1 + Math.floor(TEAMS.length / 2) ? '#eff6ff' : '#f8f9fa',
                  border: '1px solid',
                  borderColor:
                    spreadIdx === 1 + Math.floor(TEAMS.length / 2) ? '#1d4ed8' : '#e2e8f0',
                  cursor: 'pointer',
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  color: '#0D1B2A',
                  textAlign: 'left',
                  marginTop: 8,
                }}
              >
                🏟️ Stadiums
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
