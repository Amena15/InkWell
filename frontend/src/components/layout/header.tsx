import Link from 'next/link';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
};

type HeaderProps = {
  className?: string;
  navItems?: NavItem[];
};

export function Header({ className, navItems = [] }: HeaderProps) {
  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">InkWell AI</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
