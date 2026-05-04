import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import './Auth.css';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: request code, 2: reset password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Invalid email format');
        setLoading(false);
        return;
      }

      await API.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await API.post('/auth/reset-password', {
        email,
        code: code.toUpperCase(),
        newPassword
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>⚽ Mundial 2026 Hub</h1>
        <h2>Reset Password</h2>

        {error && <div className="alert alert-danger">❌ {error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
            <div className="mb-3">
              <label className="form-label">✉️ Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <small className="text-muted">
                Enter the email associated with your account. We'll send a reset code.
              </small>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label">📬 Reset Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="6-character code from your email"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
              <small className="text-muted">
                Check your email for a 6-character code. If you don't see it, check spam folder.
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label">🔒 New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">🔐 Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && (
                <small className={newPassword === confirmPassword ? 'text-success' : 'text-danger'}>
                  {newPassword === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </small>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              className="btn btn-link w-100 mt-2"
              onClick={() => {
                setStep(1);
                setCode('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
            >
              Back
            </button>
          </form>
        )}

        <div className="mt-3 text-center">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
};
