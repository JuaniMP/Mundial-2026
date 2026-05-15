import { NavLink, useNavigate } from 'react-router-dom';
import { Search, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const LEFT_NAV = [
  { to: '/fan-zone', label: 'FAN ZONE' },
  { to: '/matches', label: 'MATCHES' },
] as const;

const RIGHT_NAV = [
  { to: '/tickets', label: 'TICKETS' },
  { to: '/teams', label: 'TEAMS' },
] as const;

const MOBILE_NAV = [
  { to: '/', label: 'Inicio', exact: true },
  { to: '/matches', label: 'Partidos', exact: false },
  { to: '/standings', label: 'Tabla', exact: false },
  { to: '/tickets', label: 'Entradas', exact: false },
  { to: '/teams', label: 'Selecciones', exact: false },
  { to: '/album', label: 'Álbum', exact: false },
  { to: '/superpolla', label: 'Predictor', exact: false },
] as const;

const navLinkStyle = (isActive: boolean): string =>
  `text-xs font-bold tracking-widest transition-colors duration-200 px-1 py-0.5 border-b-2 ${
    isActive
      ? 'text-[#006847] border-[#006847]'
      : 'text-[#374151] border-transparent hover:text-[#0D1B2A] hover:border-[#0D1B2A]'
  }`;

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showHubMenu, setShowHubMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  const handleLogout = () => {
    setShowHubMenu(false);
    logout();
    navigate('/login');
  };

  const displayName =
    user?.email
      ? user.email.split('@')[0].slice(0, 12).toUpperCase()
      : 'MY HUB';

  return (
    <>
      {/* ══════ Desktop Navbar ══════ */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          height: 64,
        }}
        className="hidden md:flex"
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            paddingInline: 24,
            gap: 8,
          }}
        >
          {/* Search icon */}
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = '#f0f2f5')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = 'none')
            }
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Left nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginLeft: 8 }}>
            {LEFT_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navLinkStyle(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Center Logo — FIFA 2026 official emblem */}
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <img
              src="/assets/fwc26-logo.png"
              alt="FIFA World Cup 2026"
              style={{
                height: 48,
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </NavLink>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginRight: 8 }}>
            {RIGHT_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navLinkStyle(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* MY HUB pill button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowHubMenu((v) => !v)}
              style={{
                background: '#002868',
                color: '#ffffff',
                border: 'none',
                borderRadius: 9999,
                padding: '8px 20px',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = '#001a4a')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = '#002868')
              }
            >
              {displayName}
              <ChevronDown size={13} />
            </button>

            {showHubMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  minWidth: 200,
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {user && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(0,0,0,0.07)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: '#6b7280',
                        fontFamily: 'Inter, sans-serif',
                        margin: 0,
                      }}
                    >
                      Signed in as
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#0D1B2A',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        margin: '2px 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.email}
                    </p>
                  </div>
                )}
                {[
                  { to: '/album', label: '📔 My Collection' },
                  { to: '/superpolla', label: '🏆 Predictor Game' },
                  { to: '/pack-opening', label: '📦 Open Packs' },
                  { to: '/stadiums', label: '🏟 Stadiums' },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowHubMenu(false)}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      fontSize: 13,
                      fontFamily: 'Inter, sans-serif',
                      color: '#374151',
                      textDecoration: 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.background = '#f0f2f5')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.background = 'none')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    borderTop: '1px solid rgba(0,0,0,0.07)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    color: '#C8102E',
                    textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(200,16,46,0.06)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = 'none')
                  }
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══════ Mobile Navbar ══════ */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          height: 56,
        }}
        className="flex md:hidden items-center px-4"
      >
        {/* Logo mobile */}
        <NavLink
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            flex: 1,
          }}
        >
          <img
            src="/assets/fwc26-logo.png"
            alt="FIFA World Cup 2026"
            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
          />
        </NavLink>

        {/* Hamburger */}
        <button
          onClick={() => setShowMobile((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#0D1B2A',
            padding: 6,
          }}
          aria-label="Toggle menu"
        >
          {showMobile ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobile && (
        <div
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#ffffff',
            zIndex: 49,
            overflowY: 'auto',
            padding: '16px 0',
          }}
          className="md:hidden"
        >
          {MOBILE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setShowMobile(false)}
              style={({ isActive }) => ({
                display: 'block',
                padding: '14px 24px',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: isActive ? '#006847' : '#0D1B2A',
                borderLeft: isActive ? '3px solid #006847' : '3px solid transparent',
                background: isActive ? 'rgba(0,104,71,0.06)' : 'none',
              })}
            >
              {item.label}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: 8, paddingTop: 8 }}>
            {user && (
              <div style={{ padding: '10px 24px' }}>
                <p
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                  }}
                >
                  {user.email}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#C8102E',
                textAlign: 'left',
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Click-away backdrop for desktop HUB menu */}
      {showHubMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => setShowHubMenu(false)}
        />
      )}
    </>
  );
}
