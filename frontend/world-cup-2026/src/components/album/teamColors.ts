export interface Stadium {
  name: string;
  city: string;
  image: string;
}

export interface Team {
  name: string;
  shortName: string;
  flag: string;
  /** ISO-2 lowercase para flagcdn.com (mx, ar, br, ...) */
  isoCode: string;
  group: string;
  primary: string;
  secondary: string;
  text: string;
  stadium: Stadium;
}

function hslToHex(h: number, s: number, l: number) {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  const hueToRgb = (p: number, q: number, t: number) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };

  let red: number;
  let green: number;
  let blue: number;

  if (saturation === 0) {
    red = green = blue = lightness;
  } else {
    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    red = hueToRgb(p, q, hue + 1 / 3);
    green = hueToRgb(p, q, hue);
    blue = hueToRgb(p, q, hue - 1 / 3);
  }

  const toHex = (value: number) => {
    const hex = Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
    return hex;
  };

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function paletteFor(code: string) {
  let hash = 0;
  for (const char of code) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }

  return {
    primary: hslToHex(hash, 68, 40),
    secondary: hslToHex((hash + 34) % 360, 74, 56),
    text: '#ffffff',
  };
}

function makeTeam(spec: {
  name: string;
  shortName: string;
  flag: string;
  isoCode: string;
  group: string;
  stadium: Stadium;
}): Team {
  return {
    ...spec,
    ...paletteFor(spec.shortName),
  };
}

/** Estadios anfitriones del Mundial 2026 (USA / Canadá / México) */
const ST_AZTECA: Stadium = {
  name: 'Estadio Azteca',
  city: 'Ciudad de México, México',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Estadio_Azteca_2015.jpg/1280px-Estadio_Azteca_2015.jpg',
};
const ST_AKRON: Stadium = {
  name: 'Estadio Akron',
  city: 'Guadalajara, México',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Estadio_Akron_panor%C3%A1mica.jpg/1280px-Estadio_Akron_panor%C3%A1mica.jpg',
};
const ST_BBVA: Stadium = {
  name: 'Estadio BBVA',
  city: 'Monterrey, México',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Estadio_BBVA_-_2017.jpg/1280px-Estadio_BBVA_-_2017.jpg',
};
const ST_METLIFE: Stadium = {
  name: 'MetLife Stadium',
  city: 'New York / New Jersey, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/MetLife_Stadium_%28Aerial_view%29.jpg/1280px-MetLife_Stadium_%28Aerial_view%29.jpg',
};
const ST_SOFI: Stadium = {
  name: 'SoFi Stadium',
  city: 'Los Ángeles, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/SoFi_Stadium_at_Halloween_2021.jpg/1280px-SoFi_Stadium_at_Halloween_2021.jpg',
};
const ST_ATT: Stadium = {
  name: 'AT&T Stadium',
  city: 'Dallas, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/At%26t_stadium_dallas_cowboys.jpg/1280px-At%26t_stadium_dallas_cowboys.jpg',
};
const ST_HARDROCK: Stadium = {
  name: 'Hard Rock Stadium',
  city: 'Miami, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Hard_Rock_Stadium_2016.jpg/1280px-Hard_Rock_Stadium_2016.jpg',
};
const ST_GILLETTE: Stadium = {
  name: 'Gillette Stadium',
  city: 'Boston, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Gillette_Stadium_outside_view.jpg/1280px-Gillette_Stadium_outside_view.jpg',
};
const ST_ARROWHEAD: Stadium = {
  name: 'Arrowhead Stadium',
  city: 'Kansas City, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Arrowhead_Stadium_aerial.jpg/1280px-Arrowhead_Stadium_aerial.jpg',
};
const ST_LEVI: Stadium = {
  name: 'Levi’s Stadium',
  city: 'San Francisco, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Levi%27s_Stadium_pano.jpg/1280px-Levi%27s_Stadium_pano.jpg',
};
const ST_LINCOLN: Stadium = {
  name: 'Lincoln Financial Field',
  city: 'Philadelphia, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Lincoln_Financial_Field_2017.jpg/1280px-Lincoln_Financial_Field_2017.jpg',
};
const ST_MERCEDES: Stadium = {
  name: 'Mercedes-Benz Stadium',
  city: 'Atlanta, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mercedes-Benz_Stadium_in_2020.jpg/1280px-Mercedes-Benz_Stadium_in_2020.jpg',
};
const ST_BCPLACE: Stadium = {
  name: 'BC Place',
  city: 'Vancouver, Canadá',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/BC_Place_at_night.jpg/1280px-BC_Place_at_night.jpg',
};
const ST_BMO: Stadium = {
  name: 'BMO Field',
  city: 'Toronto, Canadá',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/BMO_Field_-_Toronto_FC_vs_New_England.jpg/1280px-BMO_Field_-_Toronto_FC_vs_New_England.jpg',
};
const ST_NRG: Stadium = {
  name: 'NRG Stadium',
  city: 'Houston, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Reliant_Stadium_full.jpg/1280px-Reliant_Stadium_full.jpg',
};
const ST_LUMEN: Stadium = {
  name: 'Lumen Field',
  city: 'Seattle, USA',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Lumen_Field%2C_July_2022.jpg/1280px-Lumen_Field%2C_July_2022.jpg',
};

