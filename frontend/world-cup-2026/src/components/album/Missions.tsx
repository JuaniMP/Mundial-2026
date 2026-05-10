import { useState, useEffect, useMemo } from 'react';
import type { LaminaAlbum } from './albumApi';
import { parseRareza } from './rarityUtils';
import { getTeamForLamina, TEAMS } from './teamColors';

interface MissionsProps {
  laminas: LaminaAlbum[];
  coins: number;
  onClaim: (reward: number, missionId: string) => void;
}

interface Mission {
  id: string;
  icon: string;
  title: string;
  description: string;
  reward: number; // coins
  type: 'collection' | 'pack' | 'paste' | 'rarity';
  check: (laminas: LaminaAlbum[]) => { progress: number; goal: number };
}

// ─── Mission definitions ──────────────────────────────────────────────────────

const MISSIONS: Mission[] = [
  {
    id: 'first-5',
    icon: '🎴',
    title: 'Primeros pasos',
    description: 'Consigue tus primeros 5 cromos',
    reward: 25,
    type: 'collection',
    check: (ls) => ({ progress: Math.min(ls.length, 5), goal: 5 }),
  },
  {
    id: 'first-20',
    icon: '📚',
    title: 'Coleccionista',
    description: 'Consigue 20 cromos',
    reward: 75,
    type: 'collection',
    check: (ls) => ({ progress: Math.min(ls.length, 20), goal: 20 }),
  },
  {
    id: 'first-50',
    icon: '📦',
    title: 'Álbum en marcha',
    description: 'Consigue 50 cromos',
    reward: 150,
    type: 'collection',
    check: (ls) => ({ progress: Math.min(ls.length, 50), goal: 50 }),
  },
  {
    id: 'paste-10',
    icon: '📌',
    title: 'Pegador',
    description: 'Pega 10 cromos en el álbum',
    reward: 50,
    type: 'paste',
    check: (ls) => ({ progress: Math.min(ls.filter((l) => l.estaPegada).length, 10), goal: 10 }),
  },
  {
    id: 'paste-30',
    icon: '🗂️',
    title: 'Álbum organizado',
    description: 'Pega 30 cromos en el álbum',
    reward: 120,
    type: 'paste',
    check: (ls) => ({ progress: Math.min(ls.filter((l) => l.estaPegada).length, 30), goal: 30 }),
  },
  {
    id: 'raro-3',
    icon: '🔵',
    title: 'Cazador de raros',
    description: 'Consigue 3 cromos raros',
    reward: 60,
    type: 'rarity',
    check: (ls) => ({
      progress: Math.min(ls.filter((l) => parseRareza(l.rareza) === 'RARO').length, 3),
      goal: 3,
    }),
  },
  {
    id: 'epico-1',
    icon: '💜',
    title: 'Épico hallazgo',
    description: 'Consigue un cromo épico',
    reward: 100,
    type: 'rarity',
    check: (ls) => ({
      progress: Math.min(ls.filter((l) => parseRareza(l.rareza) === 'EPICO').length, 1),
      goal: 1,
    }),
  },
  {
    id: 'legendario-1',
    icon: '⭐',
    title: 'Leyenda viva',
    description: 'Consigue un cromo legendario',
    reward: 250,
    type: 'rarity',
    check: (ls) => ({
      progress: Math.min(ls.filter((l) => parseRareza(l.rareza) === 'LEGENDARIO').length, 1),
      goal: 1,
    }),
  },
  {
    id: 'team-complete',
    icon: '🏆',
    title: 'Equipo completo',
    description: 'Completa todos los cromos de un equipo',
    reward: 200,
    type: 'collection',
    check: (ls) => {
      // Check if any team has all 10 slots filled
      let maxFill = 0;
      for (let ti = 0; ti < TEAMS.length; ti++) {
        const count = ls.filter((l) => {
          const idx = Math.floor((l.idLamina - 1) / 10) % TEAMS.length;
          return idx === ti;
        }).length;
        if (count > maxFill) maxFill = count;
      }
      return { progress: Math.min(maxFill, 10), goal: 10 };
    },
  },
  {
    id: 'hosts-3',
    icon: '🌎',
    title: 'Tierra de anfitriones',
    description: 'Consigue 3 cromos de los países anfitriones',
    reward: 80,
    type: 'collection',
    check: (ls) => {
      const hostShorts = ['USA', 'MEX', 'CAN'];
      const count = ls.filter((l) =>
        hostShorts.includes(getTeamForLamina(l.idLamina).shortName),
      ).length;
      return { progress: Math.min(count, 3), goal: 3 };
    },
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const LS_KEY = 'wc2026_claimed_missions';

function loadClaimed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function Missions({ laminas, onClaim }: MissionsProps) {
  const [claimed, setClaimed] = useState<Set<string>>(loadClaimed);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify([...claimed]));
  }, [claimed]);

  const evaluated = useMemo(
    () =>
      MISSIONS.map((m) => {
        const { progress, goal } = m.check(laminas);
        const completed = progress >= goal;
        const isClaimed = claimed.has(m.id);
        return { ...m, progress, goal, completed, isClaimed };
      }),
    [laminas, claimed],
  );

  const totalReward = evaluated
    .filter((m) => m.completed && !m.isClaimed)
    .reduce((s, m) => s + m.reward, 0);
  const completedCount = evaluated.filter((m) => m.completed).length;

  const handleClaim = (m: (typeof evaluated)[0]) => {
    if (!m.completed || m.isClaimed) return;
    setClaimed((prev) => new Set([...prev, m.id]));
    onClaim(m.reward, m.id);
  };

  const categoryColor: Record<Mission['type'], string> = {
    collection: '#60a5fa',
    pack: '#34d399',
    paste: '#f59e0b',
    rarity: '#c084fc',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '8px 14px',
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#60a5fa',
              fontFamily: 'Oswald,sans-serif',
            }}
          >
            {completedCount}
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'Inter,sans-serif',
              display: 'block',
            }}
          >
            / {MISSIONS.length} Completadas
          </span>
        </div>
        <div
          style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 10,
            padding: '8px 14px',
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#fbbf24',
              fontFamily: 'Oswald,sans-serif',
            }}
          >
            {coins} 🪙
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'Inter,sans-serif',
              display: 'block',
            }}
          >
            Tu saldo
          </span>
        </div>
        {totalReward > 0 && (
          <div
            style={{
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: 10,
              padding: '8px 14px',
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#34d399',
                fontFamily: 'Oswald,sans-serif',
              }}
            >
              +{totalReward}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'Inter,sans-serif',
                display: 'block',
              }}
            >
              Pendientes de cobro
            </span>
          </div>
        )}
      </div>

      {/* Mission list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {evaluated.map((m) => {
          const pct = Math.min((m.progress / m.goal) * 100, 100);
          const clr = categoryColor[m.type];

          return (
            <div
              key={m.id}
              style={{
                background: m.isClaimed
                  ? 'rgba(52,211,153,0.05)'
                  : m.completed
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${m.isClaimed ? 'rgba(52,211,153,0.2)' : m.completed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                opacity: m.isClaimed ? 0.65 : 1,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: `${clr}22`,
                  border: `1px solid ${clr}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                {m.isClaimed ? '✅' : m.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 8,
                  }}
                >
                  <p
                    style={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14,
                      margin: 0,
                      fontFamily: 'Oswald,sans-serif',
                      letterSpacing: 0.5,
                    }}
                  >
                    {m.title}
                  </p>
                  <span
                    style={{
                      color: '#fbbf24',
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: 'Oswald,sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    +{m.reward} 🪙
                  </span>
                </div>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 12,
                    margin: '3px 0 8px',
                    fontFamily: 'Inter,sans-serif',
                  }}
                >
                  {m.description}
                </p>
                {/* Progress bar */}
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
                      borderRadius: 99,
                      background: m.isClaimed ? '#34d399' : clr,
                      width: `${pct}%`,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 11,
                    margin: '4px 0 0',
                    fontFamily: 'Inter,sans-serif',
                  }}
                >
                  {m.progress} / {m.goal}
                </p>
              </div>

              {/* Claim button */}
              {m.completed && !m.isClaimed && (
                <button
                  onClick={() => handleClaim(m)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    flexShrink: 0,
                    background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
                    border: 'none',
                    color: '#000',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: 'Oswald,sans-serif',
                    letterSpacing: 1,
                    boxShadow: '0 0 16px rgba(251,191,36,0.4)',
                    textTransform: 'uppercase',
                  }}
                >
                  Cobrar
                </button>
              )}
              {m.isClaimed && (
                <span
                  style={{
                    fontSize: 12,
                    color: '#34d399',
                    fontFamily: 'Inter,sans-serif',
                    flexShrink: 0,
                  }}
                >
                  Cobrado
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
