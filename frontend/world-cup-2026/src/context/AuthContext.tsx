import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import API from '../services/api';

interface User {
  email: string;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombre: string, seleccionFavorita: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token: newToken, email: userEmail, nombre, rol } = response.data.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ email: userEmail, nombre, rol });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, nombre: string, seleccionFavorita: string) => {
    try {
      const response = await API.post('/auth/register', {
        email,
        password,
        nombre,
        seleccionFavorita
      });
      const { token: newToken, email: userEmail, nombre: userName, rol } = response.data.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ email: userEmail, nombre: userName, rol });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
