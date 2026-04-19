'use client';

import { LibraryFilter } from '@/components/library/LibraryFilter';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { LibraryLightbox } from '@/components/library/LibraryLightbox';
import { LibraryTopBar } from '@/components/library/LibraryTopBar';
import type {
  LibraryGeneration,
  LibraryUpload,
} from '@/components/library/types';
import { useGenerationActions } from '@/hooks/useGenerationActions';
import { Images } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const PAGE_SIZE = 24;

interface UploadRow {
  id: string;
  blobUrl: string;
  createdAt: string;
}

export default function LibraryPage() {
  const [tokens, setTokens] = useState<number | null>(null);
  const [uploads, setUploads] = useState<LibraryUpload[]>([]);
  const [generations, setGenerations] = useState<LibraryGeneration[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filterUploadId, setFilterUploadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [lightbox, setLightbox] = useState<LibraryGeneration | null>(null);

  const { downloadGeneration, deleteGeneration } = useGenerationActions();

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/me/tokens', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.tokens === 'number') setTokens(data.tokens);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/uploads', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.uploads)) return;
        const sortedAsc = [...(data.uploads as UploadRow[])].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        setUploads(
          sortedAsc.map((u, idx) => ({
            id: u.id,
            blobUrl: u.blobUrl,
            createdAt: u.createdAt,
            label: `Original ${idx + 1}`,
          })),
        );
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const loadPage = useCallback(
    async (nextOffset: number, uploadId: string | null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(nextOffset),
        });
        if (uploadId) params.set('sourceUploadId', uploadId);
        const res = await fetch(`/api/me/generations?${params.toString()}`);
        if (!res.ok) {
          toast.error('Could not load library.');
          return;
        }
        const data = (await res.json()) as {
          generations: LibraryGeneration[];
          total: number;
        };
        setTotal(data.total);
        setGenerations((prev) =>
          nextOffset === 0 ? data.generations : [...prev, ...data.generations],
        );
        setOffset(nextOffset + data.generations.length);
      } catch {
        toast.error('Could not load library.');
      } finally {
        setLoading(false);
        setHydrated(true);
      }
    },
    [],
  );

  useEffect(() => {
    loadPage(0, filterUploadId);
  }, [loadPage, filterUploadId]);

  const handleDownload = useCallback(
    (entry: LibraryGeneration) =>
      downloadGeneration({
        id: entry.id,
        styleLabel: entry.styleLabel,
        imageUrl: entry.outputBlobUrl,
      }),
    [downloadGeneration],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const { ok } = await deleteGeneration(id);
      if (!ok) return;
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      setLightbox((curr) => (curr?.id === id ? null : curr));
      toast.success('Deleted.');
    },
    [deleteGeneration],
  );

  const loadMore = useCallback(() => {
    if (loading) return;
    loadPage(offset, filterUploadId);
  }, [filterUploadId, loadPage, loading, offset]);

  const canLoadMore = generations.length < total;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LibraryTopBar tokens={tokens} />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Your library
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {hydrated
                  ? `Showing ${generations.length} of ${total}`
                  : 'Loading…'}
              </p>
            </div>
            {uploads.length > 0 && (
              <LibraryFilter
                uploads={uploads}
                selectedUploadId={filterUploadId}
                onSelect={setFilterUploadId}
              />
            )}
          </div>

          {hydrated && generations.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <Images className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                {filterUploadId
                  ? 'No generations from this upload yet'
                  : 'Nothing generated yet'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Head back to Spaces and create your first redesign.
              </p>
              <Link
                href="/spaces"
                className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Spaces
              </Link>
            </div>
          )}

          {generations.length > 0 && (
            <LibraryGrid
              generations={generations}
              onOpen={setLightbox}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )}

          {canLoadMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="inline-flex h-10 items-center rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </main>

      <LibraryLightbox
        entry={lightbox}
        onClose={() => setLightbox(null)}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  );
}
