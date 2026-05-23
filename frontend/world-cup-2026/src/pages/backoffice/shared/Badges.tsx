export function SeverityBadge({ level }: { level: string | null }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    ALTA: { bg: '#fee2e2', fg: '#991b1b' },
    MEDIA: { bg: '#fef3c7', fg: '#92400e' },
    BAJA: { bg: '#dcfce7', fg: '#166534' },
  };
  const c = colors[(level ?? '').toUpperCase()] ?? { bg: '#e5e7eb', fg: '#374151' };
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {level ?? '—'}
    </span>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    ALTO: { bg: '#fee2e2', fg: '#991b1b' },
    MEDIO: { bg: '#fef3c7', fg: '#92400e' },
    BAJO: { bg: '#dcfce7', fg: '#166534' },
  };
  const c = colors[level] ?? { bg: '#e5e7eb', fg: '#374151' };
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: '4px 12px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
      }}
    >
      {level}
    </span>
  );
}
