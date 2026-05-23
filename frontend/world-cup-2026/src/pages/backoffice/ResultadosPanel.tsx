import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { cargarResultadoManual } from '../../services/backofficeApi';
import { Card } from './shared/Card';
import { Input } from './shared/FormFields';

export function ResultadosPanel() {
  const [partidoId, setPartidoId] = useState('');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [observacion, setObservacion] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    prediccionesRecalculadas: number;
    pollasAfectadas: number;
  } | null>(null);

  const submit = async () => {
    setError(null);
    setSuccess(null);
    if (!partidoId || !golesLocal || !golesVisitante) {
      setError('Completa partido y marcador.');
      return;
    }
    setWorking(true);
    try {
      const res = await cargarResultadoManual({
        partidoId: Number(partidoId),
        golesLocal: Number(golesLocal),
        golesVisitante: Number(golesVisitante),
        observacion,
      });
      setSuccess({
        prediccionesRecalculadas: res.prediccionesRecalculadas,
        pollasAfectadas: res.pollasAfectadas,
      });
      setPartidoId('');
      setGolesLocal('');
      setGolesVisitante('');
      setObservacion('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 8 }}>
        <AlertTriangle size={20} color="#f59e0b" style={{ marginTop: 2 }} />
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Oswald, sans-serif', fontSize: 22 }}>
            Carga manual de resultados
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Úsalo solo cuando la API deportiva falla. Dispara recalculo automático de puntajes en
            todas las pollas que tengan predicciones para este partido.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 12,
          marginTop: 16,
          maxWidth: 480,
        }}
      >
        <Input
          label="ID partido (football-data.org)"
          value={partidoId}
          onChange={setPartidoId}
          type="number"
          placeholder="ej: 472432"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 8,
            alignItems: 'end',
          }}
        >
          <Input label="Goles local" value={golesLocal} onChange={setGolesLocal} type="number" />
          <div style={{ paddingBottom: 8, color: '#9ca3af', fontWeight: 700 }}>vs</div>
          <Input
            label="Goles visitante"
            value={golesVisitante}
            onChange={setGolesVisitante}
            type="number"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            Observación (opcional)
          </label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={2}
            placeholder="ej: API caída entre 14:00-15:30, dato verificado contra FIFA.com"
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: 10,
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              background: '#dcfce7',
              color: '#166534',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            ✓ Marcador guardado. Predicciones recalculadas:{' '}
            <strong>{success.prediccionesRecalculadas}</strong> · Pollas afectadas:{' '}
            <strong>{success.pollasAfectadas}</strong>
          </div>
        )}

        <button
          onClick={submit}
          disabled={working}
          style={{
            background: '#006847',
            color: '#ffffff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: 6,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center',
          }}
        >
          {working ? <Loader2 size={14} /> : <CheckCircle2 size={14} />}
          {working ? 'Procesando…' : 'Guardar y recalcular puntajes'}
        </button>
      </div>
    </Card>
  );
}
