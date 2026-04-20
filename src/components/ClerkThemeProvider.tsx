'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { useClerkAppearance } from '@/hooks/useClerkAppearance';

export function ClerkThemeProvider({ children }: { children: ReactNode }) {
  const appearance = useClerkAppearance();
  return <ClerkProvider appearance={appearance}>{children}</ClerkProvider>;
}
