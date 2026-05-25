export interface Team {
  name: string;
  shortName: string;
  flag: string;
  group: string;
  primary: string;
  secondary: string;
  text: string;
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

function makeTeam(spec: { name: string; shortName: string; flag: string; group: string }): Team {
  return {
    ...spec,
    ...paletteFor(spec.shortName),
  };
}

export const TEAMS: Team[] = [
  // Group A
  makeTeam({ name: 'México', shortName: 'MEX', flag: '🇲🇽', group: 'A' }),
  makeTeam({ name: 'Sudáfrica', shortName: 'RSA', flag: '🇿🇦', group: 'A' }),
  makeTeam({ name: 'Corea del Sur', shortName: 'KOR', flag: '🇰🇷', group: 'A' }),
  makeTeam({ name: 'Chequia', shortName: 'CZE', flag: '🇨🇿', group: 'A' }),
  // Group B
  makeTeam({ name: 'Canadá', shortName: 'CAN', flag: '🇨🇦', group: 'B' }),
  makeTeam({ name: 'Bosnia y Herzegovina', shortName: 'BIH', flag: '🇧🇦', group: 'B' }),
  makeTeam({ name: 'Catar', shortName: 'QAT', flag: '🇶🇦', group: 'B' }),
  makeTeam({ name: 'Suiza', shortName: 'SUI', flag: '🇨🇭', group: 'B' }),
  // Group C
  makeTeam({ name: 'Brasil', shortName: 'BRA', flag: '🇧🇷', group: 'C' }),
  makeTeam({ name: 'Marruecos', shortName: 'MAR', flag: '🇲🇦', group: 'C' }),
  makeTeam({ name: 'Haití', shortName: 'HAI', flag: '🇭🇹', group: 'C' }),
  makeTeam({ name: 'Escocia', shortName: 'SCO', flag: '🏴', group: 'C' }),
  // Group D
  makeTeam({ name: 'Estados Unidos', shortName: 'USA', flag: '🇺🇸', group: 'D' }),
  makeTeam({ name: 'Paraguay', shortName: 'PAR', flag: '🇵🇾', group: 'D' }),
  makeTeam({ name: 'Australia', shortName: 'AUS', flag: '🇦🇺', group: 'D' }),
  makeTeam({ name: 'Türkiye', shortName: 'TUR', flag: '🇹🇷', group: 'D' }),
  // Group E
  makeTeam({ name: 'Alemania', shortName: 'GER', flag: '🇩🇪', group: 'E' }),
  makeTeam({ name: 'Curazao', shortName: 'CUW', flag: '🇨🇼', group: 'E' }),
  makeTeam({ name: 'Costa de Marfil', shortName: 'CIV', flag: '🇨🇮', group: 'E' }),
  makeTeam({ name: 'Ecuador', shortName: 'ECU', flag: '🇪🇨', group: 'E' }),
  // Group F
  makeTeam({ name: 'Países Bajos', shortName: 'NED', flag: '🇳🇱', group: 'F' }),
  makeTeam({ name: 'Japón', shortName: 'JPN', flag: '🇯🇵', group: 'F' }),
  makeTeam({ name: 'Suecia', shortName: 'SWE', flag: '🇸🇪', group: 'F' }),
  makeTeam({ name: 'Túnez', shortName: 'TUN', flag: '🇹🇳', group: 'F' }),
  // Group G
  makeTeam({ name: 'Bélgica', shortName: 'BEL', flag: '🇧🇪', group: 'G' }),
  makeTeam({ name: 'Egipto', shortName: 'EGY', flag: '🇪🇬', group: 'G' }),
  makeTeam({ name: 'Irán', shortName: 'IRN', flag: '🇮🇷', group: 'G' }),
  makeTeam({ name: 'Nueva Zelanda', shortName: 'NZL', flag: '🇳🇿', group: 'G' }),
  // Group H
  makeTeam({ name: 'España', shortName: 'ESP', flag: '🇪🇸', group: 'H' }),
  makeTeam({ name: 'Cabo Verde', shortName: 'CPV', flag: '🇨🇻', group: 'H' }),
  makeTeam({ name: 'Arabia Saudita', shortName: 'KSA', flag: '🇸🇦', group: 'H' }),
  makeTeam({ name: 'Uruguay', shortName: 'URU', flag: '🇺🇾', group: 'H' }),
  // Group I
  makeTeam({ name: 'Francia', shortName: 'FRA', flag: '🇫🇷', group: 'I' }),
  makeTeam({ name: 'Senegal', shortName: 'SEN', flag: '🇸🇳', group: 'I' }),
  makeTeam({ name: 'Irak', shortName: 'IRQ', flag: '🇮🇶', group: 'I' }),
  makeTeam({ name: 'Noruega', shortName: 'NOR', flag: '🇳🇴', group: 'I' }),
  // Group J
  makeTeam({ name: 'Argentina', shortName: 'ARG', flag: '🇦🇷', group: 'J' }),
  makeTeam({ name: 'Argelia', shortName: 'ALG', flag: '🇩🇿', group: 'J' }),
  makeTeam({ name: 'Austria', shortName: 'AUT', flag: '🇦🇹', group: 'J' }),
  makeTeam({ name: 'Jordania', shortName: 'JOR', flag: '🇯🇴', group: 'J' }),
  // Group K
  makeTeam({ name: 'Portugal', shortName: 'POR', flag: '🇵🇹', group: 'K' }),
  makeTeam({ name: 'RD Congo', shortName: 'COD', flag: '🇨🇩', group: 'K' }),
  makeTeam({ name: 'Uzbekistán', shortName: 'UZB', flag: '🇺🇿', group: 'K' }),
  makeTeam({ name: 'Colombia', shortName: 'COL', flag: '🇨🇴', group: 'K' }),
  // Group L
  makeTeam({ name: 'Inglaterra', shortName: 'ENG', flag: '🏴', group: 'L' }),
  makeTeam({ name: 'Croacia', shortName: 'CRO', flag: '🇭🇷', group: 'L' }),
  makeTeam({ name: 'Ghana', shortName: 'GHA', flag: '🇬🇭', group: 'L' }),
  makeTeam({ name: 'Panamá', shortName: 'PAN', flag: '🇵🇦', group: 'L' }),
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

const FALLBACK_TEAM: Team = {
  name: 'Especial',
  shortName: 'ESP',
  flag: '⭐',
  group: '-',
  primary: '#002868',
  secondary: '#C8102E',
  text: '#ffffff',
};

/** Match by seleccionNombre (partial, case-insensitive) */
export function getTeamBySeleccion(nombre: string | null | undefined): Team {
  if (!nombre) return FALLBACK_TEAM;
  const q = nombre.toLowerCase();
  return (
    TEAMS.find((t) => t.name.toLowerCase() === q || t.shortName.toLowerCase() === q) ??
    TEAMS.find((t) => t.name.toLowerCase().includes(q) || q.includes(t.name.toLowerCase())) ??
    FALLBACK_TEAM
  );
}
