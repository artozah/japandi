import { useEffect, useRef } from 'react';

export const overlaySpring = { type: 'spring' as const, damping: 28, stiffness: 300 };

/**
 * Handles Escape-to-close, body scroll lock, and cleanup for overlay components.
 * Uses a ref for onClose to avoid re-running the effect on parent re-renders.
 */
export function useOverlayLock(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);
}
