'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle } from 'lucide-react';
import { navItems } from '@/config/navigation';
import { useNavigation } from '@/context/navigation-context';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useNavigation();

  return (
    <div 
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
        !isSidebarOpen && '-translate-x-full md:translate-x-0',
        'md:block',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-semibold">Inkwell</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                    'transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                    item.disabled && 'pointer-events-none opacity-50',
                  )}
                  onClick={closeSidebar}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="mt-auto p-4 border-t">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2 text-sm">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Need help?</span>
            </div>
            <p className="mt-2 text-sm">
              Check our{' '}
              <a href="#" className="text-primary hover:underline">
                documentation
              </a>{' '}
              or contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
