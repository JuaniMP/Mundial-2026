import axios from 'axios';
import type {
  FdMatch,
  FdStandingsGroup,
  EstadioApi,
  SeleccionResponse,
  JugadorResponse,
  QualifierFixture,
  Confederation,
} from '../types';

const API_BASE = 'http://localhost:8082/api/v1/football';
const ESTADIOS_BASE = 'http://localhost:8082/api/v1/estadios';
const BACKEND_BASE = 'http://localhost:8082/api/v1';

// ── helper ───────────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = sessionStorage.getItem('token');
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

// ── Teams ─────────────────────────────────────────────────────────────────────

export interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  venue?: string;
  clubColors?: string;
}

export interface ApiPlayer {
  id: number;
  name: string;
  position?: string;
  dateOfBirth?: string;
  nationality?: string;
  shirtNumber?: number;
}

export interface ApiTeamDetail extends ApiTeam {
  squad: ApiPlayer[];
  coach?: { name: string; nationality?: string };
  address?: string;
  website?: string;
  founded?: number;
}

export async function fetchTeams(): Promise<ApiTeam[]> {
  const { data } = await axios.get(`${API_BASE}/teams`, { headers: getAuthHeaders() });
  return data?.data?.teams ?? [];
}

export async function fetchTeamSquad(teamId: number): Promise<ApiTeamDetail | null> {
  try {
    const { data } = await axios.get(`${API_BASE}/teams/${teamId}`, {
      headers: getAuthHeaders(),
    });
    return data?.data ?? null;
  } catch {
    return null;
  }
}

// ── Estadios / Venues ─────────────────────────────────────────────────────────
// Venues from World Cup 2026 (16 official FIFA stadiums).
// Tries backend first; falls back to embedded dataset with full details + photos.

import { WORLD_CUP_2026_STADIUMS } from '../data/worldCup2026Stadiums';

export async function fetchEstadios(): Promise<EstadioApi[]> {
  try {
    const { data } = await axios.get(ESTADIOS_BASE, { timeout: 4000 });
    const backendData: EstadioApi[] = data?.data ?? [];

    // If backend has data, enrich it with images/details from our static dataset
    if (backendData.length > 0) {
      return backendData.map((s) => {
        const match = WORLD_CUP_2026_STADIUMS.find(
          (w) =>
            w.nombre.toLowerCase() === s.nombre.toLowerCase() ||
            w.ciudad.toLowerCase() === s.ciudad.toLowerCase(),
        );
        return match
          ? {
              ...s,
              imagen: s.imagen ?? match.imagen,
              partidos: s.partidos ?? match.partidos,
              inaugurado: s.inaugurado ?? match.inaugurado,
              equipoLocal: s.equipoLocal ?? match.equipoLocal,
            }
          : s;
      });
    }
    // Backend returned empty → use full static dataset
    return WORLD_CUP_2026_STADIUMS;
  } catch {
    // Backend failed → use full static dataset
    return WORLD_CUP_2026_STADIUMS;
  }
}

// ── Selecciones ───────────────────────────────────────────────────────────────

export async function fetchSelecciones(): Promise<SeleccionResponse[]> {
  const { data } = await axios.get(`${BACKEND_BASE}/selecciones`, {
    headers: getAuthHeaders(),
  });
  return (data?.data as SeleccionResponse[]) ?? [];
}

export async function fetchSeleccionByCode(code: string): Promise<SeleccionResponse | null> {
  try {
    const { data } = await axios.get(`${BACKEND_BASE}/selecciones/codigo/${code}`, {
      headers: getAuthHeaders(),
    });
    return (data?.data as SeleccionResponse) ?? null;
  } catch {
    return null;
  }
}

export async function fetchJugadoresBySeleccion(id: number): Promise<JugadorResponse[]> {
  const { data } = await axios.get(`${BACKEND_BASE}/selecciones/${id}/jugadores`, {
    headers: getAuthHeaders(),
  });
  return (data?.data as JugadorResponse[]) ?? [];
}

// ── Qualifiers / Eliminatorias ────────────────────────────────────────────

export async function fetchQualifierMatches(
  confederation?: Confederation,
): Promise<QualifierFixture[]> {
  const params: Record<string, string> = {};
  if (confederation) params.confederation = confederation;
  const { data } = await axios.get(`${API_BASE}/qualifiers/matches`, {
    params,
    headers: getAuthHeaders(),
  });
  return data?.data?.matches ?? [];
}

export async function fetchQualifierStandings(
  confederation: Confederation,
): Promise<FdStandingsGroup[]> {
  const { data } = await axios.get(`${API_BASE}/qualifiers/standings`, {
    params: { confederation },
    headers: getAuthHeaders(),
  });
  return data?.data ?? [];
}

export const CONFEDERATIONS: {
  id: Confederation;
  label: string;
  emoji: string;
}[] = [
  { id: 'CONMEBOL', label: 'Sudamérica', emoji: '🌎' },
  { id: 'CONCACAF', label: 'Norte y Centroamérica', emoji: '🌎' },
  { id: 'UEFA', label: 'Europa', emoji: '🌍' },
  { id: 'AFC', label: 'Asia', emoji: '🌏' },
  { id: 'CAF', label: 'África', emoji: '🌍' },
  { id: 'OFC', label: 'Oceanía', emoji: '🌏' },
];

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatMatchDate(utcDate: string): { date: string; time: string } {
  const d = new Date(utcDate);
  return {
    date: d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Bogota',
    }),
    time: d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota',
    }),
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

export type BadgeVariant = 'primary' | 'accent' | 'danger' | 'secondary';

export function statusBadge(status: string): { label: string; color: BadgeVariant } {
  const map: Record<string, { label: string; color: BadgeVariant }> = {
    TIMED: { label: 'Programado', color: 'secondary' },
    SCHEDULED: { label: 'Programado', color: 'secondary' },
    LIVE: { label: '🔴 En Vivo', color: 'danger' },
    IN_PLAY: { label: '🔴 En Juego', color: 'danger' },
    PAUSED: { label: 'Descanso', color: 'accent' },
    FINISHED: { label: 'Finalizado', color: 'primary' },
    POSTPONED: { label: 'Postergado', color: 'accent' },
    CANCELLED: { label: 'Cancelado', color: 'danger' },
  };
  return map[status] ?? { label: status, color: 'secondary' };
}
