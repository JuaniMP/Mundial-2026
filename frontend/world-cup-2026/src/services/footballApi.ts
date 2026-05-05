import axios from 'axios';
import type { FdMatch, FdStandingsGroup, EstadioApi } from '../types';

const API_BASE = 'http://localhost:8082/api/v1/football';
const ESTADIOS_BASE = 'http://localhost:8082/api/v1/estadios';

// ── helper ───────────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Matches ───────────────────────────────────────────────────────────────────

export async function fetchAllMatches(): Promise<FdMatch[]> {
  const { data } = await axios.get(`${API_BASE}/matches`, { headers: getAuthHeaders() });
  return data?.data?.matches ?? [];
}

export async function fetchMatchesByStage(stage: string): Promise<FdMatch[]> {
  const { data } = await axios.get(`${API_BASE}/matches`, {
    params: { stage },
    headers: getAuthHeaders(),
  });
  return data?.data?.matches ?? [];
}

export async function fetchMatchesByMatchday(matchday: number): Promise<FdMatch[]> {
  const { data } = await axios.get(`${API_BASE}/matches`, {
    params: { matchday },
    headers: getAuthHeaders(),
  });
  return data?.data?.matches ?? [];
}

// ── Standings ─────────────────────────────────────────────────────────────────

export async function fetchStandings(): Promise<FdStandingsGroup[]> {
  const { data } = await axios.get(`${API_BASE}/standings`, { headers: getAuthHeaders() });
  return data?.data?.standings ?? [];
}

// ── Estadios ──────────────────────────────────────────────────────────────────

export async function fetchEstadios(): Promise<EstadioApi[]> {
  const { data } = await axios.get(ESTADIOS_BASE);
  return data?.data ?? [];
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatMatchDate(utcDate: string): { date: string; time: string } {
  const d = new Date(utcDate);
  return {
    date: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Bogota' }),
    time: d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' }),
  };
}

export function groupLabel(group: string | null): string {
  if (!group) return '';
  return group.replace('GROUP_', 'Grupo ');
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    GROUP_STAGE: 'Fase de Grupos',
    ROUND_OF_16: 'Octavos de Final',
    QUARTER_FINALS: 'Cuartos de Final',
    SEMI_FINALS: 'Semifinales',
    THIRD_PLACE: 'Tercer Lugar',
    FINAL: 'Final',
  };
  return labels[stage] ?? stage;
}

export function statusBadge(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    TIMED:     { label: 'Programado', color: 'secondary' },
    SCHEDULED: { label: 'Programado', color: 'secondary' },
    LIVE:      { label: '🔴 En Vivo', color: 'danger' },
    IN_PLAY:   { label: '🔴 En Juego', color: 'danger' },
    PAUSED:    { label: 'Descanso', color: 'warning' },
    FINISHED:  { label: 'Finalizado', color: 'primary' },
    POSTPONED: { label: 'Postergado', color: 'warning' },
    CANCELLED: { label: 'Cancelado', color: 'danger' },
  };
  return map[status] ?? { label: status, color: 'secondary' };
}
