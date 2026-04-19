'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useAutoResetState<T>(
  idleValue: T,
  timeoutMs: number,
): {
  value: T;
  setWithTimeout: (next: T) => void;
  reset: () => void;
} {
  const [value, setValue] = useState<T>(idleValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const setWithTimeout = useCallback(
    (next: T) => {
      clearTimer();
      setValue(next);
      timerRef.current = setTimeout(() => {
        setValue(idleValue);
        timerRef.current = null;
      }, timeoutMs);
    },
    [clearTimer, idleValue, timeoutMs],
  );

  const reset = useCallback(() => {
    clearTimer();
    setValue(idleValue);
  }, [clearTimer, idleValue]);

  return { value, setWithTimeout, reset };
}
