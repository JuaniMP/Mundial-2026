export interface Player {
  id: string;
  name: string;
  position: string;
  image?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  group: string;
  flagUrl: string;
  players: Player[];
  introStickers: string[]; // e.g. "Shield", "Team Photo"
}

// Generate 48 teams (Groups A-L)
const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Realistic core teams for the demo
const coreTeams = [
  { name: 'Mexico', code: 'MEX', group: 'A' },
  { name: 'South Africa', code: 'RSA', group: 'A' },
  { name: 'Korea Republic', code: 'KOR', group: 'A' },
  { name: 'Czechia', code: 'CZE', group: 'A' },

  { name: 'Canada', code: 'CAN', group: 'B' },
  { name: 'Bosnia-Herzegovina', code: 'BIH', group: 'B' },
  { name: 'Qatar', code: 'QAT', group: 'B' },
  { name: 'Switzerland', code: 'SUI', group: 'B' },

  { name: 'USA', code: 'USA', group: 'D' },
  { name: 'Paraguay', code: 'PAR', group: 'D' },
  { name: 'Australia', code: 'AUS', group: 'D' },
  { name: 'Türkiye', code: 'TUR', group: 'D' },
];

export const TEAMS: Team[] = [];

// Helper to get flag
function getFlagCode(code: string) {
  const map: Record<string, string> = {
    MEX: 'mx',
    RSA: 'za',
    KOR: 'kr',
    CZE: 'cz',
    CAN: 'ca',
    BIH: 'ba',
    QAT: 'qa',
    SUI: 'ch',
    USA: 'us',
    PAR: 'py',
    AUS: 'au',
    TUR: 'tr',
    BRA: 'br',
    ARG: 'ar',
    ENG: 'gb-eng',
    FRA: 'fr',
    ESP: 'es',
    GER: 'de',
    NED: 'nl',
    POR: 'pt',
    ITA: 'it',
    BEL: 'be',
    URU: 'uy',
    COL: 'co',
    CHI: 'cl',
    PER: 'pe',
    ECU: 'ec',
    VEN: 've',
  };
  return map[code] || code.toLowerCase().slice(0, 2);
}

// Populate the rest of the 48 teams
let currentGroupIdx = 0;
let teamsInGroup = 0;

for (let i = 0; i < 48; i++) {
  const core = coreTeams[i];
  const group = core ? core.group : groupLetters[currentGroupIdx];
  const name = core ? core.name : `Team ${i + 1}`;
  const code = core ? core.code : `T${i + 1}`;

  // Generate 12 dummy players for each team
  const players: Player[] = Array.from({ length: 12 }).map((_, pIdx) => ({
    id: `${code}_P${pIdx + 1}`,
    name: core && pIdx === 1 ? 'LUIS MALAGÓN' : `Player ${pIdx + 1}`,
    position: pIdx === 0 ? 'GK' : pIdx < 4 ? 'DEF' : pIdx < 8 ? 'MID' : 'FWD',
  }));

  TEAMS.push({
    id: code,
    name,
    code,
    group,
    flagUrl: `https://flagcdn.com/w80/${getFlagCode(code)}.png`,
    players,
    introStickers: [`${code}_SHIELD`, `${code}_TEAM_PHOTO`],
  });

  if (!core) {
    teamsInGroup++;
    if (teamsInGroup >= 4) {
      teamsInGroup = 0;
      currentGroupIdx++;
    }
  }
}
