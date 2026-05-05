import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Landmark, Trophy, BookOpen, Globe, Bell, User, LogOut, CalendarDays, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Inicio', icon: Compass, exact: true },
  { to: '/matches', label: 'Partidos', icon: CalendarDays, exact: false },
  { to: '/standings', label: 'Tabla', icon: BarChart3, exact: false },
  { to: '/stadiums', label: 'Estadios', icon: Landmark, exact: false },
  { to: '/superpolla', label: 'Superpolla', icon: Trophy, exact: false },
  { to: '/album', label: 'Álbum', icon: BookOpen, exact: false },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ══════ Desktop Top Navbar ══════ */}
      <nav className="fixed top-0 w-full z-50 hidden md:block glass" id="navbar-desktop">
        <div className="flex items-center w-full px-6 py-3.5 max-w-screen-2xl mx-auto relative">
          {/* Brand */}
          <div className="flex-1 min-w-0">
            <NavLink to="/" className="inline-flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow shrink-0">
                <Globe className="text-text-inverse w-5 h-5" />
              </div>
              <span className="text-xl font-black text-text-primary tracking-tight uppercase font-headline truncate">
                WC <span className="gradient-text">2026</span>
              </span>
            </NavLink>
          </div>

          {/* Desktop Links - Centered */}
          <div className="flex justify-center items-center gap-1 shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `relative font-headline tracking-tight text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'text-primary font-bold bg-primary-subtle'
                      : 'text-text-secondary font-medium hover:text-text-primary hover:bg-bg-elevated'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex-1 flex justify-end items-center gap-2 min-w-0">
            <button className="relative text-text-secondary hover:text-text-primary hover:bg-bg-elevated p-2.5 rounded-lg transition-all duration-300 shrink-0" id="btn-notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger animate-pulse" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="text-text-secondary hover:text-text-primary hover:bg-bg-elevated p-2.5 rounded-lg transition-all duration-300 shrink-0"
                id="btn-profile"
              >
                <User className="w-5 h-5" />
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="p-4 border-b border-border">
                    <p className="text-sm text-text-muted">Signed in as</p>
                    <p className="font-semibold text-text-primary truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-2 text-text-primary hover:bg-bg-elevated transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ══════ Mobile Bottom Navbar ══════ */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 glass rounded-t-2xl" id="navbar-mobile">
        <div className="flex justify-around items-center px-2 pt-2 pb-7">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : item.to !== '/' && location.pathname.startsWith(item.to);
            const isHome = item.to === '/' && location.pathname === '/';
            const active = isActive || isHome;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={
                  active
                    ? 'flex flex-col items-center justify-center gradient-primary text-text-inverse rounded-xl px-5 py-2 scale-105 shadow-lg transition-all duration-300'
                    : 'flex flex-col items-center justify-center text-text-muted hover:text-text-secondary transition-all duration-300'
                }
              >
                <item.icon className="w-5 h-5 mb-0.5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">
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