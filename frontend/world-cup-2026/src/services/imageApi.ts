const WIKI_BASE = 'https://en.wikipedia.org/w/api.php';
// lorelei is too "cartoon anime" — use "micah" which looks more like real faces
const DICEBEAR_BASE = 'https://api.dicebear.com/7.x/micah/svg';

// ─── Names that MUST NOT be sent to Wikipedia (wrong/ambiguous results) ───────
// "Vega" → star/constellation; "Goretzka" fails; "Antony" → non-footballer page, etc.
const WIKI_BLOCKLIST = new Set([
  'vega',
  'antony',
  'romo',
  'araujo',
  'galíndez',
  'mena',
  'miller',
  'larin',
  'hoilett',
  'laryea',
  'cavallini',
  'borjan',
  'chair',
  'cheddira',
]);

// ─── Curated Wikipedia page titles for top players ───────────────────────────
// Key: lowercase player name from DB seed → exact Wikipedia article title
const WIKI_TITLES: Record<string, string> = {
  // Argentina
  messi: 'Lionel Messi',
  'lionel messi': 'Lionel Messi',
  'di maría': 'Ángel Di María',
  'di maria': 'Ángel Di María',
  'lautaro martínez': 'Lautaro Martínez',
  'lautaro martinez': 'Lautaro Martínez',
  'julián álvarez': 'Julián Álvarez',
  'julian alvarez': 'Julián Álvarez',
  'de paul': 'Rodrigo De Paul',
  'mac allister': 'Alexis Mac Allister',
  'alexis mac allister': 'Alexis Mac Allister',
  fernández: 'Enzo Fernández',
  'enzo fernández': 'Enzo Fernández',
  otamendi: 'Nicolás Otamendi',
  romero: 'Cristian Romero',
  tagliafico: 'Nicolás Tagliafico',
  molina: 'Nahuel Molina',
  acuña: 'Marcos Acuña',

  // Brasil
  'vinicius jr': 'Vinícius Júnior',
  'vinícius jr': 'Vinícius Júnior',
  neymar: 'Neymar',
  rodrygo: 'Rodrygo',
  casemiro: 'Casemiro',
  alisson: 'Alisson Becker',
  marquinhos: 'Marquinhos',
  'thiago silva': 'Thiago Silva',
  danilo: 'Danilo (footballer, born 1991)',
  militão: 'Éder Militão',
  'éder militão': 'Éder Militão',
  richarlison: 'Richarlison',
  raphinha: 'Raphinha',
  antony: 'Antony (footballer)',

  // Francia
  mbappé: 'Kylian Mbappé',
  mbappe: 'Kylian Mbappé',
  griezmann: 'Antoine Griezmann',
  dembélé: 'Ousmane Dembélé',
  tchouaméni: 'Aurélien Tchouaméni',
  saliba: 'William Saliba',
  camavinga: 'Eduardo Camavinga',
  hernández: 'Theo Hernández',
  koundé: 'Jules Koundé',
  upamecano: 'Dayot Upamecano',
  maignan: 'Mike Maignan',

  // España
  pedri: 'Pedri',
  gavi: 'Gavi (footballer)',
  yamal: 'Lamine Yamal',
  morata: 'Álvaro Morata',
  olmo: 'Dani Olmo',
  rodri: 'Rodri',
  carvajal: 'Dani Carvajal',
  asensio: 'Marco Asensio',
  cucurella: 'Marc Cucurella',

  // Inglaterra
  bellingham: 'Jude Bellingham',
  saka: 'Bukayo Saka',
  foden: 'Phil Foden',
  kane: 'Harry Kane',
  rice: 'Declan Rice',
  trippier: 'Kieran Trippier',
  stones: 'John Stones',
  maguire: 'Harry Maguire',
  pickford: 'Jordan Pickford',
  walker: 'Kyle Walker',

  // Alemania
  musiala: 'Jamal Musiala',
  wirtz: 'Florian Wirtz',
  havertz: 'Kai Havertz',
  kimmich: 'Joshua Kimmich',
  rüdiger: 'Antonio Rüdiger',
  rudiger: 'Antonio Rüdiger',
  neuer: 'Manuel Neuer',
  sané: 'Leroy Sané',

  // Portugal
  ronaldo: 'Cristiano Ronaldo',
  'cristiano ronaldo': 'Cristiano Ronaldo',
  'bruno fernandes': 'Bruno Fernandes (footballer, born 1994)',
  'bernardo silva': 'Bernardo Silva',
  leão: 'Rafael Leão',
  'joão félix': 'João Félix',
  'rúben dias': 'Rúben Dias',
  cancelo: 'João Cancelo',
  'diogo costa': 'Diogo Costa',
  pepe: 'Pepe (footballer)',

  // Colombia
  james: 'James Rodríguez',
  'james rodríguez': 'James Rodríguez',
  cuadrado: 'Juan Cuadrado',
  falcao: 'Radamel Falcao',
  'luis díaz': 'Luis Díaz (footballer, born 1997)',

  // México
  'hirving lozano': 'Hirving Lozano',
  lozano: 'Hirving Lozano',
  'raúl jiménez': 'Raúl Jiménez',
  jiménez: 'Raúl Jiménez',
  ochoa: 'Guillermo Ochoa',

  // USA
  pulisic: 'Christian Pulisic',
  'christian pulisic': 'Christian Pulisic',
  mckennie: 'Weston McKennie',
  reyna: 'Giovanni Reyna',

  // Canadá
  davies: 'Alphonso Davies',
  'alphonso davies': 'Alphonso Davies',
  david: 'Jonathan David',
  'jonathan david': 'Jonathan David',

  // Croacia
  modric: 'Luka Modrić',
  'luka modric': 'Luka Modrić',
  kovacic: 'Mateo Kovačić',
  brozovic: 'Marcelo Brozović',

  // Japón
  mitoma: 'Kaoru Mitoma',
  kubo: 'Takefusa Kubo',

  // Países Bajos
  'van dijk': 'Virgil van Dijk',
  'virgil van dijk': 'Virgil van Dijk',
  'de jong': 'Frenkie de Jong',
  gakpo: 'Cody Gakpo',
  depay: 'Memphis Depay',

  // Bélgica
  'de bruyne': 'Kevin De Bruyne',
  'kevin de bruyne': 'Kevin De Bruyne',
  lukaku: 'Romelu Lukaku',
  doku: 'Jérémy Doku',

  // Marruecos
  hakimi: 'Achraf Hakimi',
  ziyech: 'Hakim Ziyech',
  bono: 'Yassine Bounou',
  'en-nesyri': 'Youssef En-Nesyri',
  amrabat: 'Sofyan Amrabat',

  // Uruguay
  'luis suárez': 'Luis Suárez',
  suárez: 'Luis Suárez',
  cavani: 'Edinson Cavani',
  valverde: 'Federico Valverde',
  'de arrascaeta': 'Giorgian de Arrascaeta',
  bentancur: 'Rodrigo Bentancur',
  núñez: 'Darwin Núñez',
  godín: 'Diego Godín',
  giménez: 'José María Giménez',

  // Corea del Sur
  son: 'Son Heung-min',
  'son heung-min': 'Son Heung-min',
  'kim min-jae': 'Kim Min-jae',
};

