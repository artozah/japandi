import { del } from '@vercel/blob';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import type { Generation } from '@/db/schema';
import { requireUserId } from '@/lib/auth';
import {
  applyPredictionResult,
  selectGenerationForUser,
} from '@/lib/generations';
import { getReplicate } from '@/lib/replicate';
import { refundToken } from '@/lib/tokens';

export const runtime = 'nodejs';

const WAIT_MAX_MS = 9500;
const WAIT_TICK_MS = 1000;

function isTerminal(row: Generation): boolean {
  return row.status === 'ready' || row.status === 'error';
}

async function advanceGeneration(row: Generation): Promise<Generation> {
  if (row.provider !== 'replicate' || !row.providerPredictionId) return row;
  try {
    const replicate = getReplicate();
    const prediction = await replicate.predictions.get(row.providerPredictionId);
    return await applyPredictionResult(row, prediction);
  } catch (err) {
    console.warn('[generations/:id] Replicate poll failed:', err);
    return row;
  }
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  const { id } = await params;

  const url = new URL(request.url);
  const rawWait = Number(url.searchParams.get('wait') ?? 0);
  const wait = Number.isFinite(rawWait)
    ? Math.min(Math.max(0, rawWait), WAIT_MAX_MS)
    : 0;

  let row = await selectGenerationForUser(id, userId);
  if (!row) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  if (isTerminal(row)) {
    return Response.json({ generation: row });
  }

  // Single-shot (legacy): advance once via Replicate and return.
  if (wait === 0) {
    row = await advanceGeneration(row);
    return Response.json({ generation: row });
  }

  // Long-poll: tick through DB reads + Replicate calls until terminal or deadline.
  const deadline = Date.now() + wait;
  while (Date.now() < deadline && !request.signal.aborted) {
    row = await advanceGeneration(row);
    if (isTerminal(row)) {
      return Response.json({ generation: row });
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await sleep(Math.min(WAIT_TICK_MS, remaining), request.signal);

    const fresh = await selectGenerationForUser(id, userId);
    if (!fresh) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    row = fresh;
    if (isTerminal(row)) {
      return Response.json({ generation: row });
    }
  }

  return Response.json({ generation: row });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  const { id } = await params;

  const [row] = await db
    .delete(schema.generations)
    .where(
      and(
        eq(schema.generations.id, id),
        eq(schema.generations.userId, userId),
      ),
    )
    .returning();

  if (!row) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const cleanups: Promise<unknown>[] = [];
  const wasInFlight = row.status === 'pending' || row.status === 'running';
  if (wasInFlight && row.providerPredictionId && row.provider === 'replicate') {
    cleanups.push(getReplicate().predictions.cancel(row.providerPredictionId));
  }
  if (row.outputBlobPathname) {
    cleanups.push(del(row.outputBlobPathname));
  }
  const results = await Promise.allSettled(cleanups);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn('[generations/:id DELETE] cleanup failed:', result.reason);
    }
  }

  if (wasInFlight) await refundToken(userId);

  return Response.json({ ok: true });
}
