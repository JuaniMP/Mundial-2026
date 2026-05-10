import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ChevronDown, Check, X } from 'lucide-react';
import { TEAMS } from '../components/album/teamColors';

// ─── Password strength ────────────────────────────────────────────────────────

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  barColor: string;
  rules: { text: string; ok: boolean }[];
}

function analysePassword(pw: string): StrengthResult {
  const rules = [
    { text: 'Al menos 8 caracteres', ok: pw.length >= 8 },
    { text: 'Al menos una letra mayúscula (A-Z)', ok: /[A-Z]/.test(pw) },
    { text: 'Al menos una letra minúscula (a-z)', ok: /[a-z]/.test(pw) },
    { text: 'Al menos un número (0-9)', ok: /[0-9]/.test(pw) },
    { text: 'Al menos un símbolo (!@#$%^&*…)', ok: /[^a-zA-Z0-9]/.test(pw) },
  ];
  const score = rules.filter((r) => r.ok).length;

  const levels = [
    { label: 'Muy débil', color: 'text-red-500', barColor: '#ef4444' },
    { label: 'Débil', color: 'text-orange-500', barColor: '#f97316' },
    { label: 'Regular', color: 'text-yellow-500', barColor: '#eab308' },
    { label: 'Buena', color: 'text-blue-500', barColor: '#3b82f6' },
    { label: 'Fuerte', color: 'text-green-500', barColor: '#22c55e' },
  ];

  return { score, rules, ...levels[score] };
}

