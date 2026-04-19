'use client';

import { BeforeAfterSlider } from '@/components/spaces/BeforeAfterSlider';
import { SourceSwitcher } from '@/components/spaces/SourceSwitcher';
import { uploadImage, type UploadedImage } from '@/lib/uploads';
import type { HistoryEntry } from '@/types/spaces';
import { Loader2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MainCanvasProps {
  selectedEntry: HistoryEntry | null;
  currentSourceEntry: HistoryEntry | null;
  hasUploads: boolean;
  canPromoteGeneration: boolean;
  isHydrating: boolean;
  onImageUpload: (image: UploadedImage) => void;
  onSelectOriginal: () => void;
  onPromoteGenerated: () => void;
}

export function MainCanvas({
  selectedEntry,
  currentSourceEntry,
  hasUploads,
  canPromoteGeneration,
  isHydrating,
  onImageUpload,
  onSelectOriginal,
  onPromoteGenerated,
}: MainCanvasProps) {
  const currentSourceImage = currentSourceEntry?.imageUrl ?? null;
  const currentSourceKind = currentSourceEntry?.kind ?? null;
  const currentSourceEntryId = currentSourceEntry?.id ?? null;
  const [isUploading, setIsUploading] = useState(false);
  const uploadingRef = useRef(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (uploadingRef.current) return;
      uploadingRef.current = true;
      setIsUploading(true);
      try {
        const image = await uploadImage(file);
        onImageUpload(image);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        toast.error(message);
      } finally {
        uploadingRef.current = false;
        setIsUploading(false);
      }
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

  if (isHydrating) {
    return (
      <div className="flex h-[80%] w-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentSourceImage) {
    return (
      <div
        className="flex h-[80%] w-full items-center justify-center p-6"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <label
          aria-busy={isUploading}
          className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-muted-foreground hover:bg-muted/50 aria-busy:cursor-wait aria-busy:opacity-75"
        >
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="text-center">
            <span className="text-sm font-medium text-foreground">
              {isUploading ? 'Uploading…' : 'Upload an image'}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              {isUploading ? 'Please wait' : 'or drag and drop here'}
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploading}
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
