// ─── Types ───────────────────────────────────────────────────────────────────

export interface Stadium {
  id: number;
  nombre: string;
  ciudad: string;
  pais: 'USA' | 'México' | 'Canadá';
  capacidad: number;
}

interface StadiumCardProps {
  stadium: Stadium;
  size?: 'xs' | 'sm' | 'md';
}

// ─── Country accent colors ────────────────────────────────────────────────────

const COUNTRY_CLR: Record<string, string> = {
  USA: '#002868',
  México: '#006847',
  Canadá: '#CC0000',
};

// ─── Football pitch sub‑component ────────────────────────────────────────────

function PitchView({ w, h }: { w: number; h: number }) {
  const r = Math.min(w, h) * 0.15; // center circle radius
  return (
    <div
      style={{
        width: w,
        height: h,
        background:
          'repeating-linear-gradient(90deg,#2a6e2a 0px,#2a6e2a 16px,#317431 16px,#317431 32px)',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.45)',
        flexShrink: 0,
      }}
    >
      {/* Center line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1.5,
          background: 'rgba(255,255,255,0.55)',
        }}
      />
      {/* Center circle */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: r * 2,
          height: r * 2,
          border: '1.5px solid rgba(255,255,255,0.55)',
          borderRadius: '50%',
        }}
      />
      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 4,
          height: 4,
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
        }}
      />
      {/* Left penalty area */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: 0,
          width: '22%',
          height: '50%',
          border: '1.5px solid rgba(255,255,255,0.55)',
          borderLeft: 'none',
        }}
      />
      {/* Right penalty area */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          right: 0,
          width: '22%',
          height: '50%',
          border: '1.5px solid rgba(255,255,255,0.55)',
          borderRight: 'none',
        }}
      />
      {/* Left goal */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: 0,
          width: '6%',
          height: '24%',
          border: '1.5px solid rgba(255,255,255,0.4)',
          borderLeft: 'none',
          background: 'rgba(255,255,255,0.06)',
        }}
      />
      {/* Right goal */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          right: 0,
          width: '6%',
          height: '24%',
          border: '1.5px solid rgba(255,255,255,0.4)',
          borderRight: 'none',
          background: 'rgba(255,255,255,0.06)',
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const SZ = {
  xs: { w: 60, h: 84 },
  sm: { w: 88, h: 123 },
  md: { w: 120, h: 168 },
} as const;

export function StadiumCard({ stadium, size = 'sm' }: StadiumCardProps) {
  const dim = SZ[size];
  const clr = COUNTRY_CLR[stadium.pais] ?? '#1a1a2e';
  const pitchW = dim.w - 12;
  const pitchH = Math.floor((dim.h - 52) * 0.68);
  const nameSize = size === 'xs' ? 7 : size === 'sm' ? 9 : 11;

  return (
    <div
      style={{
        width: dim.w,
        height: dim.h,
        borderRadius: 8,
        background: `linear-gradient(180deg, ${clr} 0%, ${clr}cc 50%, #111827 100%)`,
        border: '2px solid rgba(138,43,226,0.55)',
        boxShadow: '0 0 16px rgba(138,43,226,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '3px 5px',
          background: 'rgba(0,0,0,0.38)',
        }}
      >
        <span style={{ fontSize: 10, lineHeight: 1 }}>🏟️</span>
        <span
          style={{
            fontSize: 7,
            color: '#c084fc',
            fontWeight: 800,
            fontFamily: 'Oswald, sans-serif',
          }}
        >
          {String(stadium.id).padStart(3, '0')}
        </span>
      </div>

      {/* Pitch */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 6px 0',
        }}
      >
        <PitchView w={pitchW} h={pitchH} />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '2px 5px 3px',
          background: 'rgba(0,0,0,0.62)',
          borderTop: '1px solid rgba(138,43,226,0.3)',
        }}
      >
        <div
          style={{
            fontSize: nameSize,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'Oswald, sans-serif',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {stadium.nombre}
        </div>
        {size !== 'xs' && (
          <div
            style={{ fontSize: 7, color: '#c084fc', fontFamily: 'Inter, sans-serif', marginTop: 1 }}
          >
            {stadium.ciudad}
          </div>
        )}
      </div>
    </div>
  );
}
