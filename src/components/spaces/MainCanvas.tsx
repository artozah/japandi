'use client';

import { BeforeAfterSlider } from '@/components/spaces/BeforeAfterSlider';
import { SourceSwitcher } from '@/components/spaces/SourceSwitcher';
import type { HistoryEntry } from '@/types/spaces';
import { Upload } from 'lucide-react';
import { useCallback } from 'react';

interface MainCanvasProps {
  selectedEntry: HistoryEntry | null;
  currentSourceImage: string | null;
  currentSourceEntryId: string | null;
  currentSourceKind: HistoryEntry['kind'] | null;
  hasUploads: boolean;
  canPromoteGeneration: boolean;
  onImageUpload: (dataUrl: string) => void;
  onSelectOriginal: () => void;
  onPromoteGenerated: () => void;
}

export function MainCanvas({
  selectedEntry,
  currentSourceImage,
  currentSourceEntryId,
  currentSourceKind,
  hasUploads,
  canPromoteGeneration,
  onImageUpload,
  onSelectOriginal,
  onPromoteGenerated,
}: MainCanvasProps) {
  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          onImageUpload(result);
        }
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  if (!currentSourceImage) {
    return (
      <div
        className="flex h-[80%] w-full items-center justify-center p-6"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-muted-foreground hover:bg-muted/50">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <span className="text-sm font-medium text-foreground">
              Upload an image
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              or drag and drop here
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </label>
      </div>
    );
  }

  const beforeAfterEntry =
    selectedEntry?.kind === 'generation' &&
    selectedEntry.status === 'ready' &&
    selectedEntry.imageUrl !== null &&
    selectedEntry.id !== currentSourceEntryId
      ? selectedEntry
      : null;

  const plainImage =
    selectedEntry?.kind === 'upload'
      ? selectedEntry.imageUrl
      : currentSourceImage;

  return (
    <div className="flex h-[80%] w-full flex-col bg-muted/30 px-4 pt-3 pb-4">
      <div className="mb-2 flex shrink-0 justify-center">
        <SourceSwitcher
          currentSourceKind={currentSourceKind}
          hasUploads={hasUploads}
          canPromoteGeneration={canPromoteGeneration}
          onSelectOriginal={onSelectOriginal}
          onFileSelected={handleFile}
          onPromoteGenerated={onPromoteGenerated}
        />
      </div>
      <div className="min-h-0 flex-1">
        {beforeAfterEntry && beforeAfterEntry.imageUrl ? (
          <BeforeAfterSlider
            key={beforeAfterEntry.id}
            beforeUrl={beforeAfterEntry.sourceImageUrl}
            afterUrl={beforeAfterEntry.imageUrl}
          />
        ) : (
          <div
            className="h-full w-full rounded-lg bg-muted"
            style={{
              backgroundImage: `url(${plainImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>
    </div>
  );
}
