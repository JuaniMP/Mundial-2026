import type { EstadioApi } from '../types';

/**
 * Los 16 estadios oficiales del Mundial FIFA 2026
 * Datos confirmados por FIFA en febrero 2024
 *
 * - 11 sedes en USA
 * - 2 sedes en Canadá
 * - 3 sedes en México
 *
 * Imágenes: Wikimedia Commons via Special:FilePath (redirect estable)
 */

// Helper: build a stable Wikimedia URL that auto-resolves to the current file
const wiki = (filename: string, width = 1280): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;

export const WORLD_CUP_2026_STADIUMS: EstadioApi[] = [
  // ───────────────── USA (11 sedes) ─────────────────
  {
    id: 1,
    nombre: 'AT&T Stadium',
    ciudad: 'Dallas',
    pais: 'USA',
    capacidad: 80000,
    lat: 32.7473,
    lng: -97.0945,
    direccion: '1 AT&T Way, Arlington, TX 76011',
    imagen: wiki('AT&T Stadium full.jpg'),
    partidos: 9,
    inaugurado: 2009,
    equipoLocal: 'Dallas Cowboys (NFL)',
  },
  {
    id: 2,
    nombre: 'Mercedes-Benz Stadium',
    ciudad: 'Atlanta',
    pais: 'USA',
    capacidad: 71000,
    lat: 33.7553,
    lng: -84.4006,
    direccion: '1 AMB Drive NW, Atlanta, GA 30313',
    imagen: wiki('Mercedes-Benz Stadium (48042087722).jpg'),
    partidos: 8,
    inaugurado: 2017,
    equipoLocal: 'Atlanta United (MLS)',
  },
  {
    id: 3,
    nombre: 'Gillette Stadium',
    ciudad: 'Boston',
    pais: 'USA',
    capacidad: 65878,
    lat: 42.0909,
    lng: -71.2643,
    direccion: '1 Patriot Pl, Foxborough, MA 02035',
    imagen: wiki('Gillette Stadium Aerial.jpg'),
    partidos: 7,
    inaugurado: 2002,
    equipoLocal: 'New England Patriots (NFL)',
  },
  {
    id: 4,
    nombre: 'NRG Stadium',
    ciudad: 'Houston',
    pais: 'USA',
    capacidad: 72220,
    lat: 29.6847,
    lng: -95.4107,
    direccion: 'NRG Pkwy, Houston, TX 77054',
    imagen: wiki('NRG Stadium 03.jpg'),
    partidos: 7,
    inaugurado: 2002,
    equipoLocal: 'Houston Texans (NFL)',
  },
  {
    id: 5,
    nombre: 'Arrowhead Stadium',
    ciudad: 'Kansas City',
    pais: 'USA',
    capacidad: 76416,
    lat: 39.0489,
    lng: -94.4839,
    direccion: '1 Arrowhead Dr, Kansas City, MO 64129',
    imagen: wiki('Arrowhead Stadium 2017.jpg'),
    partidos: 6,
    inaugurado: 1972,
    equipoLocal: 'Kansas City Chiefs (NFL)',
  },
  {
    id: 6,
    nombre: 'SoFi Stadium',
    ciudad: 'Los Angeles',
    pais: 'USA',
    capacidad: 70240,
    lat: 33.9534,
    lng: -118.3387,
    direccion: '1001 Stadium Dr, Inglewood, CA 90301',
    imagen: wiki('SoFi Stadium in April 2021.jpg'),
    partidos: 8,
    inaugurado: 2020,
    equipoLocal: 'LA Rams & Chargers (NFL)',
  },
  {
    id: 7,
    nombre: 'Hard Rock Stadium',
    ciudad: 'Miami',
    pais: 'USA',
    capacidad: 65326,
    lat: 25.958,
    lng: -80.2389,
    direccion: '347 Don Shula Dr, Miami Gardens, FL 33056',
    imagen: wiki('Hard Rock Stadium June 2020.jpg'),
    partidos: 7,
    inaugurado: 1987,
    equipoLocal: 'Miami Dolphins (NFL)',
  },
  {
    id: 8,
    nombre: 'MetLife Stadium',
    ciudad: 'New York/New Jersey',
    pais: 'USA',
    capacidad: 82500,
    lat: 40.8136,
    lng: -74.0744,
    direccion: '1 MetLife Stadium Dr, East Rutherford, NJ 07073',
    imagen: wiki('MetLife Stadium (September 2010).JPG'),
    partidos: 8,
    inaugurado: 2010,
    equipoLocal: 'NY Giants & Jets (NFL)',
  },
  {
    id: 9,
    nombre: 'Lincoln Financial Field',
    ciudad: 'Philadelphia',
    pais: 'USA',
    capacidad: 69176,
    lat: 39.9008,
    lng: -75.1675,
    direccion: '1 Lincoln Financial Field Way, Philadelphia, PA 19148',
    imagen: wiki('Lincoln Financial Field 2018.jpg'),
    partidos: 6,
    inaugurado: 2003,
    equipoLocal: 'Philadelphia Eagles (NFL)',
  },
  {
    id: 10,
    nombre: "Levi's Stadium",
    ciudad: 'San Francisco',
    pais: 'USA',
    capacidad: 68500,
    lat: 37.4032,
    lng: -121.9697,
    direccion: '4900 Marie P DeBartolo Way, Santa Clara, CA 95054',
    imagen: wiki("2014.07.17 Levi's Stadium open house.jpg"),
    partidos: 6,
    inaugurado: 2014,
    equipoLocal: 'San Francisco 49ers (NFL)',
  },
  {
    id: 11,
    nombre: 'Lumen Field',
    ciudad: 'Seattle',
    pais: 'USA',
    capacidad: 68740,
    lat: 47.5952,
    lng: -122.3316,
    direccion: '800 Occidental Ave S, Seattle, WA 98134',
    imagen: wiki('CenturyLink Field 2017 - 3.jpg'),
    partidos: 6,
    inaugurado: 2002,
    equipoLocal: 'Seattle Seahawks (NFL)',
  },

  // ───────────────── Canadá (2 sedes) ─────────────────
  {
    id: 12,
    nombre: 'BMO Field',
    ciudad: 'Toronto',
    pais: 'Canada',
    capacidad: 45500,
    lat: 43.6332,
    lng: -79.4185,
    direccion: '170 Princes’ Blvd, Toronto, ON M6K 3C3',
    imagen: wiki('BMO Field 2011.jpg'),
    partidos: 6,
    inaugurado: 2007,
    equipoLocal: 'Toronto FC (MLS)',
  },
  {
    id: 13,
    nombre: 'BC Place',
    ciudad: 'Vancouver',
    pais: 'Canada',
    capacidad: 54500,
    lat: 49.2768,
    lng: -123.1119,
    direccion: '777 Pacific Blvd, Vancouver, BC V6B 4Y8',
    imagen: wiki('BC Place 2014.jpg'),
    partidos: 7,
    inaugurado: 1983,
    equipoLocal: 'Vancouver Whitecaps (MLS)',
  },

  // ───────────────── México (3 sedes) ─────────────────
  {
    id: 14,
    nombre: 'Estadio Azteca',
    ciudad: 'Ciudad de México',
    pais: 'México',
    capacidad: 87523,
    lat: 19.3029,
    lng: -99.1505,
    direccion: 'Calz. de Tlalpan 3465, Coyoacán, 04650 CDMX',
    imagen: wiki('Estadio Azteca - Mexico City.jpg'),
    partidos: 5,
    inaugurado: 1966,
    equipoLocal: 'Club América (Liga MX)',
  },
  {
    id: 15,
    nombre: 'Estadio Akron',
    ciudad: 'Guadalajara',
    pais: 'México',
    capacidad: 49850,
    lat: 20.6817,
    lng: -103.4625,
    direccion: 'Av. Gral. Ramón Corona 1685, Zapopan, Jalisco',
    imagen: wiki('Estadio Akron - Guadalajara - México.jpg'),
    partidos: 4,
    inaugurado: 2010,
    equipoLocal: 'Chivas de Guadalajara',
  },
  {
    id: 16,
    nombre: 'Estadio BBVA',
    ciudad: 'Monterrey',
    pais: 'México',
    capacidad: 53500,
    lat: 25.6692,
    lng: -100.2447,
    direccion: 'Av. Pablo Livas 2011, Guadalupe, Nuevo León',
    imagen: wiki('BBVA stadium field view 2017.jpg'),
    partidos: 4,
    inaugurado: 2015,
    equipoLocal: 'Rayados de Monterrey',
  },
];

