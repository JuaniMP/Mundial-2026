import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Trophy,
  Ticket,
  BarChart2,
  Settings,
  LogOut,
  Shield,
  Database,
  Bell,
  FileText,
} from 'lucide-react';

const adminSections = [
  {
    title: 'Usuarios',
    description: 'Gestionar aficionados, operadores y roles',
    icon: Users,
    color: '#1D3557',
    bg: '#EBF2FA',
  },
  {
    title: 'Partidos',
    description: 'Crear, editar y gestionar partidos del Mundial',
    icon: Trophy,
    color: '#0B7B3E',
    bg: '#E6F5ED',
  },
  {
    title: 'Entradas',
    description: 'Control de ventas y disponibilidad de tickets',
    icon: Ticket,
    color: '#E63946',
    bg: '#FDEAEB',
  },
  {
    title: 'Reportes',
    description: 'Estadísticas, compliance y logs transaccionales',
    icon: BarChart2,
    color: '#F4A261',
    bg: '#FEF4E8',
  },
  {
    title: 'Notificaciones',
    description: 'Enviar alertas y comunicados a los usuarios',
    icon: Bell,
    color: '#6A0572',
    bg: '#F4E8F6',
  },
  {
    title: 'Álbum / Láminas',
    description: 'Gestionar láminas, paquetes e intercambios',
    icon: Database,
    color: '#2A9D8F',
    bg: '#E4F5F3',
  },
  {
    title: 'Incidentes',
    description: 'Revisar y resolver incidentes de soporte',
    icon: FileText,
    color: '#457B9D',
    bg: '#EAF2F8',
  },
  {
    title: 'Configuración',
    description: 'Ajustes del sistema y parámetros globales',
    icon: Settings,
    color: '#6C757D',
    bg: '#F1F3F5',
  },
];

export const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    : 'A';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-[#1D3557] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0B7B3E] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-widest">WORLD CUP 2026</h1>
            <p className="text-xs text-blue-200 tracking-wider">PANEL DE ADMINISTRACIÓN</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0B7B3E] flex items-center justify-center text-xs font-black">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">{user?.name}</p>
              <p className="text-xs text-blue-200">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 mt-1">Panel de control del sistema Mundial HUB 2026</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Usuarios', value: '—', color: '#1D3557' },
            { label: 'Partidos', value: '—', color: '#0B7B3E' },
            { label: 'Entradas vendidas', value: '—', color: '#E63946' },
            { label: 'Álbumes activos', value: '—', color: '#F4A261' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.title}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: section.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: section.color }} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#0B7B3E] transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">{section.description}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
