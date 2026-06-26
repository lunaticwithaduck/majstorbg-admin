'use client';

import { Button, Icon, Text } from '@lunaticwithaduck/webui';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { THEME, THEME_COOKIE, THEME_MAX_AGE_SECONDS } from '@/config/theme';
import { THEME_TOGGLE } from './config/constants';
import styles from './ThemeToggle.styles';

export default function ThemeToggle() {
  // Seed from the class the server already rendered on <html>, so the first
  // paint and the toggle agree (no hydration flicker).
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleToggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    // biome-ignore lint/suspicious/noDocumentCookie: a plain cookie write is intentional — the Cookie Store API has no stable Firefox/Safari support, and the server layout reads this cookie to render the theme class without a flash.
    document.cookie = `${THEME_COOKIE}=${next ? THEME.dark : THEME.light}; path=/; max-age=${THEME_MAX_AGE_SECONDS}; samesite=lax`;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      aria-label={isDark ? THEME_TOGGLE.toLight : THEME_TOGGLE.toDark}
      className={styles.root}
    >
      <Icon icon={isDark ? Sun : Moon} size="sm" />
      <Text as="span" size="sm" weight="medium">
        {isDark ? THEME_TOGGLE.toLight : THEME_TOGGLE.toDark}
      </Text>
    </Button>
  );
}
