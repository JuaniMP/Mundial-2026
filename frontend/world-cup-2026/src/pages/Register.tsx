import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const MUNDIAL_2026_TEAMS = [
  'Argentina', 'Brasil', 'Colombia', 'México', 'Uruguay', 'Estados Unidos',
  'Alemania', 'Francia', 'España', 'Italia', 'Portugal', 'Holanda', 'Bélgica', 'Inglaterra', 'Suiza',
  'Dinamarca', 'Suecia', 'Noruega', 'Islandia', 'Gales', 'Escocia', 'República Irlandesa',
  'Croacia', 'Hungría', 'República Checa', 'Polonia', 'Rumania', 'Bulgaria', 'Serbia', 'Ucrania',
  'Rusia', 'Georgia', 'Armenia', 'Kazajistán', 'Uzbekistán', 'Turkmenistán',
  'Japón', 'Corea del Sur', 'Australia', 'China', 'Tailandia', 'Vietnam', 'Indonesia',
  'Irán', 'Arabia Saudita', 'Emiratos Árabes Unidos', 'Qatar', 'Israel'
].sort();

const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  return score;
};

const getStrengthLabel = (score: number): string => {
  const labels = ['Muy débil', 'Débil', 'Moderada', 'Fuerte', 'Muy fuerte'];
  return labels[Math.max(0, score - 1)] || 'Muy débil';
};

const getStrengthColor = (score: number): string => {
  const colors = ['danger', 'warning', 'info', 'success', 'success'];
  return colors[Math.max(0, score - 1)] || 'danger';
};

export const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    seleccionFavorita: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordScore = calculatePasswordStrength(formData.password);
  const passwordMatch = formData.password === formData.confirmPassword;
  const passwordsNotEmpty = formData.password && formData.confirmPassword;

  const validateForm = (): string | null => {
    if (!formData.nombre.trim() || formData.nombre.length < 3) {
      return 'Name must be at least 3 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Invalid email format';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (passwordScore < 3) {
      return 'Password must be moderately strong';
    }
    if (!passwordMatch) {
      return 'Passwords do not match';
    }
    if (formData.seleccionFavorita && !MUNDIAL_2026_TEAMS.includes(formData.seleccionFavorita)) {
      return 'Invalid team selection';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.nombre, formData.seleccionFavorita);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>⚽ Mundial 2026 Hub</h1>
        <h2>Create Account</h2>

        {error && <div className="alert alert-danger">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">👤 Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            {formData.nombre.length > 0 && formData.nombre.length < 3 && (
              <small className="text-danger">❌ Minimum 3 characters</small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">✉️ Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">🔒 Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {formData.password && (
              <>
                <div className="mt-2">
                  <div className="progress" style={{ height: '20px' }}>
                    <div
                      className={`progress-bar bg-${getStrengthColor(passwordScore)}`}
                      style={{ width: `${(passwordScore / 5) * 100}%` }}
                    >
                      {getStrengthLabel(passwordScore)}
                    </div>
                  </div>
                </div>

                <small className="d-block mt-2">
                  <div>{passwordScore >= 1 ? '✅' : '○'} At least 8 characters</div>
                  <div>{/[A-Z]/.test(formData.password) ? '✅' : '○'} Uppercase letter</div>
                  <div>{/[a-z]/.test(formData.password) ? '✅' : '○'} Lowercase letter</div>
                  <div>{/\d/.test(formData.password) ? '✅' : '○'} Number</div>
                  <div>{/[!@#$%^&*]/.test(formData.password) ? '✅' : '○'} Special character (!@#$%^&*)</div>
                </small>
              </>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">🔐 Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            {passwordsNotEmpty && (
              <small className={passwordMatch ? 'text-success' : 'text-danger'}>
                {passwordMatch ? '✅ Passwords match' : '❌ Passwords do not match'}
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">⚽ Favorite Team (2026 World Cup)</label>
            <select
              className="form-select"
              value={formData.seleccionFavorita}
              onChange={(e) => setFormData({ ...formData, seleccionFavorita: e.target.value })}
            >
              <option value="">Select a team...</option>
              {MUNDIAL_2026_TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading || !passwordMatch}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-3 text-center">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
