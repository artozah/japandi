import { eq } from 'drizzle-orm';
import { validateWebhook } from 'replicate';
import { db, schema } from '@/db';
import { applyPredictionResult } from '@/lib/generations';
import { getWebhookSecret } from '@/lib/replicate';

export const runtime = 'nodejs';

const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

interface WebhookPayload {
  id?: string;
  status?: string;
  output?: unknown;
  error?: unknown;
}

export async function POST(request: Request) {
  const body = await request.text();
  const id = request.headers.get('webhook-id');
  const timestamp = request.headers.get('webhook-timestamp');
  const signature = request.headers.get('webhook-signature');

  if (!id || !timestamp || !signature) {
    return Response.json({ error: 'Missing webhook headers' }, { status: 400 });
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return Response.json({ error: 'Invalid timestamp' }, { status: 400 });
  }
  const nowSeconds = Date.now() / 1000;
  if (Math.abs(nowSeconds - ts) > MAX_CLOCK_SKEW_SECONDS) {
    return Response.json({ error: 'Timestamp out of range' }, { status: 401 });
  }

  const secret = getWebhookSecret();
  if (!secret) {
    return Response.json(
      { error: 'Webhook secret not configured' },
      { status: 503 },
    );
  }

  let valid = false;
  try {
    valid = await validateWebhook({ id, timestamp, signature, body, secret });
  } catch {
    valid = false;
  }
  if (!valid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(body) as WebhookPayload;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!payload.id || !payload.status) {
    return Response.json({ ok: true });
  }

  const [row] = await db
    .select()
    .from(schema.generations)
    .where(eq(schema.generations.providerPredictionId, payload.id))
    .limit(1);

  if (!row) return Response.json({ ok: true });

  await applyPredictionResult(row, {
    id: payload.id,
    status: payload.status,
    output: payload.output,
    error: payload.error,
  });

  return Response.json({ ok: true });
}
