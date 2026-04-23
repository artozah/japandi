import { and, eq } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';
import { db, schema } from '@/db';
import { toImageSource } from '@/lib/anthropic-image';
import { ensureUserRow, requireUserId } from '@/lib/auth';
import {
  DESCRIBE_ROOM_TOOL,
  DESCRIBE_SYSTEM_PROMPT,
} from '@/lib/prompt-templates';

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;
const TIMEOUT_MS = 15_000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  await ensureUserRow(userId);
  const { id } = await params;

  const [row] = await db
    .select()
    .from(schema.uploads)
    .where(and(eq(schema.uploads.id, id), eq(schema.uploads.userId, userId)))
    .limit(1);

  if (!row) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  if (row.description) {
    return Response.json(
      { description: row.description },
      { headers: { 'x-describe-cached': 'true' } },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Describe unavailable.' },
      { status: 503 },
    );
  }

  const imageSource = toImageSource(row.blobUrl);
  if (!imageSource) {
    return Response.json(
      { error: 'Invalid image source.' },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onRequestAbort = () => controller.abort();
  request.signal.addEventListener('abort', onRequestAbort, { once: true });

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: DESCRIBE_SYSTEM_PROMPT,
        tools: [DESCRIBE_ROOM_TOOL],
        tool_choice: { type: 'tool', name: 'describe_room' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: imageSource },
              {
                type: 'text',
                text: 'Describe this room per the system rules. Pure observation, 120–200 words, one paragraph.',
              },
            ],
          },
        ],
      },
      { signal: controller.signal },
    );

    let description: string | null = null;
    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'describe_room') {
        const input = block.input as { description?: unknown };
        if (
          typeof input.description === 'string' &&
          input.description.trim().length > 0
        ) {
          description = input.description.trim();
          break;
        }
      }
    }

    if (!description) {
      return Response.json(
        { error: 'Describe returned no content.' },
        { status: 502 },
      );
    }

    const [updated] = await db
      .update(schema.uploads)
      .set({ description, describedAt: new Date() })
      .where(and(eq(schema.uploads.id, id), eq(schema.uploads.userId, userId)))
      .returning({ description: schema.uploads.description });

    return Response.json(
      { description: updated?.description ?? description },
      { headers: { 'x-describe-cached': 'false' } },
    );
  } catch (err) {
    console.warn('[api/uploads/:id/describe] failed:', err);
    return Response.json({ error: 'Describe failed.' }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
    request.signal.removeEventListener('abort', onRequestAbort);
  }
}
