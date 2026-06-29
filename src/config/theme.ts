/**
 * Theme (light / dark) resolution for admin.
 *
 * The design-system colours are Tailwind v4 `@theme` CSS variables generated
 * from `@lunaticwithaduck/webui`'s `tokens.ts`. Dark mode overrides those token
 * *values* under a `.dark` scope on `<html>` (see `src/app/globals.css`), so
 * every component keeps using the same token classes (`bg-background`,
 * `text-text`, …) and adapts automatically.
 *
 * Persistence is a cookie (not localStorage) so the Server Component root layout
 * can read it and render the correct `dark` class on `<html>` — no flash, no
 * hydration mismatch. Default is light.
 */

export const THEME_COOKIE = 'mbg-admin-theme';

export const THEME = {
  light: 'light',
  dark: 'dark',
} as const;

export type ThemeName = (typeof THEME)[keyof typeof THEME];

/** 1 year — the preference is sticky until the user flips it again. */
export const THEME_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
