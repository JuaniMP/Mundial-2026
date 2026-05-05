import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MUNDIAL_2026_TEAMS = [
  'Argentina',
  'Brasil',
  'Colombia',
  'Paraguay',
  'Uruguay',
  'Ecuador',
  'México',
  'Estados Unidos',
  'Canadá',
  'Costa Rica',
  'Jamaica',
  'Panamá',
  'Alemania',
  'Francia',
  'Italia',
  'España',
  'Inglaterra',
  'Portugal',
  'Países Bajos',
  'Bélgica',
  'Suecia',
  'Dinamarca',
  'Noruega',
  'Suiza',
  'Austria',
  'República Checa',
  'Polonia',
  'Ucrania',
  'Rumania',
  'Japón',
  'Corea del Sur',
  'Arabia Saudí',
  'Australia',
  'Irán',
  'Uzbekistán',
  'Emiratos Árabes Unidos',
  'Tailandia',
  'Senegal',
  'Marruecos',
  'Nigeria',
  'Ghana',
  'Costa de Marfil',
  'Camerún',
  'Tunisia',
  'Zimbabue',
  'Sudáfrica',
  'Nueva Zelanda',
  'Fiyi',
  'Samoa',
].sort();

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [seleccionFavorita, setSeleccionFavorita] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) score++;
    });

    if (score <= 1)
      return { score: 1, label: 'Muy débil', color: 'bg-danger', percentage: 20, checks };
    if (score === 2)
      return { score: 2, label: 'Débil', color: 'bg-warning', percentage: 40, checks };
    if (score === 3)
      return { score: 3, label: 'Moderada', color: 'bg-info', percentage: 60, checks };
    if (score === 4)
      return { score: 4, label: 'Fuerte', color: 'bg-success', percentage: 80, checks };
    return { score: 5, label: 'Muy fuerte', color: 'bg-success', percentage: 100, checks };
  }, [password]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar nombre
    if (!nombre.trim()) {
      setError('❌ Please enter your full name');
      return;
    }

    if (nombre.trim().length < 3) {
      setError('❌ Name must be at least 3 characters');
      return;
    }

    // Validar email
    if (!email.trim()) {
      setError('❌ Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('❌ Please enter a valid email address');
      return;
    }

    // Validar contraseña
    if (!password) {
      setError('❌ Please enter a password');
      return;
    }

    if (password.length < 8) {
      setError('❌ Password must be at least 8 characters');
      return;
    }

    if (passwordStrength.score < 3) {
      setError(
        '❌ Password is too weak. Use uppercase, lowercase, numbers, and special characters',
      );
      return;
    }

    // Validar confirmación de contraseña
    if (!confirmPassword) {
      setError('❌ Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ Passwords do not match');
      return;
    }

    // Validar equipo favorito
    if (seleccionFavorita.trim() && !MUNDIAL_2026_TEAMS.includes(seleccionFavorita.trim())) {
      setError(`❌ "${seleccionFavorita}" is not a valid team in the 2026 World Cup`);
      return;
    }

    try {
      await register(email, password, nombre, seleccionFavorita);
      setSuccess('✅ Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || '❌ Registration failed');
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-gradient-to-br from-bg-base via-bg-deep to-bg-deep">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-text-primary mb-2">
            Mundial 2026
          </h1>
          <p className="text-text-secondary">Create your account</p>
        </div>

        {/* Form Card */}
        <div className="card-base p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-gap-3">
              <span className="text-lg">✅</span>
              <p className="text-sm text-success">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-lg">👤</span>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-lg">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-lg">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Strength:</span>
                    <span
                      className={`text-xs font-semibold ${
                        passwordStrength.score === 1
                          ? 'text-danger'
                          : passwordStrength.score === 2
                            ? 'text-warning'
                            : passwordStrength.score === 3
                              ? 'text-info'
                              : 'text-success'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-3 text-xs space-y-1">
                    <p className="text-text-muted font-medium">Requirements:</p>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center gap-2 ${passwordStrength.checks?.length ? 'text-success' : 'text-text-muted'}`}
                      >
                        <span>{passwordStrength.checks?.length ? '✅' : '○'}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordStrength.checks?.uppercase ? 'text-success' : 'text-text-muted'}`}
                      >
                        <span>{passwordStrength.checks?.uppercase ? '✅' : '○'}</span>
                        <span>Uppercase letter (A-Z)</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordStrength.checks?.lowercase ? 'text-success' : 'text-text-muted'}`}
                      >
                        <span>{passwordStrength.checks?.lowercase ? '✅' : '○'}</span>
                        <span>Lowercase letter (a-z)</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordStrength.checks?.number ? 'text-success' : 'text-text-muted'}`}
                      >
                        <span>{passwordStrength.checks?.number ? '✅' : '○'}</span>
                        <span>Number (0-9)</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordStrength.checks?.special ? 'text-success' : 'text-text-muted'}`}
                      >
                        <span>{passwordStrength.checks?.special ? '✅' : '○'}</span>
                        <span>Special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-lg">🔐</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
              {password && confirmPassword && (
                <p
                  className={`text-xs mt-2 ${password === confirmPassword ? 'text-success' : 'text-danger'}`}
                >
                  {password === confirmPassword
                    ? '✅ Passwords match'
                    : '❌ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Favorite Team Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Favorite Team (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-lg">⚽</span>
                <select
                  value={seleccionFavorita}
                  onChange={(e) => setSeleccionFavorita(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a team...</option>
                  {MUNDIAL_2026_TEAMS.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-3.5 text-lg pointer-events-none">▼</span>
              </div>
              {seleccionFavorita && (
                <p className="text-xs mt-2 text-success">
                  ✅ {seleccionFavorita} is a valid 2026 World Cup team
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-primary text-white font-semibold py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
