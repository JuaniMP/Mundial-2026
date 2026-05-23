import { useEffect, useState } from 'react';
import { Lock, Unlock, Search } from 'lucide-react';
import {
  type UsuarioRiesgo,
  buscarUsuarios,
  bloquearUsuario,
  desbloquearUsuario,
} from '../../services/backofficeApi';
import { Card } from './shared/Card';
import { RiskBadge } from './shared/Badges';
import { Stat } from './shared/FormFields';
import { fmtDate } from './shared/format';

export function CuentasPanel() {
  const [q, setQ] = useState('');
  const [usuarios, setUsuarios] = useState<UsuarioRiesgo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<UsuarioRiesgo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [razonBloqueo, setRazonBloqueo] = useState('');
  const [working, setWorking] = useState(false);

  const buscar = (query: string) => {
    setLoading(true);
    setError(null);
    buscarUsuarios(query)
      .then(setUsuarios)
      .catch((e) => setError(e.message ?? 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    buscar('');
  }, []);

  const handleBloquear = async () => {
    if (!selected) return;
    if (!razonBloqueo.trim()) {
      setError('Debes indicar la razón del bloqueo.');
      return;
    }
    setWorking(true);
    try {
      const updated = await bloquearUsuario(selected.id, razonBloqueo);
      setSelected(updated);
      buscar(q);
      setRazonBloqueo('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setWorking(false);
    }
  };

  const handleDesbloquear = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      const updated = await desbloquearUsuario(selected.id);
      setSelected(updated);
      buscar(q);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Lista */}
      <Card>
        <h2 style={{ margin: '0 0 12px', fontFamily: 'Oswald, sans-serif', fontSize: 22 }}>
          Buscar usuarios
        </h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="nombre o email"
            onKeyDown={(e) => e.key === 'Enter' && buscar(q)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
            }}
          />
          <button
            onClick={() => buscar(q)}
            disabled={loading}
            style={{
              background: '#0D1B2A',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Search size={14} /> Buscar
          </button>
        </div>
        <div style={{ maxHeight: 480, overflowY: 'auto' }}>
          {usuarios.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
              Sin resultados.
            </div>
          )}
          {usuarios.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u)}
              style={{
                width: '100%',
                background: selected?.id === u.id ? '#eff6ff' : 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.nombre}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {u.bloqueado && <Lock size={14} color="#991b1b" />}
                <RiskBadge level={u.nivelRiesgo} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Detalle */}
      <Card>
        {!selected ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            Selecciona un usuario para ver su perfil de riesgo.
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontFamily: 'Oswald, sans-serif', fontSize: 22 }}>
                  {selected.nombre}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>
                  {selected.email} · {selected.rol}
                </p>
              </div>
              <RiskBadge level={selected.nivelRiesgo} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Stat label="Intercambios" value={selected.totalIntercambios} />
              <Stat label="Entradas" value={selected.totalEntradasTransferidas} />
              <Stat label="Alertas" value={selected.alertasAbiertas} />
            </div>

            {selected.bloqueado && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 13,
                }}
              >
                <strong>Cuenta bloqueada</strong> · {fmtDate(selected.fechaBloqueo)}
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  Razón: {selected.razonBloqueo ?? '—'}
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: 10,
                  background: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: 6,
                  marginBottom: 12,
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}

            {!selected.bloqueado ? (
              <>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Razón del bloqueo
                </label>
                <textarea
                  value={razonBloqueo}
                  onChange={(e) => setRazonBloqueo(e.target.value)}
                  rows={3}
                  placeholder="ej: transferencias de entradas anómalas en 24h..."
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    marginBottom: 8,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
                <button
                  onClick={handleBloquear}
                  disabled={working}
                  style={{
                    background: '#C8102E',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 6,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  <Lock size={14} />
                  {working ? 'Bloqueando…' : 'Bloquear cuenta'}
                </button>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
                  ⚠ Esto congela inmediatamente sus entradas y participación en pollas.
                </p>
              </>
            ) : (
              <button
                onClick={handleDesbloquear}
                disabled={working}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 6,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Unlock size={14} />
                {working ? 'Desbloqueando…' : 'Desbloquear cuenta'}
              </button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
