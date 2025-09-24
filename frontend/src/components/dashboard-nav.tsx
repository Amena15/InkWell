'use client';

import * as React from 'react';
import type { ReactNode, SVGProps } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';

// Define icon component props type
type IconProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

// Menu icon component
const MenuIcon: React.FC<IconProps> = ({ className = '', ...props }) => (
  <svg 
    className={`h-6 w-6 ${className}`} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 6h16M4 12h16m-7 6h7" 
    />
  </svg>
);

// Close (X) icon component
const XIcon: React.FC<IconProps> = ({ className = '', ...props }) => (
  <svg 
    className={`h-6 w-6 ${className}`} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M6 18L18 6M6 6l12 12" 
    />
  </svg>
);

// Logout icon component
const LogOutIcon: React.FC<IconProps> = ({ className = '', ...props }) => (
  <svg 
    className={`h-4 w-4 ${className}`} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
    />
  </svg>
);

// For backward compatibility
export const LogOut = LogOutIcon;

// Define types for navigation items
type NavigationItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

// Simple utility function to merge class names
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const navigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  { 
    name: 'Templates', 
    href: '/dashboard/templates',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

interface DashboardNavProps {
  // Add any props if needed
}

export function DashboardNav({}: DashboardNavProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  const handleSignOut = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-white text-xl font-bold">InkWell AI</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="text-blue-100 hover:!bg-blue-700/50 hover:!text-white"
            >
              <LogOutIcon />
              Sign out
            </Button>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XIcon />
              ) : (
                <MenuIcon />
              )}
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              className="text-blue-100 hover:!bg-blue-700/50 hover:!text-white"
              onClick={() => {
                const mobileMenu = document.querySelector('.mobile-menu');
                mobileMenu?.classList.toggle('hidden');
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="mobile-menu md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-base font-medium',
                pathname === item.href
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
              onClick={() => {
                const mobileMenu = document.querySelector('.mobile-menu');
                mobileMenu?.classList.add('hidden');
              }}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => {
              handleSignOut();
              const mobileMenu = document.querySelector('.mobile-menu');
              mobileMenu?.classList.add('hidden');
            }}
            className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700/50 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
