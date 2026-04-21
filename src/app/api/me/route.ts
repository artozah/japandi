import { del } from '@vercel/blob';
import { and, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireUserId } from '@/lib/auth';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  cancelPaddleSubscription,
} from '@/lib/paddle';

export const runtime = 'nodejs';

const BLOB_DELETE_CONCURRENCY = 10;

async function bestEffortDel(pathname: string) {
  try {
    await del(pathname);
  } catch (err) {
    console.warn('[me DELETE] blob del failed for', pathname, err);
  }
}

async function deleteInChunks(paths: string[], chunkSize: number) {
  for (let i = 0; i < paths.length; i += chunkSize) {
    const batch = paths.slice(i, i + chunkSize);
    await Promise.allSettled(batch.map((p) => bestEffortDel(p)));
  }
}

export async function DELETE() {
  const userId = await requireUserId();

  const activeSubs = await db
    .select({ paddleSubscriptionId: schema.subscriptions.paddleSubscriptionId })
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.userId, userId),
        inArray(schema.subscriptions.status, ACTIVE_SUBSCRIPTION_STATUSES),
      ),
    );

  await Promise.allSettled(
    activeSubs.map((s) => cancelPaddleSubscription(s.paddleSubscriptionId)),
  );

  const uploads = await db
    .select({ pathname: schema.uploads.blobPathname })
    .from(schema.uploads)
    .where(eq(schema.uploads.userId, userId));

  const generations = await db
    .select({ pathname: schema.generations.outputBlobPathname })
    .from(schema.generations)
    .where(eq(schema.generations.userId, userId));

  const paths = [
    ...uploads.map((u) => u.pathname),
    ...generations
      .map((g) => g.pathname)
      .filter((p): p is string => typeof p === 'string' && p.length > 0),
  ];

  await deleteInChunks(paths, BLOB_DELETE_CONCURRENCY);

  await db.delete(schema.users).where(eq(schema.users.id, userId));

  return Response.json({ ok: true });
}
