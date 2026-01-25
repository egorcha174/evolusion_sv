
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { ThemeSettings, ThemePalette, ColorScheme } from '$lib/types';
import { DEFAULT_THEME, BUILTIN_THEMES } from './defaults';
import { generateThemeCss } from './utils';
import { minutesOfDay } from '../../app/time';

const STORAGE_KEY = 'evolusion_theme_settings';

const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'auto',
  activeThemeId: 'default',
  schedule: {
    darkStart: '22:00',
    darkEnd: '07:00'
  },
  customThemes: []
};

// --- Settings Store ---
function createSettingsStore() {
  const { subscribe, set, update } = writable<ThemeSettings>(DEFAULT_SETTINGS);

  return {
    subscribe,
    set,
    update,
    init: () => {
      if (!browser) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          set({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (e) {
        console.error('Failed to load theme settings', e);
      }
    },
    save: (settings: ThemeSettings) => {
      if (!browser) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      set(settings);
    }
  };
}

export const themeSettings = createSettingsStore();

// --- Environment Stores ---
export const systemPrefersDark = writable<boolean>(false);

if (browser) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  systemPrefersDark.set(mq.matches);
  mq.addEventListener('change', (e) => systemPrefersDark.set(e.matches));
}

// --- Derived State ---
export const themeState = derived(
  [themeSettings, systemPrefersDark, minutesOfDay],
  ([$settings, $systemDark, $minutes]) => {
    
    // 1. Determine Scheme
    let scheme: ColorScheme = 'light';

    if ($settings.mode === 'day') {
      scheme = 'light';
    } else if ($settings.mode === 'night') {
      scheme = 'dark';
    } else if ($settings.mode === 'auto') {
      scheme = $systemDark ? 'dark' : 'light';
    } else if ($settings.mode === 'schedule') {
      const [sH, sM] = $settings.schedule.darkStart.split(':').map(Number);
      const [eH, eM] = $settings.schedule.darkEnd.split(':').map(Number);
      const start = sH * 60 + sM;
      const end = eH * 60 + eM;
      
      let isDarkTime = false;
      if (start < end) {
        isDarkTime = $minutes >= start && $minutes < end;
      } else {
        isDarkTime = $minutes >= start || $minutes < end;
      }
      scheme = isDarkTime ? 'dark' : 'light';
    }

    // 2. Find Active Theme
    const allThemes = [...BUILTIN_THEMES, ...$settings.customThemes];
    
    const activeThemeRaw = allThemes.find(t => {
       // Polymorphic ID access: ThemeDefinition has .id, ThemeFile has .theme.id
       const id = (t as any).theme?.id || (t as any).id;
       return id === $settings.activeThemeId;
    }) || DEFAULT_THEME;

    // 3. Select Palette
    // ThemeFile has nested structure: { theme: { scheme: { light: ..., dark: ... } } }
    // ThemeDefinition has flat structure: { light: ..., dark: ... }
    const palettes = (activeThemeRaw as any).theme?.scheme || activeThemeRaw;
    const palette: ThemePalette = scheme === 'dark' ? palettes.dark : palettes.light;

    // 4. Generate CSS
    const css = generateThemeCss(palette);

    return {
      scheme,
      activeTheme: activeThemeRaw,
      palette,
      css
    };
  }
);
