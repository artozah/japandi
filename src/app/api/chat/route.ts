import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage } from '@/types/spaces';

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

const SYSTEM_PROMPT = `You are an interior design intake assistant inside a photo redesign tool. The user has a photo of a room and wants to redesign it. Your job is to understand their intent well enough to write a clear, vivid generation prompt — not to execute the redesign yourself.

Rules:
- If a photo is attached, look at it and reference specific elements the user has (layout, furniture, materials, lighting) in your questions and in the final prompt.
- Keep every reply short (1–3 sentences).
- Ask at most one concise clarifying question per turn. Skip small talk.
- Probe for: overall mood or style, color palette, materials, any must-keep elements, and what they want to change.
- When you have enough to write a specific prompt AND the user has confirmed the direction, call the propose_prompt tool. Do not propose a prompt in plain text — only via the tool.
- If the user's request is already specific on the first turn, you may propose immediately.`;

const PROPOSE_PROMPT_TOOL: Anthropic.Tool = {
  name: 'propose_prompt',
  description:
    'Finalize and propose a generation prompt for the interior redesign. Only call once you have a clear, concrete direction the user has confirmed.',
  input_schema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description:
          'A vivid, specific prompt describing the redesigned room — style, mood, palette, materials, and any must-keep elements.',
      },
      label: {
        type: 'string',
        description:
          'A short 2–4 word tag for the history slider (e.g. "Cozy Japandi", "Warm Industrial").',
      },
    },
    required: ['prompt', 'label'],
  },
};

function encodeSSE(event: string, data: unknown): Uint8Array {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return new TextEncoder().encode(payload);
}

type SupportedImageMediaType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp';

const SUPPORTED_IMAGE_MEDIA_TYPES: readonly SupportedImageMediaType[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

function parseDataUrl(
  dataUrl: string,
): { mediaType: SupportedImageMediaType; data: string } | null {
  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const mediaType = match[1] as SupportedImageMediaType;
  if (!SUPPORTED_IMAGE_MEDIA_TYPES.includes(mediaType)) return null;
  return { mediaType, data: match[2] };
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not set on the server.' },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[]; sourceImage?: string | null };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: 'Body must contain a non-empty messages array.' },
      { status: 400 },
    );
  }

  const anthropicMessages: Anthropic.MessageParam[] = messages
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));

  if (anthropicMessages.length === 0) {
    return Response.json(
      { error: 'No non-empty messages to send.' },
      { status: 400 },
    );
  }

  const imagePart = body.sourceImage ? parseDataUrl(body.sourceImage) : null;
  if (imagePart) {
    for (let i = anthropicMessages.length - 1; i >= 0; i--) {
      const msg = anthropicMessages[i];
      if (msg.role !== 'user') continue;
      const textContent = typeof msg.content === 'string' ? msg.content : '';
      anthropicMessages[i] = {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imagePart.mediaType,
              data: imagePart.data,
            },
          },
          { type: 'text', text: textContent },
        ],
      };
      break;
    }
  }

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const abortSignal = request.signal;
      const messageStream = client.messages.stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        tools: [PROPOSE_PROMPT_TOOL],
        messages: anthropicMessages,
      });

      const onAbort = () => messageStream.abort();
      abortSignal.addEventListener('abort', onAbort, { once: true });

      messageStream.on('text', (delta) => {
        controller.enqueue(encodeSSE('text', { delta }));
      });

      try {
        const final = await messageStream.finalMessage();
        for (const block of final.content) {
          if (block.type === 'tool_use' && block.name === 'propose_prompt') {
            const input = block.input as { prompt?: unknown; label?: unknown };
            if (
              typeof input.prompt === 'string' &&
              typeof input.label === 'string'
            ) {
              controller.enqueue(
                encodeSSE('proposed', {
                  prompt: input.prompt,
                  label: input.label,
                }),
              );
            }
          }
        }
        controller.enqueue(encodeSSE('done', {}));
      } catch (err) {
        if (abortSignal.aborted) {
          controller.close();
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Unknown streaming error';
        controller.enqueue(encodeSSE('error', { message }));
      } finally {
        abortSignal.removeEventListener('abort', onAbort);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
