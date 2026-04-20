'use client';

import { dark } from '@clerk/themes';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

const DARK_APPEARANCE = { theme: dark } as const;

export function useClerkAppearance() {
  const { theme } = useTheme();
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemDark);
  return useMemo(() => (isDark ? DARK_APPEARANCE : undefined), [isDark]);
}
