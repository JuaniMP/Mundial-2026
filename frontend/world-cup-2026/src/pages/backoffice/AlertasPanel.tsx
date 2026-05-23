import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { type Alerta, listarAlertas, revisarAlerta } from '../../services/backofficeApi';
import { Card } from './shared/Card';
import { SeverityBadge } from './shared/Badges';
import { fmtDate } from './shared/format';

export function AlertasPanel() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [soloAbiertas, setSoloAbiertas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = (open = soloAbiertas) => {
    setLoading(true);
    setError(null);
    listarAlertas(open)
      .then(setAlertas)
      .catch((e) => setError(e.message ?? 'Error cargando alertas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar(soloAbiertas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloAbiertas]);

  const handleRevisar = async (a: Alerta) => {
    try {
      await revisarAlerta(a.id, !a.revisada);
      cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Oswald, sans-serif', fontSize: 22 }}>
            Alertas tempranas anti-fraude
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Patrones sospechosos detectados automáticamente por el sistema.
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={soloAbiertas}
            onChange={(e) => setSoloAbiertas(e.target.checked)}
          />
          Solo abiertas
        </label>
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Cargando alertas...
        </div>
      )}

      {error && (
        <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8 }}>
          ⚠ {error}
        </div>
      )}

      {!loading && !error && alertas.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          <CheckCircle2
            size={32}
            style={{ margin: '0 auto 8px', display: 'block', color: '#10b981' }}
          />
          No hay alertas pendientes.
        </div>
      )}

      {alertas.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px', fontWeight: 700 }}>Tipo</th>
                <th style={{ padding: '10px 8px', fontWeight: 700 }}>Severidad</th>
                <th style={{ padding: '10px 8px', fontWeight: 700 }}>Usuario</th>
                <th style={{ padding: '10px 8px', fontWeight: 700 }}>Descripción</th>
                <th style={{ padding: '10px 8px', fontWeight: 700 }}>Fecha</th>
                <th style={{ padding: '10px 8px', fontWeight: 700 }}></th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{a.tipo}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <SeverityBadge level={a.severidad} />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div>{a.usuarioNombre ?? '—'}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{a.usuarioEmail ?? ''}</div>
                  </td>
                  <td style={{ padding: '10px 8px', maxWidth: 350 }}>
                    <div
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {a.descripcion}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap', color: '#6b7280' }}>
                    {fmtDate(a.timestamp)}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <button
                      onClick={() => handleRevisar(a)}
                      style={{
                        background: a.revisada ? '#f3f4f6' : '#006847',
                        color: a.revisada ? '#374151' : '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {a.revisada ? (
                        <>
                          <XCircle size={13} /> Reabrir
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} /> Revisar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
