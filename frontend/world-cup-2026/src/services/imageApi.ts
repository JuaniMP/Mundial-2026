const WIKI_BASE = 'https://en.wikipedia.org/w/api.php';
const DICEBEAR_BASE = 'https://api.dicebear.com/7.x/lorelei/svg';
const UNSPLASH_KEY = 'RoLK0oFjtR1E6dmFZfx-83N7MLuHI0Wcq7bu37XCeRI';

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

/**
 * Tries to fetch a player thumbnail from Wikipedia.
 * Falls back to a DiceBear avatar if unavailable.
 */
export async function fetchPlayerPhoto(name: string): Promise<string> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: name,
      prop: 'pageimages',
      format: 'json',
      pithumbsize: '300',
      origin: '*',
      formatversion: '2',
    });
    const resp = await fetch(`${WIKI_BASE}?${params}`);
    if (!resp.ok) return diceBearUrl(name);
    const json = (await resp.json()) as WikiResponse;
    const src = json.query.pages[0]?.thumbnail?.source;
    return src ?? diceBearUrl(name);
  } catch {
    return diceBearUrl(name);
  }
}

/** DiceBear avatar URL (deterministic from player name). */
export function diceBearUrl(name: string): string {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(name)}&scale=85`;
}

/** Fetch a landscape stadium photo from Unsplash. */
export async function fetchStadiumPhoto(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      query: `${query} soccer stadium`,
      per_page: '1',
      orientation: 'landscape',
    });
    const resp = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    });
    if (!resp.ok) return null;
    const json = (await resp.json()) as UnsplashResult;
    return json.results[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}
