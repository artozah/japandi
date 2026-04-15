import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
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
  activeNav: string;
  history: HistoryEntry[];
  messages: ChatMessage[];
  currentImage: string | null;
}
