import {
  Activity,
  Banknote,
  BarChart3,
  Briefcase,
  Code,
  CreditCard,
  FileText,
  Flag,
  Gavel,
  Hammer,
  Images,
  Languages,
  Layers,
  type LucideIcon,
  MapPin,
  Percent,
  Receipt,
  Scale,
  Settings,
  ShieldAlert,
  Split,
  Star,
  Tag,
  Tags,
  Timer,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { routes } from '@/config/routes';

export type NavLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export type NavGroup = {
  label: string;
  links: readonly NavLink[];
};

export type NavModule = {
  label: string;
  icon: LucideIcon;
  links?: readonly NavLink[];
  groups?: readonly NavGroup[];
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
  {
    label: 'Finance',
    icon: Wallet,
    links: [
      { href: routes.finance.transactions, label: 'Transactions', icon: CreditCard },
      { href: routes.finance.payouts, label: 'Payouts', icon: Banknote },
      { href: routes.finance.settings, label: 'Commission', icon: Percent },
    ],
  },
  {
    label: 'Trust & Safety',
    icon: ShieldAlert,
    links: [{ href: routes.trust.moderation, label: 'Moderation', icon: Flag }],
  },
  {
    label: 'Compliance',
    icon: Scale,
    links: [{ href: routes.compliance.dataRequests, label: 'Data requests', icon: FileText }],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    groups: [
      {
        label: 'Overview',
        links: [
          { href: routes.reports.users, label: 'User directory', icon: Users },
          { href: routes.reports.jobsFunnel, label: 'Jobs funnel', icon: TrendingUp },
          { href: routes.reports.disputes, label: 'Open disputes', icon: Gavel },
          { href: routes.reports.invoices, label: 'Invoices & AR aging', icon: Receipt },
        ],
      },
      {
        label: 'Marketplace',
        links: [
          { href: routes.reports.liquidity, label: 'Liquidity (bids per job)', icon: Layers },
          { href: routes.reports.matchSpeed, label: 'Match speed', icon: Timer },
          {
            href: routes.reports.cancellations,
            label: 'Cancellations & stuck jobs',
            icon: XCircle,
          },
          { href: routes.reports.bidOutcomes, label: 'Bid outcomes', icon: Split },
        ],
      },
      {
        label: 'Supply',
        links: [
          { href: routes.reports.workerSupply, label: 'Worker supply & coverage', icon: MapPin },
          { href: routes.reports.workerLeaderboard, label: 'Worker leaderboard', icon: Trophy },
          {
            href: routes.reports.profileCompleteness,
            label: 'Profile completeness',
            icon: UserCheck,
          },
        ],
      },
      {
        label: 'Growth',
        links: [
          { href: routes.reports.registrations, label: 'User registrations', icon: UserPlus },
          { href: routes.reports.engagement, label: 'Engagement & presence', icon: Activity },
        ],
      },
      {
        label: 'Quality',
        links: [{ href: routes.reports.ratings, label: 'Ratings & quality', icon: Star }],
      },
      {
        label: 'Catalogue',
        links: [
          { href: routes.reports.categories, label: 'Category performance', icon: Tags },
          { href: routes.reports.portfolio, label: 'Portfolio & content coverage', icon: Images },
        ],
      },
    ],
  },
];

export const ADMIN_SHELL_BRAND = {
  name: 'MajstorBG',
  suffix: 'Admin',
} as const;
