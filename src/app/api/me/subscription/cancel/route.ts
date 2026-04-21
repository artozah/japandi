import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireUserId } from '@/lib/auth';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  cancelPaddleSubscription,
  subscriptionDbPatchFromPaddle,
} from '@/lib/paddle';

export const runtime = 'nodejs';

export async function POST() {
  const userId = await requireUserId();

  const [sub] = await db
    .select({ paddleSubscriptionId: schema.subscriptions.paddleSubscriptionId })
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.userId, userId),
        inArray(schema.subscriptions.status, ACTIVE_SUBSCRIPTION_STATUSES),
        isNull(schema.subscriptions.endsAt),
      ),
    )
    .orderBy(desc(schema.subscriptions.updatedAt))
    .limit(1);

  if (!sub) {
    return Response.json(
      { error: 'No active subscription.' },
      { status: 404 },
    );
  }

  const paddleSub = await cancelPaddleSubscription(
    sub.paddleSubscriptionId,
    'next_billing_period',
  );
  if (!paddleSub) {
    return Response.json({ error: 'cancel_failed' }, { status: 502 });
  }

  await db
    .update(schema.subscriptions)
    .set({ ...subscriptionDbPatchFromPaddle(paddleSub), updatedAt: sql`now()` })
    .where(
      eq(schema.subscriptions.paddleSubscriptionId, sub.paddleSubscriptionId),
    );

  return Response.json({ ok: true });
}
