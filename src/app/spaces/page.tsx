'use client';

import { HistorySlider } from '@/components/spaces/HistorySlider';
import { LeftMenu, type StyleSelection } from '@/components/spaces/LeftMenu';
import { MainCanvas } from '@/components/spaces/MainCanvas';
import { MobileGate } from '@/components/spaces/MobileGate';
import { RightChat } from '@/components/spaces/RightChat';
import { SpacesHeader } from '@/components/spaces/SpacesHeader';
import { useRedesign } from '@/hooks/useRedesign';
import type {
  ChatMessage,
  HistoryEntry,
  NavId,
  SpacesState,
} from '@/types/spaces';
import { useCallback, useMemo, useState } from 'react';

export default function SpacesPage() {
  const [state, setState] = useState<SpacesState>({
    activeNav: 'style',
    history: [],
    messages: [],
    currentSourceImage: null,
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
        currentSourceImage: dataUrl,
        selectedEntryId: entry.id,
        history: [...prev.history, entry],
      };
    });
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    if (entry.kind === 'generation' && entry.status !== 'ready') return;
    setState((prev) => ({ ...prev, selectedEntryId: entry.id }));
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    setState((prev) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Thanks for your message! AI integration is coming soon. For now, try uploading an image to explore the editor.',
        timestamp: Date.now() + 1,
      };
      return {
        ...prev,
        messages: [...prev.messages, userMsg, aiMsg],
      };
    });
  }, []);

  const { startRedesign } = useRedesign(state, setState);

  const handleSelectStyle = useCallback(
    (selection: StyleSelection) => startRedesign(selection),
    [startRedesign],
  );

  const inFlightByStyleKey = useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of state.history) {
      if (
        entry.kind === 'generation' &&
        entry.status === 'generating' &&
        entry.sourceImageUrl === state.currentSourceImage
      ) {
        map[entry.styleKey] = entry.percentage;
      }
    }
    return map;
  }, [state.history, state.currentSourceImage]);

  const selectedEntry = useMemo(
    () =>
      state.history.find((e) => e.id === state.selectedEntryId) ?? null,
    [state.history, state.selectedEntryId],
  );

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
              currentSourceImage={state.currentSourceImage}
              onImageUpload={handleImageUpload}
            />
            <HistorySlider
              history={state.history}
              selectedEntryId={state.selectedEntryId}
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
