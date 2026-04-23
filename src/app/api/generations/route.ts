import { and, desc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { ensureUserRow, requireUserId } from '@/lib/auth';
import { buildStaticPrompt } from '@/lib/prompt-builder';
import { getModel, getReplicate, getWebhookUrl } from '@/lib/replicate';
import { refundToken, spendToken } from '@/lib/tokens';
import type { PromptSpec } from '@/types/spaces';

export const runtime = 'nodejs';

interface CreateBody {
  id?: string;
  sourceUploadId?: string;
  sourceGenerationId?: string;
  styleKey?: string;
  styleLabel?: string;
  prompt?: string;
  promptSpec?: PromptSpec;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  const userId = await requireUserId();
  const rows = await db
    .select({
      id: schema.generations.id,
      status: schema.generations.status,
      percentage: schema.generations.percentage,
      styleKey: schema.generations.styleKey,
      styleLabel: schema.generations.styleLabel,
      prompt: schema.generations.prompt,
      sourceUploadId: schema.generations.sourceUploadId,
      sourceGenerationId: schema.generations.sourceGenerationId,
      outputBlobUrl: schema.generations.outputBlobUrl,
      errorMessage: schema.generations.errorMessage,
      createdAt: schema.generations.createdAt,
    })
    .from(schema.generations)
    .where(eq(schema.generations.userId, userId))
    .orderBy(desc(schema.generations.createdAt));
  return Response.json({ generations: rows });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  await ensureUserRow(userId);

  const body = (await request.json()) as CreateBody;
  const hasUpload = Boolean(body.sourceUploadId);
  const hasGen = Boolean(body.sourceGenerationId);
  if (hasUpload === hasGen) {
    return Response.json(
      { error: 'Provide exactly one of sourceUploadId or sourceGenerationId' },
      { status: 400 },
    );
  }
  if (!body.styleKey || !body.styleLabel || !body.prompt) {
    return Response.json(
      { error: 'styleKey, styleLabel and prompt are required' },
      { status: 400 },
    );
  }
  if (body.id !== undefined && !UUID_RE.test(body.id)) {
    return Response.json({ error: 'id must be a UUID' }, { status: 400 });
  }

  let sourceImageUrl: string | null = null;
  if (body.sourceUploadId) {
    const [row] = await db
      .select({ id: schema.uploads.id, blobUrl: schema.uploads.blobUrl })
      .from(schema.uploads)
      .where(
        and(
          eq(schema.uploads.id, body.sourceUploadId),
          eq(schema.uploads.userId, userId),
        ),
      )
      .limit(1);
    if (!row) {
      return Response.json({ error: 'Source upload not found' }, { status: 404 });
    }
    sourceImageUrl = row.blobUrl;
  } else if (body.sourceGenerationId) {
    const [row] = await db
      .select({
        id: schema.generations.id,
        outputBlobUrl: schema.generations.outputBlobUrl,
        status: schema.generations.status,
      })
      .from(schema.generations)
      .where(
        and(
          eq(schema.generations.id, body.sourceGenerationId),
          eq(schema.generations.userId, userId),
        ),
      )
      .limit(1);
    if (!row || row.status !== 'ready' || !row.outputBlobUrl) {
      return Response.json(
        { error: 'Source generation is not available' },
        { status: 404 },
      );
    }
    sourceImageUrl = row.outputBlobUrl;
  }

  if (!sourceImageUrl) {
    return Response.json({ error: 'Source image missing' }, { status: 400 });
  }

  const prompt =
    body.promptSpec ? buildStaticPrompt(body.promptSpec) : body.prompt!;

  const spent = await spendToken(userId);
  if (!spent) {
    return Response.json(
      { error: 'Insufficient tokens', code: 'no_tokens' },
      { status: 402 },
    );
  }

  const [inserted] = await db
    .insert(schema.generations)
    .values({
      ...(body.id ? { id: body.id } : {}),
      userId,
      sourceUploadId: body.sourceUploadId ?? null,
      sourceGenerationId: body.sourceGenerationId ?? null,
      styleKey: body.styleKey,
      styleLabel: body.styleLabel,
      prompt,
      provider: 'replicate',
      status: 'pending',
    })
    .returning();

  try {
    const replicate = getReplicate();
    const webhook = getWebhookUrl();
    const prediction = await replicate.predictions.create({
      model: getModel(),
      input: {
        image: sourceImageUrl,
        prompt,
      },
      ...(webhook
        ? { webhook, webhook_events_filter: ['completed' as const] }
        : {}),
    });

    const [updated] = await db
      .update(schema.generations)
      .set({
        providerPredictionId: prediction.id,
        status: prediction.status === 'starting' ? 'pending' : 'running',
        updatedAt: new Date(),
      })
      .where(eq(schema.generations.id, inserted.id))
      .returning();

    return Response.json({ generation: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Replicate error';
    const [updated] = await db
      .update(schema.generations)
      .set({
        status: 'error',
        errorMessage: message.slice(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(schema.generations.id, inserted.id))
      .returning();
    await refundToken(userId);
    return Response.json({ generation: updated, error: message }, { status: 502 });
  }
}
