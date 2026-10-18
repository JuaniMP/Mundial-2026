import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import {
  Mail,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { API_V1 } from '../config';

const API_BASE_URL = API_V1;

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email,
    });

    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }
  };

  const handleResetPassword = async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      email,
      code: code.trim().toUpperCase(),
      newPassword,
    });

    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusMessage('');

    try {
      await handleRequestCode();
      setStep('reset');
      setStatusMessage(`Se envió un código de verificación a ${email}.`);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.data?.error as string) ||
          (err.response?.data?.message as string) ||
          'No se pudo enviar el código de verificación.'
        : 'No se pudo enviar el código de verificación.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusMessage('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await handleResetPassword();
      setStep('done');
      setStatusMessage('La contraseña se actualizó correctamente. Ya puedes iniciar sesión.');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.data?.error as string) ||
          (err.response?.data?.message as string) ||
          'No se pudo cambiar la contraseña.'
        : 'No se pudo cambiar la contraseña.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError('');
    setStatusMessage('');
    try {
      await handleRequestCode();
      setStatusMessage(`Reenviamos el código a ${email}.`);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.data?.error as string) ||
          (err.response?.data?.message as string) ||
          'No se pudo reenviar el código.'
        : 'No se pudo reenviar el código.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const score = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[a-z]/.test(newPassword),
      /\d/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ].filter(Boolean).length;

    if (!newPassword) return { label: 'Sin escribir', className: 'bg-border', width: '0%' };
    if (score <= 2) return { label: 'Débil', className: 'bg-red-500', width: '33%' };
    if (score <= 4) return { label: 'Media', className: 'bg-amber-500', width: '66%' };
    return { label: 'Fuerte', className: 'bg-emerald-500', width: '100%' };
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-deep via-bg-base to-bg-surface py-8">
      <div className="w-full max-w-md mx-4">
        {/* Card */}
        <div className="card-base p-8 md:p-10">
          {step !== 'done' ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 font-headline">
                  {step === 'request' ? 'Restablecer contraseña' : 'Verificar y cambiar contraseña'}
                </h1>
                <p className="text-text-muted">
                  {step === 'request'
                    ? 'Escribe tu correo para recibir un código de verificación.'
                    : 'Ingresa el código recibido por correo y define tu nueva contraseña.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-accent-glow border border-accent rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-text-primary text-sm">{error}</p>
                </div>
              )}

              {/* Status Message */}
              {statusMessage && (
                <div className="mb-6 p-4 bg-secondary/10 border border-secondary rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-text-primary text-sm">{statusMessage}</p>
                </div>
              )}

              {/* Form */}
              {step === 'request' ? (
                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      Correo electrónico
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
                    {loading ? 'Enviando...' : 'Enviar código de verificación'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmitReset} className="space-y-5">
                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      Código de verificación
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                      <input
                        id="code"
                        type="text"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.toUpperCase());
                          if (error) setError('');
                        }}
                        placeholder="ABC123"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted tracking-[0.35em] uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((value) => !value)}
                        className="absolute right-3 top-3 text-text-muted hover:text-text-primary transition-colors"
                        aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="mt-3">
                      <div className="h-2 w-full rounded-full bg-bg-elevated overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.className}`}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-text-muted">
                        Fortaleza:{' '}
                        <span className="text-text-primary font-semibold">
                          {passwordStrength.label}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Repite la nueva contraseña"
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-3 top-3 text-text-muted hover:text-text-primary transition-colors"
                        aria-label={
                          showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-primary hover:bg-primary-light text-text-inverse font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={resendCode}
                      className="w-full py-2.5"
                    >
                      Reenviar código
                    </Button>
                  </div>
                </form>
              )}

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
                  Contraseña actualizada
                </h1>
                <p className="text-text-muted mb-6">
                  {statusMessage || 'Ya puedes iniciar sesión con tu nueva contraseña.'}
                </p>

                {/* Back to Login */}
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-light text-text-inverse font-semibold rounded-lg transition-all gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
