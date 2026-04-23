'use client';

import { HistorySlider } from '@/components/spaces/HistorySlider';
import { LeftMenu, type StyleSelection } from '@/components/spaces/LeftMenu';
import { MainCanvas } from '@/components/spaces/MainCanvas';
import { MobileGate } from '@/components/spaces/MobileGate';
import { RightChat } from '@/components/spaces/RightChat';
import { SpacesHeader } from '@/components/spaces/SpacesHeader';
import { useGenerationActions } from '@/hooks/useGenerationActions';
import { useRedesign } from '@/hooks/useRedesign';
import { streamChat } from '@/lib/chat-stream';
import type { GenerationRow } from '@/lib/redesign';
import type { UploadedImage } from '@/lib/uploads';
import type {
  ChatMessage,
  GenerationHistoryEntry,
  HistoryEntry,
  InFlightMap,
  NavId,
  SpacesState,
} from '@/types/spaces';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UploadRow {
  id: string;
  blobUrl: string;
  createdAt: string;
}

interface ChatMessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'complete' | 'error';
  proposedPrompt: { prompt: string; label: string } | null;
  createdAt: string;
}

export default function SpacesPage() {
  const [state, setState] = useState<SpacesState>({
    activeNav: 'style',
    history: [],
    messages: [],
    currentSourceEntryId: null,
    selectedEntryId: null,
  });
  const [isHydrating, setIsHydrating] = useState(true);
  const [tokens, setTokens] = useState<number | null>(null);

  const refreshTokens = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/me/tokens', { signal });
      if (!res.ok) return;
      const data = (await res.json()) as { tokens?: number };
      if (typeof data.tokens === 'number') setTokens(data.tokens);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refreshTokens(controller.signal);
    return () => controller.abort();
  }, [refreshTokens]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'success') return;
    toast.success('Thanks! Your tokens are on the way.');
    const url = new URL(window.location.href);
    url.searchParams.delete('checkout');
    window.history.replaceState({}, '', url.toString());
    const timer = setTimeout(() => refreshTokens(), 2000);
    return () => clearTimeout(timer);
  }, [refreshTokens]);


  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const [uploadsRes, generationsRes, sessionRes] = await Promise.all([
          fetch('/api/uploads', { signal: controller.signal }),
          fetch('/api/generations', { signal: controller.signal }),
          fetch('/api/chat/session', { signal: controller.signal }),
        ]);
        if (!uploadsRes.ok) throw new Error('Failed to load uploads');
        if (!generationsRes.ok) throw new Error('Failed to load generations');
        if (!sessionRes.ok) throw new Error('Failed to load chat session');

        const uploadsData = (await uploadsRes.json()) as {
          uploads: UploadRow[];
        };
        const generationsData = (await generationsRes.json()) as {
          generations: GenerationRow[];
        };
        const sessionData = (await sessionRes.json()) as {
          session: { id: string };
          messages: ChatMessageRow[];
        };

        const uploadsByIdAsc = [...uploadsData.uploads].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        const uploadEntries: HistoryEntry[] = uploadsByIdAsc.map((row, idx) => ({
          id: row.id,
          kind: 'upload',
          imageUrl: row.blobUrl,
          timestamp: new Date(row.createdAt).getTime(),
          label: `Original ${idx + 1}`,
        }));
        const uploadUrlById = new Map(
          uploadsByIdAsc.map((row) => [row.id, row.blobUrl] as const),
        );

        const generationsByIdAsc = [...generationsData.generations].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        const generationOutputById = new Map(
          generationsByIdAsc.map(
            (row) => [row.id, row.outputBlobUrl] as const,
          ),
        );
        const generationEntries: HistoryEntry[] = generationsByIdAsc.flatMap(
          (row) => {
            const sourceImageUrl = row.sourceUploadId
              ? uploadUrlById.get(row.sourceUploadId) ?? null
              : row.sourceGenerationId
                ? generationOutputById.get(row.sourceGenerationId) ?? null
                : null;
            if (!sourceImageUrl) return [];
            return [
              {
                id: row.id,
                kind: 'generation',
                status:
                  row.status === 'ready'
                    ? 'ready'
                    : row.status === 'error'
                      ? 'error'
                      : 'generating',
                styleKey: row.styleKey,
                styleLabel: row.styleLabel,
                prompt: row.prompt ?? undefined,
                sourceImageUrl,
                imageUrl: row.outputBlobUrl,
                percentage: row.percentage,
                errorMessage: row.errorMessage ?? undefined,
                timestamp: new Date(row.createdAt).getTime(),
                label: row.styleLabel,
              },
            ];
          },
        );

        const chatMessages: ChatMessage[] = sessionData.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt).getTime(),
          status: m.status,
          proposedPrompt: m.proposedPrompt ?? undefined,
        }));

        const requestedSourceId =
          new URLSearchParams(window.location.search).get(
            'sourceGenerationId',
          ) ?? null;
        if (requestedSourceId) {
          const url = new URL(window.location.href);
          url.searchParams.delete('sourceGenerationId');
          window.history.replaceState({}, '', url.toString());
        }

        setState((prev) => {
          const combined = [...uploadEntries, ...generationEntries].sort(
            (a, b) => a.timestamp - b.timestamp,
          );
          const latestUpload = uploadEntries[uploadEntries.length - 1];
          const requestedSource = requestedSourceId
            ? combined.find(
                (e) =>
                  e.id === requestedSourceId &&
                  e.kind === 'generation' &&
                  e.status === 'ready',
              )
            : undefined;
          const initialId =
            requestedSource?.id ?? latestUpload?.id ?? null;
          return {
            ...prev,
            history: combined,
            messages: chatMessages,
            currentSourceEntryId: initialId,
            selectedEntryId: initialId,
          };
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load history';
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) setIsHydrating(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const handleNavChange = useCallback((id: NavId) => {
    setState((prev) => ({ ...prev, activeNav: id }));
  }, []);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setState((prev) => {
      if (prev.history.some((e) => e.id === image.id)) return prev;
      const entry: HistoryEntry = {
        id: image.id,
        kind: 'upload',
        imageUrl: image.url,
        timestamp: new Date(image.createdAt).getTime(),
        label: `Original ${prev.history.filter((e) => e.kind === 'upload').length + 1}`,
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

      const userMessageId = crypto.randomUUID();
      const assistantId = crypto.randomUUID();
      const userMsg: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'complete',
      };
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
        {
          messages: historyForRequest,
          sourceImage: sourceForRequest,
          userMessageId,
          assistantMessageId: assistantId,
        },
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
  const hasUploads = state.history.some((e) => e.kind === 'upload');

  const selectedEntry = useMemo(
    () => state.history.find((e) => e.id === state.selectedEntryId) ?? null,
    [state.history, state.selectedEntryId],
  );

  const canPromoteGeneration =
    selectedEntry?.kind === 'generation' &&
    selectedEntry.status === 'ready' &&
    selectedEntry.id !== state.currentSourceEntryId;

  const { startRedesign, cancelRedesign } = useRedesign({
    currentSourceEntry,
    setState,
    onGenerationSettled: refreshTokens,
  });

  const handleSelectStyle = useCallback(
    (selection: StyleSelection) => startRedesign(selection),
    [startRedesign],
  );

  const handleClearChat = useCallback(() => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    setState((prev) => (prev.messages.length === 0 ? prev : { ...prev, messages: [] }));
    fetch('/api/chat/session', { method: 'DELETE' }).catch(() => {
      toast.error('Failed to clear chat on the server.');
    });
  }, []);

  const handleGenerateFromChat = useCallback(
    (messageId: string) => {
      const msg = state.messages.find((m) => m.id === messageId);
      if (!msg?.proposedPrompt) return;
      startRedesign({
        styleKey: `chat:${messageId}`,
        styleLabel: msg.proposedPrompt.label,
        promptSpec: {
          category: 'style',
          groupTitle: 'Chat',
          itemTitle: msg.proposedPrompt.label,
        },
        overridePrompt: msg.proposedPrompt.prompt,
      });
    },
    [state.messages, startRedesign],
  );

  const { downloadGeneration, deleteGeneration } = useGenerationActions();

  const handleDeleteGeneration = useCallback(
    async (id: string) => {
      const { ok } = await deleteGeneration(id);
      if (!ok) return;

      cancelRedesign(id);
      setState((prev) => {
        if (!prev.history.some((e) => e.id === id)) return prev;
        const history = prev.history.filter((e) => e.id !== id);
        const fallbackId =
          history.findLast((e) => e.kind === 'upload')?.id ?? null;
        const nextSourceId =
          prev.currentSourceEntryId === id
            ? fallbackId
            : prev.currentSourceEntryId;
        const nextSelectedId =
          prev.selectedEntryId === id ? nextSourceId : prev.selectedEntryId;
        return {
          ...prev,
          history,
          currentSourceEntryId: nextSourceId,
          selectedEntryId: nextSelectedId,
        };
      });
      toast.success('Deleted.');
    },
    [cancelRedesign, deleteGeneration],
  );

  const handleDownloadGeneration = useCallback(
    (entry: GenerationHistoryEntry) => downloadGeneration(entry),
    [downloadGeneration],
  );

  const isChatStreaming = state.messages.some((m) => m.status === 'streaming');
  const hasSource = currentSourceImage !== null;

  const inFlightByStyleKey = useMemo(() => {
    const map: InFlightMap = {};
    for (const entry of state.history) {
      if (
        entry.kind === 'generation' &&
        entry.status === 'generating' &&
        entry.sourceImageUrl === currentSourceImage
      ) {
        map[entry.styleKey] = {
          status: entry.status,
          percentage: entry.percentage,
        };
      }
    }
    return map;
  }, [state.history, currentSourceImage]);

  return (
    <MobileGate>
      <div className="flex h-full w-full flex-col">
        <SpacesHeader tokens={tokens} />
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
              currentSourceEntry={currentSourceEntry}
              hasUploads={hasUploads}
              canPromoteGeneration={canPromoteGeneration}
              isHydrating={isHydrating}
              onImageUpload={handleImageUpload}
              onSelectOriginal={handleSelectOriginal}
              onPromoteGenerated={handlePromoteGenerated}
            />
            <HistorySlider
              history={state.history}
              selectedEntryId={state.selectedEntryId}
              onSelect={handleHistorySelect}
              onDeleteGeneration={handleDeleteGeneration}
              onDownloadGeneration={handleDownloadGeneration}
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
