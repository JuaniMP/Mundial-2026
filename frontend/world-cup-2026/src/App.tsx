import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/layout/Layout';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Matches } from './pages/Matches';
import { Standings } from './pages/Standings';
import { Stadiums } from './pages/Stadiums';
import { Teams } from './pages/Teams';
import { Superpolla } from './pages/Superpolla';
import { Album } from './pages/Album';
import { Tickets } from './pages/Tickets';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes — solo ADMIN */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          {/* Protected Routes — cualquier usuario autenticado (AFICIONADO, OPERADOR…) */}
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
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/superpolla" element={<Superpolla />} />
                    <Route path="/album" element={<Album />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
