import type { ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'AFICIONADO' | 'OPERADOR' | 'SOPORTE' | 'COMPLIANCE' | 'ALIADO';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  zonaHoraria: string;
  seleccionFavorita: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  usuario: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    nombre: string,
    seleccionFavorita: string,
  ) => Promise<void>;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}
