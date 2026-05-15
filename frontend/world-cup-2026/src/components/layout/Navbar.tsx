import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const desktopNavItems = [
  { to: '/superpolla', label: 'FAN ZONE' },
  { to: '/matches', label: 'MATCHES' },
  { to: '/tickets', label: 'TICKETS' },
  { to: '/teams', label: 'TEAMS' },
];

const mobileNavItems = [
  { to: '/', label: 'HOME', exact: true },
  { to: '/matches', label: 'MATCHES', exact: false },
  { to: '/album', label: 'ALBUM', exact: false },
  { to: '/superpolla', label: 'FAN ZONE', exact: false },
  { to: '/tickets', label: 'TICKETS', exact: false },
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

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? 'U');

  return (
    <>
      {/* ══════ Desktop Navbar ══════ */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100 hidden md:block">
        <div className="flex items-center w-full px-8 py-0 max-w-screen-2xl mx-auto h-16">
          {/* Search */}
          <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors mr-4">
            <Search className="w-5 h-5" />
          </button>

          {/* Left nav items */}
          <div className="flex items-center gap-1 flex-1">
            {desktopNavItems.slice(0, 2).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `font-bold text-xs tracking-widest px-4 py-5 border-b-2 transition-all duration-200 ${
                    isActive
                      ? 'border-[#0B7B3E] text-[#0B7B3E]'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Logo - Center */}
          <NavLink to="/" className="flex flex-col items-center justify-center mx-6 shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-[#0B7B3E] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-black text-sm">WC</span>
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] text-gray-800 mt-0.5">
              2026
            </span>
          </NavLink>

          {/* Right nav items */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            {desktopNavItems.slice(2).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `font-bold text-xs tracking-widest px-4 py-5 border-b-2 transition-all duration-200 ${
                    isActive
                      ? 'border-[#0B7B3E] text-[#0B7B3E]'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* MY HUB Button */}
            <div className="relative ml-4">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 bg-[#1D3557] text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest hover:bg-[#0f2238] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#0B7B3E] flex items-center justify-center text-[10px] font-black">
                  {initials}
                </div>
                MY HUB
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="font-semibold text-gray-900 truncate text-sm">{user?.email}</p>
                  </div>
                  <NavLink
                    to="/album"
                    className="w-full px-4 py-3 flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-all text-sm"
                    onClick={() => setShowProfile(false)}
                  >
                    <User className="w-4 h-4" />
                    Mi Álbum
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ══════ Mobile Bottom Navbar ══════ */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white border-t border-gray-100">
        <div className="flex justify-around items-center px-2 pt-2 pb-6">
          {mobileNavItems.map((item) => {
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
                    ? 'flex flex-col items-center justify-center bg-[#0B7B3E] text-white rounded-xl px-4 py-2 scale-105 shadow-lg transition-all duration-300'
                    : 'flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-300 px-2 py-2'
                }
              >
                <span className="text-[9px] font-black tracking-[0.1em] mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
