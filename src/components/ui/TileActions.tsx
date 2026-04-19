'use client';

import { cn } from '@/lib/utils';
import { Check, Download, Trash2, X } from 'lucide-react';

interface TileActionsProps {
  label: string;
  confirming: boolean;
  onDownload: () => void;
  onStartConfirm: () => void;
  onConfirmDelete: () => void;
  onCancelConfirm: () => void;
}

// Parent must apply `group/tile` and `relative` to the containing element
// so hover/focus-within reveal works and absolute positioning is correct.
export function TileActions({
  label,
  confirming,
  onDownload,
  onStartConfirm,
  onConfirmDelete,
  onCancelConfirm,
}: TileActionsProps) {
  return (
    <div
      className={cn(
        'absolute right-1.5 top-1.5 z-10 flex items-center gap-1 transition-opacity',
        confirming
          ? 'opacity-100'
          : 'opacity-0 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100',
      )}
    >
      {confirming ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfirmDelete();
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
              onCancelConfirm();
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
              onDownload();
            }}
            className="flex h-[22px] w-[22px] items-center justify-center rounded bg-black/55 text-white hover:bg-black/75"
            aria-label={`Download ${label}`.trim()}
          >
            <Download className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartConfirm();
            }}
            className="flex h-[22px] w-[22px] items-center justify-center rounded bg-black/55 text-white hover:bg-red-600"
            aria-label={`Delete ${label}`.trim()}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  );
}
