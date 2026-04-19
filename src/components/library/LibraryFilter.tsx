'use client';

import type { LibraryUpload } from '@/components/library/types';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface LibraryFilterProps {
  uploads: LibraryUpload[];
  selectedUploadId: string | null;
  onSelect: (uploadId: string | null) => void;
}

export function LibraryFilter({
  uploads,
  selectedUploadId,
  onSelect,
}: LibraryFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = uploads.find((u) => u.id === selectedUploadId);
  const label = selected ? selected.label : 'All uploads';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <span className="text-muted-foreground">Source:</span>
        <span className="font-medium">{label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-40 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-border bg-card py-1 shadow-xl"
        >
          <FilterOption
            active={selectedUploadId === null}
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            label="All uploads"
          />
          {uploads.length > 0 && (
            <li
              role="separator"
              aria-hidden
              className="my-1 border-t border-border"
            />
          )}
          {uploads.map((u) => (
            <FilterOption
              key={u.id}
              active={selectedUploadId === u.id}
              onClick={() => {
                onSelect(u.id);
                setOpen(false);
              }}
              label={u.label}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterOption({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'block w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted',
          active ? 'font-medium text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </button>
    </li>
  );
}
