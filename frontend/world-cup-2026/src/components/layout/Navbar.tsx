import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Landmark,
  Trophy,
  BookOpen,
  Bell,
  User,
  LogOut,
  CalendarDays,
  BarChart3,
  Ticket,
  Compass,
  Users,
  Package,
  Shield,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const BASE_NAV = [
  { to: '/', label: 'Inicio', icon: Compass, exact: true },
  { to: '/matches', label: 'Partidos', icon: CalendarDays, exact: false },
  { to: '/standings', label: 'Tabla', icon: BarChart3, exact: false },
  { to: '/stadiums', label: 'Estadios', icon: Landmark, exact: false },
  { to: '/superpolla', label: 'Superpolla', icon: Trophy, exact: false },
  { to: '/tickets', label: 'Entradas', icon: Ticket, exact: false },
  { to: '/album', label: 'Álbum', icon: BookOpen, exact: false },
  { to: '/teams', label: 'Selecciones', icon: Users, exact: false },
  { to: '/pack-opening', label: 'Sobre', icon: Package, exact: false },
] as const;

const TICKER_ITEMS = [
  'Faltan 31 días para el saque inicial',
  'Mascotas oficiales: Maple · Zayu · Clutch',
  '16 sedes — México · USA · Canadá',
  'Tu álbum digital al 45% completado',
  'Sorteo grupal · 5 dic 2025 · Las Vegas',
  'Entradas Fase 2 abren el 27 mayo',
  '48 selecciones · 104 partidos · 1 trofeo',
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    ...BASE_NAV,
    ...(user?.rol === 'SOPORTE' || user?.rol === 'ADMIN' || user?.rol === 'OPERADOR'
      ? [{ to: '/agentes', label: 'Soporte', icon: Headphones, exact: false } as const]
      : []),
    ...(user?.rol === 'ADMIN'
      ? [{ to: '/admin', label: 'Admin', icon: Shield, exact: false } as const]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ══════ Desktop Navbar ══════ */}
      <div className="fixed top-0 w-full z-50 hidden md:block">
        {/* Ticker strip */}
        <div className="ticker">
          <div className="ticker-track">
            {[0, 1].map((k) => (
              <span key={k} style={{ display: 'inline-flex', gap: 48 }}>
                {TICKER_ITEMS.map((item, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                    <span className="ticker-dot" />
                    {item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Main nav */}
        <nav
          style={{
            background: 'var(--color-bg-deep)',
            borderBottom: '1.5px solid var(--color-ink)',
          }}
        >
          <div
            style={{
              maxWidth: 1440,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 36px',
              gap: 24,
            }}
          >
            {/* Brand */}
            <NavLink
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                color: 'var(--color-ink)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: 'var(--color-ink)',
                  color: 'var(--color-primary)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 24,
                  borderRadius: 3,
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>M</span>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-linear-gradient(45deg, transparent 0 5px, rgba(229,180,73,.08) 5px 10px)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span
                  style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 20,
                    letterSpacing: '0.03em',
                    color: 'var(--color-ink)',
                  }}
                >
                  MUNDIAL <span style={{ color: 'var(--color-secondary)' }}>26</span>
                </span>
                <span
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontSize: 9,
                    letterSpacing: '0.25em',
                    color: 'var(--color-text-muted)',
                    marginTop: 3,
                    textTransform: 'uppercase',
                  }}
                >
                  FIFA WORLD CUP · USA · MEX · CAN
                </span>
              </div>
            </NavLink>

            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  style={({ isActive }) => ({
                    position: 'relative',
                    padding: '8px 12px',
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'none',
                    color: isActive ? 'var(--color-ink)' : 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'color 0.15s',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span
                          style={{
                            position: 'absolute',
                            left: 12,
                            right: 12,
                            bottom: 1,
                            height: 3,
                            background: 'var(--color-primary)',
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                id="btn-notifications"
                style={{
                  width: 38,
                  height: 38,
                  background: 'transparent',
                  border: '1.5px solid var(--color-ink)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-ink)',
                  position: 'relative',
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
                aria-label="Notificaciones"
              >
                <Bell size={16} />
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-danger)',
                    border: '1.5px solid var(--color-bg-deep)',
                  }}
                />
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  id="btn-profile"
                  onClick={() => setShowProfile(!showProfile)}
                  style={{
                    width: 38,
                    height: 38,
                    background: 'transparent',
                    border: '1.5px solid var(--color-ink)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-ink)',
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
                  aria-label="Cuenta"
                >
                  <User size={16} />
                </button>

                {showProfile && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      minWidth: 200,
                      background: 'var(--color-bg-deep)',
                      border: '1.5px solid var(--color-ink)',
                      boxShadow: '6px 6px 0 var(--color-ink)',
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1.5px solid var(--color-ink)',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'Archivo, sans-serif',
                          fontSize: 10,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'var(--color-text-muted)',
                          margin: 0,
                        }}
                      >
                        Signed in as
                      </p>
                      <p
                        style={{
                          fontFamily: 'Anton, sans-serif',
                          fontSize: 14,
                          margin: '4px 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'Archivo, sans-serif',
                        fontSize: 13,
                        color: 'var(--color-ink)',
                        transition: 'background 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          'var(--color-bg-elevated)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* ══════ Mobile Bottom Navbar ══════ */}
      <nav
        className="md:hidden fixed bottom-0 w-full z-50"
        style={{
          background: 'var(--color-bg-deep)',
          borderTop: '1.5px solid var(--color-ink)',
        }}
      >
        <div className="flex justify-around items-center px-2 pt-2 pb-7">
          {navItems.slice(0, 7).map((item) => {
            const itemTo = item.to as string;
            const isActive = item.exact
              ? location.pathname === itemTo
              : itemTo !== '/' && location.pathname.startsWith(itemTo);
            const isHome = itemTo === '/' && location.pathname === '/';
            const active = isActive || isHome;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: active ? '6px 14px' : '6px 8px',
                  background: active ? 'var(--color-ink)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  gap: 2,
                }}
              >
                <item.icon style={{ width: 18, height: 18 }} strokeWidth={active ? 2.5 : 2} />
                <span
                  style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 8,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
