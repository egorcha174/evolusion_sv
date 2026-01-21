import { get } from 'svelte/store';
import { dashboardStore } from '../../app/dashboardStore';
import type { TabId, CardId, GridRect } from './types';

/**
 * Adapter to bridge the Editor Domain (GridRects, drafts) 
 * and the App Domain (DashboardConfig, persistence).
 */
export const layoutAdapter = {
  loadLayout(tabId: TabId) {
    const state = get(dashboardStore);
    const tab = state.tabs[tabId];
    
    const cards = new Map<CardId, GridRect>();
    // Default grid size if not configured
    const cols = tab?.gridColumns ?? 8;
    const rows = tab?.gridRows ?? 6;

    if (tab) {
      tab.cards.forEach(c => {
        cards.set(c.id, {
          col: c.position.x,
          row: c.position.y,
          w: c.position.w,
          h: c.position.h
        });
      });
    }

    return { cards, cols, rows };
  },

  saveLayout(tabId: TabId, drafts: Map<CardId, GridRect>) {
    // Commit drafts to store
    // We update each card's position in the persistent store
    drafts.forEach((rect, id) => {
      dashboardStore.updateCardPosition(tabId, id, {
        x: rect.col,
        y: rect.row,
        w: rect.w,
        h: rect.h
      });
    });
  }
};