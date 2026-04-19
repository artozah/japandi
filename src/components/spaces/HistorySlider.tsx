'use client';

import { GenerationOverlay } from '@/components/spaces/GenerationOverlay';
import { cn } from '@/lib/utils';
import type { HistoryEntry } from '@/types/spaces';
import { AlertCircle } from 'lucide-react';

interface HistorySliderProps {
  history: HistoryEntry[];
  selectedEntryId: string | null;
  onSelect: (entry: HistoryEntry) => void;
}

const containerCn =
  'flex h-[20%] w-full shrink-0 items-center border-t border-border bg-background px-4';

const tileBaseCn = 'relative h-24 w-32 shrink-0 overflow-hidden rounded-md';

export function HistorySlider({
  history,
  selectedEntryId,
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
        const isActive = selectedEntryId === entry.id;

        if (
          entry.kind === 'generation' &&
          (entry.status === 'generating' || entry.status === 'preparing')
        ) {
          return (
            <div
              key={entry.id}
              className={cn(tileBaseCn, 'bg-muted')}
              aria-label={
                entry.status === 'preparing'
                  ? `Preparing ${entry.styleLabel}`
                  : `Generating ${entry.styleLabel}`
              }
              style={
                entry.styleImage
                  ? {
                      backgroundImage: `url(${entry.styleImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
              <GenerationOverlay
                variant={entry.status === 'preparing' ? 'preparing' : 'progress'}
                percentage={entry.percentage}
                size="sm"
              />
            </div>
          );
        }

        if (entry.kind === 'generation' && entry.status === 'error') {
          return (
            <div
              key={entry.id}
              className={cn(
                tileBaseCn,
                'flex flex-col items-center justify-center gap-1 border border-red-500/60 bg-red-500/10 px-2 text-center',
              )}
              title={entry.errorMessage}
              aria-label={`Failed: ${entry.styleLabel}`}
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-medium text-red-600 leading-tight">
                {entry.styleLabel}
              </span>
              <span className="text-[9px] text-red-500">Failed</span>
            </div>
          );
        }

        const imageUrl =
          entry.kind === 'upload' ? entry.imageUrl : entry.imageUrl ?? '';
        const caption =
          entry.kind === 'generation' ? entry.styleLabel : entry.label;

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry)}
            className={cn(
              tileBaseCn,
              'bg-muted transition-all',
              isActive
                ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                : 'hover:ring-1 hover:ring-border',
            )}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-label={entry.label ?? `History ${entry.id}`}
          >
            {caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-center">
                <span className="text-xs font-medium leading-none text-white">
                  {caption}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
