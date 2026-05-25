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

import { TEAMS as ALBUM_TEAMS } from '../components/album/teamColors';

export const TEAMS: Team[] = ALBUM_TEAMS.map((team) => {
  const code = team.shortName;
  const players: Player[] = Array.from({ length: 12 }).map((_, pIdx) => ({
    id: `${code}_P${pIdx + 1}`,
    name: pIdx === 1 ? `${team.name.toUpperCase()} CAPTAIN` : `Player ${pIdx + 1}`,
    position: pIdx === 0 ? 'GK' : pIdx < 4 ? 'DEF' : pIdx < 8 ? 'MID' : 'FWD',
  }));

  return {
    id: code.toLowerCase(),
    name: team.name,
    code,
    group: team.group,
    flagUrl: `https://flagcdn.com/w80/${getFlagCode(code)}.png`,
    players,
    introStickers: [`${code}_SHIELD`, `${code}_TEAM_PHOTO`],
  };
});

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
