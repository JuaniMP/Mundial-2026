import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<string>;
  register: (
    name: string,
    email: string,
    password: string,
    seleccionFavorita?: string,
  ) => Promise<string>;
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
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Interceptor global: si el servidor responde 401 limpiar sesión
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          // Token expirado o inválido → limpiar sesión
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
        return Promise.reject(err);
      },
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { data } = response.data;
      const {
        token,
        email: userEmail,
        nombre,
        rol,
      } = data as {
        token: string;
        email: string;
        nombre: string;
        rol: string;
      };
      const user: User = {
        id: userEmail,
        email: userEmail,
        name: nombre,
        rol,
      };
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return rol;
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
        seleccionFavorita: seleccionFavorita || null,
      });

      const { data } = response.data;
      const {
        token,
        email: userEmail,
        nombre,
        rol,
      } = data as {
        token: string;
        email: string;
        nombre: string;
        rol: string;
      };
      const user: User = {
        id: userEmail,
        email: userEmail,
        name: nombre,
        rol,
      };
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return rol;
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
