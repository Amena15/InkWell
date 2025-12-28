'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { quickActions, navSections } from '@/config/navigation';
import { useNavigation } from '@/context/navigation-context';
import { Bell, Sparkles } from 'lucide-react';

export function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { toggleSidebar } = useNavigation();

  const handleSignOut = async () => {
    try {
      // Clear the session and cookies
      const data = await signOut({
        redirect: false,
        callbackUrl: '/'
      });
      
      // Force a full page reload to clear all client-side state
      window.location.href = data.url || '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback to a full page reload if there's an error
      window.location.href = '/';
    }
  };

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-bold text-xl">
              InkWell
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Toggle navigation</span>
            <Sparkles className="h-4 w-4" />
          </Button>
          <Link href="/" className="font-semibold tracking-tight">
            InkWell
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {quickActions.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'flex items-center space-x-2 text-sm',
                    isActive && 'bg-accent'
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navSections[2].items.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
