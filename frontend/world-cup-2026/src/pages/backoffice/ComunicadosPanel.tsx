import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import {
  type ComunicadoProgreso,
  enviarComunicado,
  obtenerProgresoComunicado,
} from '../../services/backofficeApi';
import { Card } from './shared/Card';
import { Input, Select } from './shared/FormFields';

export function ComunicadosPanel() {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [segmento, setSegmento] = useState<'TODOS' | 'CIUDAD' | 'PARTIDO' | 'ESTADIO' | 'ROL'>(
    'TODOS',
  );
  const [segmentoValor, setSegmentoValor] = useState('');
  const [canales, setCanales] = useState<Array<'APP' | 'PUSH'>>(['APP', 'PUSH']);
  const [progreso, setProgreso] = useState<ComunicadoProgreso | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll progress every 1s while in process
  useEffect(() => {
    if (!progreso || progreso.estado !== 'EN_PROCESO') return;
    const i = window.setInterval(() => {
      obtenerProgresoComunicado(progreso.id)
        .then(setProgreso)
        .catch(() => {
          /* keep */
        });
    }, 1000);
    return () => window.clearInterval(i);
  }, [progreso]);

  const enviar = async () => {
    setError(null);
    if (!titulo.trim() || !mensaje.trim()) {
      setError('Título y mensaje son obligatorios.');
      return;
    }
    if (segmento !== 'TODOS' && !segmentoValor.trim()) {
      setError('Especifica el valor del segmento.');
      return;
    }
    if (canales.length === 0) {
      setError('Selecciona al menos un canal (APP o PUSH).');
      return;
    }
    setWorking(true);
    try {
      const p = await enviarComunicado({
        titulo,
        mensaje,
        segmento,
        segmentoValor: segmento === 'TODOS' ? undefined : segmentoValor,
        canales,
      });
      setProgreso(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setWorking(false);
    }
  };

  const pct =
    progreso && progreso.totalDestinatarios > 0
      ? Math.round(((progreso.enviados + progreso.fallidos) / progreso.totalDestinatarios) * 100)
      : 0;

  return (
    <Card>
      <h2 style={{ margin: 0, fontFamily: 'Oswald, sans-serif', fontSize: 22 }}>
        Comunicados masivos
      </h2>
      <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#6b7280' }}>
        Envío segmentado en lotes de 100. Asíncrono — verás el progreso en tiempo real.
      </p>

      <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <Input
          label="Título"
          value={titulo}
          onChange={setTitulo}
          placeholder="ej: Cambio de horario del partido"
        />
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            Mensaje
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={5}
            placeholder="Cuerpo del mensaje. Soporta texto plano."
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select
            label="Segmento"
            value={segmento}
            onChange={(v) =>
              setSegmento(v as 'TODOS' | 'CIUDAD' | 'PARTIDO' | 'ESTADIO' | 'ROL')
            }
            options={[
              { v: 'TODOS', label: 'Todos los usuarios' },
              { v: 'CIUDAD', label: 'Por ciudad' },
              { v: 'PARTIDO', label: 'Por partido (ID API)' },
              { v: 'ESTADIO', label: 'Por estadio (venue)' },
              { v: 'ROL', label: 'Por rol' },
            ]}
          />
          {segmento !== 'TODOS' && (
            <Input
              label={
                segmento === 'CIUDAD'
                  ? 'Ciudad'
                  : segmento === 'PARTIDO'
                    ? 'ID partido (api)'
                    : segmento === 'ESTADIO'
                      ? 'Nombre del estadio (venue exacto)'
                    : 'Rol (AFICIONADO, OPERADOR, …)'
              }
              value={segmentoValor}
              onChange={setSegmentoValor}
            />
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            Canales
          </label>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={canales.includes('APP')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCanales((prev) => (prev.includes('APP') ? prev : [...prev, 'APP']));
                  } else {
                    setCanales((prev) => prev.filter((c) => c !== 'APP'));
                  }
                }}
              />
              APP (centro de notificaciones interno)
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={canales.includes('PUSH')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCanales((prev) => (prev.includes('PUSH') ? prev : [...prev, 'PUSH']));
                  } else {
                    setCanales((prev) => prev.filter((c) => c !== 'PUSH'));
                  }
                }}
              />
              PUSH (Firebase FCM)
            </label>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280' }}>
            PUSH requiere que el usuario tenga token FCM registrado y permisos activos en el navegador.
          </p>
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

        <button
          onClick={enviar}
          disabled={working}
          style={{
            background: '#0D1B2A',
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
          <Send size={14} />
          {working ? 'Iniciando…' : 'Enviar comunicado'}
        </button>

        {progreso && (
          <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: 13 }}>
                {progreso.estado === 'COMPLETADO'
                  ? '✓ Envío completado'
                  : progreso.estado === 'ERROR'
                    ? '✗ Error en el envío'
                    : 'Enviando…'}
              </strong>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {progreso.enviados + progreso.fallidos}/{progreso.totalDestinatarios}
              </span>
            </div>
            <div
              style={{
                height: 10,
                background: '#e5e7eb',
                borderRadius: 9999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background:
                    progreso.estado === 'COMPLETADO'
                      ? '#10b981'
                      : progreso.estado === 'ERROR'
                        ? '#ef4444'
                        : '#3b82f6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#6b7280',
                marginTop: 6,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Enviados: {progreso.enviados}</span>
              {progreso.fallidos > 0 && (
                <span style={{ color: '#991b1b' }}>Fallidos: {progreso.fallidos}</span>
              )}
              <span>
                Tracking: <code style={{ fontSize: 10 }}>{progreso.id.slice(0, 8)}</code>
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
