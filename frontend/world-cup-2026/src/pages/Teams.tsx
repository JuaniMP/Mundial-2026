import { useState, useEffect, useCallback } from 'react';
import type { SeleccionResponse, JugadorResponse } from '../types';
import { fetchSelecciones, fetchJugadoresBySeleccion } from '../services/footballApi';
import { CromoCard } from '../components/album/CromoCard';
import { getTeamByShortName } from '../components/album/teamColors';
import type { Team } from '../components/album/teamColors';
import { parseRareza } from '../components/album/rarityUtils';
import { ArrowLeft, Loader } from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────

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
        background: 'var(--color-bg-deep)',
        border: '1.5px solid var(--color-ink)',
        padding: '14px 10px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        transition: 'transform .15s, box-shadow .15s',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translate(-3px,-3px)';
        el.style.boxShadow = '6px 6px 0 var(--color-ink)';
        el.style.background = 'var(--color-bg-elevated)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.background = 'var(--color-bg-deep)';
      }}
    >
      <span style={{ fontSize: 28 }}>{team.flag}</span>
      <p
        style={{
          color: 'var(--color-ink)',
          fontFamily: 'Anton, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          margin: 0,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {team.shortName}
      </p>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'Archivo, sans-serif',
          fontSize: 10,
          margin: 0,
          letterSpacing: '0.1em',
        }}
      >
        GRP {seleccion.grupo}
      </p>
      <div
        style={{
          width: 24,
          height: 3,
          background: team.primary,
          marginTop: 2,
        }}
      />
    </button>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export function Teams() {
  const [selecciones, setSelecciones] = useState<SeleccionResponse[]>([]);
  const [selected, setSelected] = useState<SeleccionResponse | null>(null);
  const [jugadores, setJugadores] = useState<JugadorResponse[]>([]);
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

  const groups = selecciones.reduce<Record<string, SeleccionResponse[]>>((acc, s) => {
    const g = s.grupo ?? 'X';
    return { ...acc, [g]: [...(acc[g] ?? []), s] };
  }, {});

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-deep)',
        paddingTop: 115,
      }}
    >
      {/* ── Page Hero ── */}
      <section
        style={{ borderBottom: '1.5px solid var(--color-ink)', background: 'var(--color-bg-deep)' }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '48px 36px 32px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 11,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 2,
                  background: 'var(--color-primary)',
                  display: 'inline-block',
                }}
              />
              {selected
                ? `Jugadores · Grupo ${selected.grupo}`
                : '48 equipos · FIFA World Cup 2026'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {selected && (
                <button
                  onClick={handleBack}
                  style={{
                    background: 'transparent',
                    border: '1.5px solid var(--color-ink)',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-ink)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-ink)';
                  }}
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <h1
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 'clamp(42px,6vw,96px)',
                  lineHeight: 0.9,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                {selected ? (
                  <>
                    {resolveTeam(selected).flag}{' '}
                    <span
                      style={{
                        fontFamily: 'DM Serif Display, serif',
                        fontStyle: 'italic',
                        fontSize: '0.82em',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      {resolveTeam(selected).name}
                    </span>
                  </>
                ) : (
                  <>
                    🌍{' '}
                    <span
                      style={{
                        fontFamily: 'DM Serif Display, serif',
                        fontStyle: 'italic',
                        fontSize: '0.82em',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      32
                    </span>{' '}
                    SELECCIONES
                  </>
                )}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 36px' }}>
        {/* ── Error ── */}
        {error && (
          <p
            style={{
              fontFamily: 'Anton, sans-serif',
              color: 'var(--color-danger)',
              textAlign: 'center',
              marginTop: 60,
              fontSize: 18,
              letterSpacing: '0.08em',
            }}
          >
            {error}
          </p>
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
              color: 'var(--color-text-muted)',
            }}
          >
            <Loader size={20} className="animate-spin" />
            <span
              style={{ fontFamily: 'Archivo, sans-serif', fontSize: 14, letterSpacing: '0.1em' }}
            >
              Cargando selecciones…
            </span>
          </div>
        )}

        {/* ── Teams list ── */}
        {!selected && !loadingTeams && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {Object.keys(groups)
              .sort()
              .map((g) => (
                <section key={g}>
                  <h2
                    style={{
                      fontFamily: 'Anton, sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      margin: '0 0 14px',
                      borderBottom: '1.5px solid var(--color-ink)',
                      paddingBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: 'var(--color-ink)',
                    }}
                  >
                    <span
                      style={{
                        background: 'var(--color-ink)',
                        color: 'var(--color-primary)',
                        padding: '3px 10px',
                        fontFamily: 'Anton, sans-serif',
                        fontSize: 13,
                        letterSpacing: '0.15em',
                      }}
                    >
                      GRUPO {g}
                    </span>
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

        {/* ── Loading players ── */}
        {loadingPlayers && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
              gap: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            <Loader size={20} className="animate-spin" />
            <span
              style={{ fontFamily: 'Archivo, sans-serif', fontSize: 14, letterSpacing: '0.1em' }}
            >
              Cargando jugadores…
            </span>
          </div>
        )}

        {/* ── Players grid ── */}
        {selected && !loadingPlayers && (
          <div>
            {jugadores.length === 0 ? (
              <p
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  marginTop: 60,
                  fontSize: 15,
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
      </div>
    </main>
  );
}
