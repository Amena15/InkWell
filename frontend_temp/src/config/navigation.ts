import { FileText, Home, BarChart, Bot, Bell } from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart,
  },
  {
    title: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
];
