import axios from 'axios';
import { API_V1, authHeaders } from './http';

const BASE = `${API_V1}/pollas`;

export interface Polla {
  id: number;
  nombre: string;
  codigoAcceso: string;
  pozoPuntos: number;
  idCreador: number;
  nombreCreador: string;
}

export interface PollaResumen {
  id: number;
  nombre: string;
  codigoAcceso: string;
  pozoPuntos: number;
  nombreCreador: string;
  totalParticipantes: number;
  misPuntos: number;
  miPosicion: number;
  soyCreador: boolean;
}

export interface RankingEntry {
  posicion: number;
  idUsuario: number;
  nombreUsuario: string;
  email: string;
  seleccionFavorita?: string | null;
  puntos: number;
  totalPredicciones: number;
  aciertosExactos: number;
  premio?: 'ORO' | 'PLATA' | 'BRONCE' | null;
}

export interface Prediccion {
  id: number;
  golesLocal: number;
  golesVisitante: number;
  puntosObtenidos: number;
  idUsuario: number;
  nombreUsuario: string;
  apiPartidoId: number;
}

export interface PrediccionRequest {
  idPolla: number;
  apiPartidoId: number;
  golesLocal: number;
  golesVisitante: number;
  /** ISO-8601 del kickoff. */
  fechaPartido?: string;
}

function unwrap<T>(resp: { data?: { data?: T } } | undefined): T {
  return (resp?.data?.data as T) ?? (null as unknown as T);
}

export async function getMisPollas(): Promise<PollaResumen[]> {
  const { data } = await axios.get(`${BASE}/mis-pollas`, { headers: authHeaders() });
  return (data?.data as PollaResumen[]) ?? [];
}

export async function getPollaById(id: number): Promise<Polla> {
  const { data } = await axios.get(`${BASE}/${id}`, { headers: authHeaders() });
  return unwrap<Polla>({ data });
}

export async function getPollaByCodigo(codigo: string): Promise<Polla> {
  const { data } = await axios.get(`${BASE}/codigo/${codigo}`, { headers: authHeaders() });
  return unwrap<Polla>({ data });
}

export async function getRanking(id: number): Promise<RankingEntry[]> {
  const { data } = await axios.get(`${BASE}/${id}/ranking`, { headers: authHeaders() });
  return (data?.data as RankingEntry[]) ?? [];
}

export async function getMisPredicciones(pollaId: number): Promise<Prediccion[]> {
  const { data } = await axios.get(`${BASE}/${pollaId}/mis-predicciones`, {
    headers: authHeaders(),
  });
  return (data?.data as Prediccion[]) ?? [];
}

export async function getPredicciones(pollaId: number): Promise<Prediccion[]> {
  const { data } = await axios.get(`${BASE}/${pollaId}/predicciones`, { headers: authHeaders() });
  return (data?.data as Prediccion[]) ?? [];
}

export async function crearPolla(nombre: string): Promise<Polla> {
  const { data } = await axios.post(`${BASE}`, { nombre }, { headers: authHeaders() });
  return unwrap<Polla>({ data });
}

export async function unirseAPolla(codigo: string): Promise<Polla> {
  const { data } = await axios.post(`${BASE}/unirse/${codigo}`, {}, { headers: authHeaders() });
  return unwrap<Polla>({ data });
}

export async function guardarPrediccion(req: PrediccionRequest): Promise<Prediccion> {
  const { data } = await axios.post(`${BASE}/predicciones`, req, { headers: authHeaders() });
  return unwrap<Prediccion>({ data });
}
