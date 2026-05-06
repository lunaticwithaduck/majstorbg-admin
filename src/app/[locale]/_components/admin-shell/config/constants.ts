import { FileText, type LucideIcon, Users } from 'lucide-react';
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
];

export const ADMIN_SHELL_BRAND = {
  name: 'MajstorBG',
  suffix: 'Admin',
} as const;
