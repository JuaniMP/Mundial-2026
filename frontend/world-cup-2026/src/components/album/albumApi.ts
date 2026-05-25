import axios from 'axios';

const BASE = 'http://localhost:8082/api/v1';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Auth ────────────────────────────────────────────────────────────────────

function authHeader() {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireToken(): string {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Debes iniciar sesion para guardar el album en la base de datos.');
  }
  return token;
}

/**
 * Tries to extract a numeric user ID from the JWT.
 * The backend JWT may store the userId under different claim names.
 */
export function extractUserId(): number {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) return 1;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const id = payload.id ?? payload.userId ?? payload.user_id;
    if (typeof id === 'number') return id;
    if (typeof id === 'string' && !isNaN(Number(id))) return Number(id);
  } catch {
    /* fall through */
  }
  return 1; // dev fallback
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function fetchAlbumStats(): Promise<AlbumStats> {
  requireToken();
  const uid = extractUserId();
  const r = await axios.get(`${BASE}/album/${uid}`, { headers: authHeader() });
  return (r.data.data ?? r.data) as AlbumStats;
}

export async function fetchLaminas(): Promise<LaminaAlbum[]> {
  requireToken();
  const uid = extractUserId();
  const r = await axios.get(`${BASE}/album/laminas/${uid}`, { headers: authHeader() });
  const data = r.data.data ?? r.data;
  return Array.isArray(data) ? (data as LaminaAlbum[]) : [];
}

export async function abrirPaquete(): Promise<number[]> {
  requireToken();
  const uid = extractUserId();
  const r = await axios.post(`${BASE}/album/abrir-paquete/${uid}`, {}, { headers: authHeader() });
  const data = r.data.data ?? r.data;
  // backend returns { id, laminas: number[] }
  if (data && Array.isArray(data.laminas)) return data.laminas as number[];
  if (Array.isArray(data)) return data as number[];
  return [];
}

export async function pegarLamina(laminaId: number): Promise<AlbumStats> {
  requireToken();
  const uid = extractUserId();
  const r = await axios.post(
    `${BASE}/album/pegar/${uid}/${laminaId}`,
    {},
    { headers: authHeader() },
  );
  return (r.data.data ?? r.data) as AlbumStats;
}

/** Todas las 320 láminas con estado del usuario (incluye las no obtenidas). */
export async function fetchTodasLaminas(): Promise<LaminaAlbum[]> {
  requireToken();
  const uid = extractUserId();
  const r = await axios.get(`${BASE}/album/todas/${uid}`, { headers: authHeader() });
  const data = r.data.data ?? r.data;
  return Array.isArray(data) ? (data as LaminaAlbum[]) : [];
}

export async function fetchPaquetesAbiertos(): Promise<PaquetesAbiertosStats> {
  requireToken();
  const uid = extractUserId();
  const r = await axios.get(`${BASE}/album/paquetes-abiertos/${uid}`, { headers: authHeader() });
  return (r.data.data ?? r.data) as PaquetesAbiertosStats;
}
