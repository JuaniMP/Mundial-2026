import { BadgeCheck } from 'lucide-react';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  country: string;
  points: number | string;
  avatarSeed: string;
  isCurrentUser?: boolean;
  isTop?: boolean;
  dotColor?: string;
  className?: string;
}

export function LeaderboardRow({
  rank,
  name,
  country,
  points,
  avatarSeed,
  isCurrentUser = false,
  isTop = false,
  dotColor = 'bg-primary',
  className = '',
}: LeaderboardRowProps) {
  return (
    <div
      className={`
        group relative flex items-center justify-between p-4 pl-5 rounded-xl
        transition-all duration-300
        ${isCurrentUser
          ? 'bg-primary-subtle border border-border-accent'
          : 'card-base'
        }
        ${className}
      `}
    >
      {/* Left accent bar for top player */}
      {isTop && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 rounded-r-sm gradient-primary" />
      )}

      <div className="flex items-center gap-4 md:gap-5 min-w-0">
        {/* Rank */}
        <span
          className={`font-headline font-black text-lg md:text-xl w-10 text-center shrink-0 ${
            isTop ? 'text-primary' : 'text-text-muted'
          }`}
        >
          {typeof rank === 'number' && rank <= 3 ? (
            <span className="gradient-text">{rank}</span>
          ) : (
            rank.toLocaleString()
          )}
        </span>

        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            alt={name}
            className={`rounded-full object-cover ${
              isTop ? 'w-11 h-11' : 'w-9 h-9'
            } ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-base' : ''}`}
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
          />
          {rank === 1 && (
            <div className="absolute -bottom-1 -right-1 bg-bg-card rounded-full p-0.5">
              <BadgeCheck className="w-4 h-4 text-accent fill-accent text-bg-card" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h3 className={`font-headline font-semibold text-sm md:text-base truncate ${
            isCurrentUser ? 'text-primary' : 'text-text-primary'
          }`}>
            {name}
            {isCurrentUser && (
              <span className="text-xs font-normal text-text-muted ml-1.5">(You)</span>
            )}
          </h3>
          <span className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            <span className="text-[0.65rem] uppercase tracking-[0.1em] text-text-muted font-medium">
              {country}
            </span>
          </span>
        </div>
      </div>

      {/* Points */}
      <div className={`font-headline font-bold text-base md:text-lg tracking-tight shrink-0 ${
        isCurrentUser ? 'text-primary' : 'text-text-primary'
      }`}>
        {typeof points === 'number' ? points.toLocaleString() : points}
      </div>
    </div>
  );
}
