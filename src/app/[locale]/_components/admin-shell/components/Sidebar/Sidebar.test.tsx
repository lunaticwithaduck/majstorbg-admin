import { render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

const pathnameRef = { current: '/en/users/report' };

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameRef.current,
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@lunaticwithaduck/i18n/runtime/navigation', () => ({
  Link: ({
    children,
    href,
    ...rest
  }: { children?: ReactNode; href?: string } & Record<string, unknown>) =>
    createElement('a', { href, ...rest }, children),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => pathnameRef.current,
  redirect: vi.fn(),
  getPathname: () => pathnameRef.current,
}));

import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renders the User management module with the Report link', () => {
    pathnameRef.current = '/en/users/report';
    render(<Sidebar />);
    expect(screen.getByText(/User management/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Report/ })).toBeInTheDocument();
  });

  it('marks the Report link as current when pathname matches', () => {
    pathnameRef.current = '/en/users/report';
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /Report/ })).toHaveAttribute('aria-current', 'page');
  });

  it('marks the Report link as current when pathname is a child like /en/users/abc123', () => {
    pathnameRef.current = '/en/users/abc123';
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /Report/ })).not.toHaveAttribute('aria-current');
  });
});
