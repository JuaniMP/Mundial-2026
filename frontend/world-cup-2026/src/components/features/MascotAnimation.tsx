import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';

interface Mascot {
  name: string;
  emoji: string;
  color: string;
  delay: number;
  subtitle: string;
}

const MASCOTS: Mascot[] = [
  {
    name: 'Zincha',
    emoji: '🦫',
    color: '#C8962C',
    delay: 0,
    subtitle: '🇨🇴 Colombia',
  },
  {
    name: 'Ésquimo',
    emoji: '🐻‍❄️',
    color: '#74ACDF',
    delay: 0.35,
    subtitle: '🇨🇦 Canadá',
  },
  {
    name: 'Onza',
    emoji: '🐆',
    color: '#006847',
    delay: 0.7,
    subtitle: '🌎 CONCACAF',
  },
];

const DANCE_ANIM = {
  y: [0, -20, 0, -10, 0],
  rotate: [-4, 4, -2, 2, 0],
};

const BASE_TRANSITION: Omit<Transition, 'delay'> = {
  duration: 1.8,
  repeat: Infinity,
  ease: 'easeInOut',
};

export interface MascotAnimationProps {
  size?: 'sm' | 'md';
}

export function MascotAnimation({ size = 'md' }: MascotAnimationProps) {
  const boxSize = size === 'sm' ? 52 : 72;
  const emojiSize = size === 'sm' ? 26 : 36;
  const nameSize = size === 'sm' ? 10 : 12;
  const gap = size === 'sm' ? 16 : 32;

  return (
    <div
      style={{
        display: 'flex',
        gap,
        justifyContent: 'center',
        alignItems: 'flex-end',
      }}
    >
      {MASCOTS.map((m) => (
        <motion.div
          key={m.name}
          animate={DANCE_ANIM}
          transition={{ ...BASE_TRANSITION, delay: m.delay }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: boxSize,
              height: boxSize,
              borderRadius: 20,
              background: `${m.color}22`,
              border: `2px solid ${m.color}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: emojiSize,
              boxShadow: `0 4px 24px ${m.color}44`,
            }}
          >
            {m.emoji}
          </div>
          <span
            style={{
              fontSize: nameSize,
              fontFamily: 'Oswald, sans-serif',
              color: m.color,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {m.name}
          </span>
          <span
            style={{
              fontSize: nameSize - 1,
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            {m.subtitle}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
