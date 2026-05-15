import { useState } from 'react';
import { Link } from 'react-router-dom';
import { matches, leaderboardUsers, teams } from '../data/mockData';
import { Bell, BellOff, X, ExternalLink, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFcm } from '../hooks/useFcm';

const HERO_PLAYERS = [
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80',
  'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&q=80',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&q=80',
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&q=80',
];

const MOCK_GROUP: { code: string; flag: string; w: number; d: number; l: number; pts: number }[] = [
  { code: 'MEX', flag: '🇲🇽', w: 4, d: 3, l: 2, pts: 7 },
  { code: 'USA', flag: '🇺🇸', w: 3, d: 1, l: 1, pts: 5 },
  { code: 'CAN', flag: '🇨🇦', w: 4, d: 0, l: 1, pts: 4 },
  { code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', w: 4, d: 1, l: 0, pts: 0 },
];

export function Dashboard() {
  const { token } = useAuth();
  const { permission, registered, foregroundMessage, isConfigured, requestAndRegister, disable } =
    useFcm(token);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [predictionVotes, setPredictionVotes] = useState<Record<string, string>>({});

  const showBanner =
    isConfigured &&
    !bannerDismissed &&
    permission !== 'granted' &&
    permission !== 'denied' &&
    permission !== 'unsupported';

  const handleEnable = async () => {
    setLoading(true);
    await requestAndRegister();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Foreground Push Toast ── */}
      {foregroundMessage && (
        <div className="fixed top-20 right-4 z-[200] max-w-sm w-full">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl flex items-start gap-3">
            <Bell className="w-5 h-5 text-[#0B7B3E] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">{foregroundMessage.title}</p>
              <p className="text-gray-500 text-sm mt-0.5">{foregroundMessage.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification Banner ── */}
      {showBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-[#0B7B3E] text-white px-6 py-3 flex items-center gap-4">
          <Bell className="w-4 h-4 shrink-0" />
          <p className="flex-1 text-sm font-medium">
            Activa las notificaciones para recibir resultados en tiempo real
          </p>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="bg-white text-[#0B7B3E] text-xs font-bold px-4 py-1.5 rounded-full hover:bg-green-50 transition-colors shrink-0"
          >
            {loading ? 'Activando…' : 'Activar'}
          </button>
          <button onClick={() => setBannerDismissed(true)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Notification status ── */}
      {isConfigured && permission === 'granted' && (
        <div className="fixed top-16 right-4 z-40 flex items-center gap-2">
          {registered ? (
            <button
              onClick={disable}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors bg-white shadow rounded-full px-3 py-1.5"
            >
              <BellOff className="w-3.5 h-3.5" />
              Desactivar
            </button>
          ) : null}
        </div>
      )}

      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <section className="relative pt-16 overflow-hidden bg-white" style={{ minHeight: '520px' }}>
        {/* Left green diagonal accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #0B7B3E 50%, transparent 50%)',
          }}
        />
        {/* Right red diagonal accent */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(225deg, #E63946 50%, transparent 50%)',
          }}
        />

        {/* Green stripe bars on left */}
        <div className="absolute left-0 top-0 bottom-0 z-20 flex flex-col gap-1 w-5 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ background: i % 2 === 0 ? '#0B7B3E' : '#065a2e' }}
            />
          ))}
        </div>

        {/* Player images row */}
        <div className="relative z-0 flex items-end justify-center gap-2 px-28 pt-8 pb-0 h-[400px]">
          {HERO_PLAYERS.map((url, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-t-2xl flex-1 max-w-[200px]"
              style={{
                height: i === 1 || i === 2 ? '100%' : '80%',
                marginBottom: 0,
              }}
            >
              <img
                src={url}
                alt="Player"
                className="w-full h-full object-cover object-top"
                style={{ filter: i === 0 || i === 3 ? 'brightness(0.7)' : 'brightness(0.85)' }}
              />
              {/* Color tint overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    i === 0
                      ? 'rgba(11,123,62,0.3)'
                      : i === 3
                        ? 'rgba(230,57,70,0.3)'
                        : 'rgba(29,53,87,0.15)',
                }}
              />
            </div>
          ))}

          {/* Overlaid text */}
          <div className="absolute inset-0 flex flex-col justify-end pb-8 pl-32 z-10 pointer-events-none">
            <div
              className="bg-black/80 backdrop-blur-sm p-6 rounded-2xl max-w-md"
              style={{ pointerEvents: 'auto' }}
            >
              <h1
                className="text-white font-black uppercase leading-none mb-3"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
              >
                THE WORLD&apos;S GAME.
                <br />
                YOUR TOURNAMENT.
                <br />
                <span style={{ color: '#0B7B3E' }}>2026.</span>
              </h1>
              <Link
                to="/matches"
                className="inline-flex items-center gap-2 bg-white text-black text-xs font-black tracking-widest uppercase px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                Ver Partidos
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === 1 ? '20px' : '6px',
                height: '6px',
                background: i === 1 ? '#0B7B3E' : '#d1d5db',
              }}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          MAIN CONTENT GRID
      ════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 pb-28 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── MATCH CENTER (col-span-2) ── */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-black text-gray-900 uppercase tracking-wide text-sm">
                  Match Center
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Próximos partidos & resultados</p>
              </div>
              <Link
                to="/matches"
                className="text-[#0B7B3E] hover:underline flex items-center gap-1 text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-100">
              {/* Upcoming matches */}
              <div className="p-4">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">
                  Upcoming Fixt.
                </p>
                <div className="space-y-3">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 text-sm hover:bg-gray-50 rounded-xl p-2 transition-colors"
                    >
                      <img
                        src={m.homeTeam.flagUrl}
                        alt={m.homeTeam.code}
                        className="w-6 h-4 object-cover rounded-sm"
                      />
                      <span className="text-xs font-bold text-gray-600 w-8">{m.homeTeam.code}</span>
                      <span className="text-[10px] font-black text-gray-300 mx-1">0–0</span>
                      <img
                        src={m.awayTeam.flagUrl}
                        alt={m.awayTeam.code}
                        className="w-6 h-4 object-cover rounded-sm"
                      />
                      <span className="text-xs font-bold text-gray-600 w-8">{m.awayTeam.code}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{m.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live score + Group */}
              <div className="p-4 flex flex-col gap-4">
                {/* Featured live */}
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black tracking-widest text-[#E63946] uppercase mb-2">
                    Live Score
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={teams[0].flagUrl}
                      alt="MEX"
                      className="w-8 h-5 object-cover rounded-sm"
                    />
                    <span className="text-4xl font-black text-gray-900">3</span>
                    <span className="text-lg font-black text-gray-300">vs</span>
                    <span className="text-4xl font-black text-gray-900">0</span>
                    <img
                      src={teams[1].flagUrl}
                      alt="USA"
                      className="w-8 h-5 object-cover rounded-sm"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">72' · Estadio Azteca</p>
                </div>

                {/* Group table */}
                <div>
                  <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">
                    Group
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 font-bold">
                        <th className="text-left pb-1">Team</th>
                        <th className="pb-1">G</th>
                        <th className="pb-1">W</th>
                        <th className="pb-1">L</th>
                        <th className="pb-1 text-[#0B7B3E]">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_GROUP.map((row) => (
                        <tr key={row.code} className="border-t border-gray-100">
                          <td className="py-1 flex items-center gap-1.5 font-bold text-gray-700">
                            <span>{row.flag}</span>
                            <span>{row.code}</span>
                          </td>
                          <td className="py-1 text-center text-gray-500">
                            {row.w + row.d + row.l}
                          </td>
                          <td className="py-1 text-center text-gray-500">{row.w}</td>
                          <td className="py-1 text-center text-gray-500">{row.l}</td>
                          <td className="py-1 text-center font-black text-[#0B7B3E]">{row.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Link
                    to="/standings"
                    className="text-[10px] font-bold text-[#0B7B3E] hover:underline mt-2 block"
                  >
                    Show more ›
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── VIRTUAL ALBUM (col-span-1) ── */}
          <div className="bg-[#1D3557] rounded-2xl overflow-hidden relative shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-black text-white uppercase tracking-wide text-sm">
                Virtual Trading Card Album
              </h2>
              <Link to="/album" className="text-white/60 hover:text-white">
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Album preview */}
            <div className="px-5 pb-4">
              <div className="relative bg-[#0f2238] rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center mb-4">
                {/* Background text */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <p
                    className="text-white font-black text-center uppercase leading-tight"
                    style={{ fontSize: '2rem' }}
                  >
                    VIRTUAL
                    <br />
                    TRADING
                    <br />
                    CARD
                    <br />
                    ALBUM
                  </p>
                </div>
                {/* Mini cards */}
                <div className="relative flex gap-2">
                  {[
                    { top: '0', color: '#0B7B3E' },
                    { top: '-8px', color: '#E63946' },
                    { top: '0', color: '#1D3557' },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="w-16 h-20 rounded-lg shadow-lg flex items-end justify-center pb-2"
                      style={{
                        background: `linear-gradient(135deg, ${card.color} 0%, #000 100%)`,
                        transform: `translateY(${card.top})`,
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {['MX', 'CA', 'US'][i]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collect & Swap */}
              <div className="bg-[#0f2238] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-black text-xs uppercase tracking-wide">
                    Collect &amp; Swap
                  </p>
                  <span className="text-[#0B7B3E] font-bold text-xs">+10,60%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: '64%', background: '#0B7B3E' }}
                  />
                </div>
                <p className="text-white/50 text-[10px] mb-4">
                  Colecciona, intercambia y completa tu álbum digital con stickers de todas las
                  selecciones.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/album"
                    className="flex-1 bg-[#0B7B3E] text-white text-xs font-bold py-2.5 rounded-full text-center hover:bg-[#065a2e] transition-colors"
                  >
                    Open Pack
                  </Link>
                  <Link
                    to="/album"
                    className="flex-1 bg-white/10 text-white text-xs font-bold py-2.5 rounded-full text-center hover:bg-white/20 transition-colors"
                  >
                    My Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── COMMUNITY CHALLENGES ── */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-black text-gray-900 uppercase tracking-wide text-sm">
                  Community Challenges
                </h2>
              </div>
              <Link to="/superpolla" className="text-[#0B7B3E] hover:underline text-xs font-bold">
                Ver todo ›
              </Link>
            </div>
            <div className="px-6 py-4">
              <div className="flex text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">
                <span className="flex-1">By TRTAFMIME</span>
                <span>LEADERBOARD</span>
              </div>
              <div className="space-y-2">
                {leaderboardUsers.slice(0, 5).map((u, i) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <span
                      className="w-5 text-center font-black text-sm"
                      style={{ color: i === 0 ? '#0B7B3E' : '#9ca3af' }}
                    >
                      {i + 1}
                    </span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                      style={{ background: i === 0 ? '#0B7B3E' : '#1D3557' }}
                    >
                      {u.name.split(' ')[0][0]}
                      {u.name.split(' ')[1]?.[0] ?? ''}
                    </div>
                    <span className="flex-1 font-semibold text-gray-800 text-sm">
                      {u.name.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-black text-gray-900 text-sm">{u.points}</span>
                      <span
                        className="text-[10px]"
                        style={{ color: i % 2 === 0 ? '#0B7B3E' : '#E63946' }}
                      >
                        {i % 2 === 0 ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PREDICTOR GAME ── */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-black text-gray-900 uppercase tracking-wide text-sm">
                  Predictor Game
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Predice los próximos partidos</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {matches.map((m) => (
                <div key={m.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={m.homeTeam.flagUrl}
                      alt={m.homeTeam.code}
                      className="w-5 h-3.5 object-cover rounded-sm"
                    />
                    <span className="text-xs font-bold text-gray-700">{m.homeTeam.code}</span>
                    <span className="text-[10px] text-gray-400 mx-1">vs.</span>
                    <img
                      src={m.awayTeam.flagUrl}
                      alt={m.awayTeam.code}
                      className="w-5 h-3.5 object-cover rounded-sm"
                    />
                    <span className="text-xs font-bold text-gray-700">{m.awayTeam.code}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[m.homeTeam.code, 'DRAW', m.awayTeam.code].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setPredictionVotes((prev) => ({ ...prev, [m.id]: opt }))}
                        className="flex-1 text-[10px] font-black py-1.5 rounded-full transition-all"
                        style={{
                          background:
                            predictionVotes[m.id] === opt ? '#0B7B3E' : 'rgba(0,0,0,0.06)',
                          color: predictionVotes[m.id] === opt ? 'white' : '#6b7280',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <Link
                to="/superpolla"
                className="block w-full bg-[#0B7B3E] text-white text-xs font-black uppercase tracking-widest py-3 rounded-full text-center hover:bg-[#065a2e] transition-colors mt-2"
              >
                Log prediction
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
