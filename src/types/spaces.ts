import type { LucideIcon } from "lucide-react";

export type NavId = 'style' | 'occasions' | 'locations' | 'themes' | 'enhance' | 'finalize';

export interface NavItem {
  id: NavId;
  label: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

export interface AccordionEntry {
  image: string;
  title: string;
}

export interface AccordionGroup {
  title: string;
  items?: readonly AccordionEntry[];
  badges?: readonly string[];
}

export type GenerationStatus = 'generating' | 'ready' | 'error';

export type PromptCategory = NavId;

export interface PromptSpec {
  category: PromptCategory;
  groupTitle: string;
  itemTitle: string;
}

export interface StyleSelection {
  styleKey: string;
  styleLabel: string;
  styleImage?: string;
  promptSpec: PromptSpec;
}

export interface InFlightState {
  status: 'generating';
  percentage: number;
}

export type InFlightMap = Record<string, InFlightState>;

export interface UploadHistoryEntry {
  id: string;
  kind: 'upload';
  imageUrl: string;
  timestamp: number;
  label?: string;
}

export interface GenerationHistoryEntry {
  id: string;
  kind: 'generation';
  status: GenerationStatus;
  styleKey: string;
  styleLabel: string;
  styleImage?: string;
  sourceImageUrl: string;
  imageUrl: string | null;
  percentage: number;
  errorMessage?: string;
  timestamp: number;
  label?: string;
}

export type HistoryEntry = UploadHistoryEntry | GenerationHistoryEntry;

export type ChatMessageStatus = 'streaming' | 'complete' | 'error';

export interface ProposedPrompt {
  prompt: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: ChatMessageStatus;
  proposedPrompt?: ProposedPrompt;
}

export interface SpacesState {
  activeNav: NavId;
  history: HistoryEntry[];
  messages: ChatMessage[];
  currentSourceEntryId: string | null;
  selectedEntryId: string | null;
}
