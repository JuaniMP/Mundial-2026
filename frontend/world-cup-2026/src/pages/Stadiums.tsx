import { stadiums, matches } from '../data/mockData';
import { MatchCard } from '../components/features/MatchCard';
import { StatCard, PageHeader, Badge } from '../components/ui';
import { Users, CloudSun, Star, Tag } from 'lucide-react';

export function Stadiums() {
  const selectedStadium = stadiums[0];
  const nextMatch = matches[0];

  return (
    <main className="pt-20 md:pt-24 pb-28 md:pb-12 w-full flex-1 flex flex-col">
      <div className="max-w-screen-2xl mx-auto w-full flex-1 px-4 md:px-8">
        {/* ══════ Header ══════ */}
        <PageHeader
          title={selectedStadium.name}
          subtitle={`${selectedStadium.location} • Capacity: ${selectedStadium.capacity.toLocaleString()}`}
          badge="Host Venue"
          className="mb-10 pt-4 animate-fade-in-up"
        />

        {/* ══════ Hero Image + Scoreboard ══════ */}
        <section className="relative w-full h-[450px] md:h-[550px] rounded-3xl overflow-hidden mb-12 md:mb-16 animate-fade-in-up delay-100">
          {/* Background Image */}
          <img
            alt={selectedStadium.name}
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjx_r5C0ZPSr9XihWu_dB0cXx2BJXjbyUv_FTWs6FEz55lLWxfGor_eXuoQrYxm9A_loLkPQ1SBT64mXEh1bGiYZkNtsCXo8qp6AnD_B6Q4INBaAI6WIcvw7vnVZfVVO-R4evyxNhRnpwqwMF0tk-QuSHkiv1ufACCo4rZHpNi0MiLud21a-BQxzJRZk3jqzApmYuiHFVvbybdNkODGd-7eQJLsO0t4_vkBycVL9gvHPQvHfR-fWfpsUBHvzOTTg5Ut92MyJgZ3jc"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/40 to-transparent" />
          <div className="absolute inset-0 bg-bg-deep/30" />

          {/* Glassmorphism Scoreboard */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <MatchCard match={nextMatch} className="shadow-xl" />
            </div>
          </div>
        </section>

        {/* ══════ Bento Grid: Details ══════ */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-12 md:mb-16 animate-fade-in-up delay-200">
          {/* Seating Map Area (Span 8) */}
          <div className="md:col-span-8 card-base p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-xl font-bold text-text-primary">
                Seating & Availability
              </h2>
              <button className="text-sm font-medium text-text-secondary bg-bg-elevated hover:bg-bg-hover px-4 py-2 rounded-lg transition-all duration-300 border border-border">
                View Details
              </button>
            </div>
            <div className="relative w-full flex-grow bg-bg-base rounded-xl overflow-hidden min-h-[280px] flex items-center justify-center">
              <img
                alt="Seat Map"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLLTV0FeN-DFdY7SFz_iDsw39TBuzn-e8l1QjhODWzRWQxN4w-4CbqYJgRJpb1AnwYenIRywcCo5gm4acDC0T9zr4FNzjbekSJ9Qw0e26C5hmNp8zDBWXJTnDAvx216LwnCVlgFETrIhiZ9jTvS--K-lE4X3LDRGzPdkCAYD2ohwtxvVRb-QHKm8ha9zAeXnGaZpoMSFH_x0U3TLUK-RyU29dpgILQMs9Nll2jbl55lo8TkXerc6w8VqvMBCxqEqc3KoO51th4780"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
              {/* Heatmap Indicators */}
              <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-danger/20 rounded-full blur-2xl" />
              <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-primary/15 rounded-full blur-2xl" />
              <div className="z-10 glass p-5 rounded-xl shadow-lg max-w-xs text-center">
                <Tag className="text-accent w-8 h-8 mb-2 mx-auto" />
                <p className="text-sm text-text-primary font-medium">
                  High Demand in Sections 100-112
                </p>
                <p className="text-[0.65rem] text-text-muted mt-1 uppercase tracking-wider">
                  Tap map to explore
                </p>
              </div>
            </div>
          </div>

          {/* Stats Column (Span 4) */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <StatCard
              label="Capacity"
              value={selectedStadium.capacity.toLocaleString()}
              icon={Users}
              iconColor="text-secondary"
              progress={85}
              progressColor="linear-gradient(90deg, var(--color-danger), var(--color-accent))"
              subtitle="85% Sold Out"
            />

            {/* Weather Card */}
            <div className="gradient-primary rounded-xl p-6 shadow-lg text-text-inverse flex-grow flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <CloudSun className="w-6 h-6" />
                  <h3 className="font-headline text-lg font-bold">Matchday Forecast</h3>
                </div>
                <div>
                  <p className="font-headline text-5xl font-extrabold mb-1">24°C</p>
                  <p className="text-sm opacity-80">
                    Partly cloudy, low humidity. Perfect conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ Fan Experience ══════ */}
        <section className="mb-12 md:mb-16 animate-fade-in-up delay-300">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-primary mb-8">
            Fan Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Review Card */}
            <div className="card-base p-6 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-full bg-bg-elevated flex items-center justify-center overflow-hidden border border-border">
                  <img
                    className="w-full h-full object-cover"
                    alt="Maria S."
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=MariaS"
                  />
                </div>
                <div>
                  <p className="font-headline font-bold text-text-primary text-sm">Maria S.</p>
                  <div className="flex text-accent gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed flex-grow">
                "The atmosphere here is electric! Section 204 has incredible
                views of the whole pitch. Arrive early to soak it all in."
              </p>
            </div>

            {/* Photo Grid */}
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { alt: 'Soccer ball', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_vskEac3zVKo1nmpl99uDJ2dlZwwcdziZFHEViSfDIVq6Sq59ZWueu4N1XGGqA9M5OQfp8nQye7ymqP7EMQgKCj_uR_BvlFr8zaCJXVAUt_BlSMQ7kKppclp449_WHJZpZLTZlpcDE2WEV25qN19Lk6OKk41JlfxZIfpGiy_ukFwO4xp9mJD8Rodp-pkjBXe7tciS-kJwlRMC_e8K5jF_TDTuctcUvhgyZSCV0hHEGN_gv68udtDvGByKQusVl_jLQArVjWdZ53Y' },
                { alt: 'Fans cheering', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIrgOBR-sxa4TPzDa4Q9a9Z-d7eZ0WH1QPkst2cJFlwwWGKYCzLkqxHNkCenZYNi5BdM8YbFYxPSpbLlW0PsWRVICh7iahehIuQB6I7KMjmdo-CSlFI3GmgGuX5usvOFmFkhw8RpleHN22PdHNZcdyMoYlB7OCgX5TGUjB300YNXpKe8Cr8fMu_lPpGZs-ZLT_CYDZ_33heR2D1n9dARAKOIPgf1oUP-5aVZYdCYsQxHAAmnZexzgU3TWA_PBdjNRjfTe8YAOBXuA' },
                { alt: 'Stadium exterior', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm9mrP7l1LUobgt3F5-MOf9pUfs6RMqhYzTzwlSxZx1TkC4Ksw6W8Lp2pxHftoxKnvNuleY6UvKPPkn5N24Qmk0ni4N5VikQPEIEQVOrd7EQYnSbnJaJRZbDz-OmD3879LbaAaAce2SYh5ZFx4RshdfyVn2IWEm2d0Kolk7Nq6hBJc7w17MnwN6VUPHxMZJGUQIBXFSkrEd9_e8gs95RDWOD_cEtciMmfwLHv1pgHezigzL6i70N7KyrRVzwWSEB-5VR2Hhc6MvWQ', colSpan: true },
              ].map((photo, i) => (
                <div
                  key={i}
                  className={`rounded-xl overflow-hidden aspect-square relative group ${
                    photo.colSpan ? 'md:col-span-2' : ''
                  }`}
                >
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={photo.alt}
                    src={photo.src}
                  />
                  <div className="absolute inset-0 bg-bg-deep/30 group-hover:bg-transparent transition-colors duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}