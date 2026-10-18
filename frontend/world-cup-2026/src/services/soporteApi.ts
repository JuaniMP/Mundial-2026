import axios from 'axios';
import { API_V1 } from './http';

const API = `${API_V1}/soporte`;

export interface EntradaResumen {
  entradaId: number;
  codigoQr: string;
  partido: string;
  categoria: string;
  estado: string;
  stripeStatus: string | null;
  stripePaymentIntentId: string | null;
  emailComprador: string | null;
  total: number | null;
  fechaCompra: string | null;
}

export interface BusquedaResponse {
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string | null;
  seleccionFavorita: string | null;
  zonaHoraria: string | null;
  fechaRegistro: string | null;
  ultimoLogin: string | null;
  totalEntradas: number;
  totalIncidentes: number;
  totalLogs: number;
  entradas: EntradaResumen[];
}

export interface TimelineEvent {
  timestamp: string;
  tipo: string;
  titulo: string;
  detalle: string | null;
  correlationId: string | null;
  severidad: string;
  referenciaId: number | null;
}

export interface AccionResult {
  mensaje: string;
  [key: string]: unknown;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Extrae un mensaje legible de un error de axios. El backend envuelve los
 * errores en ApiResponse.error → el mensaje real va en `data.data.error`.
 */
export function errorMessage(err: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { data?: { error?: string } } | undefined;
    return body?.data?.error || err.message || fallback;
  }
  return fallback;
}

/** Busca un aficionado por ID, correo o ID de transacción. */
export async function buscarUsuario(q: string): Promise<BusquedaResponse> {
  const res = await axios.get<ApiEnvelope<BusquedaResponse>>(`${API}/buscar`, {
    params: { q },
  });
  return res.data.data;
}

/** Obtiene la línea de tiempo cronológica de un aficionado. */
export async function getTimeline(usuarioId: number): Promise<TimelineEvent[]> {
  const res = await axios.get<ApiEnvelope<TimelineEvent[]>>(`${API}/timeline/${usuarioId}`);
  return res.data.data ?? [];
}

/** Acción correctiva: reenviar el correo de confirmación de una entrada. */
export async function reenviarConfirmacion(entradaId: number): Promise<AccionResult> {
  const res = await axios.post<ApiEnvelope<AccionResult>>(
    `${API}/acciones/reenviar-confirmacion/${entradaId}`,
  );
  return res.data.data;
}

/** Acción correctiva: reactivar una reserva liberada por error. */
export async function reactivarReserva(entradaId: number): Promise<AccionResult> {
  const res = await axios.post<ApiEnvelope<AccionResult>>(
    `${API}/acciones/reactivar-reserva/${entradaId}`,
  );
  return res.data.data;
}

/** Acción correctiva: procesar un reembolso simulado de la pasarela sandbox. */
export async function procesarReembolso(entradaId: number): Promise<AccionResult> {
  const res = await axios.post<ApiEnvelope<AccionResult>>(`${API}/acciones/reembolso/${entradaId}`);
  return res.data.data;
}
