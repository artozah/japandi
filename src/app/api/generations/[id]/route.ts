import { del } from '@vercel/blob';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireUserId } from '@/lib/auth';
import { applyPredictionResult } from '@/lib/generations';
import { getReplicate } from '@/lib/replicate';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  const { id } = await params;

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

  if (!row) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  if (
    (row.status === 'pending' || row.status === 'running') &&
    row.providerPredictionId
  ) {
    try {
      const replicate = getReplicate();
      const prediction = await replicate.predictions.get(
        row.providerPredictionId,
      );
      const updated = await applyPredictionResult(row, prediction);
      return Response.json({ generation: updated });
    } catch (err) {
      console.error('[generations/:id] Replicate poll failed:', err);
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
  if (
    (row.status === 'pending' || row.status === 'running') &&
    row.providerPredictionId
  ) {
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

  return Response.json({ ok: true });
}
