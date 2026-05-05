import { useState } from 'react';
import { currentUser } from '../data/mockData';
import { LeaderboardRow } from '../components/features/LeaderboardRow';
import { StatCard, PageHeader, Button } from '../components/ui';
import { Share2, Target, Medal, MoreVertical, ChevronDown } from 'lucide-react';

type FilterTab = 'global' | 'friends' | 'national';

const rankingData = [
  {
    rank: 1,
    name: 'Alex Mercer',
    country: 'USA',
    points: 52100,
    seed: 'AlexMercer',
    dotColor: 'bg-secondary',
  },
  {
    rank: 2,
    name: 'Sofia Reyes',
    country: 'Mexico',
    points: 51850,
    seed: 'SofiaReyes',
    dotColor: 'bg-primary',
  },
  {
    rank: 3,
    name: 'David Chen',
    country: 'Canada',
    points: 50900,
    seed: 'DavidChen',
    dotColor: 'bg-danger',
  },
];

export function Superpolla() {
  const [activeTab, setActiveTab] = useState<FilterTab>('global');

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'global', label: 'Global' },
    { key: 'friends', label: 'Friends' },
    { key: 'national', label: 'National' },
  ];

  return (
    <main className="pt-20 md:pt-24 pb-28 md:pb-12 px-4 md:px-8 max-w-screen-xl mx-auto w-full flex-1 flex flex-col gap-10">
      <PageHeader
        title="Superpolla"
        subtitle="Predict, compete, and claim your spot in the global gallery."
        className="animate-fade-in-up"
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up delay-100">
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl gradient-hero p-8 shadow-xl flex flex-col justify-between min-h-[240px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full mix-blend-screen blur-[80px] opacity-20 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full mix-blend-screen blur-[60px] opacity-15 -translate-x-1/4 translate-y-1/4 pointer-events-none" />
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-lg"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
              />
              <div>
                <h2 className="font-headline font-bold text-2xl text-white tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-white/10 text-white/80 text-xs uppercase tracking-widest backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Team {currentUser.team.name}
                </span>
              </div>
            </div>
            <button className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-end justify-between mt-8">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-[0.12em] mb-1">Global Rank</p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline font-extrabold text-5xl text-white tracking-tighter">
                  1,248
                </span>
                <span className="text-sm text-primary-light font-semibold">↑ 12</span>
              </div>
            </div>
            <div className="text-right sm:text-left">
              <p className="text-xs text-white/50 uppercase tracking-[0.12em] mb-1">Total Points</p>
              <span className="font-headline font-bold text-3xl text-white">45,920</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <StatCard
            label="Accuracy"
            value="68.4%"
            icon={Target}
            iconColor="text-secondary"
            progress={68.4}
            progressColor="linear-gradient(90deg, var(--color-secondary-dim), var(--color-secondary))"
          />
          <StatCard
            label="Next Milestone"
            value="2,100 pts away"
            icon={Medal}
            iconColor="text-accent"
            subtitle="Top 1,000 Global"
          />
        </div>
      </section>

      <section className="flex flex-col gap-6 animate-fade-in-up delay-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <h2 className="font-headline font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
            Global Rankings
          </h2>
          <div className="flex bg-bg-elevated rounded-xl p-1 border border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === tab.key ? 'bg-bg-card text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-secondary'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {rankingData.map((entry) => (
            <LeaderboardRow
              key={entry.rank}
              rank={entry.rank}
              name={entry.name}
              country={entry.country}
              points={entry.points}
              avatarSeed={entry.seed}
              isTop={entry.rank === 1}
              dotColor={entry.dotColor}
            />
          ))}
          <div className="py-2 flex justify-center">
            <MoreVertical className="text-text-muted/30 w-5 h-5" />
          </div>
          <LeaderboardRow
            rank={1248}
            name={currentUser.name}
            country="Canada"
            points={45920}
            avatarSeed={currentUser.name}
            isCurrentUser
            dotColor="bg-danger"
          />
        </div>
        <div className="flex justify-center mt-2">
          <Button variant="secondary" icon={ChevronDown} size="md">
            Load More Rankings
          </Button>
        </div>
      </section>
    </main>
  );
}
