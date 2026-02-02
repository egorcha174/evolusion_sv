
import { get } from 'svelte/store';
import { dashboardStore } from '../../app/dashboardStore';
import type { TabId, CardId, GridRect } from './types';
import type { DashboardCardConfig } from '$lib/types';

/**
 * Adapter to bridge the Editor Domain (GridRects, drafts) 
 * and the App Domain (DashboardConfig, persistence).
 */
export const layoutAdapter = {
  loadLayout(tabId: TabId) {
    const state = get(dashboardStore);
    const tab = state.tabs[tabId];

    const cards = new Map<CardId, GridRect>();
    const entities = new Map<CardId, string>();

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
        // For entity cards, store entityId; for camera cards, store cameraId with prefix
        if (c.widgetType === 'camera' && c.cameraId) {
          entities.set(c.id, `camera:${c.cameraId}`);
        } else if (c.entityId) {
          entities.set(c.id, c.entityId);
        }
      });
    }

    return { cards, entities, cols, rows };
  },

  saveLayout(
    tabId: TabId,
    drafts: Map<CardId, GridRect>,
    cardEntities: Map<CardId, string>,
    templateOverrides?: Map<CardId, string | undefined>
  ) {
    // Fetch existing cards to preserve properties not managed by the editor
    const state = get(dashboardStore);
    const existingCards = state.tabs[tabId]?.cards || [];
    const existingMap = new Map<string, DashboardCardConfig>(existingCards.map(c => [c.id, c]));

    const newCards: DashboardCardConfig[] = [];

    drafts.forEach((rect, id) => {
      const entityValue = cardEntities.get(id);
      if (entityValue) {
        const existing = existingMap.get(id);

        // Determine template ID:
        // 1. Override from editor session (highest priority)
        // 2. Existing persistent value
        // 3. undefined
        let templateId = existing?.templateId;
        if (templateOverrides && templateOverrides.has(id)) {
          templateId = templateOverrides.get(id);
        }

        // Check if this is a camera widget
        if (entityValue.startsWith('camera:')) {
          const cameraId = entityValue.slice(7); // Remove 'camera:' prefix
          newCards.push({
            ...(existing || {}), // Preserve existing props (including cameraSourceConfig)
            id: id,
            widgetType: 'camera',
            cameraId: cameraId,
            position: {
              x: rect.col,
              y: rect.row,
              w: rect.w,
              h: rect.h
            }
          });
        } else {
          newCards.push({
            ...(existing || {}), // Preserve existing props (including settings)
            id: id,
            entityId: entityValue,
            position: {
              x: rect.col,
              y: rect.row,
              w: rect.w,
              h: rect.h
            },
            templateId: templateId
          });
        }
      }
    });

    // Atomic replacement handles moves, adds, deletes, and template changes
    dashboardStore.replaceTabCards(tabId, newCards);
  }
};
