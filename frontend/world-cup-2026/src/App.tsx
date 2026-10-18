import { lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';

// Desregistrar service workers viejos de Firebase si no está configurado
if ('serviceWorker' in navigator && !import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs
      .filter((r) => r.active?.scriptURL?.includes('firebase-messaging-sw'))
      .forEach((r) => r.unregister());
  });
}
import { LanguageProvider } from './context/LanguageContext';
import { PrivateRoute } from './components/PrivateRoute';
import { RoleRoute } from './components/RoleRoute';
import { Layout } from './components/layout/Layout';
import { Navbar } from './components/layout/Navbar';
import { useAuth } from './context/AuthContext';

/** Cada página se descarga cuando se visita (three.js, Leaflet y Stripe no van en el bundle inicial). */
function lazyPage<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => load().then((module) => ({ default: module[name] })));
}

const Dashboard = lazyPage(() => import('./pages/Dashboard'), 'Dashboard');
const Matches = lazyPage(() => import('./pages/Matches'), 'Matches');
const Standings = lazyPage(() => import('./pages/Standings'), 'Standings');
const Stadiums = lazyPage(() => import('./pages/Stadiums'), 'Stadiums');
const Superpolla = lazyPage(() => import('./pages/Superpolla'), 'Superpolla');
const Album = lazyPage(() => import('./pages/Album'), 'Album');
const Tickets = lazyPage(() => import('./pages/Tickets'), 'Tickets');
const Teams = lazyPage(() => import('./pages/Teams'), 'Teams');
const PackOpening = lazyPage(() => import('./pages/PackOpening'), 'PackOpening');
const Admin = lazyPage(() => import('./pages/Admin'), 'Admin');
const Agentes = lazyPage(() => import('./pages/Agentes'), 'Agentes');
const Login = lazyPage(() => import('./pages/Login'), 'Login');
const Register = lazyPage(() => import('./pages/Register'), 'Register');
const ForgotPassword = lazyPage(() => import('./pages/ForgotPassword'), 'ForgotPassword');
const Pollas = lazyPage(() => import('./pages/Pollas'), 'Pollas');
const PollaDetalle = lazyPage(() => import('./pages/PollaDetalle'), 'PollaDetalle');
const Profile = lazyPage(() => import('./pages/Profile'), 'Profile');
const Backoffice = lazyPage(() => import('./pages/backoffice'), 'Backoffice');
const Soporte = lazyPage(() => import('./pages/Soporte'), 'Soporte');

function RequireLoginNotice({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="card-base p-6 text-center">
        <p className="text-text-secondary">{t('common.loading')}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <section className="relative min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-150px)] overflow-hidden">
        <div className="pointer-events-none select-none blur-[1.2px] grayscale-[0.2] opacity-55">
          {children}
        </div>

        <div className="absolute inset-0 flex items-start justify-center pt-24 md:pt-28 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/70 bg-white/72 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.20)] p-6 md:p-8 text-center animate-fade-in">
            <p className="text-xs font-bold tracking-[0.2em] text-[#002868] uppercase">
              {t('auth.guestPreviewLabel')}
            </p>
            <h2 className="mt-2 font-headline font-bold text-2xl md:text-3xl text-text-primary">
              {t('auth.guestTitle')}
            </h2>
            <p className="mt-3 text-text-secondary">{t('auth.guestBody')}</p>
            <div className="mt-5 flex justify-center">
              <Link
                to="/login"
                className="inline-flex items-center rounded-full bg-[#002868] text-white px-6 py-2.5 text-sm font-bold tracking-wide hover:bg-[#001f55] transition-colors"
              >
                {t('auth.guestButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Admin/Compliance Backoffice - Separate Layout (No Navbar) */}
              <Route
                path="/backoffice/*"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['ADMIN', 'COMPLIANCE']}>
                      <Routes>
                        <Route path="/" element={<Backoffice />} />
                        <Route path="*" element={<Navigate to="/backoffice" replace />} />
                      </Routes>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* Support Dashboard - Separate Layout (No Navbar) */}
              <Route
                path="/soporte/*"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['ADMIN', 'SOPORTE']}>
                      <Routes>
                        <Route path="/" element={<Soporte />} />
                        <Route path="*" element={<Navigate to="/soporte" replace />} />
                      </Routes>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* Regular User Routes - With Navbar */}
              <Route
                path="/*"
                element={
                  <Layout>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route
                        path="/matches"
                        element={
                          <RequireLoginNotice>
                            <Matches />
                          </RequireLoginNotice>
                        }
                      />
                      <Route path="/standings" element={<Standings />} />
                      <Route
                        path="/stadiums"
                        element={
                          <RequireLoginNotice>
                            <Stadiums />
                          </RequireLoginNotice>
                        }
                      />
                      <Route path="/superpolla" element={<Superpolla />} />
                      <Route path="/album" element={<Album />} />
                      <Route
                        path="/tickets"
                        element={
                          <RequireLoginNotice>
                            <Tickets />
                          </RequireLoginNotice>
                        }
                      />
                      <Route path="/teams" element={<Teams />} />
                      <Route path="/pack-opening" element={<PackOpening />} />
                      <Route
                        path="/pollas"
                        element={
                          <RequireLoginNotice>
                            <Pollas />
                          </RequireLoginNotice>
                        }
                      />
                      <Route
                        path="/pollas/:id"
                        element={
                          <RequireLoginNotice>
                            <PollaDetalle />
                          </RequireLoginNotice>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <RequireLoginNotice>
                            <Profile />
                          </RequireLoginNotice>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                              <Admin />
                            </RoleRoute>
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/agentes"
                        element={
                          <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN', 'SOPORTE', 'OPERADOR']}>
                              <Agentes />
                            </RoleRoute>
                          </PrivateRoute>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </Suspense>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
