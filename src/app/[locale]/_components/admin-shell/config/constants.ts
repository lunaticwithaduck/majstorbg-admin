import {
  Briefcase,
  Code,
  FileText,
  Flag,
  Hammer,
  Languages,
  type LucideIcon,
  Settings,
  Tag,
  Users,
} from 'lucide-react';
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
    label: 'Categories',
    icon: Tag,
    links: [
      { href: routes.skillCategories, label: 'Skill categories', icon: Hammer },
      { href: routes.jobCategories, label: 'Job categories', icon: Tag },
    ],
  },
  {
    label: 'Configuration',
    icon: Settings,
    links: [
      { href: routes.featureFlags, label: 'Feature flags', icon: Flag },
      { href: routes.localisations, label: 'Localisations', icon: Languages },
      { href: routes.apiExplorer, label: 'API explorer', icon: Code },
    ],
  },
];

export const ADMIN_SHELL_BRAND = {
  name: 'MajstorBG',
  suffix: 'Admin',
} as const;
