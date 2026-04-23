import { put } from '@vercel/blob';
import { and, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/db';
import type { Generation } from '@/db/schema';
import { refundToken } from '@/lib/tokens';

export async function selectGenerationForUser(
  id: string,
  userId: string,
): Promise<Generation | undefined> {
  const [row] = await db
    .select()
    .from(schema.generations)
    .where(
      and(
        eq(schema.generations.id, id),
        eq(schema.generations.userId, userId),
      ),
    )
    .limit(1);
  return row;
}

type PredictionSnapshot = {
  id: string;
  status: string;
  output?: unknown;
  error?: unknown;
};

const OPEN_STATUSES = ['pending', 'running'] as const;

async function getGeneration(id: string): Promise<Generation> {
  const [row] = await db
    .select()
    .from(schema.generations)
    .where(eq(schema.generations.id, id))
    .limit(1);
  return row;
}

export async function applyPredictionResult(
  row: Generation,
  prediction: PredictionSnapshot,
): Promise<Generation> {
  if (row.status === 'ready' || row.status === 'error') return row;

  if (prediction.status === 'succeeded') {
    const outputUrl = extractOutputUrl(prediction.output);
    if (!outputUrl) {
      return await markError(row.id, 'Replicate returned no output');
    }
    const stored = await downloadAndStore(outputUrl, row);
    const [updated] = await db
      .update(schema.generations)
      .set({
        status: 'ready',
        percentage: 100,
        outputBlobUrl: stored.url,
        outputBlobPathname: stored.pathname,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.generations.id, row.id),
          inArray(schema.generations.status, OPEN_STATUSES),
        ),
      )
      .returning();
    return updated ?? (await getGeneration(row.id));
  }

  if (prediction.status === 'failed' || prediction.status === 'canceled') {
    const message =
      typeof prediction.error === 'string' && prediction.error.length > 0
        ? prediction.error
        : prediction.status === 'canceled'
          ? 'Generation canceled'
          : 'Generation failed';
    const [transitioned] = await db
      .update(schema.generations)
      .set({
        status: 'error',
        errorMessage: message.slice(0, 500),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.generations.id, row.id),
          inArray(schema.generations.status, OPEN_STATUSES),
        ),
      )
      .returning();
    if (transitioned) {
      await refundToken(row.userId);
      return transitioned;
    }
    return await getGeneration(row.id);
  }

  if (row.status === 'pending' && prediction.status === 'processing') {
    const [updated] = await db
      .update(schema.generations)
      .set({ status: 'running', updatedAt: new Date() })
      .where(
        and(
          eq(schema.generations.id, row.id),
          eq(schema.generations.status, 'pending'),
        ),
      )
      .returning();
    return updated ?? (await getGeneration(row.id));
  }

  return row;
}

function extractOutputUrl(output: unknown): string | null {
  if (typeof output === 'string') return output;
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0];
  return null;
}

async function markError(id: string, message: string): Promise<Generation> {
  const [updated] = await db
    .update(schema.generations)
    .set({
      status: 'error',
      errorMessage: message.slice(0, 500),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.generations.id, id),
        inArray(schema.generations.status, OPEN_STATUSES),
      ),
    )
    .returning();
  return updated ?? (await getGeneration(id));
}

async function downloadAndStore(outputUrl: string, row: Generation) {
  const res = await fetch(outputUrl);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to fetch Replicate output: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') ?? 'image/png';
  const extension = contentType.split(';')[0].split('/')[1] ?? 'png';
  const pathname = `users/${row.userId}/generations/${row.id}.${extension}`;
  return await put(pathname, res.body, {
    access: 'public',
    contentType,
    allowOverwrite: true,
    addRandomSuffix: false,
  });
}

