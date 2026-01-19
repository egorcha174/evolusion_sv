import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const infoPanelWidth = writable<number>(320);

const STORAGE_KEY = 'evolusion.infoPanel.width';

export function loadUIState(): void {
  if (!browser) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const w = parseInt(stored, 10);
      // Valid range check matching InfoPanel constraints
      if (!isNaN(w) && w >= 280 && w <= 500) {
        infoPanelWidth.set(w);
      }
    }
  } catch (e) {
    console.error('Failed to load UI state', e);
  }
}

export function saveUIState(width: number): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, width.toString());
    infoPanelWidth.set(width);
  } catch (e) {
    console.error('Failed to save UI state', e);
  }
}