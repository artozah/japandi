export interface RunRedesignArgs {
  sourceImageUrl: string;
  styleLabel: string;
  styleImage?: string;
  onProgress: (percentage: number) => void;
  signal?: AbortSignal;
}

const MIN_DURATION_MS = 8_000;
const MAX_DURATION_MS = 16_000;
const FAILURE_RATE = 0.1;

export function runRedesign({
  sourceImageUrl,
  styleImage,
  onProgress,
  signal,
}: RunRedesignArgs): Promise<string> {
  const duration = MIN_DURATION_MS + Math.random() * (MAX_DURATION_MS - MIN_DURATION_MS);
  const start = Date.now();

  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const abort = () => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      if (signal.aborted) {
        abort();
        return;
      }
      signal.addEventListener('abort', abort, { once: true });
    }

    const tick = () => {
      if (signal?.aborted) return;
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const pct = Math.min(99, Math.round(progress * 100));
      onProgress(pct);

      if (progress >= 1) {
        signal?.removeEventListener('abort', abort);
        if (Math.random() < FAILURE_RATE) {
          reject(new Error('Generation failed — please try again'));
          return;
        }
        onProgress(100);
        // Mock stand-in: return the style's reference image so the before/after
        // slider shows two different images. Badge selections have no styleImage
        // and fall back to the source — a real backend would replace this entirely.
        resolve(styleImage ?? sourceImageUrl);
        return;
      }

      const delay = 150 + Math.random() * 200;
      timeoutId = setTimeout(tick, delay);
    };

    tick();
  });
}