export const TEAMS: Team[] = [
  // Group A
  makeTeam({
    name: 'México',
    shortName: 'MEX',
    flag: '🇲🇽',
    isoCode: 'mx',
    group: 'A',
    stadium: ST_AZTECA,
  }),
  makeTeam({
    name: 'Sudáfrica',
    shortName: 'RSA',
    flag: '🇿🇦',
    isoCode: 'za',
    group: 'A',
    stadium: ST_AKRON,
  }),
  makeTeam({
    name: 'Corea del Sur',
    shortName: 'KOR',
    flag: '🇰🇷',
    isoCode: 'kr',
    group: 'A',
    stadium: ST_AZTECA,
  }),
  makeTeam({
    name: 'Chequia',
    shortName: 'CZE',
    flag: '🇨🇿',
    isoCode: 'cz',
    group: 'A',
    stadium: ST_BBVA,
  }),
  // Group B
  makeTeam({
    name: 'Canadá',
    shortName: 'CAN',
    flag: '🇨🇦',
    isoCode: 'ca',
    group: 'B',
    stadium: ST_BCPLACE,
  }),
  makeTeam({
    name: 'Bosnia y Herzegovina',
    shortName: 'BIH',
    flag: '🇧🇦',
    isoCode: 'ba',
    group: 'B',
    stadium: ST_BMO,
  }),
  makeTeam({
    name: 'Catar',
    shortName: 'QAT',
    flag: '🇶🇦',
    isoCode: 'qa',
    group: 'B',
    stadium: ST_BCPLACE,
  }),
  makeTeam({
    name: 'Suiza',
    shortName: 'SUI',
    flag: '🇨🇭',
    isoCode: 'ch',
    group: 'B',
    stadium: ST_BMO,
  }),
  // Group C
  makeTeam({
    name: 'Brasil',
    shortName: 'BRA',
    flag: '🇧🇷',
    isoCode: 'br',
    group: 'C',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Marruecos',
    shortName: 'MAR',
    flag: '🇲🇦',
    isoCode: 'ma',
    group: 'C',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Haití',
    shortName: 'HAI',
    flag: '🇭🇹',
    isoCode: 'ht',
    group: 'C',
    stadium: ST_LINCOLN,
  }),
  makeTeam({
    name: 'Escocia',
    shortName: 'SCO',
    flag: '🏴',
    isoCode: 'gb-sct',
    group: 'C',
    stadium: ST_GILLETTE,
  }),
  // Group D
  makeTeam({
    name: 'Estados Unidos',
    shortName: 'USA',
    flag: '🇺🇸',
    isoCode: 'us',
    group: 'D',
    stadium: ST_SOFI,
  }),
  makeTeam({
    name: 'Paraguay',
    shortName: 'PAR',
    flag: '🇵🇾',
    isoCode: 'py',
    group: 'D',
    stadium: ST_HARDROCK,
  }),
  makeTeam({
    name: 'Australia',
    shortName: 'AUS',
    flag: '🇦🇺',
    isoCode: 'au',
    group: 'D',
    stadium: ST_LEVI,
  }),
  makeTeam({
    name: 'Türkiye',
    shortName: 'TUR',
    flag: '🇹🇷',
    isoCode: 'tr',
    group: 'D',
    stadium: ST_MERCEDES,
  }),
  // Group E
  makeTeam({
    name: 'Alemania',
    shortName: 'GER',
    flag: '🇩🇪',
    isoCode: 'de',
    group: 'E',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Curazao',
    shortName: 'CUW',
    flag: '🇨🇼',
    isoCode: 'cw',
    group: 'E',
    stadium: ST_HARDROCK,
  }),
  makeTeam({
    name: 'Costa de Marfil',
    shortName: 'CIV',
    flag: '🇨🇮',
    isoCode: 'ci',
    group: 'E',
    stadium: ST_ATT,
  }),
  makeTeam({
    name: 'Ecuador',
    shortName: 'ECU',
    flag: '🇪🇨',
    isoCode: 'ec',
    group: 'E',
    stadium: ST_NRG,
  }),
  // Group F
  makeTeam({
    name: 'Países Bajos',
    shortName: 'NED',
    flag: '🇳🇱',
    isoCode: 'nl',
    group: 'F',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Japón',
    shortName: 'JPN',
    flag: '🇯🇵',
    isoCode: 'jp',
    group: 'F',
    stadium: ST_LUMEN,
  }),
  makeTeam({
    name: 'Suecia',
    shortName: 'SWE',
    flag: '🇸🇪',
    isoCode: 'se',
    group: 'F',
    stadium: ST_GILLETTE,
  }),
  makeTeam({
    name: 'Túnez',
    shortName: 'TUN',
    flag: '🇹🇳',
    isoCode: 'tn',
    group: 'F',
    stadium: ST_LINCOLN,
  }),
  // Group G
  makeTeam({
    name: 'Bélgica',
    shortName: 'BEL',
    flag: '🇧🇪',
    isoCode: 'be',
    group: 'G',
    stadium: ST_BMO,
  }),
  makeTeam({
    name: 'Egipto',
    shortName: 'EGY',
    flag: '🇪🇬',
    isoCode: 'eg',
    group: 'G',
    stadium: ST_MERCEDES,
  }),
  makeTeam({
    name: 'Irán',
    shortName: 'IRN',
    flag: '🇮🇷',
    isoCode: 'ir',
    group: 'G',
    stadium: ST_ARROWHEAD,
  }),
  makeTeam({
    name: 'Nueva Zelanda',
    shortName: 'NZL',
    flag: '🇳🇿',
    isoCode: 'nz',
    group: 'G',
    stadium: ST_LEVI,
  }),
  // Group H
  makeTeam({
    name: 'España',
    shortName: 'ESP',
    flag: '🇪🇸',
    isoCode: 'es',
    group: 'H',
    stadium: ST_SOFI,
  }),
  makeTeam({
    name: 'Cabo Verde',
    shortName: 'CPV',
    flag: '🇨🇻',
    isoCode: 'cv',
    group: 'H',
    stadium: ST_LINCOLN,
  }),
  makeTeam({
    name: 'Arabia Saudita',
    shortName: 'KSA',
    flag: '🇸🇦',
    isoCode: 'sa',
    group: 'H',
    stadium: ST_NRG,
  }),
  makeTeam({
    name: 'Uruguay',
    shortName: 'URU',
    flag: '🇺🇾',
    isoCode: 'uy',
    group: 'H',
    stadium: ST_HARDROCK,
  }),
  // Group I
  makeTeam({
    name: 'Francia',
    shortName: 'FRA',
    flag: '🇫🇷',
    isoCode: 'fr',
    group: 'I',
    stadium: ST_ATT,
  }),
  makeTeam({
    name: 'Senegal',
    shortName: 'SEN',
    flag: '🇸🇳',
    isoCode: 'sn',
    group: 'I',
    stadium: ST_NRG,
  }),
  makeTeam({
    name: 'Irak',
    shortName: 'IRQ',
    flag: '🇮🇶',
    isoCode: 'iq',
    group: 'I',
    stadium: ST_ARROWHEAD,
  }),
  makeTeam({
    name: 'Noruega',
    shortName: 'NOR',
    flag: '🇳🇴',
    isoCode: 'no',
    group: 'I',
    stadium: ST_GILLETTE,
  }),
  // Group J
  makeTeam({
    name: 'Argentina',
    shortName: 'ARG',
    flag: '🇦🇷',
    isoCode: 'ar',
    group: 'J',
    stadium: ST_AZTECA,
  }),
  makeTeam({
    name: 'Argelia',
    shortName: 'ALG',
    flag: '🇩🇿',
    isoCode: 'dz',
    group: 'J',
    stadium: ST_MERCEDES,
  }),
  makeTeam({
    name: 'Austria',
    shortName: 'AUT',
    flag: '🇦🇹',
    isoCode: 'at',
    group: 'J',
    stadium: ST_LEVI,
  }),
  makeTeam({
    name: 'Jordania',
    shortName: 'JOR',
    flag: '🇯🇴',
    isoCode: 'jo',
    group: 'J',
    stadium: ST_NRG,
  }),
  // Group K
  makeTeam({
    name: 'Portugal',
    shortName: 'POR',
    flag: '🇵🇹',
    isoCode: 'pt',
    group: 'K',
    stadium: ST_SOFI,
  }),
  makeTeam({
    name: 'RD Congo',
    shortName: 'COD',
    flag: '🇨🇩',
    isoCode: 'cd',
    group: 'K',
    stadium: ST_LUMEN,
  }),
  makeTeam({
    name: 'Uzbekistán',
    shortName: 'UZB',
    flag: '🇺🇿',
    isoCode: 'uz',
    group: 'K',
    stadium: ST_ARROWHEAD,
  }),
  makeTeam({
    name: 'Colombia',
    shortName: 'COL',
    flag: '🇨🇴',
    isoCode: 'co',
    group: 'K',
    stadium: ST_BBVA,
  }),
  // Group L
  makeTeam({
    name: 'Inglaterra',
    shortName: 'ENG',
    flag: '🏴',
    isoCode: 'gb-eng',
    group: 'L',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Croacia',
    shortName: 'CRO',
    flag: '🇭🇷',
    isoCode: 'hr',
    group: 'L',
    stadium: ST_LINCOLN,
  }),
  makeTeam({
    name: 'Ghana',
    shortName: 'GHA',
    flag: '🇬🇭',
    isoCode: 'gh',
    group: 'L',
    stadium: ST_LUMEN,
  }),
  makeTeam({
    name: 'Panamá',
    shortName: 'PAN',
    flag: '🇵🇦',
    isoCode: 'pa',
    group: 'L',
    stadium: ST_BMO,
  }),
];

