import { matches } from '../data/mockData';
import { MatchCard } from '../components/features/MatchCard';
import { FeatureCard } from '../components/features/FeatureCard';
import { Badge, Button } from '../components/ui';
import { ArrowRight, Play, Landmark, Trophy, BookOpen } from 'lucide-react';

export function Dashboard() {
  const nextMatch = matches[0];

  return (
    <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-screen-2xl mx-auto w-full pb-28 md:pb-12">
      {/* ══════ Hero Section: Next Match ══════ */}
      <section className="mb-12 md:mb-16 relative rounded-3xl overflow-hidden group animate-fade-in-up">
        {/* Background */}
        <div className="absolute inset-0 z-0 gradient-hero noise">
          <img
            alt="Stadium atmosphere"
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiIMYdM6-PbXJI8K0dRF2iUv_cxCAb-auD5ug2oeud28B0JYmRhTpCC95XS4emTnWScf_XR9eC9ZbTBZj1gkYdLAZ4__BUUfiDUQfcbVlWenaCB19kxsnVOPOfmyFJmhCXg7fSLEswe6Qsh78MQmzj26BvlcJCmL78ac_3Cq69D9ZyPM9RgOwJRv6H45OVgQOTYyFzo6k--aE6ZAOB8qDPQFcOHWUIoWO8PSp8slA4rn0iqjLa69KuKI0TeU6yZnNWEgGHVap88q8"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
        </div>

        <div className="relative z-10 p-6 md:p-12 lg:p-16 flex flex-col lg:flex-row justify-between items-end gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 animate-fade-in-up delay-100">
            <Badge variant="danger" dot className="mb-6">
              Upcoming Fixture
            </Badge>
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-5">
              <span className="text-white">El Gran</span>
              <br />
              <span className="gradient-text">Comienzo</span>
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-xl leading-relaxed mb-8">
              The opening match of the 2026 FIFA World Cup. Witness history as
              the host nations take center stage.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={ArrowRight} size="lg">
                View Match Details
              </Button>
              <Button variant="ghost" icon={Play} iconPosition="left" size="lg">
                Watch Teaser
              </Button>
            </div>
          </div>

          {/* Match Card */}
          <div className="w-full lg:w-auto lg:min-w-[380px] animate-fade-in-up delay-300">
            <MatchCard match={nextMatch} />
          </div>
        </div>
      </section>

      {/* ══════ Bento Grid: Quick Links & Stats ══════ */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12 md:mb-16">
        <FeatureCard
          to="/stadiums"
          title="Stadiums"
          description="Explore the 16 architectural marvels across North America."
          icon={Landmark}
          variant="image"
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAfE5Vb07Lq20RL2Swb3E-l6mzOGewnk7TfeWxz1us0c3BulSAU0XByUDvYHfCm4Prb8co-SeSwmQSSa1sqbPkzLbwqmCqC9fTaa1Ma3pJ3LA4KJhgz6fASTerBk3-zoJ72copmi2GQgcJ-QdRoaSAYXy-Ou7xhSVRI2NvVVxKKE7lysro6UHrJRf0CMCQo-qECVSzI7im4UXKmtYNwZ6FeUj80F0eeSHrFJheEVkspSFx_pTQJZTCzTs78t_OsS-nOAeebiSn2Z64"
          className="animate-fade-in-up delay-200"
        />
        <FeatureCard
          to="/superpolla"
          title="Superpolla"
          description="Make your predictions. Climb the global leaderboard."
          icon={Trophy}
          variant="accent"
          badge="Live"
          stat={{ label: 'Current Rank', value: '#4,209' }}
          className="animate-fade-in-up delay-300 bg-bg-surface"
        />
        <FeatureCard
          to="/album"
          title="Digital Album"
          description="Collect, trade, and complete your digital sticker album."
          icon={BookOpen}
          variant="solid"
          progress={{ value: 45, label: '45%' }}
          className="animate-fade-in-up delay-400 bg-bg-surface"
        />
      </section>

      {/* ══════ Upcoming Matches Row ══════ */}
      <section className="mb-12 md:mb-16 animate-fade-in-up delay-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              Upcoming Matches
            </h2>
            <p className="text-sm text-text-muted mt-1">Group stage fixtures</p>
          </div>
          <Button variant="ghost" icon={ArrowRight} size="sm">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    </main>
  );
}