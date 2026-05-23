import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { PrivateRoute } from './components/PrivateRoute';
import { RoleRoute } from './components/RoleRoute';
import { Layout } from './components/layout/Layout';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Matches } from './pages/Matches';
import { Standings } from './pages/Standings';
import { Stadiums } from './pages/Stadiums';
import { Superpolla } from './pages/Superpolla';
import { Album } from './pages/Album';
import { Tickets } from './pages/Tickets';
import { Teams } from './pages/Teams';
import { PackOpening } from './pages/PackOpening';
import { Admin } from './pages/Admin';
import { Agentes } from './pages/Agentes';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Pollas } from './pages/Pollas';
import { PollaDetalle } from './pages/PollaDetalle';
import { Profile } from './pages/Profile';
import { Backoffice } from './pages/backoffice';
import { Soporte } from './pages/Soporte';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
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
                <PrivateRoute>
                  <Layout>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/matches" element={<Matches />} />
                      <Route path="/standings" element={<Standings />} />
                      <Route path="/stadiums" element={<Stadiums />} />
                      <Route path="/superpolla" element={<Superpolla />} />
                      <Route path="/album" element={<Album />} />
                      <Route path="/tickets" element={<Tickets />} />
                      <Route path="/teams" element={<Teams />} />
                      <Route path="/pack-opening" element={<PackOpening />} />
                      <Route path="/pollas" element={<Pollas />} />
                      <Route path="/pollas/:id" element={<PollaDetalle />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route
                        path="/admin"
                        element={
                          <RoleRoute allowedRoles={['ADMIN']}>
                            <Admin />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/agentes"
                        element={
                          <RoleRoute allowedRoles={['ADMIN', 'SOPORTE', 'OPERADOR']}>
                            <Agentes />
                          </RoleRoute>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
