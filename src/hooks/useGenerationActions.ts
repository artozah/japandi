'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { downloadBlobUrl } from '@/lib/download';

export interface DownloadableGeneration {
  id: string;
  styleLabel: string;
  imageUrl: string | null;
}

export function useGenerationActions() {
  const downloadGeneration = useCallback(
    async (entry: DownloadableGeneration) => {
      if (!entry.imageUrl) return;
      const safeLabel =
        entry.styleLabel
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'generation';
      const filenameBase = `${safeLabel}-${entry.id.slice(0, 8)}`;
      try {
        await downloadBlobUrl(entry.imageUrl, filenameBase);
      } catch {
        toast.error('Download failed.');
      }
    },
    [],
  );

  const deleteGeneration = useCallback(
    async (id: string): Promise<{ ok: boolean }> => {
      try {
        const res = await fetch(`/api/generations/${id}`, {
          method: 'DELETE',
        });
        if (res.ok || res.status === 404) return { ok: true };
        toast.error('Failed to delete generation.');
        return { ok: false };
      } catch {
        toast.error('Failed to delete generation.');
        return { ok: false };
      }
    },
    [],
  );

  return { downloadGeneration, deleteGeneration };
}
