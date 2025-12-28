import * as React from 'react';
import { NavBar } from '@/components/navbar';
import { SafeChildren } from '@/components/ui/safe-children';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <SafeChildren>{children}</SafeChildren>
      </main>
    </div>
  );
}
