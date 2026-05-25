import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { registerFcmToken } from '../services/firebase';

interface User {
  id: string;
  email: string;
  name: string;
  rol?: string;
  seleccionFavorita?: string;
  avatarSeed?: string;
  avatarCustomUrls?: string[];
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
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8082/api/v1';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // NOTA: usamos sessionStorage (no localStorage) para que la sesión sea
  // independiente por pestaña/ventana. Así se puede iniciar sesión con
  // usuarios distintos en ventanas distintas sin que se mezclen los datos.
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));
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
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const localToken = sessionStorage.getItem('token');
          const tokenLooksBroken =
            !localToken ||
            localToken === 'null' ||
            localToken === 'undefined' ||
            !localToken.includes('.');
          // 401 = token expirado/inválido. 403 con token corrupto = JWT malformado.
          if (status === 401 || (status === 403 && tokenLooksBroken)) {
            setUser(null);
            setToken(null);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
          }
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
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Registrar token FCM para push notifications (no bloquea el login)
      registerFcmToken().catch(() => {});
      return rol;
    } catch (err) {
      let message = 'Error al iniciar sesión. Inténtalo de nuevo.';
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const rawError = (err.response?.data?.data?.error as string) ?? '';
        if (status && status >= 500) {
          message = 'Error del servidor. Por favor, inténtalo más tarde.';
        } else if (rawError && !rawError.toLowerCase().startsWith('internal server error')) {
          message = rawError;
        } else if (err.response?.data?.message && err.response.data.message !== 'Error') {
          message = err.response.data.message as string;
        } else if (status === 401 || status === 404) {
          message = 'Email o contraseña incorrectos.';
        }
      }
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
        seleccionFavorita: seleccionFavorita ?? undefined,
      };
      setToken(token);
      setUser(user);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Registrar token FCM para push notifications (no bloquea el registro)
      registerFcmToken().catch(() => {});
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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const clearError = () => setError(null);

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      const next = { ...(prev ?? {}), ...(patch ?? {}) } as User;
      // Ensure avatarCustomUrls is always an array if provided as single string
      if (patch.avatarCustomUrls && !Array.isArray(patch.avatarCustomUrls)) {
        next.avatarCustomUrls = [String(patch.avatarCustomUrls)];
      }
      sessionStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout, clearError, updateUser }}
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
