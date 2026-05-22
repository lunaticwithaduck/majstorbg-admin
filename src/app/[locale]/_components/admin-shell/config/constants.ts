import { Briefcase, Code, FileText, Flag, type LucideIcon, Settings, Users } from 'lucide-react';
import { routes } from '@/config/routes';

export type NavLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export type NavModule = {
  label: string;
  icon: LucideIcon;
  links: readonly NavLink[];
};

export const NAV_MODULES: readonly NavModule[] = [
  {
    label: 'User management',
    icon: Users,
    links: [{ href: routes.users.report, label: 'Report', icon: FileText }],
  },
  {
    label: 'Marketplace',
    icon: Briefcase,
    links: [{ href: routes.jobs.explorer, label: 'Jobs', icon: Briefcase }],
  },
  {
    label: 'Configuration',
    icon: Settings,
    links: [
      { href: routes.featureFlags, label: 'Feature flags', icon: Flag },
      { href: routes.apiExplorer, label: 'API explorer', icon: Code },
    ],
  },
];

export const ADMIN_SHELL_BRAND = {
  name: 'MajstorBG',
  suffix: 'Admin',
} as const;
