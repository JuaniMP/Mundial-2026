import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  FileSearch,
  UserX,
  ClipboardEdit,
  Megaphone,
  Home,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AlertasPanel } from './AlertasPanel';
import { LogsPanel } from './LogsPanel';
import { CuentasPanel } from './CuentasPanel';
import { ResultadosPanel } from './ResultadosPanel';
import { ComunicadosPanel } from './ComunicadosPanel';

type TabKey = 'alertas' | 'logs' | 'cuentas' | 'resultados' | 'comunicados';

interface TabDef {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  roles: Array<'ADMIN' | 'COMPLIANCE'>;
}

const TABS: TabDef[] = [
  {
    key: 'alertas',
    label: 'Alertas anti-fraude',
    icon: ShieldAlert,
    roles: ['COMPLIANCE', 'ADMIN'],
  },
  { key: 'logs', label: 'Auditoría de logs', icon: FileSearch, roles: ['COMPLIANCE', 'ADMIN'] },
  { key: 'cuentas', label: 'Gestión de cuentas', icon: UserX, roles: ['COMPLIANCE', 'ADMIN'] },
  { key: 'resultados', label: 'Resultados manuales', icon: ClipboardEdit, roles: ['ADMIN'] },
  { key: 'comunicados', label: 'Comunicados masivos', icon: Megaphone, roles: ['ADMIN'] },
];

export function Backoffice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = (user?.rol ?? '') as 'ADMIN' | 'COMPLIANCE' | string;

  const visibleTabs = useMemo(
    () => TABS.filter((t) => t.roles.includes(role as 'ADMIN' | 'COMPLIANCE')),
    [role],
  );

  const [active, setActive] = useState<TabKey>(visibleTabs[0]?.key ?? 'alertas');

  if (visibleTabs.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
        No tienes permiso para acceder a este módulo.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Top Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#006847',
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: '#0D1B2A',
            }}
          >
            Panel de Administración • Rol: <strong>{role}</strong>
          </span>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
            e.currentTarget.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          <Home size={16} /> Ver vista de usuario
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        <header style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: 'var(--font-display, Oswald, sans-serif)',
              fontSize: 'clamp(32px, 3.8vw, 48px)',
              color: '#0D1B2A',
              margin: 0,
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
            }}
          >
            Backoffice
          </h1>
          <p style={{ color: '#6b7280', margin: '8px 0 0', fontFamily: 'Inter, sans-serif' }}>
            Gestión y monitoreo del sistema
          </p>
        </header>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            borderBottom: '2px solid #e5e7eb',
            marginBottom: 24,
            overflowX: 'auto',
          }}
        >
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive ? '#0D1B2A' : '#6b7280',
                  borderBottom: isActive ? '3px solid #006847' : '3px solid transparent',
                  marginBottom: -2,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Panels */}
        {active === 'alertas' && <AlertasPanel />}
        {active === 'logs' && <LogsPanel />}
        {active === 'cuentas' && <CuentasPanel />}
        {active === 'resultados' && <ResultadosPanel />}
        {active === 'comunicados' && <ComunicadosPanel />}
      </div>
    </div>
  );
}
