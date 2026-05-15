import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { User, Mail, Lock, AlertCircle, Shield, Check, X } from 'lucide-react';

/* ── Selecciones clasificadas al Mundial 2026 (por grupo) ── */
const GRUPOS: { grupo: string; selecciones: string[] }[] = [
  { grupo: 'Grupo A', selecciones: ['Argentina', 'Colombia', 'Paraguay', 'Canadá'] },
  { grupo: 'Grupo B', selecciones: ['Brasil', 'Uruguay', 'Bolivia', 'México'] },
  { grupo: 'Grupo C', selecciones: ['Ecuador', 'Perú', 'Venezuela', 'Costa Rica'] },
  { grupo: 'Grupo D', selecciones: ['Chile', 'Francia', 'Italia', 'Marruecos'] },
  { grupo: 'Grupo E', selecciones: ['España', 'Alemania', 'Japón', 'Nigeria'] },
  { grupo: 'Grupo F', selecciones: ['Portugal', 'Países Bajos', 'Bélgica', 'Irak'] },
  { grupo: 'Grupo G', selecciones: ['Inglaterra', 'Irán', 'Türkiye', 'Ghana'] },
  { grupo: 'Grupo H', selecciones: ['Gales', 'Sudáfrica', 'Tailandia', 'Honduras'] },
];

/* ── Evaluador de fortaleza de contraseña ── */
type Strength = 'vacia' | 'debil' | 'regular' | 'buena' | 'fuerte';

function evaluarPassword(pwd: string): Strength {
  if (!pwd) return 'vacia';
  if (pwd.length < 6) return 'debil';
  const tieneUpper = /[A-Z]/.test(pwd);
  const tieneLower = /[a-z]/.test(pwd);
  const tieneNumero = /[0-9]/.test(pwd);
  const tieneEspecial = /[^A-Za-z0-9]/.test(pwd);
  const score = [tieneUpper, tieneLower, tieneNumero, tieneEspecial].filter(Boolean).length;
  if (pwd.length >= 10 && score === 4) return 'fuerte';
  if (pwd.length >= 8 && score >= 3) return 'buena';
  return 'regular';
}

const STRENGTH_CONFIG: Record<Strength, { label: string; color: string; bars: number }> = {
  vacia: { label: '', color: 'bg-border', bars: 0 },
  debil: { label: 'Muy débil', color: 'bg-accent', bars: 1 },
  regular: { label: 'Regular', color: 'bg-yellow-500', bars: 2 },
  buena: { label: 'Buena', color: 'bg-blue-500', bars: 3 },
  fuerte: { label: 'Fuerte', color: 'bg-secondary', bars: 4 },
};

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [seleccionFavorita, setSeleccionFavorita] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => evaluarPassword(password), [password]);
  const strengthCfg = STRENGTH_CONFIG[strength];

  const passwordMatch = !confirmPassword || password === confirmPassword;
  const passwordOk = password.length >= 6;

  const requirements = [
    { ok: password.length >= 6, label: 'Mínimo 6 caracteres' },
    { ok: /[A-Z]/.test(password), label: 'Al menos una mayúscula' },
    { ok: /[0-9]/.test(password), label: 'Al menos un número' },
    {
      ok: password === confirmPassword && confirmPassword.length > 0,
      label: 'Las contraseñas coinciden',
    },
  ];

  const allFilled =
    name.trim() &&
    email.trim() &&
    passwordOk &&
    confirmPassword &&
    password === confirmPassword &&
    seleccionFavorita;

  const blur = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true, seleccion: true });
    if (!allFilled) return;
    try {
      const rol = await register(name, email, password, seleccionFavorita);
      navigate(rol === 'ADMIN' ? '/admin' : '/');
    } catch {
      /* error shown via context */
    }
  };

  const baseInput =
    'w-full pl-10 pr-4 py-2.5 bg-bg-elevated border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all';
  const fieldError = (field: string, condition: boolean) =>
    touched[field] && !condition ? 'border-accent' : 'border-border';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-deep via-bg-base to-bg-surface py-8">
      <div className="w-full max-w-md mx-4">
        <div className="card-base p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 font-headline">
              Join the Experience
            </h1>
            <p className="text-text-muted">Crea tu cuenta y sé parte del Mundial 2026</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-accent-glow border border-accent rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-text-primary text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Nombre completo <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) clearError();
                  }}
                  onBlur={() => blur('name')}
                  placeholder="Tu nombre"
                  className={`${baseInput} ${fieldError('name', name.trim().length >= 2)}`}
                  required
                />
              </div>
              {touched.name && name.trim().length < 2 && (
                <p className="mt-1 text-xs text-accent">Ingresa tu nombre completo</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Correo electrónico <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  onBlur={() => blur('email')}
                  placeholder="tu@email.com"
                  className={`${baseInput} ${fieldError('email', /\S+@\S+\.\S+/.test(email))}`}
                  required
                />
              </div>
              {touched.email && !/\S+@\S+\.\S+/.test(email) && (
                <p className="mt-1 text-xs text-accent">Ingresa un correo válido</p>
              )}
            </div>

            {/* Selección Favorita */}
            <div>
              <label
                htmlFor="seleccion"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Selección favorita <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 w-5 h-5 text-text-muted pointer-events-none z-10" />
                <select
                  id="seleccion"
                  value={seleccionFavorita}
                  onChange={(e) => setSeleccionFavorita(e.target.value)}
                  onBlur={() => blur('seleccion')}
                  className={`${baseInput} appearance-none cursor-pointer ${fieldError('seleccion', !!seleccionFavorita)}`}
                  required
                >
                  <option value="">Elige tu selección...</option>
                  {GRUPOS.map(({ grupo, selecciones }) => (
                    <optgroup key={grupo} label={grupo}>
                      {selecciones.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              {touched.seleccion && !seleccionFavorita && (
                <p className="mt-1 text-xs text-accent">Elige tu selección favorita</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Contraseña <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => blur('password')}
                  placeholder="••••••••"
                  className={`${baseInput} ${fieldError('password', passwordOk)}`}
                  required
                />
              </div>

              {/* Barra de fortaleza */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((b) => (
                      <div
                        key={b}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          b <= strengthCfg.bars ? strengthCfg.color : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  {strengthCfg.label && (
                    <p className="text-xs text-text-muted">
                      Fortaleza:{' '}
                      <span className="font-semibold text-text-primary">{strengthCfg.label}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Requisitos */}
              {(touched.password || password) && (
                <ul className="mt-2 space-y-1">
                  {requirements.slice(0, 3).map(({ ok, label }) => (
                    <li
                      key={label}
                      className={`flex items-center gap-1.5 text-xs ${ok ? 'text-secondary' : 'text-text-muted'}`}
                    >
                      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Confirmar contraseña <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => blur('confirm')}
                  placeholder="••••••••"
                  className={`${baseInput} ${
                    !passwordMatch && confirmPassword
                      ? 'border-accent focus:ring-accent'
                      : 'border-border'
                  }`}
                  required
                />
              </div>
              {!passwordMatch && confirmPassword && (
                <p className="mt-1 text-xs text-accent flex items-center gap-1">
                  <X className="w-3 h-3" /> Las contraseñas no coinciden
                </p>
              )}
              {passwordMatch && confirmPassword && (
                <p className="mt-1 text-xs text-secondary flex items-center gap-1">
                  <Check className="w-3 h-3" /> Las contraseñas coinciden
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-light text-text-inverse font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-surface text-text-muted">o</span>
            </div>
          </div>

          <p className="text-center text-text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary-light font-semibold transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
