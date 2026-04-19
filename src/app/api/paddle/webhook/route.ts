import { eq, sql } from 'drizzle-orm';
import { db, schema, type DbExecutor } from '@/db';
import { verifyCheckoutToken } from '@/lib/billing-token';
import {
  getPlan,
  getPlanByPriceId,
  verifyWebhookSignature,
  type Plan,
} from '@/lib/paddle';
import { grantTokens, setTokens } from '@/lib/tokens';

export const runtime = 'nodejs';

interface PaddleItem {
  price?: { id?: string };
}

interface PaddleCustomData {
  token?: string;
  planKey?: string;
}

interface PaddleEventPayload {
  event_id?: string;
  notification_id?: string;
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    subscription_id?: string;
    custom_data?: PaddleCustomData | null;
    items?: PaddleItem[];
    next_billed_at?: string | null;
    ends_at?: string | null;
    canceled_at?: string | null;
  };
}

const SUBSCRIPTION_EVENTS = new Set([
  'subscription.created',
  'subscription.activated',
  'subscription.updated',
  'subscription.canceled',
  'subscription.paused',
  'subscription.resumed',
]);

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function firstPriceId(items: PaddleItem[] | undefined): string | undefined {
  return items?.[0]?.price?.id;
}

async function resolveUserIdFromSubscription(
  executor: DbExecutor,
  subscriptionId: string | undefined | null,
): Promise<string | null> {
  if (!subscriptionId) return null;
  const [row] = await executor
    .select({ userId: schema.subscriptions.userId })
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.paddleSubscriptionId, subscriptionId))
    .limit(1);
  return row?.userId ?? null;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get('paddle-signature');
  if (!verifyWebhookSignature(raw, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: PaddleEventPayload;
  try {
    payload = JSON.parse(raw) as PaddleEventPayload;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = payload.event_type;
  const eventId = payload.event_id ?? payload.notification_id;
  if (!eventType || !eventId) {
    return Response.json({ ok: true });
  }

  const customData = payload.data?.custom_data ?? null;
  const verifiedToken = verifyCheckoutToken(customData?.token);
  const signedUserId = verifiedToken?.userId ?? null;
  const attrData = payload.data;

  try {
    await db.transaction(async (tx) => {
      const [ledger] = await tx
        .insert(schema.billingEvents)
        .values({
          paddleEventId: eventId,
          eventName: eventType,
          userId: signedUserId,
        })
        .onConflictDoNothing({ target: schema.billingEvents.paddleEventId })
        .returning({ id: schema.billingEvents.id });
      if (!ledger) return;

      if (eventType === 'transaction.completed') {
        const priceId = firstPriceId(attrData?.items);
        const plan = priceId ? getPlanByPriceId(priceId) : undefined;
        if (!plan) return;

        const userId =
          signedUserId ??
          (await resolveUserIdFromSubscription(tx, attrData?.subscription_id));
        if (!userId) return;

        if (plan.kind === 'one_time') {
          await grantTokens(userId, plan.tokens, tx);
        } else {
          await setTokens(userId, plan.tokens, tx);
        }
        return;
      }

      if (SUBSCRIPTION_EVENTS.has(eventType)) {
        const paddleSubscriptionId = attrData?.id;
        if (!paddleSubscriptionId) return;

        const priceId = firstPriceId(attrData?.items);
        const tokenPlanKey = verifiedToken?.planKey ?? customData?.planKey;
        const resolvedPlan: Plan | undefined =
          (tokenPlanKey && getPlan(tokenPlanKey)) ||
          (priceId ? getPlanByPriceId(priceId) : undefined);

        const status = attrData?.status ?? 'unknown';
        const renewsAt = parseDate(attrData?.next_billed_at);
        const endsAt =
          parseDate(attrData?.ends_at) ?? parseDate(attrData?.canceled_at);

        const userId =
          signedUserId ??
          (await resolveUserIdFromSubscription(tx, paddleSubscriptionId));

        if (resolvedPlan && resolvedPlan.kind === 'subscription' && userId) {
          await tx
            .insert(schema.subscriptions)
            .values({
              userId,
              planKey: resolvedPlan.key,
              paddleSubscriptionId,
              priceId: priceId ?? '',
              status,
              renewsAt,
              endsAt,
            })
            .onConflictDoUpdate({
              target: schema.subscriptions.paddleSubscriptionId,
              set: {
                planKey: resolvedPlan.key,
                priceId: priceId ?? '',
                status,
                renewsAt,
                endsAt,
                updatedAt: sql`now()`,
              },
            });
        } else {
          await tx
            .update(schema.subscriptions)
            .set({ status, renewsAt, endsAt, updatedAt: sql`now()` })
            .where(
              eq(
                schema.subscriptions.paddleSubscriptionId,
                paddleSubscriptionId,
              ),
            );
        }
      }
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[paddle/webhook] handler failed:', err);
    return Response.json({ error: 'Handler failed' }, { status: 500 });
  }
}
