import { API_BASE_URL, API_V1 } from '../config';

export { API_BASE_URL, API_V1 };

/** Cabecera Authorization con el JWT de la sesión, o vacía si no hay sesión válida. */
export function authHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined' || !token.includes('.')) return {};
  return { Authorization: `Bearer ${token}` };
}
