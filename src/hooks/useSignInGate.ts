'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import type { MouseEvent } from 'react';

/**
 * Returns a `gate(redirectUrl, e?)` fn. When the user is unsigned, opens
 * Clerk's sign-in modal, calls `e?.preventDefault()`, and returns `true` so
 * the caller can early-return. Returns `false` when the user is signed in or
 * Clerk is still loading — in that case the caller should proceed normally.
 */
export function useSignInGate() {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  return (redirectUrl: string, e?: MouseEvent): boolean => {
    if (!isLoaded || isSignedIn) return false;
    e?.preventDefault();
    openSignIn({ forceRedirectUrl: redirectUrl });
    return true;
  };
}
