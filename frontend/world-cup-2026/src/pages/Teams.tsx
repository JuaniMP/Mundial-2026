import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8082/api/v1';

// ── Tipos de la API football-data.org ───────────────────────────────────────

interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  venue?: string;
  founded?: number;
  clubColors?: string;
  squad?: ApiPlayer[];
}

interface ApiPlayer {
  id: number;
  name: string;
  position: string | null; // Goalkeeper | Defence | Midfield | Offence
  dateOfBirth?: string;
  nationality?: string;
  shirtNumber?: number | null;
}

interface TeamsApiResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    teams: ApiTeam[];
  } | null;
}

interface TeamDetailApiResponse {
  success: boolean;
  data: ApiTeam | null;
}

// ── Mapeos ───────────────────────────────────────────────────────────────────

// Mapeo posición inglés → español
const POS_MAP: Record<string, string> = {
  Goalkeeper: 'Portero',
  Defence: 'Defensa',
  Midfield: 'Centrocampista',
  Offence: 'Delantero',
};

const POS_ORDER: Record<string, number> = {
  Portero: 0,
  Defensa: 1,
  Centrocampista: 2,
  Delantero: 3,
};

const POS_COLORS: Record<string, { bg: string; text: string }> = {
  Portero: { bg: '#fef08a', text: '#713f12' },
  Defensa: { bg: '#bbf7d0', text: '#14532d' },
  Centrocampista: { bg: '#bfdbfe', text: '#1e3a8a' },
  Delantero: { bg: '#fecaca', text: '#7f1d1d' },
};

// Mapeo TLA → confederación (48 equipos WC 2026)
const TLA_CONF: Record<string, string> = {
  ARG: 'CONMEBOL',
  BRA: 'CONMEBOL',
  COL: 'CONMEBOL',
  URU: 'CONMEBOL',
  ECU: 'CONMEBOL',
  PAR: 'CONMEBOL',
  PER: 'CONMEBOL',
  VEN: 'CONMEBOL',
  CHI: 'CONMEBOL',
  BOL: 'CONMEBOL',
  USA: 'CONCACAF',
  MEX: 'CONCACAF',
  CAN: 'CONCACAF',
  HON: 'CONCACAF',
  JAM: 'CONCACAF',
  PAN: 'CONCACAF',
  CRC: 'CONCACAF',
  FRA: 'UEFA',
  ENG: 'UEFA',
  ESP: 'UEFA',
  GER: 'UEFA',
  POR: 'UEFA',
  NED: 'UEFA',
  BEL: 'UEFA',
  ITA: 'UEFA',
  CRO: 'UEFA',
  SUI: 'UEFA',
  SRB: 'UEFA',
  AUT: 'UEFA',
  SCO: 'UEFA',
  DEN: 'UEFA',
  TUR: 'UEFA',
  SVK: 'UEFA',
  POL: 'UEFA',
  GRE: 'UEFA',
  WAL: 'UEFA',
  CZE: 'UEFA',
  MAR: 'CAF',
  SEN: 'CAF',
  NGA: 'CAF',
  CMR: 'CAF',
  GHA: 'CAF',
  TUN: 'CAF',
  ALG: 'CAF',
  RSA: 'CAF',
  EGY: 'CAF',
  JPN: 'AFC',
  KOR: 'AFC',
  AUS: 'AFC',
  KSA: 'AFC',
  IRN: 'AFC',
  IRQ: 'AFC',
  IDN: 'AFC',
  UZB: 'AFC',
  NZL: 'OFC',
};

const CONF_COLORS: Record<string, string> = {
  CONMEBOL: '#2563eb',
  CONCACAF: '#16a34a',
  UEFA: '#7c3aed',
  CAF: '#ea580c',
  AFC: '#dc2626',
  OFC: '#0891b2',
};

const CONFEDERACIONES = ['ALL', 'CONMEBOL', 'CONCACAF', 'UEFA', 'CAF', 'AFC', 'OFC'];
const CONF_LABELS: Record<string, string> = {
  ALL: 'Todas',
  CONMEBOL: 'CONMEBOL',
  CONCACAF: 'CONCACAF',
  UEFA: 'UEFA',
  CAF: 'CAF',
  AFC: 'AFC',
  OFC: 'OFC',
};

