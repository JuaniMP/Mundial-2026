import type { ReactNode } from 'react';

export const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="min-vh-100 bg-light">{children}</div>;
};
