import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const sidebarWidth = writable<number>(280);

const STORAGE_KEY = 'evolusion.sidebar.width';

export function loadUIState(): void {
  if (!browser) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const w = parseInt(stored, 10);
      // Valid range check: min 200, max 500
      if (!isNaN(w) && w >= 200 && w <= 500) {
        sidebarWidth.set(w);
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
    sidebarWidth.set(width);
  } catch (e) {
    console.error('Failed to save UI state', e);
  }
}