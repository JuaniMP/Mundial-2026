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