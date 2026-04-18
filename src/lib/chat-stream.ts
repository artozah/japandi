import type { ChatMessage, ProposedPrompt } from '@/types/spaces';

export interface StreamChatHandlers {
  onText: (delta: string) => void;
  onProposed: (proposal: ProposedPrompt) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export interface StreamChatArgs {
  messages: ChatMessage[];
  sourceImage?: string | null;
}

export async function streamChat(
  { messages, sourceImage }: StreamChatArgs,
  handlers: StreamChatHandlers,
  signal: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, sourceImage }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    handlers.onError(err instanceof Error ? err.message : 'Network error');
    return;
  }

  if (!response.ok || !response.body) {
    let message = `Chat request failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // response wasn't JSON; keep default message
    }
    handlers.onError(message);
    return;
  }

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .getReader();

  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;

      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        dispatchFrame(frame, handlers);
        boundary = buffer.indexOf('\n\n');
      }
    }
  } catch (err) {
    if (signal.aborted) return;
    handlers.onError(err instanceof Error ? err.message : 'Stream error');
  } finally {
    reader.releaseLock();
  }
}

function dispatchFrame(frame: string, handlers: StreamChatHandlers): void {
  let event = 'message';
  let dataLine = '';
  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLine += line.slice(5).trim();
  }
  if (!dataLine) return;

  let data: unknown;
  try {
    data = JSON.parse(dataLine);
  } catch {
    return;
  }

  switch (event) {
    case 'text': {
      const delta = (data as { delta?: unknown })?.delta;
      if (typeof delta === 'string') handlers.onText(delta);
      return;
    }
    case 'proposed': {
      const d = data as { prompt?: unknown; label?: unknown };
      if (typeof d.prompt === 'string' && typeof d.label === 'string') {
        handlers.onProposed({ prompt: d.prompt, label: d.label });
      }
      return;
    }
    case 'done':
      handlers.onDone();
      return;
    case 'error': {
      const m = (data as { message?: unknown })?.message;
      handlers.onError(typeof m === 'string' ? m : 'Stream error');
      return;
    }
  }
}
