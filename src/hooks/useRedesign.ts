'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { runRedesign } from '@/lib/redesign';
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
}

export function useRedesign(state: SpacesState, setState: SetSpacesState) {
  const abortersRef = useRef(new Map<string, AbortController>());
  const sourceRef = useRef<string | null>(state.currentSourceImage);

  useEffect(() => {
    sourceRef.current = state.currentSourceImage;
  }, [state.currentSourceImage]);

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
    ({ styleKey, styleLabel, styleImage }: StartRedesignArgs) => {
      const source = sourceRef.current;
      if (!source) {
        toast.error('Upload an image first to start a redesign.');
        return;
      }

      if (abortersRef.current.size >= MAX_PARALLEL) {
        toast.warning(
          `You can run up to ${MAX_PARALLEL} redesigns at once — please wait for one to finish.`,
        );
        return;
      }

      const id = crypto.randomUUID();
      const controller = new AbortController();
      abortersRef.current.set(id, controller);

      const entry: HistoryEntry = {
        id,
        kind: 'generation',
        status: 'generating',
        styleKey,
        styleLabel,
        styleImage,
        sourceImageUrl: source,
        imageUrl: null,
        percentage: 0,
        timestamp: Date.now(),
        label: styleLabel,
      };

      setState((prev) => ({ ...prev, history: [...prev.history, entry] }));

      runRedesign({
        sourceImageUrl: source,
        styleLabel,
        styleImage,
        onProgress: (percentage) => patchEntry(id, { percentage }),
        signal: controller.signal,
      })
        .then((resultUrl) => {
          patchEntry(id, {
            status: 'ready',
            imageUrl: resultUrl,
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
