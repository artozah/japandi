'use client';

import { cn } from '@/lib/utils';
import { MessageSquare, Palette } from 'lucide-react';

interface MobileToolbarProps {
  activeSheet: 'styles' | 'chat' | null;
  onOpenStyles: () => void;
  onOpenChat: () => void;
}

export function MobileToolbar({
  activeSheet,
  onOpenStyles,
  onOpenChat,
}: MobileToolbarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[50] flex h-14 items-center justify-around border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      <button
        type="button"
        onClick={onOpenStyles}
        className={cn(
          'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
          activeSheet === 'styles'
            ? 'text-foreground'
            : 'text-muted-foreground',
        )}
      >
        <Palette className="h-5 w-5" />
        <span>Styles</span>
      </button>
      <button
        type="button"
        onClick={onOpenChat}
        className={cn(
          'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
          activeSheet === 'chat'
            ? 'text-foreground'
            : 'text-muted-foreground',
        )}
      >
        <MessageSquare className="h-5 w-5" />
        <span>Chat</span>
      </button>
    </div>
  );
}
