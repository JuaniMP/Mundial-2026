import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string; url: string };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

const CACHE_KEY_PREFIX = 'wc2026_news_cache_v2';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

function cacheKey(lang: string): string {
  return `${CACHE_KEY_PREFIX}_${lang}`;
}

function loadCache(lang: string): GNewsArticle[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(lang));
    if (!raw) return null;
    const { ts, articles } = JSON.parse(raw) as { ts: number; articles: GNewsArticle[] };
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return articles;
  } catch {
    return null;
  }
}

function saveCache(lang: string, articles: GNewsArticle[]): void {
  try {
    localStorage.setItem(cacheKey(lang), JSON.stringify({ ts: Date.now(), articles }));
  } catch {
    // ignore quota errors
  }
}

export function NewsSection() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [articles, setArticles] = useState<GNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function formatRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('news.relative.now');
    if (minutes < 60) return t('news.relative.minutes', { n: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('news.relative.hours', { n: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return t('news.relative.days', { n: days });
    return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES');
  }

  useEffect(() => {
    setLoading(true);
    setError(null);

    const cached = loadCache(lang);
    if (cached && cached.length > 0) {
      setArticles(cached);
      setLoading(false);
      return;
    }

    const apiKey = import.meta.env.VITE_GNEWS_API_KEY as string | undefined;
    if (!apiKey) {
      setError(t('news.missingKey'));
      setLoading(false);
      return;
    }

    const query =
      lang === 'en'
        ? '"world cup 2026" OR "fifa 2026"'
        : '"mundial 2026" OR "copa mundial 2026" OR "world cup 2026"';

    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q', query);
    url.searchParams.set('lang', lang);
    url.searchParams.set('max', '6');
    url.searchParams.set('sortby', 'publishedAt');
    url.searchParams.set('apikey', apiKey);

    fetch(url.toString())
      .then(async (r) => {
        if (!r.ok) throw new Error(`GNews ${r.status}`);
        const data = (await r.json()) as GNewsResponse;
        return data.articles ?? [];
      })
      .then((arts) => {
        setArticles(arts);
        saveCache(lang, arts);
      })
      .catch((e: Error) => {
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [lang, t]);

  return (
    <section style={{ marginTop: 24, padding: '0 24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: '2px solid #0D1B2A',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(28px, 3.2vw, 42px)',
            color: '#0D1B2A',
            margin: 0,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {t('news.title')}
        </h2>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: '#6b7280',
          }}
        >
          {articles.length > 0 ? t('news.count', { count: articles.length }) : ''}
        </span>
      </div>

      {loading && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#6b7280',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
          }}
        >
          {t('news.loading')}
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            padding: 20,
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: 12,
            color: '#92400e',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#6b7280',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {t('news.empty')}
        </div>
      )}

      {articles.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 18,
          }}
        >
          {articles.map((a) => (
            <a
              key={a.url}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
              }}
            >
              {a.image && (
                <div
                  style={{
                    height: 170,
                    overflow: 'hidden',
                    background: '#f3f4f6',
                  }}
                >
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#006847' }}>{a.source.name}</span>
                  <span>{formatRelative(a.publishedAt)}</span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: '#0D1B2A',
                    margin: 0,
                    lineHeight: 1.25,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {a.title}
                </h3>
                {a.description && (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      color: '#374151',
                      margin: 0,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {a.description}
                  </p>
                )}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#006847',
                  }}
                >
                  {t('common.readMore')} <ExternalLink size={12} />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
