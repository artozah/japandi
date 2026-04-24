import { and, desc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { ensureUserRow, requireUserId } from '@/lib/auth';
import { runGeminiGeneration } from '@/lib/google';
import { DEFAULT_MODEL, MODELS, isValidModelId, getReplicateModelId, buildReplicateInput } from '@/lib/models';
import { buildStaticPrompt } from '@/lib/prompt-builder';
import { getReplicate, getWebhookUrl } from '@/lib/replicate';
import { refundToken, spendToken } from '@/lib/tokens';
import type { PromptSpec } from '@/types/spaces';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface CreateBody {
  id?: string;
  sourceUploadId?: string;
  sourceGenerationId?: string;
  styleKey?: string;
  styleLabel?: string;
  promptSpec?: PromptSpec;
  overridePrompt?: string;
  model?: string;
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
  if (!body.styleKey || !body.styleLabel || (!body.promptSpec && !body.overridePrompt)) {
    return Response.json(
      { error: 'styleKey, styleLabel, and promptSpec (or overridePrompt) are required' },
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

  const prompt = body.overridePrompt ?? buildStaticPrompt(body.promptSpec!);

  const modelId = isValidModelId(body.model) ? body.model : DEFAULT_MODEL;
  const modelDef = MODELS[modelId];

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
      provider: modelDef.provider,
      model: modelDef.id,
      status: 'pending',
    })
    .returning();

  try {
    if (modelDef.provider === 'google') {
      const result = await runGeminiGeneration(
        sourceImageUrl,
        prompt,
        userId,
        inserted.id,
      );
      const [updated] = await db
        .update(schema.generations)
        .set({
          status: 'ready',
          percentage: 100,
          outputBlobUrl: result.blobUrl,
          outputBlobPathname: result.blobPathname,
          updatedAt: new Date(),
        })
        .where(eq(schema.generations.id, inserted.id))
        .returning();
      return Response.json({ generation: updated });
    }

    const replicate = getReplicate();
    const webhook = getWebhookUrl();
    const prediction = await replicate.predictions.create({
      model: getReplicateModelId(modelId),
      input: buildReplicateInput(modelId, sourceImageUrl, prompt),
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
    const message = err instanceof Error ? err.message : 'Generation error';
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
