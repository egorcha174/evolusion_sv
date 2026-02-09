
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { DashboardConfig, TabGridConfig, DashboardCardConfig, HAEntity, CardTemplate } from '$lib/types';
import { encrypt, decrypt } from '../ha/crypto';
import { session } from './session';

const STORAGE_KEY = 'evolusion_dashboard_v2_encrypted';

const DEFAULT_COLS = 8;
const DEFAULT_ROWS = 6;

// Helper to get session key
function getSessionKey(): CryptoKey {
  const s = get(session);
  if (!s.key) {
    throw new Error('Session is locked. Key not available.');
  }
  return s.key;
}

// Helper to create a default tab config
function createDefaultTabConfig(id: string, title: string): TabGridConfig {
  return {
    id,
    title,
    icon: 'mdi:view-dashboard',
    gridColumns: DEFAULT_COLS,
    gridRows: DEFAULT_ROWS,
    cards: [],
    provisioned: false
  };
}

const initialState: DashboardConfig = {
  version: 3,
  tabOrder: ['welcome'],
  tabs: {
    'welcome': {
      id: 'welcome',
      title: 'Overview',
      icon: 'mdi:hand-wave',
      gridColumns: DEFAULT_COLS,
      gridRows: DEFAULT_ROWS,
      cards: [],
      provisioned: true // Prevent auto-fill so it stays empty with Welcome message
    }
  },
  templates: {}
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
          console.log("[dashboardStore] init() - Loading from localStorage...");
          const key = getSessionKey();
          const json = await decrypt(encrypted, key);
          const data = JSON.parse(json);
          console.log("[dashboardStore] init() - Loaded data:", data);

          // Migration: Ensure tabOrder exists if coming from older version
          if (!data.tabOrder && data.tabs) {
            data.tabOrder = Object.keys(data.tabs);
          }
          // Migration: Ensure titles exist
          if (data.tabs) {
            Object.values(data.tabs).forEach((tab: any) => {
              if (!tab.title) tab.title = tab.id;
            });
          }
          // Migration: Ensure templates exist
          if (!data.templates) {
            data.templates = {};
          }

          set({ ...initialState, ...data });
          console.log("[dashboardStore] init() - State initialized successfully");
        } else {
          console.log("[dashboardStore] init() - No saved data in localStorage");
        }
      } catch (e) {
        console.error('[dashboardStore] Failed to load dashboard config', e);
      }
    },

    // Save current state
    async save() {
      if (!browser) return;
      const state = get({ subscribe });
      console.log("[dashboardStore] save() - Current state:", state);

      try {
        const key = getSessionKey();
        const json = JSON.stringify(state);
        console.log("[dashboardStore] save() - Stringified JSON length:", json.length);

        const encrypted = await encrypt(json, key);
        localStorage.setItem(STORAGE_KEY, encrypted);
        console.log("[dashboardStore] save() - Saved to localStorage successfully");
      } catch (e) {
        console.error('[dashboardStore] Failed to save dashboard config', e);
      }
    },

    // --- Tab Management ---

    ensureTabConfig(tabId: string) {
      update(state => {
        if (!state.tabs[tabId]) {
          const newTab = createDefaultTabConfig(tabId, 'New Tab');
          return {
            ...state,
            tabOrder: [...state.tabOrder, tabId],
            tabs: {
              ...state.tabs,
              [tabId]: newTab
            }
          };
        }
        return state;
      });
    },

    addTab(title: string) {
      const id = `tab_${Date.now()}`;
      update(state => ({
        ...state,
        tabOrder: [...state.tabOrder, id],
        tabs: {
          ...state.tabs,
          [id]: createDefaultTabConfig(id, title)
        }
      }));
      this.save();
      return id;
    },

    deleteTab(id: string) {
      update(state => {
        // Don't delete the last tab
        if (state.tabOrder.length <= 1) return state;

        const newTabs = { ...state.tabs };
        delete newTabs[id];

        return {
          ...state,
          tabOrder: state.tabOrder.filter(t => t !== id),
          tabs: newTabs
        };
      });
      this.save();
    },

    renameTab(id: string, title: string) {
      update(state => {
        if (!state.tabs[id]) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [id]: { ...state.tabs[id], title }
          }
        };
      });
      this.save();
    },

    clearTab(id: string) {
      update(state => {
        if (!state.tabs[id]) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            // Mark as provisioned so auto-sync doesn't refill it immediately
            [id]: { ...state.tabs[id], cards: [], provisioned: true }
          }
        };
      });
      this.save();
    },

    updateTabSettings(tabId: string, cols: number, rows: number) {
      update(state => {
        const tab = state.tabs[tabId] || createDefaultTabConfig(tabId, tabId);
        const newTabs = {
          ...state.tabs,
          [tabId]: { ...tab, gridColumns: cols, gridRows: rows }
        };
        return { ...state, tabs: newTabs };
      });
      this.save();
    },

    // --- Template Management ---

    saveTemplate(template: CardTemplate) {
      update(state => ({
        ...state,
        templates: {
          ...state.templates,
          [template.id]: template
        }
      }));
      this.save();
    },

    deleteTemplate(id: string) {
      update(state => {
        const newTemplates = { ...state.templates };
        delete newTemplates[id];
        return { ...state, templates: newTemplates };
      });
      this.save();
    },

    // --- Card Management ---

    replaceTabCards(tabId: string, cards: DashboardCardConfig[]) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            // Explicit user action implies this tab is now manually managed (provisioned)
            [tabId]: { ...tab, cards, provisioned: true }
          }
        };
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
            [tabId]: { ...tab, cards, provisioned: true }
          }
        };
      });
      this.save();
    },

    assignTemplateToCard(tabId: string, cardId: string, templateId: string | undefined) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;

        const cards = tab.cards.map(c =>
          c.id === cardId ? { ...c, templateId } : c
        );

        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards, provisioned: true }
          }
        };
      });
      this.save();
    },

    addCard(tabId: string, entityId: string) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;

        // Find simple first empty spot (naive)
        let x = 0, y = 0;
        let found = false;
        const occupied = new Set<string>();

        tab.cards.forEach(c => {
          // Mark grid cells
          for (let dx = 0; dx < c.position.w; dx++) {
            for (let dy = 0; dy < c.position.h; dy++) {
              occupied.add(`${c.position.x + dx},${c.position.y + dy}`);
            }
          }
        });

        // Look for 1x1 spot
        const cols = tab.gridColumns;
        const rows = tab.gridRows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (!occupied.has(`${c},${r}`)) {
              x = c; y = r;
              found = true;
              break;
            }
          }
          if (found) break;
        }

        if (!found) {
          // Append to bottom if full
          x = 0;
          y = rows; // Allow overflow logic elsewhere or just expand
        }

        const newCard: DashboardCardConfig = {
          id: `card_${Date.now()}`,
          entityId,
          position: { x, y, w: 1, h: 1 }
        };

        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards: [...tab.cards, newCard], provisioned: true }
          }
        };
      });
      this.save();
    },

    addCameraWidget(tabId: string, cameraId: string, sourceConfig?: any) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;

        // Find simple first empty spot (naive)
        let x = 0, y = 0;
        let found = false;
        const occupied = new Set<string>();

        tab.cards.forEach(c => {
          // Mark grid cells
          for (let dx = 0; dx < c.position.w; dx++) {
            for (let dy = 0; dy < c.position.h; dy++) {
              occupied.add(`${c.position.x + dx},${c.position.y + dy}`);
            }
          }
        });

        // Look for 2x2 spot for camera (default size)
        const defaultW = 2;
        const defaultH = 2;
        const cols = tab.gridColumns;
        const rows = tab.gridRows;

        for (let r = 0; r <= rows - defaultH; r++) {
          for (let c = 0; c <= cols - defaultW; c++) {
            // Check if 2x2 area is free
            let areaFree = true;
            for (let dx = 0; dx < defaultW && areaFree; dx++) {
              for (let dy = 0; dy < defaultH && areaFree; dy++) {
                if (occupied.has(`${c + dx},${r + dy}`)) {
                  areaFree = false;
                }
              }
            }
            if (areaFree) {
              x = c; y = r;
              found = true;
              break;
            }
          }
          if (found) break;
        }

        // Fallback to 1x1 if no 2x2 spot
        if (!found) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (!occupied.has(`${c},${r}`)) {
                x = c; y = r;
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }

        if (!found) {
          // Append to bottom if full
          x = 0;
          y = rows;
        }

        const newCard: DashboardCardConfig = {
          id: `camera_${Date.now()}`,
          widgetType: 'camera',
          cameraId, // Kept for legacy/tracking
          cameraSourceConfig: sourceConfig, // Store the decoupled config
          position: { x, y, w: found ? defaultW : 1, h: found ? defaultH : 1 }
        };

        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards: [...tab.cards, newCard], provisioned: true }
          }
        };
      });
      this.save();
    },

    addWidget(tabId: string, widgetType: string, settings: any = {}) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;

        // Find first empty 2x2 spot if possible, else 1x1
        let x = 0, y = 0;
        let found = false;
        const occupied = new Set<string>();

        tab.cards.forEach(c => {
          for (let dx = 0; dx < c.position.w; dx++) {
            for (let dy = 0; dy < c.position.h; dy++) {
              occupied.add(`${c.position.x + dx},${c.position.y + dy}`);
            }
          }
        });

        // Try 2x2 first for widgets
        const w = 2;
        const h = 2;
        const cols = tab.gridColumns;
        const rows = tab.gridRows;

        for (let r = 0; r <= rows - h; r++) {
          for (let c = 0; c <= cols - w; c++) {
            let areaFree = true;
            for (let dx = 0; dx < w && areaFree; dx++) {
              for (let dy = 0; dy < h && areaFree; dy++) {
                if (occupied.has(`${c + dx},${r + dy}`)) areaFree = false;
              }
            }
            if (areaFree) {
              x = c; y = r;
              found = true;
              break;
            }
          }
          if (found) break;
        }

        // Fallback 1x1
        if (!found) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (!occupied.has(`${c},${r}`)) {
                x = c; y = r;
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }

        if (!found) { x = 0; y = rows; }

        // Generate unique ID and default settings for timer widgets to ensure each timer is independent
        const finalSettings = { ...settings };
        if (widgetType === 'event-timer') {
          if (!finalSettings.id) {
            finalSettings.id = crypto.randomUUID();
          }
          // Initialize all required default settings so widget displays immediately
          if (!finalSettings.name) finalSettings.name = 'Maintenance';
          if (finalSettings.cycleValue === undefined) finalSettings.cycleValue = 30;
          if (!finalSettings.unit) finalSettings.unit = 'day';
          if (!finalSettings.lastResetDate) finalSettings.lastResetDate = new Date().toISOString();
          if (!finalSettings.animation) finalSettings.animation = 'smooth';
          if (finalSettings.showName === undefined) finalSettings.showName = true;
          if (finalSettings.showUnit === undefined) finalSettings.showUnit = true;
          if (finalSettings.fillOpacity === undefined) finalSettings.fillOpacity = 1;
          if (!finalSettings.fillDirection) finalSettings.fillDirection = 'bottom-to-top';
          if (!finalSettings.fillColors) finalSettings.fillColors = ['#22c55e', '#f59e0b', '#ef4444'];
          if (!finalSettings.namePosition) finalSettings.namePosition = { x: 50, y: 15 };
          if (!finalSettings.daysRemainingPosition) finalSettings.daysRemainingPosition = { x: 50, y: 50 };
          if (!finalSettings.unitPosition) finalSettings.unitPosition = { x: 68, y: 52 };
        }

        const newCard: DashboardCardConfig = {
          id: `widget_${Date.now()}`,
          // @ts-ignore
          widgetType,
          settings: finalSettings,
          position: { x, y, w: found ? 2 : 1, h: found ? 2 : 1 }
        };

        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards: [...tab.cards, newCard], provisioned: true }
          }
        };
      });
      this.save();
    },

    updateCardSettings(tabId: string, cardId: string, settings: any) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: {
              ...tab,
              cards: tab.cards.map(c => c.id === cardId ? { ...c, settings } : c),
              provisioned: true
            }
          }
        };
      });
      this.save();
    },

    // Reset timer widget by updating its lastResetDate
    resetTimerCard(cardId: string) {
      const now = new Date().toISOString();
      update(state => {
        // Find the tab containing this card
        for (const tabId of Object.keys(state.tabs)) {
          const tab = state.tabs[tabId];
          const cardIndex = tab.cards.findIndex(c => c.id === cardId);
          if (cardIndex !== -1) {
            const card = tab.cards[cardIndex];
            if (card.widgetType === 'event-timer' && card.settings) {
              const updatedSettings = { ...card.settings, lastResetDate: now };
              const updatedCards = [...tab.cards];
              updatedCards[cardIndex] = { ...card, settings: updatedSettings };
              return {
                ...state,
                tabs: {
                  ...state.tabs,
                  [tabId]: { ...tab, cards: updatedCards, provisioned: true }
                }
              };
            }
          }
        }
        return state;
      });
      this.save();
    },

    updateCardCameraSource(tabId: string, cardId: string, cameraSourceConfig: any) {
      console.log("[dashboardStore] updateCardCameraSource called with:", { tabId, cardId, cameraSourceConfig });

      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) {
          console.warn("[dashboardStore] Tab not found:", tabId);
          return state;
        }

        const updatedCards = tab.cards.map(c => {
          if (c.id === cardId) {
            console.log("[dashboardStore] Updating card:", c.id, "with config:", cameraSourceConfig);
            return { ...c, cameraSourceConfig };
          }
          return c;
        });

        console.log("[dashboardStore] Updated cards:", updatedCards);

        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: {
              ...tab,
              cards: updatedCards,
              provisioned: true
            }
          }
        };
      });

      console.log("[dashboardStore] Calling save()...");
      this.save();
    },

    findTabForCard(cardId: string): string {
      const state = get({ subscribe });
      for (const tabId of Object.keys(state.tabs)) {
        if (state.tabs[tabId].cards.some(c => c.id === cardId)) return tabId;
      }
      return '';
    },

    deleteCard(tabId: string, cardId: string) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards: tab.cards.filter(c => c.id !== cardId), provisioned: true }
          }
        };
      });
      this.save();
    },

    // Convert existing card to Camera Widget
    convertCardToCamera(tabId: string, cardId: string, sourceConfig: any) {
      update(state => {
        const tab = state.tabs[tabId];
        if (!tab) return state;

        const updatedCards = tab.cards.map(c => {
          if (c.id === cardId) {
            return {
              ...c,
              widgetType: 'camera',
              cameraSourceConfig: sourceConfig,
              entityId: undefined, // Clear entity ID if it was set
              // Preserve position, id, settings
            } as DashboardCardConfig;
          }
          return c;
        });

        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards: updatedCards, provisioned: true }
          }
        };
      });
      this.save();
    },

    // Auto-layout helper: Takes a list of entities and arranges them in the grid if not already present
    syncEntitiesToGrid(tabId: string, entities: HAEntity[]) {
      update(state => {
        const tab = state.tabs[tabId] || createDefaultTabConfig(tabId, tabId);

        // STOP if tab is already provisioned (manually managed or previously synced)
        if (tab.provisioned) return state;

        // Map existing cards for quick lookup
        const existingMap = new Map(tab.cards.map(c => [c.entityId, c]));
        const newCards: DashboardCardConfig[] = [];

        // Grid Cursor
        let x = 0;
        let y = 0;
        const cols = tab.gridColumns; // User units

        // 1. Keep existing cards (preserving their position)
        let maxY = 0;
        tab.cards.forEach(c => {
          newCards.push(c);
          // Simple approximation of occupied height
          maxY = Math.max(maxY, c.position.y + c.position.h);
        });

        // Reset cursor to end of existing content
        if (newCards.length > 0) {
          y = Math.ceil(maxY);
        }

        // 2. Add new entities
        let addedCount = 0;
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
            addedCount++;
          }
        });

        // Update if we added things OR mark as provisioned to prevent future retries
        if (addedCount > 0 || !tab.provisioned) {
          return {
            ...state,
            tabs: {
              ...state.tabs,
              [tabId]: { ...tab, cards: newCards, provisioned: true }
            }
          };
        }

        return state;
      });
    }
  };
}

export const dashboardStore = createDashboardStore();
