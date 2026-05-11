import { useState, useEffect, useCallback } from 'react';
import type { SeleccionResponse, JugadorResponse } from '../types';
import { fetchSelecciones, fetchJugadoresBySeleccion } from '../services/footballApi';
import { CromoCard } from '../components/album/CromoCard';
import { getTeamByShortName } from '../components/album/teamColors';
import type { Team } from '../components/album/teamColors';
import { parseRareza } from '../components/album/rarityUtils';
import { ArrowLeft, Loader } from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────

/** Best-effort match from codigoFifa → local Team colors */
function resolveTeam(s: SeleccionResponse): Team {
  const found = getTeamByShortName(s.codigoFifa);
  if (found) return found;
  return {
    name: s.pais,
    shortName: s.codigoFifa,
    flag: '🏳️',
    group: s.grupo,
    primary: '#1a1a2e',
    secondary: '#16213e',
    text: '#ffffff',
  };
}

/** Rarity by popularidad tier */
function popularidadToRareza(p = 50): string {
  if (p >= 90) return 'LEGENDARIO';
  if (p >= 75) return 'EPICO';
  if (p >= 55) return 'RARO';
  return 'COMUN';
}

// ── sub-components ────────────────────────────────────────────────────────────

interface TeamCardProps {
  seleccion: SeleccionResponse;
  onClick: () => void;
}

function TeamCard({ seleccion, onClick }: TeamCardProps) {
  const team = resolveTeam(seleccion);
  return (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${team.primary}ee, ${team.secondary}cc)`,
        border: `1.5px solid ${team.primary}88`,
        borderRadius: 14,
        padding: '14px 10px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        transition: 'transform 0.15s, box-shadow 0.15s',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = `0 8px 24px ${team.primary}66`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      <span style={{ fontSize: 32 }}>{team.flag}</span>
      <p
        style={{
          color: '#fff',
          fontFamily: 'Oswald, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          margin: 0,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {team.shortName}
      </p>
      <p
        style={{
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          margin: 0,
        }}
      >
        Grupo {seleccion.grupo}
      </p>
    </button>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export function Teams() {
  const [selecciones, setSelecciones] = useState<SeleccionResponse[]>([]);
  const [selected, setSelected] = useState<SeleccionResponse | null>(null);
  const [jugadores, setJugadores] = useState<JugadorResponse[]>([]);
  // loadingTeams starts true — no synchronous setState inside the effect
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSelecciones()
      .then(setSelecciones)
      .catch(() => setError('No se pudieron cargar las selecciones.'))
      .finally(() => setLoadingTeams(false));
  }, []);

  const handleSelectTeam = useCallback((s: SeleccionResponse) => {
    setSelected(s);
    setJugadores([]);
    setLoadingPlayers(true);
    fetchJugadoresBySeleccion(s.id)
      .then(setJugadores)
      .catch(() => setJugadores([]))
      .finally(() => setLoadingPlayers(false));
  }, []);

  const handleBack = useCallback(() => {
    setSelected(null);
    setJugadores([]);
  }, []);

  // Group teams by group letter
  const groups = selecciones.reduce<Record<string, SeleccionResponse[]>>((acc, s) => {
    const g = s.grupo ?? 'X';
    return { ...acc, [g]: [...(acc[g] ?? []), s] };
  }, {});

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a14',
        padding: '80px 16px 40px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {selected && (
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '8px 12px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: 32,
                fontWeight: 800,
                color: '#fff',
                margin: 0,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              {selected ? `🏴 ${resolveTeam(selected).name}` : '🌍 32 Selecciones'}
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                margin: '4px 0 0',
              }}
            >
              {selected ? `Jugadores — Grupo ${selected.grupo}` : 'FIFA World Cup 2026'}
            </p>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <p
            style={{
              color: '#f87171',
              fontFamily: 'Inter, sans-serif',
              textAlign: 'center',
              marginTop: 60,
            }}
          >
            {error}
          </p>
        )}

        {/* ── Teams list ── */}
        {!selected && !loadingTeams && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {Object.keys(groups)
              .sort()
              .map((g) => (
                <section key={g}>
                  <h2
                    style={{
                      color: '#60a5fa',
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: 16,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                      margin: '0 0 14px',
                      borderBottom: '1px solid rgba(96,165,250,0.2)',
                      paddingBottom: 6,
                    }}
                  >
                    Grupo {g}
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {groups[g].map((s) => (
                      <TeamCard key={s.id} seleccion={s} onClick={() => handleSelectTeam(s)} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}

        {/* ── Loading teams ── */}
        {loadingTeams && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
              gap: 12,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <Loader size={20} className="animate-spin" />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
              Cargando selecciones…
            </span>
          </div>
        )}

        {/* ── Players grid ── */}
        {selected && !loadingPlayers && (
          <div>
            {jugadores.length === 0 ? (
              <p
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'Inter, sans-serif',
                  textAlign: 'center',
                  marginTop: 60,
                }}
              >
                No hay jugadores registrados aún.
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  justifyContent: 'flex-start',
                }}
              >
                {jugadores.map((j) => (
                  <CromoCard
                    key={j.id}
                    id={j.id}
                    nombre={j.nombreCompleto}
                    posicion={j.posicion}
                    dorsal={j.dorsal}
                    popularidad={j.popularidad}
                    rareza={parseRareza(popularidadToRareza(j.popularidad))}
                    team={resolveTeam(selected)}
                    fotoUrl={j.fotoUrl}
                    size="md"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Loading players ── */}
        {loadingPlayers && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
              gap: 12,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <Loader size={20} className="animate-spin" />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
              Cargando jugadores…
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
