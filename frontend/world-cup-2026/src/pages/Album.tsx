import { mockAlbum } from '../data/mockData';
import { StickerCard } from '../components/features/StickerCard';
import { PageHeader, ProgressBar, Button } from '../components/ui';
import { Star, Globe, ArrowRight, ChevronDown, Shield } from 'lucide-react';

export function Album() {
  const handleOpenPack = () => {
    alert('Opening pack animation would go here!');
  };

  return (
    <main className="pt-20 md:pt-24 pb-28 md:pb-12 max-w-screen-xl mx-auto w-full px-4 md:px-6 flex flex-col gap-10 overflow-x-hidden flex-1">
      {/* Hero & Progress */}
      <section className="flex flex-col md:flex-row gap-10 items-end justify-between card-base p-8 lg:p-12 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex-1 z-10 w-full">
          <span className="badge badge-secondary mb-3">Season 2026</span>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-8">
            <span className="gradient-text">The Collection</span>
          </h1>
          <div className="flex flex-col gap-4 max-w-md">
            <div className="flex justify-between items-baseline">
              <span className="font-headline text-2xl font-bold text-text-primary">{mockAlbum.completionPercentage}% Complete</span>
              <span className="text-sm text-text-muted">{mockAlbum.ownedStickers} / {mockAlbum.totalStickers} Stickers</span>
            </div>
            <ProgressBar value={0} segments={mockAlbum.progressByCountry.map(c => ({ percentage: c.percentage, color: c.color }))} height="h-3" />
            <div className="flex gap-4 mt-1">
              {mockAlbum.progressByCountry.map((c) => (
                <div key={c.country} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs text-text-muted">{c.country}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="z-10 flex flex-col items-center justify-center p-6 bg-bg-elevated rounded-2xl border border-border min-w-[180px]">
          <Star className="w-10 h-10 text-accent mb-2 fill-accent" />
          <span className="font-headline text-3xl font-bold gradient-text-gold">{mockAlbum.goldenStickers}</span>
          <span className="text-xs uppercase tracking-wider text-text-muted mt-1">Golden Stickers</span>
        </div>
      </section>

      {/* Pack Opening */}
      <section className="relative rounded-3xl p-10 lg:p-16 flex flex-col items-center justify-center min-h-[400px] overflow-visible bg-bg-surface border border-border animate-fade-in-up delay-100">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] h-[300px] bg-primary/10 blur-[60px] rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="flex justify-center items-center h-80 w-full relative">
            <div className="absolute w-40 h-56 bg-gradient-to-br from-secondary-dim to-secondary rounded-xl shadow-lg transform rotate-[-12deg] translate-x-[-40px] translate-y-[10px] scale-90 opacity-50 transition-transform hover:translate-y-0">
              <div className="absolute inset-0 border-[3px] border-white/10 rounded-xl m-2" />
            </div>
            <div className="absolute w-40 h-56 bg-gradient-to-br from-accent-dim to-accent rounded-xl shadow-lg transform rotate-[15deg] translate-x-[50px] translate-y-[20px] scale-[0.85] opacity-40 transition-transform hover:translate-y-[10px]">
              <div className="absolute inset-0 border-[3px] border-white/10 rounded-xl m-2" />
            </div>
            <div className="absolute w-48 h-64 gradient-primary rounded-xl shadow-xl transform hover:scale-105 hover:translate-y-[-10px] transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-4 border border-white/10 z-20 glow-pulse">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-12 h-12 text-white/50" />
              </div>
              <span className="font-headline text-white font-bold text-xl tracking-wide uppercase">Standard</span>
              <span className="text-primary-light text-xs tracking-widest uppercase mt-1">5 Stickers</span>
              <div className="absolute top-6 left-0 w-full h-[1px] bg-white/20 border-b border-black/10 border-dashed" />
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center gap-4">
            <Button variant="primary" size="lg" onClick={handleOpenPack}>Open 3 Packs</Button>
            <p className="text-sm text-text-muted">You have {mockAlbum.packs} unopened packs</p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="flex flex-col gap-6 animate-fade-in-up delay-200">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-text-primary">Recent Acquisitions</h2>
            <p className="text-text-muted mt-1">Sorted by rarity and date added.</p>
          </div>
          <Button variant="ghost" icon={ArrowRight} size="sm" className="hidden md:flex">View All Gallery</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
          <StickerCard isLarge name="Mexico City Arena" subtitle="Host Venue" labelBadge="Estadio Azteca" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAsdR0Aw7Ydh9rW1zEmbye6VZYtBbGvGJHed5bY5Ab-2YihAsiFMuhIJvG-KwIzKi74aYf4SgW7BOnrBTosw1crVO5_SP2nUoLeKAp9O66WBQI7EK72g8jYBUUrnT2qP_cHlnwul0QuHlCgyxT3CroN-DjbL2Eq-HXUaSt7kzS5MMvbuf4lO7tLGHbpLo-rS7s-PkmCANZzqjgC0Nrbz0FllvIaGB4cTPyYbo2zR4Nxy61pztSDXhLQAjbbYllTNcUKgSEcckWpJD4" />
          <StickerCard name="Player Name" subtitle="MEX - FW" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDeCl4b6yopJ6OYkeSN3oVCHnuLRf5WoL8ZdYouSk2wQYj9UGalpU_iNXrx00MTyWUnSg_9G3nEzmoE2KB17Qo_IYZVz5crFnPu9t-xWfLvkYiPaorIcLwvIousPZU5Lhjn1kmp1HZr0CNhDX-XyJvc1YeRw-oHpSWEl-oGJG7iX4w3OJHYus6HNOzjF-yqa1Q3LQLYhdUU7Mbg0o9e656sTLKGUYXCp4PsZ7PJ7UfnrdLWG7Q61pTsLjaK3Re49xCaVjMmya90gkY" />
          <StickerCard name="Official Match Ball" subtitle="Equipment" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuA_b91PzwkBb2DY569mCgJ2LhwrzkSYHRHZj5COOfsbQSXnbrvpzs4a2_PaKSgdrhI5yTNxRb7A7vtPTswMoKvqcnwKhytk0wVoZfI_sa2ZT-AfgX_nXiYLJEWXRT6gxfytsFycDaSzA5vUUszv-xihvL-wh2U3J4bnf1sppNGg6QAVqa3wjAH4IxCXwDkuMVwWq8jwkWfDV_bjyTLnprvZjCwcsHcBU5DU1wQnae8kFfyTNASniEa1JHEgbxsnZB3Ji9zQ6kmQsZ8" />
          <StickerCard isIcon name="USA National Team" subtitle="Emblem" icon={Shield} />
          <StickerCard name="Head Coach" subtitle="CAN - Staff" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCpZCFasBRhyyvD6bIcOw55iTN8m1a20-1KTUad1_S5Au_wqrPEqX4P2kP2EQvwpgrVXd0NQFPDU5ZPUI6nag418rybOURqhNVaKJpG1DHqYBbNmASQqWVySVoHauP3LLlASzmu9wKqAEGZaIc0WIPQkW9DxS0qNoR2W12pLzRUB4zNOImUPo9W2YfePGFjxTcd2MN9xjxafOVrC57I6ZfcdpFoAlzsJn8u55fzTfV6Wa4zlZwlFXl6tMb6SaQs8kaxpj7O6Efm7vI" />
        </div>
        <Button variant="outline" icon={ChevronDown} className="md:hidden w-full">Load More</Button>
      </section>
    </main>
  );
}