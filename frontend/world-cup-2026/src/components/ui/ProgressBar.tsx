interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  segments?: { percentage: number; color: string }[];
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color,
  height = 'h-2',
  segments,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full bg-bg-hover rounded-full ${height} overflow-hidden ${className}`}>
      {segments ? (
        <div className="flex h-full">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="h-full transition-all duration-700 ease-out"
              style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
            />
          ))}
        </div>
      ) : (
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${percentage}%`,
            background: color || 'linear-gradient(90deg, var(--color-primary-dim), var(--color-primary))',
          }}
        />
      )}
    </div>
  );
}
