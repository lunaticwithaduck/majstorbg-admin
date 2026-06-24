import type { NavModule } from '../config/constants';

export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  return `/${segments.slice(1).join('/')}` || '/';
}

export function isActive(currentPath: string, href: string): boolean {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function moduleIsActive(currentPath: string, module: NavModule): boolean {
  const directLinks = module.links ?? [];
  const groupLinks = (module.groups ?? []).flatMap((group) => group.links);
  return [...directLinks, ...groupLinks].some((link) => isActive(currentPath, link.href));
}
