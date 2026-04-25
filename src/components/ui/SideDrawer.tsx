'use client';

import { overlaySpring, useOverlayLock } from '@/hooks/useOverlayLock';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  title: string;
  children: ReactNode;
  width?: string;
}


export function SideDrawer({
  open,
  onClose,
  side,
  title,
  children,
  width = 'w-80',
}: SideDrawerProps) {
  const fromLeft = side === 'left';
  const initialX = fromLeft ? '-100%' : '100%';

  useOverlayLock(open, onClose);

  if (typeof window === 'undefined') return null;

  const dragConstraints = fromLeft
    ? { right: 0, left: 0 }
    : { left: 0, right: 0 };
  const dragElastic = fromLeft
    ? { right: 0, left: 0.3 }
    : { left: 0, right: 0.3 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="side-drawer-root"
          className="fixed inset-0 z-[55]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'absolute top-0 bottom-0 flex flex-col overflow-hidden border-border bg-card shadow-xl',
              fromLeft
                ? 'left-0 rounded-r-2xl border-r'
                : 'right-0 rounded-l-2xl border-l',
              width,
            )}
            style={{ willChange: 'transform' }}
            initial={{ x: initialX }}
            animate={{ x: 0 }}
            exit={{ x: initialX }}
            transition={overlaySpring}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="flex shrink-0 cursor-grab items-center justify-between border-b border-border px-4 py-3 active:cursor-grabbing"
              drag="x"
              dragConstraints={dragConstraints}
              dragElastic={dragElastic}
              onDragEnd={(_e, info) => {
                const dismiss = fromLeft
                  ? info.offset.x < -80 || info.velocity.x < -500
                  : info.offset.x > 80 || info.velocity.x > 500;
                if (dismiss) onClose();
              }}
            >
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>

            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