interface WikiPage {
  thumbnail?: { source: string };
}

interface WikiResponse {
  query: { pages: WikiPage[] };
}

interface UnsplashPhoto {
  urls: { regular: string };
}

interface UnsplashResult {
  results: UnsplashPhoto[];
}

function lookupTitle(name: string): string | null {
  const key = name.toLowerCase().trim();
  // Block ambiguous names
  const lastName = key.split(' ').pop() ?? key;
  if (WIKI_BLOCKLIST.has(key) || WIKI_BLOCKLIST.has(lastName)) return null;
  // Exact match
  if (WIKI_TITLES[key]) return WIKI_TITLES[key];
  // Last name match
  if (lastName && WIKI_TITLES[lastName]) return WIKI_TITLES[lastName];
  // Try original name (Wikipedia might have it directly)
  return name;
}

async function fetchWikiPhoto(title: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'pageimages',
      format: 'json',
      pithumbsize: '300',
      origin: '*',
      formatversion: '2',
    });
    const resp = await fetch(`${WIKI_BASE}?${params}`, { signal: AbortSignal.timeout(4000) });
    if (!resp.ok) return null;
    const json = (await resp.json()) as WikiResponse;
    return json.query.pages[0]?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

/**
 * Tries to fetch a player thumbnail from Wikipedia (curated titles first).
 * Falls back to a DiceBear avatar if unavailable.
 */
export async function fetchPlayerPhoto(name: string): Promise<string> {
  const title = lookupTitle(name);
  if (title) {
    const photo = await fetchWikiPhoto(title);
    if (photo) return photo;
  }
  return diceBearUrl(name);
}

/** DiceBear avatar URL (deterministic from player name). */
export function diceBearUrl(name: string): string {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
}

/** Call once on app init to clear old lorelei-style cached avatars. */
export function clearOldPhotoCache(): void {
  const toDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith('wc2026_player_photo_') && localStorage.getItem(k)?.includes('lorelei')) {
      toDelete.push(k);
    }
  }
  toDelete.forEach((k) => localStorage.removeItem(k));
}

/** Clave pública de Unsplash (VITE_UNSPLASH_ACCESS_KEY); sin ella no se piden fotos. */
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;

/** Fetch a landscape stadium photo from Unsplash. */
export async function fetchStadiumPhoto(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;
  try {
    const params = new URLSearchParams({
      query: `${query} soccer stadium`,
      per_page: '1',
      orientation: 'landscape',
    });
    const resp = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return null;
    const json = (await resp.json()) as UnsplashResult;
    return json.results[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}