// ── Componentes visuales ──────────────────────────────────────────────────────

function TeamCrest({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          background: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#64748b',
          fontWeight: 700,
        }}
      >
        {alt.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      style={{ width: 36, height: 36, objectFit: 'contain' }}
    />
  );
}

function PlayerAvatar({ name }: { name: string }) {
  const seed = encodeURIComponent(name);
  const dicebear = `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&scale=85`;
  return (
    <img
      src={dicebear}
      alt={name}
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: '#f1f5f9',
        flexShrink: 0,
        objectFit: 'cover',
      }}
    />
  );
}

function TeamCard({
  team,
  selected,
  onClick,
}: {
  team: ApiTeam;
  selected: boolean;
  onClick: () => void;
}) {
  const conf = TLA_CONF[team.tla] ?? 'UEFA';
  const color = CONF_COLORS[conf] ?? '#64748b';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '12px 8px',
        background: selected ? color : '#fff',
        border: `2px solid ${selected ? color : '#e2e8f0'}`,
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: '100%',
        minWidth: 0,
      }}
    >
      <TeamCrest src={team.crest} alt={team.tla} />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: selected ? '#fff' : '#1e293b',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {team.shortName || team.name}
      </span>
      <span
        style={{
          fontSize: 9,
          background: selected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
          color: selected ? '#fff' : '#64748b',
          borderRadius: 5,
          padding: '1px 5px',
          fontWeight: 600,
        }}
      >
        {team.tla}
      </span>
    </button>
  );
}