/**
 * The 21 teams in the DB, ordered by their lamina ID range.
 * Each team occupies exactly 14 consecutive sticker IDs:
 *   Estados Unidos  →  1–14
 *   México          → 15–28
 *   Canadá          → 29–42
 *   Argentina       → 43–56
 *   Brasil          → 57–70
 *   Colombia        → 71–84
 *   Uruguay         → 85–98
 *   Chile           → 99–112
 *   Ecuador         → 113–126
 *   España          → 127–140
 *   Francia         → 141–154
 *   Alemania        → 155–168
 *   Inglaterra      → 169–182
 *   Italia          → 183–196
 *   Portugal        → 197–210
 *   Países Bajos    → 211–224
 *   Bélgica         → 225–238
 *   Croacia         → 239–252
 *   Japón           → 253–266
 *   Corea del Sur   → 267–280
 *   Marruecos       → 281–294
 */
const DB_TEAMS: Team[] = [
  makeTeam({
    name: 'Estados Unidos',
    shortName: 'USA',
    flag: '🇺🇸',
    isoCode: 'us',
    group: 'D',
    stadium: ST_SOFI,
  }),
  makeTeam({
    name: 'México',
    shortName: 'MEX',
    flag: '🇲🇽',
    isoCode: 'mx',
    group: 'A',
    stadium: ST_AZTECA,
  }),
  makeTeam({
    name: 'Canadá',
    shortName: 'CAN',
    flag: '🇨🇦',
    isoCode: 'ca',
    group: 'B',
    stadium: ST_BCPLACE,
  }),
  makeTeam({
    name: 'Argentina',
    shortName: 'ARG',
    flag: '🇦🇷',
    isoCode: 'ar',
    group: 'J',
    stadium: ST_AZTECA,
  }),
  makeTeam({
    name: 'Brasil',
    shortName: 'BRA',
    flag: '🇧🇷',
    isoCode: 'br',
    group: 'C',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Colombia',
    shortName: 'COL',
    flag: '🇨🇴',
    isoCode: 'co',
    group: 'K',
    stadium: ST_BBVA,
  }),
  makeTeam({
    name: 'Uruguay',
    shortName: 'URU',
    flag: '🇺🇾',
    isoCode: 'uy',
    group: 'H',
    stadium: ST_HARDROCK,
  }),
  makeTeam({
    name: 'Chile',
    shortName: 'CHI',
    flag: '🇨🇱',
    isoCode: 'cl',
    group: '-',
    stadium: ST_NRG,
  }),
  makeTeam({
    name: 'Ecuador',
    shortName: 'ECU',
    flag: '🇪🇨',
    isoCode: 'ec',
    group: 'E',
    stadium: ST_NRG,
  }),
  makeTeam({
    name: 'España',
    shortName: 'ES',
    flag: '🇪🇸',
    isoCode: 'es',
    group: 'H',
    stadium: ST_SOFI,
  }),
  makeTeam({
    name: 'Francia',
    shortName: 'FRA',
    flag: '🇫🇷',
    isoCode: 'fr',
    group: 'I',
    stadium: ST_ATT,
  }),
  makeTeam({
    name: 'Alemania',
    shortName: 'GER',
    flag: '🇩🇪',
    isoCode: 'de',
    group: 'E',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Inglaterra',
    shortName: 'ENG',
    flag: '🏴',
    isoCode: 'gb-eng',
    group: 'L',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Italia',
    shortName: 'ITA',
    flag: '🇮🇹',
    isoCode: 'it',
    group: '-',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Portugal',
    shortName: 'POR',
    flag: '🇵🇹',
    isoCode: 'pt',
    group: 'K',
    stadium: ST_SOFI,
  }),
  makeTeam({
    name: 'Países Bajos',
    shortName: 'NED',
    flag: '🇳🇱',
    isoCode: 'nl',
    group: 'F',
    stadium: ST_METLIFE,
  }),
  makeTeam({
    name: 'Bélgica',
    shortName: 'BEL',
    flag: '🇧🇪',
    isoCode: 'be',
    group: 'G',
    stadium: ST_BMO,
  }),
  makeTeam({
    name: 'Croacia',
    shortName: 'CRO',
    flag: '🇭🇷',
    isoCode: 'hr',
    group: 'L',
    stadium: ST_LINCOLN,
  }),
  makeTeam({
    name: 'Japón',
    shortName: 'JPN',
    flag: '🇯🇵',
    isoCode: 'jp',
    group: 'F',
    stadium: ST_LUMEN,
  }),
  makeTeam({
    name: 'Corea del Sur',
    shortName: 'KOR',
    flag: '🇰🇷',
    isoCode: 'kr',
    group: 'A',
    stadium: ST_AZTECA,
  }),
  makeTeam({
    name: 'Marruecos',
    shortName: 'MAR',
    flag: '🇲🇦',
    isoCode: 'ma',
    group: 'C',
    stadium: ST_METLIFE,
  }),
];

