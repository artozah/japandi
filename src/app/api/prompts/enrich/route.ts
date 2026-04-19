import { toImageSource } from '@/lib/anthropic-image';
import { requireUserId } from '@/lib/auth';
import {
  buildTemplate,
  isKnownSpec,
  isSpecShape,
  shouldEnrich,
} from '@/lib/prompt-templates';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;
const TIMEOUT_MS = 15000;

const SYSTEM_PROMPT = `You rewrite interior-design prompts for an image-to-image redesign model (Flux Kontext / similar). You receive (1) a photo of a real room and (2) a short baseline describing the desired transformation. You produce ONE long, vivid, highly specific final prompt that will guide the model to make that change in THIS exact room.

Your output MUST read like a detailed design brief, not a generic style label. Specifically:

1. Open by naming the room type and its current state grounded in the photo: "this narrow galley kitchen with a tall window and checkerboard floor", "this bright living room with bay windows and a brick fireplace", etc.
2. Walk through the visible surfaces and elements in turn — walls, floor, ceiling, cabinets, countertops, windows/window treatments, lighting fixtures, furniture, and any focal props — and for each one specify what it BECOMES: the material, finish, color, texture, and form. Aim to cover 8–15 concrete elements.
3. Use specific, evocative descriptors, not abstract ones. Instead of "warm palette" say "aged oak, bleached linen, matte terracotta". Instead of "modern lighting" say "brushed brass pendant with frosted glass globe". Name materials (walnut, travertine, washi, boucle, jute, rattan), finishes (matte, oiled, limewashed, honed), and hues (muted clay, moss green, aged white, soft taupe).
4. Name specific furniture/decor pieces to add or swap — e.g., "low-slung oak slat bench", "handwoven jute runner", "paper washi pendant", "a single bonsai on the sill".
5. Specify lighting character: direction, color temperature, diffusion, and which existing fixtures are kept vs replaced.
6. Preserve layout, camera angle, window positions, and architectural bones unless the baseline explicitly overrides (Remove / Relight / Recolor / Aspect Ratio can override specific pieces — follow their intent).
7. End with a one-sentence mood line.

Hard rules:
- ALWAYS call the finalize_prompt tool. Never reply in plain text.
- Never ask questions. Never emit meta-commentary.
- Never output a short or generic prompt. Target 150–250 words.
- Never mention "style" without also describing concrete materials, colors, and pieces.`;

const FINALIZE_PROMPT_TOOL: Anthropic.Tool = {
  name: 'finalize_prompt',
  description:
    'Emit the final image-grounded redesign prompt. A single self-contained instruction for an image-to-image model, 150–250 words, referencing 8–15 concrete visible elements with specific materials, finishes, colors, and named pieces.',
  input_schema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description:
          'The final prompt. Opens by naming the room from the photo; walks through 8–15 surfaces/elements specifying concrete materials, finishes, colors, and named pieces; preserves layout and camera angle; ends with a one-sentence mood line.',
      },
    },
    required: ['prompt'],
  },
};

interface EnrichBody {
  imageUrl?: unknown;
  spec?: unknown;
}

function templateResponse(prompt: string): Response {
  return Response.json({ prompt }, { headers: { 'x-enriched': 'false' } });
}

function enrichedResponse(prompt: string): Response {
  return Response.json({ prompt }, { headers: { 'x-enriched': 'true' } });
}

export async function POST(request: Request) {
  await requireUserId();

  let body: EnrichBody;
  try {
    body = (await request.json()) as EnrichBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (
    !isSpecShape(body.spec) ||
    typeof body.imageUrl !== 'string' ||
    body.imageUrl.length > 2048
  ) {
    return Response.json(
      { error: 'imageUrl and spec are required.' },
      { status: 400 },
    );
  }
  if (!isKnownSpec(body.spec)) {
    return Response.json({ error: 'Unknown spec values.' }, { status: 400 });
  }

  const template = buildTemplate(body.spec);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return templateResponse(template);
  if (!shouldEnrich(body.spec)) return templateResponse(template);

  const imageSource = toImageSource(body.imageUrl);
  if (!imageSource) return templateResponse(template);

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
        system: SYSTEM_PROMPT,
        tools: [FINALIZE_PROMPT_TOOL],
        tool_choice: { type: 'tool', name: 'finalize_prompt' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: imageSource },
              {
                type: 'text',
                text: `The attached photo is the source room. The user selected "${body.spec.itemTitle}" (${body.spec.category} → ${body.spec.groupTitle}). Read it as intent.

Baseline (too generic — do NOT just rephrase this; use it only as the transformation direction, then produce a long, vivid, image-grounded design brief per the system rules):
${template}

Now produce the final finalize_prompt for THIS specific photo. Walk surface by surface (walls, floor, ceiling, cabinets/built-ins if any, windows, lighting, furniture, decor), and for each state what it becomes with specific materials, finishes, colors, and named pieces. 150–250 words. Preserve layout, camera angle, and architectural bones unless the selection explicitly changes them.`,
              },
            ],
          },
        ],
      },
      { signal: controller.signal },
    );

    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'finalize_prompt') {
        const input = block.input as { prompt?: unknown };
        if (typeof input.prompt === 'string' && input.prompt.trim().length > 0) {
          return enrichedResponse(input.prompt.trim());
        }
      }
    }
    return templateResponse(template);
  } catch (err) {
    console.warn('[api/prompts/enrich] enrichment failed, using template:', err);
    return templateResponse(template);
  } finally {
    clearTimeout(timeoutId);
    request.signal.removeEventListener('abort', onRequestAbort);
  }
}