/** Suggest a strong password */
function suggestPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const syms = '!@#$%&*';
  const all = upper + lower + digits + syms;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const base = pick(upper) + pick(lower) + pick(digits) + pick(syms);
  const extra = Array.from({ length: 8 }, () => pick(all)).join('');
  return (base + extra)
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [seleccion, setSeleccion] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [teamSearch, setTeamSearch] = useState('');

  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => analysePassword(password), [password]);
  const pwMatch = password === confirmPassword;
  const strongEnough = strength.score >= 3; // at least "buena"

  const filteredTeams = useMemo(
    () =>
      TEAMS.filter(
        (t) =>
          t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
          t.shortName.toLowerCase().includes(teamSearch.toLowerCase()),
      ),
    [teamSearch],
  );

  const selectedTeam = TEAMS.find((t) => t.shortName === seleccion);

  const touch = (field: string) => setTouched((p) => ({ ...p, [field]: true }));

  const fieldErr = {
    name: touched.name && name.trim().length < 2,
    email: touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    pwd: touched.pwd && password.length < 6,
    confirm: touched.confirm && !pwMatch && confirmPassword.length > 0,
    team: touched.team && !seleccion,
  };

  const canSubmit =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6 &&
    pwMatch &&
    seleccion !== '' &&
    !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Mark all as touched to show errors
    setTouched({ name: true, email: true, pwd: true, confirm: true, team: true });
    if (!canSubmit) return;
    try {
      await register(name.trim(), email.trim(), password, seleccion);
      navigate('/');
    } catch {
      // error handled by context
    }
  };

  const handleSuggest = () => {
    const s = suggestPassword();
    setPassword(s);
    setConfirmPassword(s);
    setShowPwd(true);
    setShowConfirm(true);
  };

  // ── Input class helper ──
  const inputCls = (hasErr: boolean) =>
    `w-full pl-10 pr-10 py-2.5 bg-bg-elevated border rounded-lg text-text-primary placeholder-text-muted
     focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm
     ${hasErr ? 'border-accent focus:ring-accent/40' : 'border-border focus:ring-primary/40'}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-deep via-bg-base to-bg-surface py-8 px-4">
      <div className="w-full max-w-lg">
        <div className="card-base p-8 md:p-10">
          {/* ── Header ── */}
          <div className="mb-7">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏆</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary font-headline leading-tight">
                  Únete al Mundial
                </h1>
                <p className="text-text-muted text-sm">Crea tu cuenta para FIFA World Cup 2026</p>
              </div>
            </div>
          </div>

          {/* ── API Error ── */}
          {error && (
            <div className="mb-5 p-3.5 bg-accent-glow border border-accent/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-text-primary text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* ── Name ── */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-text-primary mb-1.5"
              >
                Nombre completo <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  required
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) clearError();
                  }}
                  onBlur={() => touch('name')}
                  placeholder="Juan García"
                  className={inputCls(!!fieldErr.name)}
                />
              </div>
              {fieldErr.name && (
                <p className="mt-1 text-xs text-accent flex items-center gap-1">
                  <X className="w-3 h-3" /> Mínimo 2 caracteres
                </p>
              )}
            </div>

            {/* ── Email ── */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-text-primary mb-1.5"
              >
                Correo electrónico <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  required
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  onBlur={() => touch('email')}
                  placeholder="juan@ejemplo.com"
                  className={inputCls(!!fieldErr.email)}
                />
              </div>
              {fieldErr.email && (
                <p className="mt-1 text-xs text-accent flex items-center gap-1">
                  <X className="w-3 h-3" /> Ingresa un email válido
                </p>
              )}
            </div>

            {/* ── Selección favorita ── */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Selección favorita <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setTeamOpen((o) => !o);
                    touch('team');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 bg-bg-elevated border rounded-lg text-sm transition-all focus:outline-none focus:ring-2
                    ${
                      fieldErr.team
                        ? 'border-accent focus:ring-accent/40'
                        : teamOpen
                          ? 'border-primary focus:ring-primary/40'
                          : 'border-border focus:ring-primary/40'
                    }`}
                >
                  {selectedTeam ? (
                    <span className="flex items-center gap-2 text-text-primary font-medium">
                      <span>{selectedTeam.flag}</span>
                      <span>{selectedTeam.name}</span>
                      <span className="text-text-muted text-xs">Gr.{selectedTeam.group}</span>
                    </span>
                  ) : (
                    <span className="text-text-muted">🌍 Elige tu selección…</span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform ${teamOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown */}
                {teamOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
                    {/* Search inside dropdown */}
                    <div className="p-2 border-b border-border">
                      <input
                        type="text"
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                        placeholder="🔍 Buscar selección…"
                        autoFocus
                        className="w-full px-3 py-1.5 text-sm bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {filteredTeams.length === 0 ? (
                        <p className="p-3 text-sm text-center text-text-muted">Sin resultados</p>
                      ) : (
                        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((grp) => {
                          const inGroup = filteredTeams.filter((t) => t.group === grp);
                          if (!inGroup.length) return null;
                          return (
                            <div key={grp}>
                              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted bg-bg-elevated/60">
                                Grupo {grp}
                              </p>
                              {inGroup.map((t) => (
                                <button
                                  key={t.shortName}
                                  type="button"
                                  onClick={() => {
                                    setSeleccion(t.shortName);
                                    setTeamOpen(false);
                                    setTeamSearch('');
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-bg-elevated
                                    ${seleccion === t.shortName ? 'bg-primary/10 text-primary font-semibold' : 'text-text-primary'}`}
                                >
                                  <span className="text-base">{t.flag}</span>
                                  <span className="flex-1">{t.name}</span>
                                  <span className="text-text-muted text-xs">{t.shortName}</span>
                                  {seleccion === t.shortName && (
                                    <Check className="w-3.5 h-3.5 text-primary" />
                                  )}
                                </button>
                              ))}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              {fieldErr.team && (
                <p className="mt-1 text-xs text-accent flex items-center gap-1">
                  <X className="w-3 h-3" /> Selecciona tu selección favorita
                </p>
              )}
            </div>

            {/* ── Password ── */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-text-primary">
                  Contraseña <span className="text-accent">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSuggest}
                  className="text-xs text-primary hover:text-primary-light font-medium transition-colors"
                >
                  ✨ Sugerir contraseña fuerte
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  required
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  onBlur={() => touch('pwd')}
                  placeholder="••••••••"
                  className={inputCls(!!fieldErr.pwd)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {/* Bar */}
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{ background: i < strength.score ? strength.barColor : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  {/* Label */}
                  <p className={`text-xs font-semibold ${strength.color}`}>
                    Contraseña {strength.label}
                  </p>
                  {/* Rules checklist */}
                  <div className="grid grid-cols-1 gap-0.5">
                    {strength.rules.map((r) => (
                      <p
                        key={r.text}
                        className={`text-xs flex items-center gap-1.5 ${r.ok ? 'text-green-600' : 'text-text-muted'}`}
                      >
                        {r.ok ? (
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-3 h-3 text-text-muted flex-shrink-0" />
                        )}
                        {r.text}
                      </p>
                    ))}
                  </div>
                  {!strongEnough && (
                    <p className="text-xs text-orange-500 font-medium">
                      💡 Recomendamos al menos una contraseña "Buena" para mayor seguridad.
                    </p>
                  )}
                </div>
              )}

              {fieldErr.pwd && (
                <p className="mt-1 text-xs text-accent flex items-center gap-1">
                  <X className="w-3 h-3" /> Mínimo 6 caracteres
                </p>
              )}
            </div>

            {/* ── Confirm password ── */}
            <div>
              <label
                htmlFor="confirmPwd"
                className="block text-sm font-semibold text-text-primary mb-1.5"
              >
                Confirmar contraseña <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="confirmPwd"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  required
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) clearError();
                  }}
                  onBlur={() => touch('confirm')}
                  placeholder="••••••••"
                  className={inputCls(!!fieldErr.confirm)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p
                  className={`mt-1 text-xs flex items-center gap-1 ${pwMatch ? 'text-green-600' : 'text-accent'}`}
                >
                  {pwMatch ? (
                    <>
                      <Check className="w-3 h-3" /> Las contraseñas coinciden
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" /> Las contraseñas no coinciden
                    </>
                  )}
                </p>
              )}
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2.5 rounded-lg font-bold text-sm transition-all mt-2 font-headline tracking-wide"
              style={{
                background: canSubmit ? 'linear-gradient(135deg,#1e3a8a,#1d4ed8)' : '#e2e8f0',
                color: canSubmit ? '#fff' : '#94a3b8',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 4px 16px rgba(29,78,216,0.35)' : 'none',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cuenta…
                </span>
              ) : (
                '🏆 Crear cuenta'
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-bg-surface text-text-muted">o</span>
            </div>
          </div>

          {/* ── Login link ── */}
          <p className="text-center text-text-muted text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary-light font-semibold transition-colors"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
