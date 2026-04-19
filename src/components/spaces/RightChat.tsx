'use client';

import { useAutoResetState } from '@/hooks/useAutoResetState';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/spaces';
import { Plus, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! Tell me what you'd like to change about the room and I'll help you shape a prompt to generate.",
  timestamp: 0,
  status: 'complete',
};

interface RightChatProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  hasSource: boolean;
  onSendMessage: (content: string) => void;
  onGenerateFromChat: (messageId: string) => void;
  onClearChat: () => void;
}

const GENERATE_COOLDOWN_MS = 3000;

export function RightChat({
  messages,
  isStreaming,
  hasSource,
  onSendMessage,
  onGenerateFromChat,
  onClearChat,
}: RightChatProps) {
  const [input, setInput] = useState('');
  const {
    value: generateCooldown,
    setWithTimeout: startCooldown,
  } = useAutoResetState(false, GENERATE_COOLDOWN_MS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = (messageId: string) => {
    if (generateCooldown) return;
    onGenerateFromChat(messageId);
    startCooldown(true);
  };

  const allMessages = [welcomeMessage, ...messages];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus();
  }, [isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const canClear = messages.length > 0 && !isStreaming;

  const handleClear = () => {
    onClearChat();
    inputRef.current?.focus();
  };

  return (
    <aside className="flex h-full w-[20%] shrink-0 flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Chat</span>
        <button
          type="button"
          onClick={handleClear}
          disabled={!canClear}
          aria-label="Start a new chat"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          New chat
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          {allMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              hasSource={hasSource}
              disabled={generateCooldown}
              onGenerate={() => handleGenerate(msg.id)}
            />
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isStreaming ? 'Waiting for reply…' : 'Type a message...'}
          disabled={isStreaming}
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isStreaming || input.trim().length === 0}
          className="rounded-md bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </aside>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  hasSource: boolean;
  disabled: boolean;
  onGenerate: () => void;
}

function MessageBubble({
  message,
  hasSource,
  disabled,
  onGenerate,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';
  const showTypingIndicator = isStreaming && message.content.length === 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5',
        isUser ? 'items-end' : 'items-start',
      )}
    >
      <div
        className={cn(
          'max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground',
          isError &&
            'border border-destructive/50 bg-destructive/10 text-destructive',
        )}
      >
        {showTypingIndicator ? <TypingDots /> : message.content}
      </div>
      {message.proposedPrompt && (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!hasSource || disabled}
          aria-label={
            hasSource
              ? 'Generate redesign'
              : 'Upload an image first to enable generation'
          }
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-foreground px-2.5 py-1.5 my-2 text-xs font-medium text-background cursor-pointer transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-3 w-3" />
          Generate redesign
        </button>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label="Assistant is typing"
    >
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
    </span>
  );
}
