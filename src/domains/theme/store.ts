
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { ThemeState, ThemeMode, ColorScheme, ThemeSchedule } from '../../themes/types';
import { loadTheme, getAvailableThemes } from '../../themes';
import { generateCSSVariables, generateBackgroundCSS, determineScheme } from '../../themes/utils';
import { defaultLightScheme, defaultDarkScheme } from '../../themes/defaults';

const STORAGE_KEY = 'evolusion-theme-settings';

const initialState: ThemeState = {
  currentThemeId: 'apple-graphite',
  currentScheme: 'light',
  mode: 'auto',
  schedule: undefined,
  availableThemes: [],
  loadedTheme: null
};

function loadStateFromStorage(): Partial<ThemeState> {
  if (!browser) return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveStateToStorage(state: ThemeState): void {
  if (!browser) return;
  const toStore = {
    currentThemeId: state.currentThemeId,
    currentScheme: state.currentScheme,
    mode: state.mode,
    schedule: state.schedule
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

function createThemeStore() {
  const stored = loadStateFromStorage();
  const { subscribe, set, update } = writable<ThemeState>({
    ...initialState,
    ...stored
  });
  
  return {
    subscribe,
    
    async init() {
      if (!browser) return;
      
      const availableThemes = getAvailableThemes();
      const state = get({ subscribe });
      
      let themeId = state.currentThemeId;
      let loadedTheme = await loadTheme(themeId);
      
      if (!loadedTheme && availableThemes.length > 0) {
        themeId = availableThemes[0].id;
        loadedTheme = await loadTheme(themeId);
      }

      const currentScheme = determineScheme(state.mode, state.schedule);
      
      update(s => ({
        ...s,
        availableThemes,
        currentThemeId: themeId,
        loadedTheme,
        currentScheme
      }));
      
      this.applyCSSVariables();
      this.startScheduler();
    },
    
    async setTheme(themeId: string) {
      const theme = await loadTheme(themeId);
      if (!theme) return;
      
      update(s => {
        const newState = { ...s, currentThemeId: themeId, loadedTheme: theme };
        saveStateToStorage(newState);
        return newState;
      });
      
      this.applyCSSVariables();
    },
    
    setMode(mode: ThemeMode) {
      update(s => {
        const currentScheme = determineScheme(mode, s.schedule);
        const newState = { ...s, mode, currentScheme };
        saveStateToStorage(newState);
        return newState;
      });
      
      this.applyCSSVariables();
    },
    
    setSchedule(schedule: ThemeSchedule | undefined) {
      update(s => {
        const newState = { ...s, schedule };
        saveStateToStorage(newState);
        return newState;
      });
      
      const state = get({ subscribe });
      this.setMode(state.mode); 
    },
    
    toggleScheme() {
      update(s => {
        const currentScheme: ColorScheme = s.currentScheme === 'light' ? 'dark' : 'light';
        const mode: ThemeMode = currentScheme === 'light' ? 'day' : 'night';
        const newState = { ...s, currentScheme, mode };
        saveStateToStorage(newState);
        return newState;
      });
      
      this.applyCSSVariables();
    },
    
    applyCSSVariables() {
      if (!browser) return;
      const state = get({ subscribe });
      const { loadedTheme, currentScheme } = state;
      
      // Fallback to default scheme if theme not loaded
      const scheme = loadedTheme ? loadedTheme[currentScheme] : (currentScheme === 'light' ? defaultLightScheme : defaultDarkScheme);
      
      const cssVars = generateCSSVariables(scheme);
      const root = document.documentElement;
      
      // Apply variables directly to :root
      Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      
      // Handle background style separately
      const backgroundCSS = generateBackgroundCSS(scheme);
      let styleTag = document.getElementById('theme-background-styles');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'theme-background-styles';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = backgroundCSS;
      
      // console.log(`Applied ${Object.keys(cssVars).length} CSS variables for scheme "${currentScheme}"`);
    },

    startScheduler() {
      if (!browser) return;
      setInterval(() => {
        const state = get({ subscribe });
        if (state.mode === 'schedule' || state.mode === 'auto') {
          const newScheme = determineScheme(state.mode, state.schedule);
          if (newScheme !== state.currentScheme) {
            update(s => ({ ...s, currentScheme: newScheme }));
            this.applyCSSVariables();
          }
        }
      }, 60000);
    }
  };
}

export const themeStore = createThemeStore();

export const activeScheme = derived(
  themeStore,
  $theme => $theme.loadedTheme?.[$theme.currentScheme] || ($theme.currentScheme === 'light' ? defaultLightScheme : defaultDarkScheme)
);
