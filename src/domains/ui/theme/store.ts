
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { ThemeFile, ThemeMode } from '../../../themes/types';
import { builtInThemes as BUILTIN_THEMES, defaultTheme } from '../../../themes';
import { applyThemeCSS } from '../../../themes/utils';
import { loadUserThemes, saveUserThemes, upsertUserTheme, deleteUserTheme } from '../../../lib/themes/userThemesStore';

// Re-export utility for consumers
export { applyThemeCSS };

const STORAGE_KEY_ACTIVE = 'evolusion_active_theme_id';
const STORAGE_KEY_MODE = 'evolusion_theme_mode';

interface ThemeStoreState {
  themes: ThemeFile[];
  activeThemeId: string;
  mode: ThemeMode;
}

// System preference store
export const systemPrefersDark = writable(false);

if (browser) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  systemPrefersDark.set(mq.matches);
  mq.addEventListener('change', e => systemPrefersDark.set(e.matches));
}

function createThemeStore() {
  const initialState: ThemeStoreState = {
    themes: [...BUILTIN_THEMES],
    activeThemeId: defaultTheme.theme.id,
    mode: 'auto'
  };

  const { subscribe, set, update } = writable<ThemeStoreState>(initialState);

  return {
    subscribe,

    init: () => {
      if (!browser) return;

      // Load custom themes from NEW store
      const customThemes = loadUserThemes();

      // Load active theme ID and mode
      const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE);
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;

      update(s => {
        // MERGE LOGIC: User themes override built-ins with same ID
        const themeMap = new Map<string, ThemeFile>();

        // 1. Add Built-ins
        BUILTIN_THEMES.forEach(t => themeMap.set(t.theme.id, t));

        // 2. Add Customs (Shadowing built-ins if IDs match)
        customThemes.forEach(t => themeMap.set(t.theme.id, t));

        const allThemes = Array.from(themeMap.values());

        // Validate active ID
        let activeId = savedActiveId || s.activeThemeId;
        if (!themeMap.has(activeId)) {
          activeId = defaultTheme.theme.id;
        }

        // Validate mode
        let mode: ThemeMode = 'auto';
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto') {
          mode = savedMode;
        }

        return {
          themes: allThemes,
          activeThemeId: activeId,
          mode
        };
      });
    },

    setActiveTheme: (id: string) => {
      update(s => {
        if (!s.themes.find(t => t.theme.id === id)) return s;
        if (browser) localStorage.setItem(STORAGE_KEY_ACTIVE, id);
        return { ...s, activeThemeId: id };
      });
    },

    setMode: (mode: ThemeMode) => {
      update(s => {
        if (browser) localStorage.setItem(STORAGE_KEY_MODE, mode);
        return { ...s, mode };
      });
    },

    saveTheme: (themeFile: ThemeFile) => {
      // Use the new store for persistence
      upsertUserTheme(themeFile);

      // Update local state
      update(s => {
        const themeMap = new Map(s.themes.map(t => [t.theme.id, t]));
        themeMap.set(themeFile.theme.id, themeFile);
        return { ...s, themes: Array.from(themeMap.values()) };
      });
    },

    deleteTheme: (id: string) => {
      // Use the new store for persistence
      deleteUserTheme(id);

      update(s => {
        const isBuiltIn = BUILTIN_THEMES.some(b => b.theme.id === id);

        let newThemes: ThemeFile[];

        if (isBuiltIn) {
          // Revert to original built-in
          const original = BUILTIN_THEMES.find(b => b.theme.id === id)!;
          // Replace current with original in memory
          newThemes = s.themes.map(t => t.theme.id === id ? original : t);
        } else {
          // Completely remove custom theme
          newThemes = s.themes.filter(t => t.theme.id !== id);
        }

        // Handle Active Theme
        let newActive = s.activeThemeId;
        if (s.activeThemeId === id && !isBuiltIn) {
          newActive = defaultTheme.theme.id;
          if (browser) localStorage.setItem(STORAGE_KEY_ACTIVE, newActive);
        }

        return { ...s, themes: newThemes, activeThemeId: newActive };
      });
    }
  };
}

export const themeStore = createThemeStore();

// Derived store for the active color scheme
export const activeScheme = derived([themeStore, systemPrefersDark], ([$s, $sysDark]) => {
  const themeFile = $s.themes.find(t => t.theme.id === $s.activeThemeId) || defaultTheme;

  if (!themeFile || !themeFile.theme || !themeFile.theme.scheme) {
    return defaultTheme.theme.scheme.light;
  }

  const isDark = $s.mode === 'dark' || ($s.mode === 'auto' && $sysDark);
  return isDark ? themeFile.theme.scheme.dark : themeFile.theme.scheme.light;
});


if (browser) {
  activeScheme.subscribe(scheme => {
    if (scheme) applyThemeCSS(scheme);
  });
}

// Helper to check if we are effectively in dark mode
export const isDarkMode = derived([themeStore, systemPrefersDark], ([$s, $sysDark]) => {
  return $s.mode === 'dark' || ($s.mode === 'auto' && $sysDark);
});
