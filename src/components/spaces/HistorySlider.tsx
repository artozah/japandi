'use client';

import { cn } from '@/lib/utils';
import type { HistoryEntry } from '@/types/spaces';

const dummyHistory: HistoryEntry[] = Array.from({ length: 8 }, (_, i) => ({
  id: `dummy-${i}`,
  imageUrl: '/images/japandi.webp',
  timestamp: Date.now() - (8 - i) * 60_000,
  label: `Design ${i + 1}`,
}));

interface HistorySliderProps {
  history: HistoryEntry[];
  currentImage: string | null;
  onSelect: (entry: HistoryEntry) => void;
}

export function HistorySlider({
  history,
  currentImage,
  onSelect,
}: HistorySliderProps) {
  const entries = history.length > 0 ? history : dummyHistory;

  return (
    <div className="flex h-[20%] w-full shrink-0 items-center gap-3 overflow-x-auto border-t border-border bg-background px-4">
      {entries.map((entry) => {
        const isActive = currentImage === entry.imageUrl;
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry)}
            className={cn(
              'h-24 w-32 shrink-0 rounded-md bg-muted transition-all',
              isActive
                ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                : 'hover:ring-1 hover:ring-border',
            )}
            style={{
              backgroundImage: `url(${entry.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-label={entry.label ?? `History ${entry.id}`}
          />
        );
      })}
    </div>
  );
}
