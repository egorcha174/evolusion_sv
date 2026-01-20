
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { DashboardConfig, TabGridConfig, DashboardCardConfig, HAEntity } from '$lib/types';
import { getOrCreateEncryptionKey, encrypt, decrypt } from '../ha/crypto';

const STORAGE_KEY = 'evolusion_dashboard_v2_encrypted';

const DEFAULT_COLS = 8;
const DEFAULT_ROWS = 6;

// Helper to create a default tab config
function createDefaultTabConfig(id: string): TabGridConfig {
  return {
    id,
    gridColumns: DEFAULT_COLS,
    gridRows: DEFAULT_ROWS,
    cards: []
  };
}

const initialState: DashboardConfig = {
  version: 2,
  tabs: {}
};

function createDashboardStore() {
  const { subscribe, set, update } = writable<DashboardConfig>(initialState);

  return {
    subscribe,
    set,
    
    // Initialize or load configuration
    async init() {
      if (!browser) return;
      try {
        const encrypted = localStorage.getItem(STORAGE_KEY);
        if (encrypted) {
          const key = await getOrCreateEncryptionKey();
          const json = await decrypt(encrypted, key);
          const data = JSON.parse(json);
          // Migration/Safety check could go here
          set(data);
        }
      } catch (e) {
        console.error('Failed to load dashboard config', e);
      }
    },

    // Save current state
    async save() {
      if (!browser) return;
      const state = get({ subscribe });
      try {
        const key = await getOrCreateEncryptionKey();
        const json = JSON.stringify(state);
        const encrypted = await encrypt(json, key);
        localStorage.setItem(STORAGE_KEY, encrypted);
      } catch (e) {
        console.error('Failed to save dashboard config', e);
      }
    },

    // Get config for a specific tab, initializing if missing
    ensureTabConfig(tabId: string) {
      update(state => {
        if (!state.tabs[tabId]) {
          return {
            ...state,
            tabs: {
              ...state.tabs,
              [tabId]: createDefaultTabConfig(tabId)
            }
          };
        }
        return state;
      });
    },

    updateTabSettings(tabId: string, cols: number, rows: number) {
      update(state => {
         const tab = state.tabs[tabId] || createDefaultTabConfig(tabId);
         const newTabs = {
           ...state.tabs,
           [tabId]: { ...tab, gridColumns: cols, gridRows: rows }
         };
         return { ...state, tabs: newTabs };
      });
      this.save();
    },

    updateCardPosition(tabId: string, cardId: string, pos: { x: number, y: number, w: number, h: number }) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;

        const cards = tab.cards.map(c => c.id === cardId ? { ...c, position: pos } : c);
        
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards }
          }
        };
      });
      this.save();
    },
    
    // Auto-layout helper: Takes a list of entities and arranges them in the grid if not already present
    syncEntitiesToGrid(tabId: string, entities: HAEntity[]) {
      update(state => {
        const tab = state.tabs[tabId] || createDefaultTabConfig(tabId);
        
        // Map existing cards for quick lookup
        const existingMap = new Map(tab.cards.map(c => [c.entityId, c]));
        const newCards: DashboardCardConfig[] = [];
        
        // Grid Cursor
        let x = 0;
        let y = 0;
        const cols = tab.gridColumns; // User units
        
        // 1. Keep existing cards (preserving their position)
        // We'll calculate the next free slot based on occupied space in a real app, 
        // but for MVP, we just re-flow new items after the max Y of existing items.
        
        let maxY = 0;
        tab.cards.forEach(c => {
           newCards.push(c);
           maxY = Math.max(maxY, c.position.y + c.position.h);
        });

        // Reset cursor to end of existing content
        if (newCards.length > 0) {
            y = Math.ceil(maxY);
        }

        // 2. Add new entities
        entities.forEach(entity => {
          if (!existingMap.has(entity.entity_id)) {
             // Default size 1x1
             const w = 1;
             const h = 1;
             
             // Wrap if needed
             if (x + w > cols) {
               x = 0;
               y++;
             }
             
             newCards.push({
               id: entity.entity_id, // Use entity_id as ID for simplicity
               entityId: entity.entity_id,
               position: { x, y, w, h }
             });
             
             // Advance cursor
             x += w;
           }
        });
        
        // Only update if count changed to avoid constant saves
        if (newCards.length !== tab.cards.length) {
           return {
             ...state,
             tabs: {
               ...state.tabs,
               [tabId]: { ...tab, cards: newCards }
             }
           };
        }
        
        return state;
      });
    }
  };
}

export const dashboardStore = createDashboardStore();
