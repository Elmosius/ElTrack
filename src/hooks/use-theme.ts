import { useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const themeStorageKey = 'theme';
const themeModes = ['auto', 'light', 'dark'] as const;

function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && themeModes.includes(value as ThemeMode);
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  const stored = window.localStorage.getItem(themeStorageKey);
  return isThemeMode(stored) ? stored : 'auto';
}

export function resolveThemeMode(mode: ThemeMode): ResolvedTheme {
  return mode === 'auto' ? getSystemTheme() : mode;
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  const resolved = resolveThemeMode(mode);
  const root = document.documentElement;

  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;

  if (mode === 'auto') {
    root.removeAttribute('data-theme');
    window.localStorage.removeItem(themeStorageKey);
    return;
  }

  root.setAttribute('data-theme', mode);
  window.localStorage.setItem(themeStorageKey, mode);
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredThemeMode());
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    applyThemeMode(mode);
  }, [mode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      const nextSystemTheme = mediaQuery.matches ? 'dark' : 'light';
      setSystemTheme(nextSystemTheme);

      if (getStoredThemeMode() === 'auto') {
        applyThemeMode('auto');
      }
    };

    handleSystemThemeChange();
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== themeStorageKey) {
        return;
      }

      setModeState(isThemeMode(event.newValue) ? event.newValue : 'auto');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return useMemo(
    () => ({
      mode,
      resolvedTheme: mode === 'auto' ? systemTheme : mode,
      setMode: setModeState,
    }),
    [mode, systemTheme],
  );
}
