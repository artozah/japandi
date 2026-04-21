'use client';

import { dark } from '@clerk/themes';
import { useMemo } from 'react';
import { useResolvedDarkMode } from '@/hooks/useResolvedDarkMode';

const DARK_APPEARANCE = { theme: dark } as const;

export function useClerkAppearance() {
  const isDark = useResolvedDarkMode();
  return useMemo(() => (isDark ? DARK_APPEARANCE : undefined), [isDark]);
}
