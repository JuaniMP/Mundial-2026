import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Users,
  Shield,
  Headphones,
  BarChart3,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

const API = 'http://localhost:8082/api/v1';

interface UsuarioItem {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  seleccionFavorita?: string;
  fechaRegistro?: string;
}

interface IncidenteItem {
  id: number;
  descripcion: string;
  estado: string;
  prioridad: string;
  reportadorNombre?: string;
  agenteNombre?: string;
  fechaCreacion?: string;
}

const ROL_COLORS: Record<string, string> = {
  ADMIN: '#C8102E',
  OPERADOR: '#E5B449',
  SOPORTE: '#006847',
  COMPLIANCE: '#1B2A5E',
  AFICIONADO: '#4A5568',
  ALIADO: '#9B59B6',
};

const PRIORIDAD_COLORS: Record<string, string> = {
  ALTA: '#C8102E',
  MEDIA: '#E5B449',
  BAJA: '#006847',
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1.5px solid var(--color-ink)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          background: color,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} color="#fff" />
      </div>
      <div>
        <p
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 28,
            margin: '2px 0 0',
            color: 'var(--color-ink)',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function Admin() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [incidentes, setIncidentes] = useState<IncidenteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'incidentes'>('usuarios');

  const loadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usRes, incRes] = await Promise.all([
        axios.get<{ data: UsuarioItem[] }>(`${API}/usuarios`),
        axios.get<{ data: IncidenteItem[] }>(`${API}/soporte/incidentes`),
      ]);
      setUsuarios(usRes.data.data ?? []);
      setIncidentes(incRes.data.data ?? []);
    } catch {
      // leave empty arrays — backend may be offline in dev
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      fetchData();
    }
  }, [fetchData]);

  const byRol = (rol: string) => usuarios.filter((u) => u.rol === rol).length;

  const stats = [
    { icon: Users, label: 'Total usuarios', value: usuarios.length, color: '#1B2A5E' },
    { icon: UserCheck, label: 'Aficionados', value: byRol('AFICIONADO'), color: '#4A5568' },
    { icon: Headphones, label: 'Agentes soporte', value: byRol('SOPORTE'), color: '#006847' },
    { icon: Shield, label: 'Operadores', value: byRol('OPERADOR'), color: '#E5B449' },
    { icon: BarChart3, label: 'Compliance', value: byRol('COMPLIANCE'), color: '#9B59B6' },
    {
      icon: AlertTriangle,
      label: 'Incidentes abiertos',
      value: incidentes.filter((i) => i.estado === 'ABIERTO').length,
      color: '#C8102E',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        paddingTop: 100,
        paddingBottom: 60,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 10,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-secondary)',
                margin: '0 0 6px',
              }}
            >
              Panel de administración
            </p>
            <h1
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(28px, 5vw, 44px)',
                margin: 0,
                color: 'var(--color-ink)',
                letterSpacing: '0.02em',
              }}
            >
              MUNDIAL 26 · ADMIN
            </h1>
          </div>
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'var(--color-ink)',
              color: 'var(--color-primary)',
              border: 'none',
              fontFamily: 'Archivo, sans-serif',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw
              size={14}
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            />
            Actualizar
          </button>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {stats.map((s) => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 24,
            borderBottom: '1.5px solid var(--color-ink)',
          }}
        >
          {(['usuarios', 'incidentes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px',
                fontFamily: 'Anton, sans-serif',
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: activeTab === tab ? 'var(--color-ink)' : 'transparent',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab === 'usuarios' ? 'Usuarios' : 'Incidentes'}
            </button>
          ))}
        </div>

        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--color-text-muted)',
              fontFamily: 'Archivo, sans-serif',
            }}
          >
            Cargando datos...
          </div>
        )}

        {/* Usuarios table */}
        {!loading && activeTab === 'usuarios' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-ink)' }}>
                  {['ID', 'Nombre', 'Email', 'Rol', 'Selección', 'Registro'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'Archivo, sans-serif',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid rgba(14,26,43,0.08)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(14,26,43,0.02)',
                    }}
                  >
                    <td style={tdStyle}>{u.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{u.nombre}</td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-secondary)' }}>{u.email}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: ROL_COLORS[u.rol] ?? '#4A5568',
                          color: '#fff',
                          fontFamily: 'Archivo, sans-serif',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                        }}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-secondary)' }}>
                      {u.seleccionFavorita ?? '—'}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: 12 }}>
                      {u.fechaRegistro
                        ? new Date(u.fechaRegistro).toLocaleDateString('es-CO')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuarios.length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'var(--color-text-muted)',
                  fontFamily: 'Archivo, sans-serif',
                }}
              >
                No hay usuarios registrados.
              </p>
            )}
          </div>
        )}

        {/* Incidentes table */}
        {!loading && activeTab === 'incidentes' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-ink)' }}>
                  {[
                    'ID',
                    'Descripción',
                    'Estado',
                    'Prioridad',
                    'Reportador',
                    'Agente',
                    'Fecha',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'Archivo, sans-serif',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidentes.map((inc, i) => (
                  <tr
                    key={inc.id}
                    style={{
                      borderBottom: '1px solid rgba(14,26,43,0.08)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(14,26,43,0.02)',
                    }}
                  >
                    <td style={tdStyle}>#{inc.id}</td>
                    <td style={{ ...tdStyle, maxWidth: 300 }}>
                      <span
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {inc.descripcion}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '2px 8px',
                          background:
                            inc.estado === 'ABIERTO'
                              ? '#C8102E'
                              : inc.estado === 'EN_PROGRESO'
                                ? '#E5B449'
                                : '#006847',
                          color: '#fff',
                          fontFamily: 'Archivo, sans-serif',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {inc.estado}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: PRIORIDAD_COLORS[inc.prioridad] ?? 'inherit',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {inc.prioridad ?? '—'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-secondary)' }}>
                      {inc.reportadorNombre ?? '—'}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-secondary)' }}>
                      {inc.agenteNombre ?? (
                        <span style={{ color: 'var(--color-text-muted)' }}>Sin asignar</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: 12 }}>
                      {inc.fechaCreacion
                        ? new Date(inc.fechaCreacion).toLocaleDateString('es-CO')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {incidentes.length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'var(--color-text-muted)',
                  fontFamily: 'Archivo, sans-serif',
                }}
              >
                No hay incidentes registrados.
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontFamily: 'Archivo, sans-serif',
  fontSize: 13,
  color: 'var(--color-ink)',
  verticalAlign: 'middle',
};
