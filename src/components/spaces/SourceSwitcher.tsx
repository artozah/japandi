'use client';

import { cn } from '@/lib/utils';
import type { HistoryEntry } from '@/types/spaces';
import { useCallback, useRef } from 'react';

interface SourceSwitcherProps {
  currentSourceKind: HistoryEntry['kind'] | null;
  hasUploads: boolean;
  canPromoteGeneration: boolean;
  onSelectOriginal: () => void;
  onFileSelected: (file: File) => void;
  onPromoteGenerated: () => void;
}

export function SourceSwitcher({
  currentSourceKind,
  hasUploads,
  canPromoteGeneration,
  onSelectOriginal,
  onFileSelected,
  onPromoteGenerated,
}: SourceSwitcherProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
      e.target.value = '';
    },
    [onFileSelected],
  );

  const originalActive = currentSourceKind === 'upload';
  const generatedActive = currentSourceKind === 'generation';

  return (
    <div
      role="group"
      aria-label="Source photo"
      className="inline-flex overflow-hidden rounded-md border border-border bg-muted"
    >
      <SegmentButton
        active={originalActive}
        disabled={!hasUploads}
        onClick={onSelectOriginal}
      >
        Original
      </SegmentButton>
      <SegmentButton onClick={handleNewClick}>New</SegmentButton>
      <SegmentButton
        active={generatedActive}
        disabled={!canPromoteGeneration && !generatedActive}
        onClick={onPromoteGenerated}
      >
        Generated
      </SegmentButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

interface SegmentButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function SegmentButton({
  active,
  disabled,
  onClick,
  children,
}: SegmentButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'border-border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground [&:not(:first-child)]:border-l',
        active
          ? 'bg-foreground text-background'
          : 'text-foreground hover:bg-foreground hover:text-background',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
