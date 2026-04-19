'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { buildFallbackPrompt, runRedesign } from '@/lib/redesign';
import type {
  GenerationHistoryEntry,
  HistoryEntry,
  SpacesState,
} from '@/types/spaces';

const MAX_PARALLEL = 5;

type SetSpacesState = React.Dispatch<React.SetStateAction<SpacesState>>;

export interface StartRedesignArgs {
  styleKey: string;
  styleLabel: string;
  styleImage?: string;
  prompt?: string;
}

export interface UseRedesignArgs {
  currentSourceEntry: HistoryEntry | null;
  setState: SetSpacesState;
}

export function useRedesign({ currentSourceEntry, setState }: UseRedesignArgs) {
  const abortersRef = useRef(new Map<string, AbortController>());
  const sourceEntryRef = useRef<HistoryEntry | null>(currentSourceEntry);

  useEffect(() => {
    sourceEntryRef.current = currentSourceEntry;
  }, [currentSourceEntry]);

  useEffect(() => {
    const aborters = abortersRef.current;
    return () => {
      aborters.forEach((controller) => controller.abort());
      aborters.clear();
    };
  }, []);

  const patchEntry = useCallback(
    (id: string, patch: Partial<GenerationHistoryEntry>) => {
      setState((prev) => {
        const target = prev.history.find((e) => e.id === id);
        if (!target || target.kind !== 'generation') return prev;
        const keys = Object.keys(patch) as Array<keyof GenerationHistoryEntry>;
        const changed = keys.some((key) => patch[key] !== target[key]);
        if (!changed) return prev;
        return {
          ...prev,
          history: prev.history.map((entry) => {
            if (entry.id !== id || entry.kind !== 'generation') return entry;
            return { ...entry, ...patch };
          }),
        };
      });
    },
    [setState],
  );

  const startRedesign = useCallback(
    ({ styleKey, styleLabel, styleImage, prompt }: StartRedesignArgs) => {
      const sourceEntry = sourceEntryRef.current;
      if (!sourceEntry || !sourceEntry.imageUrl) {
        toast.error('Upload an image first to start a redesign.');
        return;
      }
      if (abortersRef.current.size >= MAX_PARALLEL) {
        toast.warning(
          `You can run up to ${MAX_PARALLEL} redesigns at once — please wait for one to finish.`,
        );
        return;
      }

      const derivedPrompt = prompt ?? buildFallbackPrompt(styleLabel);
      const controller = new AbortController();
      const id = crypto.randomUUID();
      abortersRef.current.set(id, controller);

      const entry: GenerationHistoryEntry = {
        id,
        kind: 'generation',
        status: 'generating',
        styleKey,
        styleLabel,
        styleImage,
        prompt: derivedPrompt,
        sourceImageUrl: sourceEntry.imageUrl,
        imageUrl: null,
        percentage: 0,
        timestamp: Date.now(),
        label: styleLabel,
      };
      setState((prev) => ({ ...prev, history: [...prev.history, entry] }));

      runRedesign({
        id,
        sourceUploadId:
          sourceEntry.kind === 'upload' ? sourceEntry.id : undefined,
        sourceGenerationId:
          sourceEntry.kind === 'generation' ? sourceEntry.id : undefined,
        styleKey,
        styleLabel,
        prompt: derivedPrompt,
        onProgress: (percentage) => patchEntry(id, { percentage }),
        signal: controller.signal,
      })
        .then((result) => {
          patchEntry(id, {
            status: 'ready',
            imageUrl: result.imageUrl,
            percentage: 100,
          });
          toast.success(`${styleLabel} redesign is ready.`);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          const message =
            err instanceof Error ? err.message : 'Generation failed';
          patchEntry(id, { status: 'error', errorMessage: message });
          toast.error(`${styleLabel}: ${message}`);
        })
        .finally(() => {
          abortersRef.current.delete(id);
        });
    },
    [setState, patchEntry],
  );

  return { startRedesign };
}
