
import { writable, get, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Theme, ThemeFile, ThemeMode } from '../../themes/types';
import { BUILTIN_THEMES, defaultTheme } from '../../themes/defaults';
import { applyThemeCSS, getSystemColorMode } from '../../themes/utils';

const STORAGE_KEY_CUSTOM = 'evolusion_custom_themes_v2';
const STORAGE_KEY_ACTIVE = 'evolusion_active_theme_id';
const STORAGE_KEY_MODE = 'evolusion_theme_mode';

interface ThemeStoreState {
  themes: ThemeFile[];
  activeThemeId: string;
  mode: ThemeMode;
}

// System preference store
const systemDark = writable(false);

if (browser) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  systemDark.set(mq.matches);
  mq.addEventListener('change', e => systemDark.set(e.matches));
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

      // Load custom themes
      let customThemes: ThemeFile[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CUSTOM);
        if (stored) {
          customThemes = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load custom themes', e);
      }

      // Load active theme ID
      const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE);
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;

      update(s => {
        const allThemes = [...BUILTIN_THEMES, ...customThemes];
        let activeId = savedActiveId || s.activeThemeId;
        
        // Ensure active theme exists
        if (!allThemes.find(t => t.theme.id === activeId)) {
          activeId = defaultTheme.theme.id;
        }

        return {
          themes: allThemes,
          activeThemeId: activeId,
          mode: savedMode || 'auto'
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
      update(s => {
        // If updating existing custom theme
        const idx = s.themes.findIndex(t => t.theme.id === themeFile.theme.id);
        let newThemes = [...s.themes];
        
        if (idx >= 0) {
          if (!newThemes[idx].theme.isCustom) return s; // Cannot overwrite builtin
          newThemes[idx] = themeFile;
        } else {
          newThemes.push(themeFile);
        }

        // Persist custom themes only
        const customs = newThemes.filter(t => t.theme.isCustom);
        if (browser) localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customs));

        return { ...s, themes: newThemes };
      });
    },

    deleteTheme: (id: string) => {
      update(s => {
        const theme = s.themes.find(t => t.theme.id === id);
        if (!theme || !theme.theme.isCustom) return s; // Cannot delete builtin

        const newThemes = s.themes.filter(t => t.theme.id !== id);
        
        // Persist
        const customs = newThemes.filter(t => t.theme.isCustom);
        if (browser) localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customs));

        // If deleted active, reset to default
        let newActive = s.activeThemeId;
        if (s.activeThemeId === id) {
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
export const activeScheme = derived([themeStore, systemDark], ([$s, $sysDark]) => {
  const themeFile = $s.themes.find(t => t.theme.id === $s.activeThemeId) || defaultTheme;
  const isDark = $s.mode === 'dark' || ($s.mode === 'auto' && $sysDark);
  return isDark ? themeFile.theme.scheme.dark : themeFile.theme.scheme.light;
});

// Reactively apply CSS variables when scheme changes
if (browser) {
  activeScheme.subscribe(scheme => {
    applyThemeCSS(scheme);
  });
}
