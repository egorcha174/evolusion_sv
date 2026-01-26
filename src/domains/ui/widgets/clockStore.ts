import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface ClockSettings {
  showDate: boolean;
  showSeconds: boolean;
}

const SETTINGS_KEY = 'evolusion_clock_settings';

const defaultSettings: ClockSettings = {
  showDate: true,
  showSeconds: false,
};

function createClockStore() {
  const { subscribe, set, update } = writable<ClockSettings>(defaultSettings);

  return {
    subscribe,
    set,
    update,
    init: () => {
      if (!browser) return;
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          set({ ...defaultSettings, ...parsed });
        }
      } catch (e) {
        console.error('Failed to load clock settings', e);
      }

      // Auto-save subscription
      let timer: ReturnType<typeof setTimeout>;
      subscribe((val) => {
        if (!browser) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(val));
        }, 500);
      });
    },
  };
}

export const clockSettings = createClockStore();
clockSettings.init();
