'use client';

import { HistorySlider } from '@/components/spaces/HistorySlider';
import { LeftMenu, type StyleSelection } from '@/components/spaces/LeftMenu';
import { MainCanvas } from '@/components/spaces/MainCanvas';
import { MobileGate } from '@/components/spaces/MobileGate';
import { RightChat } from '@/components/spaces/RightChat';
import { SpacesHeader } from '@/components/spaces/SpacesHeader';
import { useRedesign } from '@/hooks/useRedesign';
import { streamChat } from '@/lib/chat-stream';
import type {
  ChatMessage,
  HistoryEntry,
  NavId,
  SpacesState,
} from '@/types/spaces';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function SpacesPage() {
  const [state, setState] = useState<SpacesState>({
    activeNav: 'style',
    history: [],
    messages: [],
    currentSourceEntryId: null,
    selectedEntryId: null,
  });

  const handleNavChange = useCallback((id: NavId) => {
    setState((prev) => ({ ...prev, activeNav: id }));
  }, []);

  const handleImageUpload = useCallback((dataUrl: string) => {
    setState((prev) => {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        kind: 'upload',
        imageUrl: dataUrl,
        timestamp: Date.now(),
        label: `Upload ${prev.history.filter((e) => e.kind === 'upload').length + 1}`,
      };
      return {
        ...prev,
        currentSourceEntryId: entry.id,
        selectedEntryId: entry.id,
        history: [...prev.history, entry],
      };
    });
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    if (entry.kind === 'generation' && entry.status !== 'ready') return;
    setState((prev) => ({ ...prev, selectedEntryId: entry.id }));
  }, []);

  const handleSelectOriginal = useCallback(() => {
    setState((prev) => {
      const latestUpload = prev.history.findLast((e) => e.kind === 'upload');
      if (!latestUpload) return prev;
      if (
        prev.currentSourceEntryId === latestUpload.id &&
        prev.selectedEntryId === latestUpload.id
      ) {
        return prev;
      }
      return {
        ...prev,
        currentSourceEntryId: latestUpload.id,
        selectedEntryId: latestUpload.id,
      };
    });
  }, []);

  const handlePromoteGenerated = useCallback(() => {
    setState((prev) => {
      const selected = prev.history.find((e) => e.id === prev.selectedEntryId);
      if (
        !selected ||
        selected.kind !== 'generation' ||
        selected.status !== 'ready'
      ) {
        return prev;
      }
      if (prev.currentSourceEntryId === selected.id) return prev;
      return { ...prev, currentSourceEntryId: selected.id };
    });
  }, []);

  const chatAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      chatAbortRef.current?.abort();
    };
  }, []);

  const patchMessage = useCallback(
    (id: string, patch: Partial<ChatMessage>) => {
      setState((prev) => {
        const target = prev.messages.find((m) => m.id === id);
        if (!target) return prev;
        const keys = Object.keys(patch) as Array<keyof ChatMessage>;
        const changed = keys.some((key) => patch[key] !== target[key]);
        if (!changed) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        };
      });
    },
    [],
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      if (chatAbortRef.current) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'complete',
      };
      const assistantId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now() + 1,
        status: 'streaming',
      };

      let historyForRequest: ChatMessage[] = [];
      let sourceForRequest: string | null = null;
      setState((prev) => {
        historyForRequest = [...prev.messages, userMsg];
        const sourceEntry = prev.history.find(
          (e) => e.id === prev.currentSourceEntryId,
        );
        sourceForRequest = sourceEntry?.imageUrl ?? null;
        return {
          ...prev,
          messages: [...prev.messages, userMsg, assistantMsg],
        };
      });

      const controller = new AbortController();
      chatAbortRef.current = controller;

      streamChat(
        { messages: historyForRequest, sourceImage: sourceForRequest },
        {
          onText: (delta) => {
            setState((prev) => {
              const target = prev.messages.find((m) => m.id === assistantId);
              if (!target) return prev;
              return {
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + delta }
                    : m,
                ),
              };
            });
          },
          onProposed: (proposal) => {
            patchMessage(assistantId, { proposedPrompt: proposal });
          },
          onDone: () => {
            patchMessage(assistantId, { status: 'complete' });
          },
          onError: (message) => {
            patchMessage(assistantId, { status: 'error' });
            toast.error(message);
          },
        },
        controller.signal,
      ).finally(() => {
        if (chatAbortRef.current === controller) {
          chatAbortRef.current = null;
        }
      });
    },
    [patchMessage],
  );

  const currentSourceEntry = useMemo(
    () =>
      state.history.find((e) => e.id === state.currentSourceEntryId) ?? null,
    [state.history, state.currentSourceEntryId],
  );

  const currentSourceImage = currentSourceEntry?.imageUrl ?? null;
  const currentSourceKind = currentSourceEntry?.kind ?? null;
  const hasUploads = state.history.some((e) => e.kind === 'upload');

  const selectedEntry = useMemo(
    () => state.history.find((e) => e.id === state.selectedEntryId) ?? null,
    [state.history, state.selectedEntryId],
  );

  const canPromoteGeneration =
    selectedEntry?.kind === 'generation' &&
    selectedEntry.status === 'ready' &&
    selectedEntry.id !== state.currentSourceEntryId;

  const { startRedesign } = useRedesign({ currentSourceImage, setState });

  const handleSelectStyle = useCallback(
    (selection: StyleSelection) => startRedesign(selection),
    [startRedesign],
  );

  const handleClearChat = useCallback(() => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    setState((prev) => (prev.messages.length === 0 ? prev : { ...prev, messages: [] }));
  }, []);

  const handleGenerateFromChat = useCallback(
    (messageId: string) => {
      const msg = state.messages.find((m) => m.id === messageId);
      if (!msg?.proposedPrompt) return;
      startRedesign({
        styleKey: `chat:${messageId}`,
        styleLabel: msg.proposedPrompt.label,
        prompt: msg.proposedPrompt.prompt,
      });
    },
    [state.messages, startRedesign],
  );

  const isChatStreaming = state.messages.some((m) => m.status === 'streaming');
  const hasSource = currentSourceImage !== null;

  const inFlightByStyleKey = useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of state.history) {
      if (
        entry.kind === 'generation' &&
        entry.status === 'generating' &&
        entry.sourceImageUrl === currentSourceImage
      ) {
        map[entry.styleKey] = entry.percentage;
      }
    }
    return map;
  }, [state.history, currentSourceImage]);

  return (
    <MobileGate>
      <div className="flex h-full w-full flex-col">
        <SpacesHeader />
        <div
          className="flex flex-1 flex-row overflow-hidden"
          style={{ height: 'calc(100dvh - 30px)' }}
        >
          <LeftMenu
            activeNav={state.activeNav}
            onNavChange={handleNavChange}
            inFlightByStyleKey={inFlightByStyleKey}
            onSelectStyle={handleSelectStyle}
          />
          <div className="flex h-full w-[60%] flex-col">
            <MainCanvas
              selectedEntry={selectedEntry}
              currentSourceImage={currentSourceImage}
              currentSourceEntryId={state.currentSourceEntryId}
              currentSourceKind={currentSourceKind}
              hasUploads={hasUploads}
              canPromoteGeneration={canPromoteGeneration}
              onImageUpload={handleImageUpload}
              onSelectOriginal={handleSelectOriginal}
              onPromoteGenerated={handlePromoteGenerated}
            />
            <HistorySlider
              history={state.history}
              selectedEntryId={state.selectedEntryId}
              onSelect={handleHistorySelect}
            />
          </div>
          <RightChat
            messages={state.messages}
            isStreaming={isChatStreaming}
            hasSource={hasSource}
            onSendMessage={handleSendMessage}
            onGenerateFromChat={handleGenerateFromChat}
            onClearChat={handleClearChat}
          />
        </div>
      </div>
    </MobileGate>
  );
}
