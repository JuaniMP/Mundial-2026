export interface Team {
  name: string;
  shortName: string;
  flag: string;
  group: string;
  primary: string;
  secondary: string;
  text: string;
}

export const TEAMS: Team[] = [
  // Group A — Anfitriones
  {
    name: 'Estados Unidos',
    shortName: 'USA',
    flag: '🇺🇸',
    group: 'A',
    primary: '#002868',
    secondary: '#BF0A30',
    text: '#ffffff',
  },
  {
    name: 'México',
    shortName: 'MEX',
    flag: '🇲🇽',
    group: 'A',
    primary: '#006847',
    secondary: '#CE1126',
    text: '#ffffff',
  },
  {
    name: 'Canadá',
    shortName: 'CAN',
    flag: '🇨🇦',
    group: 'A',
    primary: '#CC0000',
    secondary: '#ffffff',
    text: '#ffffff',
  },
  {
    name: 'Polonia',
    shortName: 'POL',
    flag: '🇵🇱',
    group: 'A',
    primary: '#DC143C',
    secondary: '#ffffff',
    text: '#ffffff',
  },
  // Group B
  {
    name: 'Brasil',
    shortName: 'BRA',
    flag: '🇧🇷',
    group: 'B',
    primary: '#009c3b',
    secondary: '#FFDF00',
    text: '#002776',
  },
  {
    name: 'Argentina',
    shortName: 'ARG',
    flag: '🇦🇷',
    group: 'B',
    primary: '#74ACDF',
    secondary: '#ffffff',
    text: '#ffffff',
  },
  {
    name: 'Francia',
    shortName: 'FRA',
    flag: '🇫🇷',
    group: 'B',
    primary: '#003189',
    secondary: '#ED2939',
    text: '#ffffff',
  },
  {
    name: 'Alemania',
    shortName: 'GER',
    flag: '🇩🇪',
    group: 'B',
    primary: '#222222',
    secondary: '#DD0000',
    text: '#ffffff',
  },
  // Group C
  {
    name: 'España',
    shortName: 'ESP',
    flag: '🇪🇸',
    group: 'C',
    primary: '#AA151B',
    secondary: '#F1BF00',
    text: '#ffffff',
  },
  {
    name: 'Inglaterra',
    shortName: 'ENG',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    group: 'C',
    primary: '#003F87',
    secondary: '#CF081F',
    text: '#ffffff',
  },
  {
    name: 'Italia',
    shortName: 'ITA',
    flag: '🇮🇹',
    group: 'C',
    primary: '#003DA5',
    secondary: '#CF101A',
    text: '#ffffff',
  },
  {
    name: 'Portugal',
    shortName: 'POR',
    flag: '🇵🇹',
    group: 'C',
    primary: '#006600',
    secondary: '#FF0000',
    text: '#ffffff',
  },
  // Group D
  {
    name: 'Países Bajos',
    shortName: 'NED',
    flag: '🇳🇱',
    group: 'D',
    primary: '#CC4700',
    secondary: '#003DA5',
    text: '#ffffff',
  },
  {
    name: 'Bélgica',
    shortName: 'BEL',
    flag: '🇧🇪',
    group: 'D',
    primary: '#EF3340',
    secondary: '#000000',
    text: '#ffffff',
  },
  {
    name: 'Croacia',
    shortName: 'CRO',
    flag: '🇭🇷',
    group: 'D',
    primary: '#CC0000',
    secondary: '#0000CC',
    text: '#ffffff',
  },
  {
    name: 'Japón',
    shortName: 'JPN',
    flag: '🇯🇵',
    group: 'D',
    primary: '#00247D',
    secondary: '#BC002D',
    text: '#ffffff',
  },
  // Group E
  {
    name: 'Uruguay',
    shortName: 'URU',
    flag: '🇺🇾',
    group: 'E',
    primary: '#4baae2',
    secondary: '#ffffff',
    text: '#ffffff',
  },
  {
    name: 'Colombia',
    shortName: 'COL',
    flag: '🇨🇴',
    group: 'E',
    primary: '#C8962C',
    secondary: '#003087',
    text: '#003087',
  },
  {
    name: 'Chile',
    shortName: 'CHI',
    flag: '🇨🇱',
    group: 'E',
    primary: '#D52B1E',
    secondary: '#003087',
    text: '#ffffff',
  },
  {
    name: 'Ecuador',
    shortName: 'ECU',
    flag: '🇪🇨',
    group: 'E',
    primary: '#c8a900',
    secondary: '#003DA5',
    text: '#003DA5',
  },
  // Group F
  {
    name: 'Marruecos',
    shortName: 'MAR',
    flag: '🇲🇦',
    group: 'F',
    primary: '#C1272D',
    secondary: '#006233',
    text: '#ffffff',
  },
  {
    name: 'Senegal',
    shortName: 'SEN',
    flag: '🇸🇳',
    group: 'F',
    primary: '#00853F',
    secondary: '#FDEF42',
    text: '#ffffff',
  },
  {
    name: 'Nigeria',
    shortName: 'NGA',
    flag: '🇳🇬',
    group: 'F',
    primary: '#008751',
    secondary: '#ffffff',
    text: '#ffffff',
  },
  {
    name: 'Ghana',
    shortName: 'GHA',
    flag: '🇬🇭',
    group: 'F',
    primary: '#006B3F',
    secondary: '#FCD116',
    text: '#ffffff',
  },
  // Group G
  {
    name: 'Australia',
    shortName: 'AUS',
    flag: '🇦🇺',
    group: 'G',
    primary: '#00008B',
    secondary: '#FFD700',
    text: '#ffffff',
  },
  {
    name: 'Corea del Sur',
    shortName: 'KOR',
    flag: '🇰🇷',
    group: 'G',
    primary: '#CD2E3A',
    secondary: '#003478',
    text: '#ffffff',
  },
  {
    name: 'Irán',
    shortName: 'IRN',
    flag: '🇮🇷',
    group: 'G',
    primary: '#239F40',
    secondary: '#DA0000',
    text: '#ffffff',
  },
  {
    name: 'Arabia Saudita',
    shortName: 'KSA',
    flag: '🇸🇦',
    group: 'G',
    primary: '#006C35',
    secondary: '#ffffff',
    text: '#ffffff',
  },
  // Group H
  {
    name: 'Serbia',
    shortName: 'SRB',
    flag: '🇷🇸',
    group: 'H',
    primary: '#C6363C',
    secondary: '#002395',
    text: '#ffffff',
  },
  {
    name: 'Suiza',
    shortName: 'SUI',
    flag: '🇨🇭',
    group: 'H',
    primary: '#DA0002',
    secondary: '#ffffff',
    text: '#ffffff',
  },
  {
    name: 'Dinamarca',
    shortName: 'DEN',
    flag: '🇩🇰',
    group: 'H',
    primary: '#C60C30',
    secondary: '#ffffff',
    text: '#ffffff',
  },
  {
    name: 'Suecia',
    shortName: 'SWE',
    flag: '🇸🇪',
    group: 'H',
    primary: '#006AA7',
    secondary: '#FECC02',
    text: '#ffffff',
  },
];

/** Team deterministically assigned based on lamina ID (10 stickers per team) */
export function getTeamForLamina(laminaId: number): Team {
  const idx = Math.floor((laminaId - 1) / 10) % TEAMS.length;
  return TEAMS[idx];
}

/** Slot number within the team (1‑10) */
export function getSlotInTeam(laminaId: number): number {
  return ((laminaId - 1) % 10) + 1;
}

export function getTeamByShortName(shortName: string): Team | undefined {
  return TEAMS.find((t) => t.shortName === shortName);
}
