"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/spaces";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to Japandi Spaces! Upload an image to get started, or tell me what kind of design you're looking for.",
  timestamp: Date.now(),
};

interface RightChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
}

export function RightChat({ messages, onSendMessage }: RightChatProps) {
  const [input, setInput] = useState("");

  const allMessages = [welcomeMessage, ...messages];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <aside className="flex h-full w-[20%] shrink-0 flex-col border-l border-border bg-background">
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted text-foreground"
              )}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </aside>
  );
}
