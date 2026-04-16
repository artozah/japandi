'use client';

import { cn } from '@/lib/utils';
import type { HistoryEntry } from '@/types/spaces';

interface HistorySliderProps {
  history: HistoryEntry[];
  currentImage: string | null;
  onSelect: (entry: HistoryEntry) => void;
}

const containerCn =
  'flex h-[20%] w-full shrink-0 items-center border-t border-border bg-background px-4';

export function HistorySlider({
  history,
  currentImage,
  onSelect,
}: HistorySliderProps) {
  if (history.length === 0) {
    return (
      <div className={cn(containerCn, 'justify-center')}>
        <p className="text-sm text-muted-foreground">
          Nothing here yet — start creating!
        </p>
      </div>
    );
  }

  return (
    <div className={cn(containerCn, 'gap-3 overflow-x-auto')}>
      {history.map((entry) => {
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