// Normalización y búsqueda robusta de estadios por nombre/alias
export function findStadiumByName(name?: string): EstadioApi | undefined {
  if (!name) return undefined;
  const norm = (s: string) => s.toLowerCase().replace(new RegExp('[.,\'’"/\\-]+', 'g'), '').trim();
  const q = norm(name);

  // Alias map para variantes informales a id del estadio
  const aliases: Record<string, number> = {
    'los angeles stadium': 6, // mapear a SoFi Stadium
    'sofi stadium': 6,
    'san francisco bay area stadium': 10, // Levi's Stadium (Santa Clara)
    'toronto stadium': 12, // BMO Field
    'bc place vancouver': 13,
    'mexico city stadium': 14, // Estadio Azteca
    'mexico city': 14,
    'dallas stadium': 1, // AT&T Stadium
    'houston stadium': 4, // NRG
    'new york new jersey stadium': 8, // MetLife
  };

  // 1) coincidencia exacta con nombre normalizado
  const exact = WORLD_CUP_2026_STADIUMS.find((s) => norm(s.nombre) === q);
  if (exact) return exact;

  // 2) includes en nombre o ciudad
  const includes = WORLD_CUP_2026_STADIUMS.find(
    (s) => norm(s.nombre).includes(q) || norm(s.ciudad).includes(q),
  );
  if (includes) return includes;

  // 3) alias map
  const aliasedId = aliases[q];
  if (aliasedId) return WORLD_CUP_2026_STADIUMS.find((s) => s.id === aliasedId);

  // 4) buscar si la query contiene la ciudad o parte del nombre
  const partial = WORLD_CUP_2026_STADIUMS.find(
    (s) => q.includes(norm(s.ciudad)) || q.includes(norm(s.nombre)),
  );
  if (partial) return partial;

  return undefined;
}
