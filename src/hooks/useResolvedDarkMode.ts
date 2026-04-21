'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export function useResolvedDarkMode(): boolean {
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

  return theme === 'dark' || (theme === 'system' && systemDark);
}
