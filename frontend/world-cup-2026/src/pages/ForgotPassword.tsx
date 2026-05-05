import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8082/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.data?.error || data.message || 'Failed to process request');
      }
    } catch {
      setError('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-deep via-bg-base to-bg-surface py-8">
      <div className="w-full max-w-md mx-4">
        {/* Card */}
        <div className="card-base p-8 md:p-10">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 font-headline">
                  Reset Password
                </h1>
                <p className="text-text-muted">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-accent-glow border border-accent rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-text-primary text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-light text-text-inverse font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 flex items-center justify-center">
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-light font-medium flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-light/20">
                  <CheckCircle className="w-8 h-8 text-secondary-light" />
                </div>
                <h1 className="text-3xl font-bold text-text-primary mb-2 font-headline">
                  Check Your Email
                </h1>
                <p className="text-text-muted mb-6">
                  We've sent a password reset link to{' '}
                  <span className="font-semibold text-text-primary">{email}</span>
                </p>
                <p className="text-sm text-text-muted mb-8">
                  Click the link in your email to reset your password. If you don't see it, check
                  your spam folder.
                </p>

                {/* Back to Login */}
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-light text-text-inverse font-semibold rounded-lg transition-all gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