const FALLBACK_TEAM: Team = {
  name: 'Especial',
  shortName: 'SPEC',
  flag: '⭐',
  isoCode: 'un',
  group: '-',
  primary: '#002868',
  secondary: '#C8102E',
  text: '#ffffff',
  stadium: ST_AZTECA,
};

/**
 * Team deterministically assigned based on lamina ID.
 * Uses the real DB structure: 21 teams × 14 stickers each (IDs 1–294).
 */
export function getTeamForLamina(laminaId: number): Team {
  const idx = Math.floor((laminaId - 1) / 14);
  return idx < DB_TEAMS.length ? DB_TEAMS[idx] : FALLBACK_TEAM;
}

/** Slot number within the team (1–14) */
export function getSlotInTeam(laminaId: number): number {
  return ((laminaId - 1) % 14) + 1;
}

export function getTeamByShortName(shortName: string): Team | undefined {
  return (
    DB_TEAMS.find((t) => t.shortName === shortName) ?? TEAMS.find((t) => t.shortName === shortName)
  );
}

/** Match by seleccionNombre (exact then partial, case-insensitive). Searches DB teams first. */
export function getTeamBySeleccion(nombre: string | null | undefined): Team {
  if (!nombre) return FALLBACK_TEAM;
  const q = nombre.toLowerCase();
  const searchIn = (teams: Team[]) =>
    teams.find((t) => t.name.toLowerCase() === q || t.shortName.toLowerCase() === q) ??
    teams.find((t) => t.name.toLowerCase().includes(q) || q.includes(t.name.toLowerCase()));
  return searchIn(DB_TEAMS) ?? searchIn(TEAMS) ?? FALLBACK_TEAM;
}
