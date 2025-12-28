"use client";

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { NavBar } from '@/components/navbar';
import { SafeChildren } from '@/components/ui/safe-children';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full flex">
        {/* Sidebar - visible on medium screens and up */}
        <aside className="hidden md:block w-64 flex-shrink-0 border-r bg-background">
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col">
          {/* Top navigation bar - visible on all screen sizes */}
          <header className="sticky top-0 z-10 bg-background border-b">
            <div className="container mx-auto px-4">
              <NavBar />
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <SafeChildren>{children}</SafeChildren>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}