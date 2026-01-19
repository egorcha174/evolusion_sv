import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { ThemeSettings, ThemeDefinition } from '$lib/types';
import { DEFAULT_THEME, BUILTIN_THEMES } from './defaults';
import { generateCssVariables } from './utils';

const STORAGE_KEY = 'evolusion_theme_settings';

const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'auto',
  activeThemeId: 'default',
  schedule: {
    darkStart: '22:00',
    darkEnd: '07:00'
  }
};

// 1. Settings Store
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
          set({ ...DEFAULT_SETTINGS, ...parsed }); // Merge to ensure new fields exist
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

// 2. System State (Media Query & Time)
export const systemPrefersDark = writable<boolean>(false);
export const isScheduleDark = writable<boolean>(false);

if (browser) {
  // Setup Media Query Listener
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  systemPrefersDark.set(mq.matches);
  mq.addEventListener('change', (e) => systemPrefersDark.set(e.matches));

  // Setup Schedule Timer
  const checkSchedule = () => {
    const settings = get(themeSettings);
    if (settings.mode !== 'schedule') return;

    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = settings.schedule.darkStart.split(':').map(Number);
    const [endH, endM] = settings.schedule.darkEnd.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    // Handle cross-midnight intervals (e.g. 22:00 to 07:00)
    let isDark = false;
    if (start < end) {
      isDark = current >= start && current < end;
    } else {
      isDark = current >= start || current < end;
    }
    isScheduleDark.set(isDark);
  };

  // Check every minute
  setInterval(checkSchedule, 60000);
  // Also check immediately when settings change (handled in derived store somewhat, but timer triggers updates)
  themeSettings.subscribe(() => checkSchedule());
}

// 3. Derived Effective Mode (Is Dark?)
export const isDarkMode = derived(
  [themeSettings, systemPrefersDark, isScheduleDark],
  ([$settings, $systemDark, $scheduleDark]) => {
    switch ($settings.mode) {
      case 'day': return false;
      case 'night': return true;
      case 'auto': return $systemDark;
      case 'schedule': return $scheduleDark;
      default: return false;
    }
  }
);

// 4. Derived CSS Variables
export const cssVariables = derived(
  [themeSettings, isDarkMode],
  ([$settings, $isDark]) => {
    // Find active theme (builtin or custom - currently only builtin supported in MVP logic)
    const theme = BUILTIN_THEMES.find(t => t.id === $settings.activeThemeId) || DEFAULT_THEME;
    const palette = $isDark ? theme.dark : theme.light;
    return generateCssVariables(palette);
  }
);
