import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Filter } from 'lucide-react';
import { type LogEntry, type LogsFilter, buscarLogs } from '../../services/backofficeApi';
import { Card } from './shared/Card';
import { SeverityBadge } from './shared/Badges';
import { Input, Select } from './shared/FormFields';
import { fmtDate } from './shared/format';

export function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<LogsFilter>({ page: 0, size: 50 });

  const ejecutar = () => {
    setLoading(true);
    setError(null);
    buscarLogs(filtro)
      .then(setLogs)
      .catch((e) => setError(e.message ?? 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await buscarLogs(filtro);
        if (!cancelled) setLogs(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <h2 style={{ margin: '0 0 4px', fontFamily: 'Oswald, sans-serif', fontSize: 22 }}>
        Consola de auditoría
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
        Filtra eventos técnicos a gran escala. No es atención uno-a-uno.
      </p>

      {/* Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 16,
          padding: 14,
          background: '#f9fafb',
          borderRadius: 8,
        }}
      >
        <Input
          label="Acción (LIKE)"
          value={filtro.tipo ?? ''}
          onChange={(v) => setFiltro({ ...filtro, tipo: v })}
          placeholder="ej: INTERCAMBIO"
        />
        <Input
          label="Usuario ID"
          value={filtro.usuarioId?.toString() ?? ''}
          onChange={(v) => setFiltro({ ...filtro, usuarioId: v ? Number(v) : undefined })}
          placeholder="ej: 123"
        />
        <Select
          label="Riesgo"
          value={filtro.nivelRiesgo ?? ''}
          onChange={(v) => setFiltro({ ...filtro, nivelRiesgo: v || undefined })}
          options={[
            { v: '', label: '(todos)' },
            { v: 'ALTA', label: 'Alta' },
            { v: 'MEDIA', label: 'Media' },
            { v: 'BAJA', label: 'Baja' },
          ]}
        />
        <Input
          label="Desde"
          value={filtro.desde ?? ''}
          onChange={(v) => setFiltro({ ...filtro, desde: v })}
          placeholder="YYYY-MM-DD"
          type="date"
        />
        <Input
          label="Hasta"
          value={filtro.hasta ?? ''}
          onChange={(v) => setFiltro({ ...filtro, hasta: v })}
          placeholder="YYYY-MM-DD"
          type="date"
        />
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={ejecutar}
            disabled={loading}
            style={{
              background: '#0D1B2A',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {loading ? <Loader2 size={14} /> : <Filter size={14} />}
            Filtrar
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <div style={{ overflowX: 'auto', maxHeight: 540 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: 0, background: '#ffffff' }}>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Acción</th>
              <th style={{ padding: '8px' }}>Riesgo</th>
              <th style={{ padding: '8px' }}>Usuario</th>
              <th style={{ padding: '8px' }}>Detalle</th>
              <th style={{ padding: '8px' }}>Verificado</th>
              <th style={{ padding: '8px' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                  Sin resultados.
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px', fontWeight: 600, fontFamily: 'monospace' }}>
                  {l.accion}
                </td>
                <td style={{ padding: '8px' }}>
                  <SeverityBadge level={l.nivelRiesgo} />
                </td>
                <td style={{ padding: '8px' }}>{l.usuarioNombre ?? l.usuarioId ?? '—'}</td>
                <td
                  style={{
                    padding: '8px',
                    maxWidth: 380,
                    fontSize: 11,
                    color: '#374151',
                  }}
                >
                  <div
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {l.detalle}
                  </div>
                </td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  {l.verificadoCompliance ? (
                    <CheckCircle2 size={14} color="#10b981" />
                  ) : (
                    <span style={{ color: '#9ca3af' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '8px', whiteSpace: 'nowrap', color: '#6b7280' }}>
                  {fmtDate(l.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
