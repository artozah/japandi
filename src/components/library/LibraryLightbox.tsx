'use client';

import { BeforeAfterSlider } from '@/components/spaces/BeforeAfterSlider';
import { Modal } from '@/components/ui/Modal';
import type { LibraryGeneration } from '@/components/library/types';
import { useAutoResetState } from '@/hooks/useAutoResetState';
import { Check, Download, Sparkles, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LibraryLightboxProps {
  entry: LibraryGeneration | null;
  onClose: () => void;
  onDownload: (entry: LibraryGeneration) => void;
  onDelete: (id: string) => Promise<void>;
}

export function LibraryLightbox({
  entry,
  onClose,
  onDownload,
  onDelete,
}: LibraryLightboxProps) {
  const router = useRouter();
  const {
    value: confirming,
    setWithTimeout: startConfirm,
    reset: cancelConfirm,
  } = useAutoResetState(false, 4000);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!entry) return;
    cancelConfirm();
    setDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleUseAsSource = () => {
    if (!entry) return;
    onClose();
    router.push(`/spaces?sourceGenerationId=${entry.id}`);
  };

  const open = entry !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? entry.styleLabel : ''}
      maxWidth="max-w-3xl"
    >
      {entry && (
        <div className="flex flex-col gap-4">
          {entry.sourceImageUrl ? (
            <div className="relative h-[calc(85vh-10rem)] min-h-[320px] w-full overflow-hidden rounded-lg border border-border">
              <BeforeAfterSlider
                beforeUrl={entry.sourceImageUrl}
                afterUrl={entry.outputBlobUrl}
                fit="contain"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div
                className="h-[calc(85vh-10rem)] min-h-[320px] w-full overflow-hidden rounded-lg border border-border"
                style={{
                  backgroundImage: `url(${entry.outputBlobUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <p className="text-xs text-muted-foreground">
                Source image is no longer available.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleUseAsSource}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Use as source
            </button>
            <button
              type="button"
              onClick={() => onDownload(entry)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            {confirming ? (
              <>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" />
                  {deleting ? 'Deleting…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={cancelConfirm}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => startConfirm(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-500/60 px-3 text-xs font-medium text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
