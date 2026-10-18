import axios from 'axios';
import { API_V1, authHeaders } from './http';

const BASE = `${API_V1}/perfil`;

export interface Preferencias {
  seleccionesFavoritas: string[];
  estadiosFavoritos: string[];
  canalesNotificacion: string[];
  zonaHorariaPreferida?: string | null;
  wizardCompletado: boolean;
  idioma?: 'es' | 'en' | 'fr';
}

export interface AgendaItem {
  id: number;
  titulo: string;
  descripcion?: string;
  tipo: 'PARTIDO' | 'VIAJE' | 'ENTRADA' | 'CUSTOM';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  fechaInicio: string;
  fechaFin?: string;
  apiPartidoId?: number;
  ubicacion?: string;
}

export interface RecordatorioViaje {
  id: number;
  ciudadDestino: string;
  paisDestino: string;
  zonaHorariaDestino?: string;
  fechaInicio: string;
  fechaFin: string;
  estadioDestino?: string;
  notas?: string;
  offsetHoras?: string | null;
  duracionEstimada?: string | null;
  enCurso: boolean;
  alerta?: string;
}

export interface FeedItem {
  id: string;
  origen: 'AGENDA' | 'VIAJE' | 'NOTIFICACION' | 'POLLA';
  titulo: string;
  detalle: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  cuando: string;
  accionUrl?: string | null;
}

function unwrapList<T>(data: { data?: T[] } | undefined): T[] {
  return (data?.data as T[]) ?? [];
}
function unwrap<T>(data: { data?: T } | undefined): T {
  return (data?.data as T) ?? (null as unknown as T);
}

export async function getPreferencias(): Promise<Preferencias> {
  const { data } = await axios.get(`${BASE}/preferencias`, { headers: authHeaders() });
  return unwrap<Preferencias>(data);
}

export async function savePreferencias(p: Partial<Preferencias>): Promise<Preferencias> {
  const { data } = await axios.put(`${BASE}/preferencias`, p, { headers: authHeaders() });
  return unwrap<Preferencias>(data);
}

export async function getAgenda(): Promise<AgendaItem[]> {
  const { data } = await axios.get(`${BASE}/agenda`, { headers: authHeaders() });
  return unwrapList<AgendaItem>(data);
}

export async function addAgendaItem(item: Omit<AgendaItem, 'id'>): Promise<AgendaItem> {
  const { data } = await axios.post(`${BASE}/agenda`, item, { headers: authHeaders() });
  return unwrap<AgendaItem>(data);
}

export async function deleteAgendaItem(id: number): Promise<void> {
  await axios.delete(`${BASE}/agenda/${id}`, { headers: authHeaders() });
}

export async function getViajes(): Promise<RecordatorioViaje[]> {
  const { data } = await axios.get(`${BASE}/viajes`, { headers: authHeaders() });
  return unwrapList<RecordatorioViaje>(data);
}

export async function addViaje(
  v: Omit<RecordatorioViaje, 'id' | 'enCurso' | 'alerta' | 'offsetHoras'>,
): Promise<RecordatorioViaje> {
  const { data } = await axios.post(`${BASE}/viajes`, v, { headers: authHeaders() });
  return unwrap<RecordatorioViaje>(data);
}

export async function deleteViaje(id: number): Promise<void> {
  await axios.delete(`${BASE}/viajes/${id}`, { headers: authHeaders() });
}

export async function getFeed(): Promise<FeedItem[]> {
  const { data } = await axios.get(`${BASE}/feed`, { headers: authHeaders() });
  return unwrapList<FeedItem>(data);
}
