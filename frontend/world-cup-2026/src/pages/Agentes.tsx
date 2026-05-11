import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Headphones,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8082/api/v1';

interface IncidenteItem {
  id: number;
  descripcion: string;
  estado: string;
  prioridad: string;
  reportadorId?: number;
  reportadorNombre?: string;
  agenteId?: number;
  agenteNombre?: string;
  fechaCreacion?: string;
}

const ESTADO_META: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  ABIERTO: { label: 'Abierto', color: '#C8102E', icon: AlertCircle },
  EN_PROGRESO: { label: 'En progreso', color: '#E5B449', icon: Clock },
  RESUELTO: { label: 'Resuelto', color: '#006847', icon: CheckCircle },
};

const PRIORIDAD_COLORS: Record<string, string> = {
  ALTA: '#C8102E',
  MEDIA: '#E5B449',
  BAJA: '#006847',
};

function IncidenteCard({
  inc,
  agenteId,
  onAsignar,
  onResolver,
}: {
  inc: IncidenteItem;
  agenteId: number | null;
  onAsignar: (id: number) => void;
  onResolver: (id: number) => void;
}) {
  const meta = ESTADO_META[inc.estado] ?? ESTADO_META['ABIERTO'];
  const Icon = meta.icon;

  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1.5px solid var(--color-ink)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 11,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
              }}
            >
              #{inc.id}
            </span>
            {inc.prioridad && (
              <span
                style={{
                  padding: '1px 6px',
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  color: PRIORIDAD_COLORS[inc.prioridad] ?? 'inherit',
                  border: `1px solid ${PRIORIDAD_COLORS[inc.prioridad] ?? 'inherit'}`,
                }}
              >
                {inc.prioridad}
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 14,
              color: 'var(--color-ink)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {inc.descripcion}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: meta.color,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <Icon size={12} />
          <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: 10, fontWeight: 700 }}>
            {meta.label}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          borderTop: '1px solid rgba(14,26,43,0.1)',
          paddingTop: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <span
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
            }}
          >
            Reportado por: <strong>{inc.reportadorNombre ?? 'Usuario'}</strong>
          </span>
          {inc.agenteNombre && (
            <span
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 12,
                color: 'var(--color-text-secondary)',
              }}
            >
              Agente: <strong>{inc.agenteNombre}</strong>
            </span>
          )}
          {inc.fechaCreacion && (
            <span
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontSize: 12,
                color: 'var(--color-text-muted)',
              }}
            >
              {new Date(inc.fechaCreacion).toLocaleDateString('es-CO')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {inc.estado === 'ABIERTO' && agenteId && (
            <button
              onClick={() => onAsignar(inc.id)}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1.5px solid var(--color-ink)',
                fontFamily: 'Archivo, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: 'var(--color-ink)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
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
              <UserCheck size={12} />
              Asignarme
            </button>
          )}
          {(inc.estado === 'ABIERTO' || inc.estado === 'EN_PROGRESO') && (
            <button
              onClick={() => onResolver(inc.id)}
              style={{
                padding: '6px 14px',
                background: '#006847',
                border: '1.5px solid #006847',
                fontFamily: 'Archivo, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }}
            >
              <CheckCircle size={12} />
              Resolver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Agentes() {
  const { user } = useAuth();
  const [incidentes, setIncidentes] = useState<IncidenteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'TODOS' | 'ABIERTO' | 'EN_PROGRESO' | 'RESUELTO'>('TODOS');

  const loadedRef = useRef(false);

  const fetchIncidentes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<{ data: IncidenteItem[] }>(`${API}/soporte/incidentes`);
      setIncidentes(res.data.data ?? []);
    } catch {
      setIncidentes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      fetchIncidentes();
    }
  }, [fetchIncidentes]);

  const handleAsignar = async (incId: number) => {
    if (!user?.id) return;
    const parsed = parseInt(user.id, 10);
    if (isNaN(parsed)) return;
    try {
      await axios.put(`${API}/soporte/incidentes/${incId}/asignar`, { agenteId: parsed });
      void fetchIncidentes();
    } catch {
      // silent — backend may not resolve numeric id from email-based id
    }
  };

  const handleResolver = async (incId: number) => {
    try {
      await axios.put(`${API}/soporte/incidentes/${incId}/resolver`, {
        resolucion: 'Incidente resuelto por el agente de soporte.',
      });
      void fetchIncidentes();
    } catch {
      // silent
    }
  };

  const filtrados = filtro === 'TODOS' ? incidentes : incidentes.filter((i) => i.estado === filtro);

  const counts = {
    TODOS: incidentes.length,
    ABIERTO: incidentes.filter((i) => i.estado === 'ABIERTO').length,
    EN_PROGRESO: incidentes.filter((i) => i.estado === 'EN_PROGRESO').length,
    RESUELTO: incidentes.filter((i) => i.estado === 'RESUELTO').length,
  };

  const agenteId = user?.id ? parseInt(user.id, 10) || null : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        paddingTop: 100,
        paddingBottom: 60,
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <Headphones size={20} color="var(--color-secondary)" />
              <p
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--color-secondary)',
                  margin: 0,
                }}
              >
                Panel de soporte
              </p>
            </div>
            <h1
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(26px, 4vw, 40px)',
                margin: 0,
                color: 'var(--color-ink)',
                letterSpacing: '0.02em',
              }}
            >
              GESTIÓN DE INCIDENTES
            </h1>
          </div>
          <button
            onClick={() => void fetchIncidentes()}
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

        {/* Summary cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 28,
          }}
        >
          {(['TODOS', 'ABIERTO', 'EN_PROGRESO', 'RESUELTO'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              style={{
                padding: '14px 16px',
                background: filtro === estado ? 'var(--color-ink)' : 'var(--color-bg-elevated)',
                border: '1.5px solid var(--color-ink)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <p
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 26,
                  margin: 0,
                  color: filtro === estado ? 'var(--color-primary)' : 'var(--color-ink)',
                }}
              >
                {counts[estado]}
              </p>
              <p
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  margin: '4px 0 0',
                  color: filtro === estado ? 'rgba(246,239,226,0.7)' : 'var(--color-text-muted)',
                }}
              >
                {estado === 'TODOS' ? 'Total' : estado.replace('_', ' ')}
              </p>
            </button>
          ))}
        </div>

        {/* Incidents list */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: 60,
              color: 'var(--color-text-muted)',
              fontFamily: 'Archivo, sans-serif',
            }}
          >
            Cargando incidentes...
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 60,
              color: 'var(--color-text-muted)',
              fontFamily: 'Archivo, sans-serif',
              border: '1.5px dashed rgba(14,26,43,0.2)',
            }}
          >
            No hay incidentes en esta categoría.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtrados.map((inc) => (
            <IncidenteCard
              key={inc.id}
              inc={inc}
              agenteId={agenteId}
              onAsignar={handleAsignar}
              onResolver={handleResolver}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