function PlayerRow({ player }: { player: ApiPlayer }) {
  const posEs = POS_MAP[player.position ?? ''] ?? player.position ?? '—';
  const colors = POS_COLORS[posEs] ?? { bg: '#f1f5f9', text: '#475569' };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 0',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <span
        style={{
          width: 28,
          fontSize: 12,
          fontWeight: 800,
          color: '#94a3b8',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {player.shirtNumber != null ? `#${player.shirtNumber}` : '—'}
      </span>
      <PlayerAvatar name={player.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#1e293b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {player.name}
        </div>
        {player.nationality && (
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{player.nationality}</div>
        )}
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          background: colors.bg,
          color: colors.text,
          borderRadius: 6,
          padding: '2px 7px',
          flexShrink: 0,
        }}
      >
        {posEs}
      </span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function Teams() {
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [squads, setSquads] = useState<Record<number, ApiPlayer[]>>({});
  const [confFilter, setConfFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSquad, setLoadingSquad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Record<number, ApiPlayer[]>>({});

  // Cargar lista de selecciones desde la API
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get<TeamsApiResponse>(`${API_BASE}/football/teams`);
        if (res.data?.data?.teams) {
          const t = res.data.data.teams;
          setTeams(t);
          if (t.length > 0) setSelectedId(t[0].id);
        } else {
          setError(
            res.data?.message ||
              'La API de football-data.org no está configurada. Configura FOOTBALL_DATA_KEY en el backend.',
          );
        }
      } catch {
        setError('Error al conectar con el backend. Verifica que el servidor esté corriendo.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Cargar squad del equipo seleccionado
  useEffect(() => {
    if (selectedId == null) return;
    if (cacheRef.current[selectedId] !== undefined) {
      setSquads((prev) => ({ ...prev, [selectedId]: cacheRef.current[selectedId] }));
      return;
    }
    const load = async () => {
      setLoadingSquad(true);
      try {
        const res = await axios.get<TeamDetailApiResponse>(
          `${API_BASE}/football/teams/${selectedId}`,
        );
        const squad = res.data?.data?.squad ?? [];
        cacheRef.current[selectedId] = squad;
        setSquads((prev) => ({ ...prev, [selectedId]: squad }));
      } catch {
        cacheRef.current[selectedId] = [];
        setSquads((prev) => ({ ...prev, [selectedId]: [] }));
      } finally {
        setLoadingSquad(false);
      }
    };
    load();
  }, [selectedId]);

  const filtered = teams.filter((t) => {
    const conf = TLA_CONF[t.tla] ?? 'UEFA';
    if (confFilter !== 'ALL' && conf !== confFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedTeam = teams.find((t) => t.id === selectedId);
  const squad = selectedId != null ? (squads[selectedId] ?? null) : null;

  const sortedSquad = squad
    ? [...squad].sort(
        (a, b) =>
          (POS_ORDER[POS_MAP[a.position ?? ''] ?? ''] ?? 9) -
            (POS_ORDER[POS_MAP[b.position ?? ''] ?? ''] ?? 9) ||
          (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99),
      )
    : null;

  const confColor = selectedTeam
    ? (CONF_COLORS[TLA_CONF[selectedTeam.tla] ?? ''] ?? '#1D3557')
    : '#1D3557';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1D3557 0%, #457B9D 100%)',
          padding: '32px 24px 24px',
          color: '#fff',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>
          🌍 Las 48 Selecciones
        </h1>
        <p style={{ margin: '6px 0 0', opacity: 0.8, fontSize: 14 }}>
          FIFA World Cup 2026 · USA · México · Canadá
        </p>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 16px',
          display: 'flex',
          gap: 24,
        }}
      >
        {/* Panel izquierdo */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Buscar selección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CONFEDERACIONES.map((conf) => (
                <button
                  key={conf}
                  onClick={() => setConfFilter(conf)}
                  style={{
                    padding: '4px 10px',
                    border: `1.5px solid ${confFilter === conf ? (CONF_COLORS[conf] ?? '#1D3557') : '#e2e8f0'}`,
                    background: confFilter === conf ? (CONF_COLORS[conf] ?? '#1D3557') : '#fff',
                    color: confFilter === conf ? '#fff' : '#475569',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {CONF_LABELS[conf]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Cargando selecciones...
            </div>
          ) : error ? (
            <div
              style={{
                padding: 20,
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: 12,
                color: '#991b1b',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              ⚠️ {error}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                maxHeight: 'calc(100vh - 260px)',
                overflowY: 'auto',
                paddingRight: 4,
              }}
            >
              {filtered.map((t) => (
                <TeamCard
                  key={t.id}
                  team={t}
                  selected={t.id === selectedId}
                  onClick={() => setSelectedId(t.id)}
                />
              ))}
              {filtered.length === 0 && (
                <div
                  style={{
                    gridColumn: '1/-1',
                    padding: 20,
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: 14,
                  }}
                >
                  Sin resultados
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedTeam ? (
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                border: '1.5px solid #e2e8f0',
                overflow: 'hidden',
              }}
            >
              {/* Cabecera equipo */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${confColor}22, ${confColor}11)`,
                  borderBottom: `3px solid ${confColor}`,
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                <TeamCrest src={selectedTeam.crest} alt={selectedTeam.tla} />
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 900,
                      color: '#1e293b',
                      letterSpacing: -0.5,
                    }}
                  >
                    {selectedTeam.name}
                  </h2>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: confColor,
                        color: '#fff',
                        borderRadius: 6,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {TLA_CONF[selectedTeam.tla] ?? '—'}
                    </span>
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        borderRadius: 6,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {selectedTeam.tla}
                    </span>
                    {selectedTeam.venue && (
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          borderRadius: 6,
                          padding: '2px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        🏟️ {selectedTeam.venue}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Plantel */}
              <div style={{ padding: '20px 28px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                    Plantel
                  </h3>
                  {sortedSquad && (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {sortedSquad.length} jugadores
                    </span>
                  )}
                </div>

                {/* Leyenda posiciones */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  {Object.entries(POS_COLORS).map(([pos, c]) => (
                    <span
                      key={pos}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: c.bg,
                        color: c.text,
                        borderRadius: 6,
                        padding: '2px 8px',
                      }}
                    >
                      {pos}
                    </span>
                  ))}
                </div>

                {loadingSquad ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    Cargando plantel...
                  </div>
                ) : sortedSquad && sortedSquad.length > 0 ? (
                  <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
                    {sortedSquad.map((p) => (
                      <PlayerRow key={p.id} player={p} />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: 14,
                    }}
                  >
                    No hay plantel disponible para este equipo en la API
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                border: '1.5px solid #e2e8f0',
                padding: 60,
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: 16,
              }}
            >
              Selecciona una selección para ver su plantel
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
