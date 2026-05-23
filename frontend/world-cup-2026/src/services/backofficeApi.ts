import axios from 'axios';

const BASE = 'http://localhost:8082/api/v1/backoffice';

function authHeaders() {
  const token = sessionStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined' || !token.includes('.')) return {};
  return { Authorization: `Bearer ${token}` };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Alerta {
  id: number;
  tipo: string;
  severidad: 'ALTA' | 'MEDIA' | 'BAJA';
  descripcion: string;
  usuarioId: number | null;
  usuarioNombre: string | null;
  usuarioEmail: string | null;
  timestamp: string | null;
  revisada: boolean;
}

export interface LogEntry {
  id: number;
  accion: string;
  timestamp: string | null;
  detalle: string;
  nivelRiesgo: string | null;
  verificadoCompliance: boolean;
  usuarioId: number | null;
  usuarioNombre: string | null;
  hashIntegridad: string | null;
}

export interface LogsFilter {
  tipo?: string;
  usuarioId?: number;
  desde?: string;
  hasta?: string;
  nivelRiesgo?: string;
  page?: number;
  size?: number;
}

export interface UsuarioRiesgo {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  fechaRegistro: string | null;
  bloqueado: boolean;
  razonBloqueo: string | null;
  fechaBloqueo: string | null;
  totalIntercambios: number;
  totalEntradasTransferidas: number;
  alertasAbiertas: number;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
}

export interface ResultadoManualRequest {
  partidoId: number;
  golesLocal: number;
  golesVisitante: number;
  observacion?: string;
}

export interface ResultadoManualResponse {
  partidoId: number;
  golesLocal: number;
  golesVisitante: number;
  prediccionesRecalculadas: number;
  pollasAfectadas: number;
}

export interface ComunicadoRequest {
  titulo: string;
  mensaje: string;
  segmento: 'TODOS' | 'CIUDAD' | 'PARTIDO' | 'ROL';
  segmentoValor?: string;
  canales?: string[];
}

export interface ComunicadoProgreso {
  id: string;
  totalDestinatarios: number;
  enviados: number;
  fallidos: number;
  estado: 'EN_PROCESO' | 'COMPLETADO' | 'ERROR';
  iniciadoEn: string;
  finalizadoEn: string | null;
}

function unwrap<T>(data: { data?: T } | undefined): T {
  return (data?.data as T) ?? (null as unknown as T);
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

export async function listarAlertas(soloAbiertas = true): Promise<Alerta[]> {
  const { data } = await axios.get(`${BASE}/alertas`, {
    params: { soloAbiertas },
    headers: authHeaders(),
  });
  return unwrap<Alerta[]>(data) ?? [];
}

export async function revisarAlerta(id: number, revisada = true): Promise<Alerta> {
  const { data } = await axios.post(`${BASE}/alertas/${id}/revisar`, null, {
    params: { revisada },
    headers: authHeaders(),
  });
  return unwrap<Alerta>(data);
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export async function buscarLogs(filtro: LogsFilter): Promise<LogEntry[]> {
  const { data } = await axios.post(`${BASE}/logs/buscar`, filtro, {
    headers: authHeaders(),
  });
  return unwrap<LogEntry[]>(data) ?? [];
}

// ─── Usuarios (Gestión) ───────────────────────────────────────────────────────

export async function buscarUsuarios(q: string = ''): Promise<UsuarioRiesgo[]> {
  const { data } = await axios.get(`${BASE}/usuarios`, {
    params: q ? { q } : {},
    headers: authHeaders(),
  });
  return unwrap<UsuarioRiesgo[]>(data) ?? [];
}

export async function perfilRiesgo(id: number): Promise<UsuarioRiesgo> {
  const { data } = await axios.get(`${BASE}/usuarios/${id}/riesgo`, {
    headers: authHeaders(),
  });
  return unwrap<UsuarioRiesgo>(data);
}

export async function bloquearUsuario(id: number, razon: string): Promise<UsuarioRiesgo> {
  const { data } = await axios.post(
    `${BASE}/usuarios/${id}/bloquear`,
    { razon },
    { headers: authHeaders() },
  );
  return unwrap<UsuarioRiesgo>(data);
}

export async function desbloquearUsuario(id: number): Promise<UsuarioRiesgo> {
  const { data } = await axios.post(`${BASE}/usuarios/${id}/desbloquear`, null, {
    headers: authHeaders(),
  });
  return unwrap<UsuarioRiesgo>(data);
}

// ─── Admin: resultados manuales ───────────────────────────────────────────────

export async function cargarResultadoManual(
  req: ResultadoManualRequest,
): Promise<ResultadoManualResponse> {
  const { data } = await axios.post(`${BASE}/resultados-manual`, req, {
    headers: authHeaders(),
  });
  return unwrap<ResultadoManualResponse>(data);
}

// ─── Admin: comunicados masivos ───────────────────────────────────────────────

export async function enviarComunicado(req: ComunicadoRequest): Promise<ComunicadoProgreso> {
  const { data } = await axios.post(`${BASE}/comunicados`, req, {
    headers: authHeaders(),
  });
  return unwrap<ComunicadoProgreso>(data);
}

export async function obtenerProgresoComunicado(trackingId: string): Promise<ComunicadoProgreso> {
  const { data } = await axios.get(`${BASE}/comunicados/${trackingId}`, {
    headers: authHeaders(),
  });
  return unwrap<ComunicadoProgreso>(data);
}
