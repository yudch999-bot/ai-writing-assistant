'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = '深色模式' | '浅色模式' | '跟随系统';

interface ThemeCtx {
  theme: Theme;
  accentColor: string;
  setTheme: (t: Theme) => void;
  setAccent: (c: string) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: '深色模式',
  accentColor: '#6366f1',
  setTheme: () => {},
  setAccent: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// Convert hex color to lighter/darker variants
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function lighten(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const l = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `rgb(${l(r)}, ${l(g)}, ${l(b)})`;
}

function darken(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const d = (c: number) => Math.round(c * (1 - amount));
  return `rgb(${d(r)}, ${d(g)}, ${d(b)})`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('深色模式');
  const [accentColor, setAccentState] = useState('#6366f1');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai-writer-settings');
      if (stored) {
        const s = JSON.parse(stored);
        if (s.theme) setThemeState(s.theme);
        if (s.accentColor) setAccentState(s.accentColor);
      }
    } catch {}
    setMounted(true);
  }, []);

  // Apply accent colors to document root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', accentColor);
    root.style.setProperty('--color-primary-dark', darken(accentColor, 0.15));
    root.style.setProperty('--color-primary-light', lighten(accentColor, 0.45));
  }, [accentColor]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      const stored = localStorage.getItem('ai-writer-settings');
      const s = stored ? JSON.parse(stored) : {};
      s.theme = t;
      localStorage.setItem('ai-writer-settings', JSON.stringify(s));
    } catch {}
  }, []);

  const setAccent = useCallback((c: string) => {
    setAccentState(c);
    try {
      const stored = localStorage.getItem('ai-writer-settings');
      const s = stored ? JSON.parse(stored) : {};
      s.accentColor = c;
      localStorage.setItem('ai-writer-settings', JSON.stringify(s));
    } catch {}
  }, []);

  // Determine effective theme
  const effective: Theme = (() => {
    if (theme === '跟随系统') {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return '浅色模式';
      }
      return '深色模式';
    }
    return theme;
  })();

  const isLight = effective === '浅色模式';

  // Apply light/dark class
  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [isLight]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}
