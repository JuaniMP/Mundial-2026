export type Rareza = 'COMUN' | 'RARO' | 'EPICO' | 'LEGENDARIO';

export interface RarityInfo {
  label: string;
  color: string;
  glow: string;
  gradient: string;
  border: string;
  stars: number;
  foil: boolean;
}

export const RARITY: Record<Rareza, RarityInfo> = {
  COMUN: {
    label: 'Común',
    color: '#94a3b8',
    glow: 'rgba(148,163,184,0.3)',
    gradient: 'linear-gradient(135deg,#475569 0%,#94a3b8 100%)',
    border: '#64748b',
    stars: 1,
    foil: false,
  },
  RARO: {
    label: 'Raro',
    color: '#60a5fa',
    glow: 'rgba(59,130,246,0.5)',
    gradient: 'linear-gradient(135deg,#1d4ed8 0%,#60a5fa 100%)',
    border: '#3b82f6',
    stars: 2,
    foil: false,
  },
  EPICO: {
    label: 'Épico',
    color: '#c084fc',
    glow: 'rgba(168,85,247,0.6)',
    gradient: 'linear-gradient(135deg,#6d28d9 0%,#a855f7 50%,#c084fc 100%)',
    border: '#a855f7',
    stars: 3,
    foil: true,
  },
  LEGENDARIO: {
    label: 'Legendario',
    color: '#fbbf24',
    glow: 'rgba(245,158,11,0.7)',
    gradient: 'linear-gradient(135deg,#78350f 0%,#d97706 40%,#fbbf24 70%,#fde68a 100%)',
    border: '#f59e0b',
    stars: 4,
    foil: true,
  },
};

export function parseRareza(raw: string | undefined | null): Rareza {
  const r = (raw ?? '').toUpperCase();
  if (r === 'RARO') return 'RARO';
  if (r === 'EPICO' || r === 'ÉPICO') return 'EPICO';
  if (r === 'LEGENDARIO') return 'LEGENDARIO';
  return 'COMUN';
}
