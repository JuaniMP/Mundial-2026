import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Trophy } from 'lucide-react';
import { fetchLaminas } from '../services/albumApi';

const TOTAL_LAMINAS = 320;

export function FanHubSection() {
  const [owned, setOwned] = useState<number | null>(null);
  const [pegadas, setPegadas] = useState(0);

  useEffect(() => {
    if (!sessionStorage.getItem('token')) return;
    fetchLaminas()
      .then((laminas) => {
        setOwned(laminas.length);
        setPegadas(laminas.filter((l) => l.estaPegada).length);
      })
      .catch(() => {
        /* silencioso — muestra el fallback estático */
      });
  }, []);

  const progress = owned !== null ? Math.min(100, Math.round((owned / TOTAL_LAMINAS) * 100)) : null;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h2
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: '#0D1B2A',
            margin: 0,
            letterSpacing: '0.04em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          FAN HUB
        </h2>
        <div style={{ height: 4, width: 40, background: '#006847', marginTop: 8 }} />
      </div>

      {/* Virtual Album Progress */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '24px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="absolute inset-0 z-0 opacity-10 album-wave-bg pointer-events-none"></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              margin: '0 0 16px 0',
              color: '#0D1B2A',
            }}
          >
            VIRTUAL ALBUM
          </h3>

          {/* Progress bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Collection Progress
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#006847' }}>
              {progress !== null ? `${progress}%` : '…'}
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: '#eef0f3',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: `${progress ?? 0}%`,
                height: '100%',
                background: '#006847',
                transition: 'width 0.6s ease',
              }}
            />
          </div>

          {/* Stats */}
          {owned !== null && (
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginBottom: 20,
                fontSize: 13,
                color: '#374151',
              }}
            >
              <span>
                <b style={{ color: '#006847' }}>{owned}</b> / {TOTAL_LAMINAS} cromos
              </span>
              <span style={{ color: '#9ca3af' }}>·</span>
              <span>
                <b style={{ color: '#C8102E' }}>{TOTAL_LAMINAS - owned}</b> te faltan
              </span>
              <span style={{ color: '#9ca3af' }}>·</span>
              <span>
                <b>{pegadas}</b> pegadas
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              to="/album"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px',
                background: '#0D1B2A',
                color: '#ffffff',
                borderRadius: 8,
                textDecoration: 'none',
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              MY COLLECTION
            </Link>
            <Link
              to="/pack-opening"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px',
                background: '#C8102E',
                color: '#ffffff',
                borderRadius: 8,
                textDecoration: 'none',
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              OPEN PACK
            </Link>
          </div>
        </div>
      </div>

      {/* Predictor Game */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '24px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h3
            style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: 0, color: '#0D1B2A' }}
          >
            PREDICTOR
          </h3>
          <Link
            to="/superpolla"
            style={{
              color: '#006847',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Play <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              background: '#f8f9fa',
              borderRadius: 8,
              padding: '16px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src="https://flagcdn.com/w40/mx.png"
                  alt="MEX"
                  style={{ width: 24, borderRadius: 2 }}
                />
                <span style={{ fontWeight: 600 }}>MEX</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="-"
                  style={{
                    width: 40,
                    height: 40,
                    textAlign: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                  }}
                />
                <span style={{ color: '#9ca3af', fontWeight: 600 }}>:</span>
                <input
                  type="number"
                  placeholder="-"
                  style={{
                    width: 40,
                    height: 40,
                    textAlign: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>USA</span>
                <img
                  src="https://flagcdn.com/w40/us.png"
                  alt="USA"
                  style={{ width: 24, borderRadius: 2 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '24px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            margin: '0 0 16px 0',
            color: '#0D1B2A',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Trophy size={20} color="#C8102E" /> LEADERBOARD
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { pos: 1, name: 'Alex P.', pts: 2450, trend: 'up' },
            { pos: 2, name: 'Maria G.', pts: 2310, trend: 'up' },
            { pos: 3, name: 'John D.', pts: 2180, trend: 'down' },
          ].map((user) => (
            <div
              key={user.pos}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    color: user.pos === 1 ? '#006847' : '#9ca3af',
                    width: 20,
                  }}
                >
                  {user.pos}
                </span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    color: '#374151',
                  }}
                >
                  {user.name.charAt(0)}
                </div>
                <span style={{ fontWeight: 600, color: '#374151' }}>{user.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#0D1B2A' }}>
                  {user.pts}
                </span>
                {user.trend === 'up' ? (
                  <TrendingUp size={16} color="#006847" />
                ) : (
                  <TrendingUp size={16} color="#C8102E" style={{ transform: 'scaleY(-1)' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
