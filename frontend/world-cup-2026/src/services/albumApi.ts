import axios from 'axios';
import { API_V1, authHeaders } from './http';

/**
 * Cliente del álbum digital. El backend identifica al usuario por el JWT,
 * por eso ninguna ruta lleva el id del usuario.
 */
const BASE = `${API_V1}/album`;

// ─── Types (espejo de los DTO del backend) ──────────────────────────────────

export interface LaminaAlbum {
  idLamina: number;
  nombreJugador: string;
  imagenUrl?: string | null;
  seleccionNombre?: string | null;
  rareza: string;
  estaPegada: boolean;
  cantidadRepetidas: number;
}

export interface AlbumStats {
  id: number;
  idUsuario: number;
  porcentajeCompletado: number;
  laminasPegadas: number;
}

export interface PaquetesAbiertosStats {
  abiertos: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function requireSession() {
  if (!sessionStorage.getItem('token')) {
    throw new Error('Debes iniciar sesion para guardar el album en la base de datos.');
  }
}

/** El backend envuelve las respuestas en { success, data }. */
function unwrap<T>(body: { data?: T } | T): T {
  return ((body as { data?: T }).data ?? body) as T;
}

async function get<T>(path: string): Promise<T> {
  requireSession();
  const r = await axios.get(`${BASE}${path}`, { headers: authHeaders() });
  return unwrap<T>(r.data);
}

async function post<T>(path: string): Promise<T> {
  requireSession();
  const r = await axios.post(`${BASE}${path}`, {}, { headers: authHeaders() });
  return unwrap<T>(r.data);
}

const asArray = <T>(data: unknown): T[] => (Array.isArray(data) ? (data as T[]) : []);

// ─── API calls ──────────────────────────────────────────────────────────────

export const fetchAlbumStats = () => get<AlbumStats>('');

export const fetchLaminas = async () => asArray<LaminaAlbum>(await get('/laminas'));

/** Todas las 320 láminas con estado del usuario (incluye las no obtenidas). */
export const fetchTodasLaminas = async () => asArray<LaminaAlbum>(await get('/todas'));

export const fetchPaquetesAbiertos = () => get<PaquetesAbiertosStats>('/paquetes-abiertos');

/** Abre un paquete y devuelve los ids de las láminas obtenidas. */
export async function abrirPaquete(): Promise<number[]> {
  const data = await post<{ laminas?: number[] } | number[]>('/abrir-paquete');
  if (Array.isArray(data)) return data;
  return data && Array.isArray(data.laminas) ? data.laminas : [];
}

export const pegarLamina = (laminaId: number) => post<AlbumStats>(`/pegar/${laminaId}`);
