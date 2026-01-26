
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { ThemeFile, ThemeMode } from '../../../themes/types';
import { builtInThemes as BUILTIN_THEMES, defaultTheme } from '../../../themes';
import { applyThemeCSS } from '../../../themes/utils';

// Re-export utility for consumers
export { applyThemeCSS };

const STORAGE_KEY_CUSTOM = 'evolusion_custom_themes_v2';
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

      // Load custom themes from storage
      let customThemes: ThemeFile[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CUSTOM);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
             customThemes = parsed.filter(t => t && t.theme && t.theme.id);
          }
        }
      } catch (e) {
        console.error('Failed to load custom themes', e);
      }

      // Load active theme ID and mode
      const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE);
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;

      update(s => {
        // MERGE LOGIC: Use a Map to overlay custom themes on top of built-ins
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
      update(s => {
        // Update the list in memory
        const themeMap = new Map(s.themes.map(t => [t.theme.id, t]));
        themeMap.set(themeFile.theme.id, themeFile);
        
        const newThemes = Array.from(themeMap.values());

        // Persist: Filter out themes that are identical to built-ins to save space? 
        // No, simpler to just save anything marked as "custom" OR any theme that shadows a built-in.
        // Actually, we just save everything that is NOT a pristine built-in.
        // To simplify: We save the user's edits.
        // Identify which themes need to be persisted:
        // 1. Completely new custom themes (not in BUILTIN)
        // 2. Modified built-ins (ID exists in BUILTIN)
        
        // We will stick to the strategy: Store all "User Versions" in localStorage.
        // If it matches a built-in ID, it shadows it.
        
        // Filter out strict built-ins that haven't been modified?
        // Simpler implementation: We rely on the fact that `themeFile` passed here is the one we want to save.
        // We need to persist the *Custom List*.
        
        // Reconstruct the "Custom List" for storage
        const themesToStore: ThemeFile[] = [];
        
        newThemes.forEach(t => {
           const isBuiltIn = BUILTIN_THEMES.some(b => b.theme.id === t.theme.id);
           
           // If it's explicitly marked custom OR it shadows a built-in (we assume if it's being saved, it's user intent)
           // But wait, we don't want to save unmodified built-ins if they are just in the list.
           // `saveTheme` is only called when the user explicitly saves changes.
           // So we should find the "Overridden" ones.
           
           // The persisted list should contain: 
           // 1. Themes where isCustom = true
           // 2. OR Themes that share an ID with a built-in (Shadows)
           
           // Ideally, the editor should mark modified built-ins as `isCustom = true` internally or we just save them.
           if (t.theme.isCustom) {
             themesToStore.push(t);
           } else if (isBuiltIn) {
             // If we are saving a built-in, we are effectively forking it. 
             // We should mark it custom to ensure it persists? 
             // No, let's keep the ID but mark isCustom=true to indicate it's a user copy?
             // Or just store it.
             themesToStore.push(t);
           }
        });

        if (browser) localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(themesToStore));

        return { ...s, themes: newThemes };
      });
    },

    deleteTheme: (id: string) => {
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
        
        // Update Storage: Remove this specific ID from the stored list
        if (browser) {
           const currentStored = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM) || '[]');
           const newStored = currentStored.filter((t: ThemeFile) => t.theme.id !== id);
           localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(newStored));
        }

        // Handle Active Theme
        let newActive = s.activeThemeId;
        if (s.activeThemeId === id && !isBuiltIn) {
          // If we deleted a purely custom theme that was active, reset to default
          newActive = defaultTheme.theme.id;
          if (browser) localStorage.setItem(STORAGE_KEY_ACTIVE, newActive);
        }
        // If we reverted a built-in, the ID is still valid, so activeId remains same.

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
