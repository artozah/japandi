'use client';

import { GenerationOverlay } from '@/components/spaces/GenerationOverlay';
import { useAutoResetState } from '@/hooks/useAutoResetState';
import { cn } from '@/lib/utils';
import type { GenerationHistoryEntry, HistoryEntry } from '@/types/spaces';
import { AlertCircle, Check, Download, Trash2, X } from 'lucide-react';

interface HistorySliderProps {
  history: HistoryEntry[];
  selectedEntryId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onDeleteGeneration: (id: string) => void;
  onDownloadGeneration: (entry: GenerationHistoryEntry) => void;
}

const containerCn =
  'flex h-[20%] w-full shrink-0 items-center border-t border-border bg-background px-4';

const tileBaseCn = 'relative h-24 w-32 shrink-0 overflow-hidden rounded-md';

const CONFIRM_TIMEOUT_MS = 3000;

function isReadyGeneration(
  entry: HistoryEntry,
): entry is GenerationHistoryEntry {
  return entry.kind === 'generation' && entry.status === 'ready';
}

export function HistorySlider({
  history,
  selectedEntryId,
  onSelect,
  onDeleteGeneration,
  onDownloadGeneration,
}: HistorySliderProps) {
  const {
    value: confirmingId,
    setWithTimeout: startConfirm,
    reset: cancelConfirm,
  } = useAutoResetState<string | null>(null, CONFIRM_TIMEOUT_MS);

  const confirmDelete = (id: string) => {
    cancelConfirm();
    onDeleteGeneration(id);
  };

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
        const canAct = isReadyGeneration(entry);
        const isConfirming = confirmingId === entry.id;

        return (
          <div
            key={entry.id}
            className={cn(
              tileBaseCn,
              'group/tile bg-muted transition-all',
              isActive
                ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                : 'hover:ring-1 hover:ring-border',
            )}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              aria-label={entry.label ?? `History ${entry.id}`}
            />

            {caption && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-center">
                <span className="text-xs font-medium leading-none text-white">
                  {caption}
                </span>
              </div>
            )}

            {canAct && (
              <div
                className={cn(
                  'absolute right-1.5 top-1.5 z-10 flex items-center gap-1 transition-opacity',
                  isConfirming
                    ? 'opacity-100'
                    : 'opacity-0 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100',
                )}
              >
                {isConfirming ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(entry.id);
                      }}
                      className="flex items-center gap-0.5 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-700"
                      aria-label="Confirm delete"
                    >
                      <Check className="h-3 w-3" />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelConfirm();
                      }}
                      className="flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-black/85"
                      aria-label="Cancel delete"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isReadyGeneration(entry)) onDownloadGeneration(entry);
                      }}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded bg-black/55 text-white hover:bg-black/75"
                      aria-label={`Download ${entry.styleLabel ?? ''}`.trim()}
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startConfirm(entry.id);
                      }}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded bg-black/55 text-white hover:bg-red-600"
                      aria-label={`Delete ${entry.styleLabel ?? ''}`.trim()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
