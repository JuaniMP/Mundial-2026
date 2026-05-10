import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    seleccionFavorita?: string,
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8082/api/v1';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { data } = response.data;
      const { token, email: userEmail, nombre } = data;
      const user: User = {
        id: userEmail,
        email: userEmail,
        name: nombre,
      };
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.data?.error as string) ||
          (err.response?.data?.message as string) ||
          'Login failed'
        : 'Login failed';
      setError(message);
      throw new Error(message, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    seleccionFavorita?: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        nombre: name,
        email,
        password,
        seleccionFavorita: seleccionFavorita ?? null,
      });

      const { data } = response.data;
      const { token, email: userEmail, nombre } = data;
      const user: User = {
        id: userEmail,
        email: userEmail,
        name: nombre,
      };
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.data?.error as string) ||
          (err.response?.data?.message as string) ||
          'Registration failed'
        : 'Registration failed';
      setError(message);
      throw new Error(message, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
