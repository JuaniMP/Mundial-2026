import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
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
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
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
