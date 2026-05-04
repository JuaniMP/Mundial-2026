import type { Team, Match, Stadium, User, Sticker, Album } from '../types';

export const teams: Team[] = [
  {
    id: 'mex',
    name: 'Mexico',
    code: 'MEX',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg',
  },
  {
    id: 'usa',
    name: 'USA',
    code: 'USA',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg',
  },
  {
    id: 'can',
    name: 'Canada',
    code: 'CAN',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_-_盎斯.svg',
  },
  {
    id: 'eng',
    name: 'England',
    code: 'ENG',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_the_United_Kingdom.svg',
  },
  {
    id: 'bra',
    name: 'Brazil',
    code: 'BRA',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg',
  },
  {
    id: 'arg',
    name: 'Argentina',
    code: 'ARG',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg',
  },
  {
    id: 'fra',
    name: 'France',
    code: 'FRA',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg',
  },
  {
    id: 'ger',
    name: 'Germany',
    code: 'GER',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg',
  },
];

export const stadiums: Stadium[] = [
  { id: 'azteca', name: 'Estadio Azteca', location: 'Mexico City, Mexico', capacity: 83264 },
  { id: 'metlife', name: 'MetLife Stadium', location: 'East Rutherford, NJ, USA', capacity: 82000 },
  { id: 'sofi', name: 'SoFi Stadium', location: 'Inglewood, CA, USA', capacity: 70000 },
  { id: 'bcplace', name: 'BC Place', location: 'Vancouver, Canada', capacity: 54000 },
  { id: 'nrg', name: 'NRG Stadium', location: 'Houston, TX, USA', capacity: 72000 },
  {
    id: ' Arrowhead',
    name: 'Arrowhead Stadium',
    location: 'Kansas City, MO, USA',
    capacity: 73000,
  },
];

export const matches: Match[] = [
  {
    id: 'match-1',
    homeTeam: teams[0],
    awayTeam: teams[3],
    date: 'June 11, 2026',
    time: '15:00 CST',
    venue: 'Estadio Azteca',
    group: 'A',
    matchday: 1,
  },
  {
    id: 'match-2',
    homeTeam: teams[1],
    awayTeam: teams[7],
    date: 'June 12, 2026',
    time: '18:00 EST',
    venue: 'MetLife Stadium',
    group: 'A',
    matchday: 1,
  },
  {
    id: 'match-3',
    homeTeam: teams[2],
    awayTeam: teams[4],
    date: 'June 12, 2026',
    time: '15:00 PST',
    venue: 'BC Place',
    group: 'B',
    matchday: 1,
  },
];

export const currentUser: User = {
  id: 'user-1',
  name: 'Elena M.',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  team: teams[2],
  points: 2450,
  rank: 42,
};

export const leaderboardUsers: User[] = [
  { id: 'user-2', name: 'Carlos R.', team: teams[0], points: 3200, rank: 1 },
  { id: 'user-3', name: 'Sarah J.', team: teams[1], points: 3150, rank: 2 },
  { id: 'user-4', name: 'Miguel S.', team: teams[4], points: 3100, rank: 3 },
  { id: 'user-5', name: 'Emma W.', team: teams[2], points: 3000, rank: 4 },
  { id: 'user-6', name: 'Lucas M.', team: teams[3], points: 2950, rank: 5 },
  { id: 'user-7', name: 'Ana P.', team: teams[5], points: 2800, rank: 6 },
  { id: 'user-8', name: 'James K.', team: teams[6], points: 2700, rank: 7 },
  { id: 'user-9', name: 'Maria G.', team: teams[7], points: 2600, rank: 8 },
];

export const mockStickers: Sticker[] = [
  { id: 's1', name: 'Goal Celebration', team: 'MEX', rarity: 'common', isOwned: true },
  { id: 's2', name: 'Stadium Azteca', team: 'MEX', rarity: 'rare', isOwned: true },
  { id: 's3', name: 'Champion Trophy', team: 'FIFA', rarity: 'legendary', isOwned: false },
  { id: 's4', name: 'Flag Wave', team: 'USA', rarity: 'common', isOwned: true },
  { id: 's5', name: 'Ball Control', team: 'CAN', rarity: 'epic', isOwned: true },
  { id: 's6', name: 'Trophy Gold', team: 'FIFA', rarity: 'legendary', isOwned: false },
  { id: 's7', name: 'Team Spirit', team: 'ENG', rarity: 'rare', isOwned: true },
  { id: 's8', name: 'Victory Dance', team: 'BRA', rarity: 'epic', isOwned: false },
];

export const mockAlbum: Album = {
  totalStickers: 678,
  ownedStickers: 432,
  completionPercentage: 64,
  stickers: mockStickers,
  packs: 8,
  goldenStickers: 12,
  progressByCountry: [
    { country: 'MEX', color: '#004e34', percentage: 35 },
    { country: 'USA', color: '#465f88', percentage: 20 },
    { country: 'CAN', color: '#8b0700', percentage: 9 },
  ],
};
