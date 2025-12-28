import {
  Home,
  FileText,
  FolderOpen,
  BarChart2,
  Bot,
  Bell,
  Sparkles,
  Cog,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

// Single source of truth for dashboard navigation so sidebar/header stay in sync.
export const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { title: 'Overview', href: '/dashboard', icon: Home },
      { title: 'Documents', href: '/dashboard/documents', icon: FileText },
      { title: 'Templates', href: '/templates', icon: FolderOpen },
    ],
  },
  {
    title: 'Insights',
    items: [
      { title: 'Analytics', href: '/analytics', icon: BarChart2 },
      { title: 'AI Assistant', href: '/ai-assistant', icon: Bot, badge: 'Live' },
      { title: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', href: '/settings', icon: Cog },
      { title: 'Security', href: '/settings/security', icon: ShieldCheck },
      { title: 'Contact Support', href: '/contact', icon: MessageCircle },
    ],
  },
];

export const quickActions: NavItem[] = [
  { title: 'Ask AI', href: '/ai-assistant', icon: Sparkles },
  { title: 'Create Document', href: '/documents/new', icon: FileText },
  { title: 'View Analytics', href: '/analytics', icon: BarChart2 },
];
