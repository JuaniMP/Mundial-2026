import { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthContextType, AuthProviderProps } from '../types/auth';
import { api } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<any>('/auth/login', { email, password });
      const { token: newToken, email: userEmail, nombre, rol } = response.data;

      const userData = { email: userEmail, nombre, rol };
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    nombre: string,
    seleccionFavorita: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await api.post<any>('/auth/register', {
        email,
        password,
        nombre,
        seleccionFavorita,
      });
      const { token: newToken, email: userEmail, nombre: userName, rol } = response.data;

      const userData = { email: userEmail, nombre: userName, rol };
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
