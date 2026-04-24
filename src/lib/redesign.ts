import { safeReadError } from '@/lib/http';
import type { PromptSpec } from '@/types/spaces';

export class InsufficientTokensError extends Error {
  constructor() {
    super('Out of tokens');
    this.name = 'InsufficientTokensError';
  }
}

export interface GenerationRow {
  id: string;
  status: 'pending' | 'running' | 'ready' | 'error';
  percentage: number;
  outputBlobUrl: string | null;
  errorMessage: string | null;
  styleKey: string;
  styleLabel: string;
  sourceUploadId: string | null;
  sourceGenerationId: string | null;
  createdAt: string;
}

export interface RunRedesignArgs {
  id: string;
  sourceUploadId?: string;
  sourceGenerationId?: string;
  styleKey: string;
  styleLabel: string;
  promptSpec?: PromptSpec;
  overridePrompt?: string;
  model?: string;
  onProgress: (percentage: number) => void;
  signal?: AbortSignal;
}

export interface RedesignResult {
  generationId: string;
  imageUrl: string;
}

const EXPECTED_DURATION_MS = 8_000;
const TICK_INTERVAL_MS = 150;
const PROGRESS_CAP = 95;
const MAX_POLL_DURATION_MS = 10 * 60 * 1000;
const SERVER_WAIT_MS = 9_500;
const RETRY_GAP_MS = 1_000;

export async function runRedesign(args: RunRedesignArgs): Promise<RedesignResult> {
  const startTime = Date.now();
  let lastPct = -1;
  const tickInterval = setInterval(() => {
    if (args.signal?.aborted) return;
    const elapsed = Date.now() - startTime;
    const ratio = 1 - Math.exp(-elapsed / EXPECTED_DURATION_MS);
    const pct = Math.min(PROGRESS_CAP, Math.round(ratio * PROGRESS_CAP));
    if (pct !== lastPct) {
      lastPct = pct;
      args.onProgress(pct);
    }
  }, TICK_INTERVAL_MS);

  try {
    const createRes = await fetch('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: args.id,
        sourceUploadId: args.sourceUploadId,
        sourceGenerationId: args.sourceGenerationId,
        styleKey: args.styleKey,
        styleLabel: args.styleLabel,
        promptSpec: args.promptSpec,
        overridePrompt: args.overridePrompt,
        model: args.model,
      }),
      signal: args.signal,
    });

    if (!createRes.ok) {
      if (createRes.status === 402) throw new InsufficientTokensError();
      const err = await safeReadError(createRes);
      throw new Error(err ?? 'Failed to start generation');
    }

    // Check if the POST already returned a terminal result (e.g. Gemini)
    const created = (await createRes.json()) as { generation: GenerationRow };
    if (created.generation.status === 'ready' && created.generation.outputBlobUrl) {
      return { generationId: created.generation.id, imageUrl: created.generation.outputBlobUrl };
    }
    if (created.generation.status === 'error') {
      throw new Error(created.generation.errorMessage ?? 'Generation failed');
    }

    // Poll until ready — the server long-polls so no initial delay needed
    while (true) {
      if (args.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      if (Date.now() - startTime > MAX_POLL_DURATION_MS) {
        throw new Error('Generation timed out');
      }

      try {
        const res = await fetch(
          `/api/generations/${args.id}?wait=${SERVER_WAIT_MS}`,
          { signal: args.signal },
        );
        if (!res.ok) {
          await sleep(RETRY_GAP_MS, args.signal);
          continue;
        }
        const { generation: row } = (await res.json()) as { generation: GenerationRow };
        if (row.status === 'ready' && row.outputBlobUrl) {
          return { generationId: row.id, imageUrl: row.outputBlobUrl };
        }
        if (row.status === 'error') {
          throw new Error(row.errorMessage ?? 'Generation failed');
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') throw err;
      }

      await sleep(RETRY_GAP_MS, args.signal);
    }
  } finally {
    clearInterval(tickInterval);
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
