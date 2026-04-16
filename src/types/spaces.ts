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
  items?: AccordionEntry[];
  badges?: string[];
}

export interface HistoryEntry {
  id: string;
  imageUrl: string;
  timestamp: number;
  label?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface SpacesState {
  activeNav: NavId;
  history: HistoryEntry[];
  messages: ChatMessage[];
  currentImage: string | null;
}
