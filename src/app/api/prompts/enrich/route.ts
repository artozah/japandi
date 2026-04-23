import { toImageSource } from '@/lib/anthropic-image';
import { requireUserId } from '@/lib/auth';
import {
  ADJUST_SYSTEM_PROMPT,
  FINALIZE_PROMPT_TOOL,
  VISION_SYSTEM_PROMPT,
  buildTemplate,
  isKnownSpec,
  isSpecShape,
  shouldEnrich,
} from '@/lib/prompt-templates';
import type { PromptSpec } from '@/types/spaces';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;
const TIMEOUT_MS = 15_000;
const MAX_DESCRIPTION_LENGTH = 4000;

interface EnrichBody {
  imageUrl?: unknown;
  description?: unknown;
  spec?: unknown;
}

type EnrichMode = 'vision' | 'text' | 'template';

function jsonPrompt(
  prompt: string,
  mode: EnrichMode,
  enriched: boolean,
): Response {
  return Response.json(
    { prompt },
    {
      headers: {
        'x-enriched': enriched ? 'true' : 'false',
        'x-enrich-mode': mode,
      },
    },
  );
}

async function runClaudeCall(
  apiKey: string,
  systemPrompt: string,
  userContent: Anthropic.ContentBlockParam[],
  abortSignal: AbortSignal,
): Promise<string | null> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: [FINALIZE_PROMPT_TOOL],
      tool_choice: { type: 'tool', name: 'finalize_prompt' },
      messages: [{ role: 'user', content: userContent }],
    },
    { signal: abortSignal },
  );

  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === 'finalize_prompt') {
      const input = block.input as { prompt?: unknown };
      if (typeof input.prompt === 'string' && input.prompt.trim().length > 0) {
        return input.prompt.trim();
      }
    }
  }
  return null;
}

function buildVisionContent(
  imageUrl: string,
  spec: PromptSpec,
  template: string,
): Anthropic.ContentBlockParam[] | null {
  const imageSource = toImageSource(imageUrl);
  if (!imageSource) {
    console.warn(
      '[api/prompts/enrich] toImageSource returned null for',
      imageUrl,
    );
    return null;
  }
  return [
    { type: 'image', source: imageSource },
    {
      type: 'text',
      text: `The attached photo is the source room. The user selected "${spec.itemTitle}" (${spec.category} → ${spec.groupTitle}). Read it as intent.

Baseline (too generic — do NOT just rephrase this; use it only as the transformation direction, then produce a long, vivid, image-grounded design brief per the system rules):
${template}

Now produce the final finalize_prompt for THIS specific photo. Walk surface by surface (walls, floor, ceiling, cabinets/built-ins if any, windows, lighting, furniture, decor), and for each state what it becomes with specific materials, finishes, colors, and named pieces. 150–250 words. Preserve layout, camera angle, and architectural bones unless the selection explicitly changes them.`,
    },
  ];
}

function buildTextContent(
  description: string,
  spec: PromptSpec,
  template: string,
): Anthropic.ContentBlockParam[] {
  return [
    {
      type: 'text',
      text: `Room description (read as the source room — do not invent features that aren't here):
${description}

The user selected "${spec.itemTitle}" (${spec.category} → ${spec.groupTitle}).

Baseline (too generic — do NOT just rephrase this; use it only as the transformation direction, then produce a long, image-grounded design brief per the system rules):
${template}

Now produce the final finalize_prompt anchored to the room above. Walk surface by surface and for each state what it becomes with specific materials, finishes, colors, and named pieces. 150–250 words. Preserve layout, camera angle, and architectural bones unless the selection explicitly changes them.`,
    },
  ];
}

export async function POST(request: Request) {
  await requireUserId();

  let body: EnrichBody;
  try {
    body = (await request.json()) as EnrichBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isSpecShape(body.spec)) {
    return Response.json({ error: 'spec is required.' }, { status: 400 });
  }
  if (!isKnownSpec(body.spec)) {
    return Response.json({ error: 'Unknown spec values.' }, { status: 400 });
  }

  const imageUrl =
    typeof body.imageUrl === 'string' &&
    body.imageUrl.length > 0 &&
    body.imageUrl.length <= 2048
      ? body.imageUrl
      : null;
  const description =
    typeof body.description === 'string' &&
    body.description.trim().length > 0 &&
    body.description.length <= MAX_DESCRIPTION_LENGTH
      ? body.description.trim()
      : null;

  if (!imageUrl && !description) {
    return Response.json(
      { error: 'imageUrl or description is required.' },
      { status: 400 },
    );
  }

  const template = buildTemplate(body.spec);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonPrompt(template, 'template', false);
  if (!shouldEnrich(body.spec)) return jsonPrompt(template, 'template', false);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onRequestAbort = () => controller.abort();
  request.signal.addEventListener('abort', onRequestAbort, { once: true });

  try {
    if (description) {
      const content = buildTextContent(description, body.spec, template);
      const result = await runClaudeCall(
        apiKey,
        ADJUST_SYSTEM_PROMPT,
        content,
        controller.signal,
      );
      if (result) return jsonPrompt(result, 'text', true);
      return jsonPrompt(template, 'template', false);
    }

    if (!imageUrl) return jsonPrompt(template, 'template', false);
    const visionContent = buildVisionContent(imageUrl, body.spec, template);
    if (!visionContent) return jsonPrompt(template, 'template', false);
    const result = await runClaudeCall(
      apiKey,
      VISION_SYSTEM_PROMPT,
      visionContent,
      controller.signal,
    );
    if (result) return jsonPrompt(result, 'vision', true);
    return jsonPrompt(template, 'template', false);
  } catch (err) {
    console.warn('[api/prompts/enrich] enrichment failed, using template:', err);
    return jsonPrompt(template, 'template', false);
  } finally {
    clearTimeout(timeoutId);
    request.signal.removeEventListener('abort', onRequestAbort);
  }
}
