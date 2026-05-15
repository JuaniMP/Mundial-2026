import axios from 'axios';

const BASE = 'http://localhost:8082/api/v1/album';

export interface LaminaAlbumResponse {
  idLamina: number;
  nombreJugador: string;
  posicion?: string;
  nacionalidad?: string;
  dorsal?: number;
  seleccion?: string;
  rareza: 'COMUN' | 'RARO' | 'EPICO' | 'LEGENDARIO';
  estaPegada: boolean;
  cantidadRepetidas: number;
}

export interface AlbumResponse {
  id: number;
  idUsuario: number;
  porcentajeCompletado: number;
  laminasPegadas: number;
}

export interface PaqueteResponse {
  id: number;
  laminas: number[];
}

export interface PacketesHoyResponse {
  abiertos: number;
  limite: number;
  restantes: number;
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getMyAlbum(token: string): Promise<AlbumResponse> {
  const res = await axios.get(`${BASE}`, { headers: authHeader(token) });
  return res.data.data;
}

export async function createMyAlbum(token: string): Promise<AlbumResponse> {
  const res = await axios.post(`${BASE}/crear`, {}, { headers: authHeader(token) });
  return res.data.data;
}

export async function getMyLaminas(token: string): Promise<LaminaAlbumResponse[]> {
  const res = await axios.get(`${BASE}/laminas`, { headers: authHeader(token) });
  return res.data.data;
}

export async function abrirPaquete(
  token: string,
): Promise<{ paquete: PaqueteResponse; laminas: LaminaAlbumResponse[] }> {
  const paqueteRes = await axios.post(`${BASE}/abrir-paquete`, {}, { headers: authHeader(token) });
  const paquete: PaqueteResponse = paqueteRes.data.data;

  const todasRes = await axios.get(`${BASE}/laminas`, { headers: authHeader(token) });
  const todas: LaminaAlbumResponse[] = todasRes.data.data;
  const idSet = new Set(paquete.laminas);
  const laminas = todas.filter((l) => idSet.has(l.idLamina));
  return { paquete, laminas };
}

export async function getPacketesHoy(token: string): Promise<PacketesHoyResponse> {
  const res = await axios.get(`${BASE}/paquetes-hoy`, { headers: authHeader(token) });
  return res.data.data;
}

export async function pegarLamina(token: string, laminaId: number): Promise<AlbumResponse> {
  const res = await axios.post(`${BASE}/pegar/${laminaId}`, {}, { headers: authHeader(token) });
  return res.data.data;
}
