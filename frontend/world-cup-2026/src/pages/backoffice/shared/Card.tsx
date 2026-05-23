import type { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </div>
  );
}
