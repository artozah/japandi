'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ChatFontSize = 'sm' | 'md' | 'lg';

const THEME_KEY = 'theme';
const CHAT_FONT_KEY = 'chat-font-size';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  chatFontSize: ChatFontSize;
  setChatFontSize: (s: ChatFontSize) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme === 'light' || theme === 'dark') {
    root.classList.add(theme);
  }
}

function applyChatFont(size: ChatFontSize) {
  document.documentElement.setAttribute('data-chat-font-size', size);
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const raw = window.localStorage.getItem(THEME_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

function readStoredChatFont(): ChatFontSize {
  if (typeof window === 'undefined') return 'md';
  const raw = window.localStorage.getItem(CHAT_FONT_KEY);
  if (raw === 'sm' || raw === 'md' || raw === 'lg') return raw;
  return 'md';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [chatFontSize, setChatFontSizeState] =
    useState<ChatFontSize>(readStoredChatFont);

  useEffect(() => {
    applyThemeClass(theme);
    applyChatFont(chatFontSize);
  }, [theme, chatFontSize]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(THEME_KEY, t);
    applyThemeClass(t);
  }, []);

  const setChatFontSize = useCallback((s: ChatFontSize) => {
    setChatFontSizeState(s);
    window.localStorage.setItem(CHAT_FONT_KEY, s);
    applyChatFont(s);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, chatFontSize, setChatFontSize }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export const themeInitScript = `(() => {
  try {
    const t = localStorage.getItem('${THEME_KEY}');
    const cls = t === 'dark' || t === 'light' ? t : null;
    if (cls) document.documentElement.classList.add(cls);
    const f = localStorage.getItem('${CHAT_FONT_KEY}');
    if (f === 'sm' || f === 'md' || f === 'lg') {
      document.documentElement.setAttribute('data-chat-font-size', f);
    }
  } catch {}
})();`;
