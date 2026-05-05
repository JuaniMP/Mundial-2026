export interface Team {
  id: string;
  name: string;
  code: string;
  flagUrl?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  venue: string;
  group: string;
  matchday: number;
}

export interface Stadium {
  id: string;
  name: string;
  location: string;
  capacity: number;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  team: Team;
  points: number;
  rank: number;
}

export interface Sticker {
  id: string;
  name: string;
  team: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
  isOwned: boolean;
}

export interface Album {
  totalStickers: number;
  ownedStickers: number;
  completionPercentage: number;
  stickers: Sticker[];
  packs: number;
  goldenStickers: number;
  progressByCountry: {
    country: string;
    color: string;
    percentage: number;
  }[];
}

// ── Football Data API types ──────────────────────────────────────────────────

export interface FdTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FdScore {
  winner: string | null;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface FdMatch {
  id: number;
  utcDate: string;
  status: 'TIMED' | 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  matchday: number;
  stage: string;
  group: string | null;
  venue: string | null;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score: FdScore;
}

export interface FdTableEntry {
  position: number;
  team: FdTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
}

export interface FdStandingsGroup {
  stage: string;
  type: string;
  group: string;
  table: FdTableEntry[];
}

// ── Estadio / Venue types ────────────────────────────────────────────────────

export interface EstadioApi {
  id: number;
  nombre: string;
  ciudad: string;
  pais: string;
  capacidad: number;
  lat: number;
  lng: number;
  direccion: string;
}

// ── Partido API (from our backend DB) ────────────────────────────────────────

export interface PartidoApi {
  id: number;
  fechaHora: string;
  ronda: string;
  estado: string;
  marcadorLocal: number;
  marcadorVisitante: number;
  idEstadio: number;
  estadioNombre: string;
  seleccionLocal: string;
  seleccionVisitante: string;
}

// ── Prediction types ─────────────────────────────────────────────────────────

export interface Prediction {
  id: string;
  match: Match;
  homeScore: number;
  awayScore: number;
  points: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  correctPredictions: number;
  trend: 'up' | 'down' | 'stable';
}