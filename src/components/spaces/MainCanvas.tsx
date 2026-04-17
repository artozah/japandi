'use client';

import { BeforeAfterSlider } from '@/components/spaces/BeforeAfterSlider';
import type { HistoryEntry } from '@/types/spaces';
import { Upload } from 'lucide-react';
import { useCallback } from 'react';

interface MainCanvasProps {
  selectedEntry: HistoryEntry | null;
  currentSourceImage: string | null;
  onImageUpload: (dataUrl: string) => void;
}

export function MainCanvas({
  selectedEntry,
  currentSourceImage,
  onImageUpload,
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

  if (
    selectedEntry &&
    selectedEntry.kind === 'generation' &&
    selectedEntry.status === 'ready' &&
    selectedEntry.imageUrl
  ) {
    return (
      <div className="flex h-[80%] w-full items-center justify-center bg-muted/30 p-4">
        <BeforeAfterSlider
          key={selectedEntry.id}
          beforeUrl={selectedEntry.sourceImageUrl}
          afterUrl={selectedEntry.imageUrl}
        />
      </div>
    );
  }

  const displayImage =
    selectedEntry?.kind === 'upload'
      ? selectedEntry.imageUrl
      : currentSourceImage;

  if (displayImage) {
    return (
      <div className="flex h-[80%] w-full items-center justify-center bg-muted/30 p-4">
        <div
          className="h-full w-full rounded-lg bg-muted"
          style={{
            backgroundImage: `url(${displayImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
    );
  }

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
