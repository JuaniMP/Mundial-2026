import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('❌ Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('❌ Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('✅ Check your email! We sent you a reset code');
      setShowResetForm(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '❌ Email not found or request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetCode.trim()) {
      setError('❌ Please enter the reset code from your email');
      return;
    }

    if (!newPassword) {
      setError('❌ Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      setError('❌ Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('❌ Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        code: resetCode,
        newPassword,
      });
      setSuccess('✅ Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || '❌ Reset failed. Check your code and try again');
    } finally {
      setIsLoading(false);
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
          <p className="text-text-secondary">Reset your password</p>
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

          {!showResetForm ? (
            <form onSubmit={handleRequestReset} className="space-y-5">
              <p className="text-sm text-text-secondary mb-6">
                Enter your email address and we'll send you a code to reset your password
              </p>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-primary text-white font-semibold py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-text-secondary mb-6">
                Enter the reset code from your email and create a new password
              </p>

              {/* Reset Code */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Reset Code
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-lg">🔐</span>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                    placeholder="ABC123DEF456"
                    className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-lg">🔒</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <p className="text-xs mt-2 text-text-muted">
                  Minimum 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password */}
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
                {newPassword && confirmPassword && (
                  <p
                    className={`text-xs mt-2 ${newPassword === confirmPassword ? 'text-success' : 'text-danger'}`}
                  >
                    {newPassword === confirmPassword
                      ? '✅ Passwords match'
                      : '❌ Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-primary text-white font-semibold py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-text-secondary">
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
