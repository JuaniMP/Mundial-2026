import { useState, useEffect, useMemo } from 'react';

interface Mascot {
  id: string;
  name: string;
  country: string;
  role: string;
  img: string;
  action: string;
  primary: string;
  light: string;
  no: string;
}

const MASCOTS: Mascot[] = [
  {
    id: 'maple',
    name: 'MAPLE',
    country: 'Canadá',
    role: 'Alce · Atajadora',
    img: '/assets/maple.png',
    action: '/assets/maple_action.png',
    primary: '#D80027',
    light: '#FF6B7A',
    no: '01',
  },
  {
    id: 'zayu',
    name: 'ZAYU',
    country: 'México',
    role: 'Jaguar · Goleador',
    img: '/assets/zayu.png',
    action: '/assets/zayu_action.png',
    primary: '#006847',
    light: '#3FC986',
    no: '09',
  },
  {
    id: 'clutch',
    name: 'CLUTCH',
    country: 'USA',
    role: 'Águila · Capitán',
    img: '/assets/clutch.png',
    action: '/assets/clutch_action.png',
    primary: '#1B2A5E',
    light: '#5B7BC8',
    no: '10',
  },
];

interface Props {
  size?: 'sm' | 'md' | 'lg';
  /** autoplay rotation interval in seconds (default 5) */
  rotateSpeed?: number;
}

const DIM = {
  sm: { frame: 260, frameH: 312, ring: 300, ring2: 360, name: 42, no: 220 },
  md: { frame: 360, frameH: 432, ring: 410, ring2: 480, name: 60, no: 320 },
  lg: { frame: 460, frameH: 552, ring: 520, ring2: 600, name: 76, no: 420 },
};

export function MascotAnimation({ size = 'md', rotateSpeed = 5 }: Props) {
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [exiting, setExiting] = useState(false);
  const dim = DIM[size];
  const m = MASCOTS[idx];

  useEffect(() => {
    const t = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MASCOTS.length);
        setAnimKey((k) => k + 1);
        setExiting(false);
      }, 450);
    }, rotateSpeed * 1000);
    return () => clearInterval(t);
  }, [rotateSpeed]);

  const goTo = (i: number) => {
    if (i === idx) return;
    setExiting(true);
    setTimeout(() => {
      setIdx(i);
      setAnimKey((k) => k + 1);
      setExiting(false);
    }, 400);
  };

  // Deterministic confetti — no Math.random in render (ESLint rule)
  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        left: (i * 127 + 11) % 100,
        delay: (i * 3 + 1) % 8,
        dur: 6 + ((i * 7) % 4),
        color: [m.primary, m.light, '#E5B449', '#F6EFE2'][i % 4],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [m.id],
  );

  return (
    <div
      style={{
        position: 'relative',
        width: dim.ring2,
        height: dim.ring2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Spotlight glow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: dim.frame * 1.3,
          height: dim.frame * 1.3,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${m.light}55 0%, ${m.primary}33 35%, transparent 70%)`,
          filter: 'blur(18px)',
          animation: 'spotPulse 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Outer dashed ring */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: dim.ring,
          height: dim.ring,
          borderRadius: '50%',
          border: '1.5px dashed rgba(229,180,73,.35)',
          animation: 'spinSlow 28s linear infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Inner ring */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: dim.ring2,
          height: dim.ring2,
          borderRadius: '50%',
          border: '1px solid rgba(14,26,43,.06)',
          pointerEvents: 'none',
        }}
      />

      {/* Mega number behind */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'Anton, sans-serif',
          fontSize: dim.no,
          lineHeight: 0.8,
          color: 'rgba(14,26,43,.035)',
          WebkitTextStroke: '1.5px rgba(14,26,43,.055)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {m.no}
      </div>

      {/* Confetti */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          borderRadius: '50%',
        }}
      >
        {confetti.map((p, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: '-20px',
              width: 7,
              height: 12,
              borderRadius: 1,
              background: p.color,
              animationName: 'confettiFall',
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Mascot frame — arch shape */}
      <div
        key={'frame-' + animKey}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: dim.frame,
          height: dim.frameH,
          borderRadius: '999px 999px 0 0',
          overflow: 'hidden',
          background: m.primary,
          border: '3px solid #e5b449',
          boxShadow: '0 24px 60px rgba(0,0,0,.35), inset 0 -60px 80px rgba(0,0,0,.2)',
          animation: 'mascotFloat 5s ease-in-out infinite',
          zIndex: 3,
        }}
      >
        {/* Stripe pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(60deg, transparent 0 20px, rgba(255,255,255,.035) 20px 40px)',
            pointerEvents: 'none',
          }}
        />
        {/* Diagonal tape label */}
        <div
          style={{
            position: 'absolute',
            left: '-14%',
            top: '13%',
            background: '#e5b449',
            color: '#0e1a2b',
            fontFamily: 'Anton, sans-serif',
            fontSize: size === 'sm' ? 10 : 12,
            letterSpacing: '0.22em',
            padding: '6px 60px',
            transform: 'rotate(-22deg)',
            zIndex: 4,
            whiteSpace: 'nowrap',
            boxShadow: '0 3px 10px rgba(0,0,0,.3)',
          }}
        >
          {m.country.toUpperCase()} · #{m.no}
        </div>

        {/* Mascot image */}
        <img
          src={m.action}
          alt={m.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            animation: exiting ? 'mascotExit 0.45s both' : 'mascotEnter 0.8s both',
            zIndex: 2,
          }}
        />
      </div>

      {/* Name plate */}
      <div
        style={{
          position: 'absolute',
          bottom: size === 'sm' ? 4 : 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: size === 'sm' ? 9 : 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#e5b449',
          }}
        >
          ⬢ {m.role.toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: dim.name,
            letterSpacing: '0.01em',
            color: '#0e1a2b',
            textShadow: '0 2px 12px rgba(229,180,73,.45)',
            lineHeight: 1,
          }}
        >
          {m.name}
        </div>
      </div>

      {/* Pager */}
      <div
        style={{
          position: 'absolute',
          right: size === 'sm' ? 0 : 6,
          top: '38%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 5,
        }}
      >
        {MASCOTS.map((mm, i) => (
          <button
            key={mm.id}
            onClick={() => goTo(i)}
            style={{
              width: size === 'sm' ? 28 : 36,
              height: size === 'sm' ? 28 : 36,
              border: `1.5px solid ${i === idx ? '#e5b449' : 'rgba(14,26,43,.22)'}`,
              background: i === idx ? '#e5b449' : 'transparent',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'Anton, sans-serif',
              fontSize: 12,
              color: i === idx ? '#0e1a2b' : 'rgba(14,26,43,.4)',
              transition: 'all 0.18s',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );
}
