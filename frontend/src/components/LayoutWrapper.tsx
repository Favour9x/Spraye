'use client';

import { Navigation } from './Navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}
