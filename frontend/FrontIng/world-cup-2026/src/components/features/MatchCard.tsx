import type { Match } from '../../types';
import { Badge } from '../ui/Badge';
import { Calendar, Clock } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  className?: string;
}

export function MatchCard({ match, className = '' }: MatchCardProps) {
  return (
    <div className={`glass rounded-2xl p-6 md:p-8 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Badge variant="secondary">
          Matchday {match.matchday} • Group {match.group}
        </Badge>
        <Badge variant="primary" dot>
          {match.date}
        </Badge>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4 md:gap-8 mb-6">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-3 flex-1">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg glow-pulse">
            <span className="font-headline font-black text-xl md:text-2xl text-text-inverse">
              {match.homeTeam.code}
            </span>
          </div>
          <span className="font-headline font-bold text-base md:text-lg tracking-tight text-text-primary text-center">
            {match.homeTeam.name}
          </span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center shrink-0">
          <span className="font-headline text-3xl md:text-4xl font-black gradient-text">VS</span>
          <span className="text-[0.65rem] uppercase text-text-muted mt-1 tracking-wider text-center max-w-[120px]">
            {match.venue}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-3 flex-1">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-bg-elevated flex items-center justify-center shadow-lg border border-border">
            <span className="font-headline font-black text-xl md:text-2xl text-secondary">
              {match.awayTeam.code}
            </span>
          </div>
          <span className="font-headline font-bold text-base md:text-lg tracking-tight text-text-primary text-center">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-5 border-t border-border flex justify-center gap-8">
        <div className="flex items-center gap-2 text-text-secondary">
          <Calendar className="text-primary w-5 h-5" />
          <span className="text-sm font-medium">{match.date}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <Clock className="text-primary w-5 h-5" />
          <span className="text-sm font-medium">{match.time}</span>
        </div>
      </div>
    </div>
  );
}
