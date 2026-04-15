"use client";

import { useState, useCallback } from "react";
import { MobileGate } from "@/components/spaces/MobileGate";
import { SpacesHeader } from "@/components/spaces/SpacesHeader";
import { LeftMenu } from "@/components/spaces/LeftMenu";
import { MainCanvas } from "@/components/spaces/MainCanvas";
import { HistorySlider } from "@/components/spaces/HistorySlider";
import { RightChat } from "@/components/spaces/RightChat";
import type { SpacesState, HistoryEntry, ChatMessage } from "@/types/spaces";

export default function SpacesPage() {
  const [state, setState] = useState<SpacesState>({
    activeNav: "style",
    history: [],
    messages: [],
    currentImage: null,
  });

  const handleNavChange = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeNav: id }));
  }, []);

  const handleImageUpload = useCallback((dataUrl: string) => {
    setState((prev) => {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        imageUrl: dataUrl,
        timestamp: Date.now(),
        label: `Upload ${prev.history.length + 1}`,
      };
      return {
        ...prev,
        currentImage: dataUrl,
        history: [...prev.history, entry],
      };
    });
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setState((prev) => ({ ...prev, currentImage: entry.imageUrl }));
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    setState((prev) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
      };
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Thanks for your message! AI integration is coming soon. For now, try uploading an image to explore the editor.",
        timestamp: Date.now() + 1,
      };
      return {
        ...prev,
        messages: [...prev.messages, userMsg, aiMsg],
      };
    });
  }, []);

  return (
    <MobileGate>
      <div className="flex h-full w-full flex-col">
        <SpacesHeader />
        <div className="flex flex-1 flex-row overflow-hidden" style={{ height: "calc(100dvh - 30px)" }}>
          <LeftMenu activeNav={state.activeNav} onNavChange={handleNavChange} />
          <div className="flex h-full w-[60%] flex-col">
            <MainCanvas
              currentImage={state.currentImage}
              onImageUpload={handleImageUpload}
            />
            <HistorySlider
              history={state.history}
              currentImage={state.currentImage}
              onSelect={handleHistorySelect}
            />
          </div>
          <RightChat
            messages={state.messages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </MobileGate>
  );
}
