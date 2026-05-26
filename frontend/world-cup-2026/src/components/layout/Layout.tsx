import React from 'react';
import { SponsorsFooter } from './SponsorsFooter';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-deep text-text-primary antialiased relative overflow-x-hidden w-full flex flex-col">
      <div className="relative z-10 w-full flex-1 block">{children}</div>
      <SponsorsFooter />
      {/* Bottom spacing for mobile nav */}
      <div className="h-24 md:hidden" />
    </div>
  );
}
