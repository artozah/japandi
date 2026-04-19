'use client';

import type { LibraryGeneration } from '@/components/library/types';
import { TileActions } from '@/components/ui/TileActions';
import { useAutoResetState } from '@/hooks/useAutoResetState';

interface LibraryGridProps {
  generations: LibraryGeneration[];
  onOpen: (entry: LibraryGeneration) => void;
  onDownload: (entry: LibraryGeneration) => void;
  onDelete: (id: string) => void;
}

const CONFIRM_TIMEOUT_MS = 3000;

export function LibraryGrid({
  generations,
  onOpen,
  onDownload,
  onDelete,
}: LibraryGridProps) {
  const {
    value: confirmingId,
    setWithTimeout: startConfirm,
    reset: cancelConfirm,
  } = useAutoResetState<string | null>(null, CONFIRM_TIMEOUT_MS);

  const handleConfirm = (id: string) => {
    cancelConfirm();
    onDelete(id);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {generations.map((entry) => {
        const isConfirming = confirmingId === entry.id;
        return (
          <div
            key={entry.id}
            className="group/tile relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            style={{
              backgroundImage: `url(${entry.outputBlobUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => onOpen(entry)}
              className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              aria-label={`Open ${entry.styleLabel}`}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-center">
              <span className="line-clamp-1 text-xs font-medium text-white">
                {entry.styleLabel}
              </span>
            </div>

            <TileActions
              label={entry.styleLabel}
              confirming={isConfirming}
              onDownload={() => onDownload(entry)}
              onStartConfirm={() => startConfirm(entry.id)}
              onConfirmDelete={() => handleConfirm(entry.id)}
              onCancelConfirm={cancelConfirm}
            />
          </div>
        );
      })}
    </div>
  );
}
