import { writable, get } from 'svelte/store';
import type { EditorState, GridRect, CardId, TabId } from './types';
import { layoutAdapter } from './layoutAdapter';
import { editorHistory } from './history';
import { rectWithinBounds, rectCollides } from './geometry';
import { dashboardStore } from '../../app/dashboardStore';

// Extended state to include modal visibility
export interface ExtendedEditorState extends EditorState {
  isTemplateManagerOpen: boolean;
}

const initialState: ExtendedEditorState = {
  enabled: false,
  tabId: null,
  selectedCardId: null,
  showGridSettings: false,
  isTemplateManagerOpen: false,
  pointerOp: { kind: 'idle' },
  gridMetrics: { halfUnitSizePx: 0, cols: 8, rows: 6 },
  drafts: new Map(),
  templateOverrides: new Map(),
  cardEntities: new Map(),
  collision: false,
};

function createEditorStore() {
  const { subscribe, set, update } = writable<ExtendedEditorState>(initialState);

  return {
    subscribe,
    update, // Expose update to allow pointer logic to modify state directly

    // --- Modals ---
    openTemplateManager() {
      update((s) => ({ ...s, isTemplateManagerOpen: true }));
    },

    closeTemplateManager() {
      update((s) => ({ ...s, isTemplateManagerOpen: false }));
    },

    // --- Lifecycle ---

    initSession(tabId: string) {
      // Load current layout via Adapter
      const { cards, entities, cols, rows } = layoutAdapter.loadLayout(tabId);

      update((s) => ({
        ...s,
        enabled: true,
        tabId,
        drafts: cards,
        templateOverrides: new Map(), // Clear overrides on init
        cardEntities: entities,
        selectedCardId: null,
        showGridSettings: false,
        collision: false,
        gridMetrics: {
          ...s.gridMetrics,
          cols,
          rows,
        },
      }));
      editorHistory.clear();
    },

    commit() {
      const s = get({ subscribe });
      if (!s.tabId) return;

      // Save complete state (drafts + deletions + additions + templates) via Adapter
      layoutAdapter.saveLayout(s.tabId, s.drafts, s.cardEntities, s.templateOverrides);

      this.reset();
    },

    cancel() {
      this.reset();
    },

    reset() {
      // Preserve isTemplateManagerOpen if needed, or reset all?
      // Usually edit mode toggle resets everything.
      set(initialState);
      editorHistory.clear();
    },

    // --- Interaction ---

    toggleGridSettings() {
      update((s) => ({ ...s, showGridSettings: !s.showGridSettings }));
    },

    selectCard(cardId: CardId | null) {
      update((s) => ({ ...s, selectedCardId: cardId }));
    },

    setGridMetrics(halfUnitPx: number, cols: number, rows: number) {
      update((s) => {
        // Prevent infinite loop if values haven't changed
        if (
          s.gridMetrics.halfUnitSizePx === halfUnitPx &&
          s.gridMetrics.cols === cols &&
          s.gridMetrics.rows === rows
        ) {
          return s;
        }
        return { ...s, gridMetrics: { halfUnitSizePx: halfUnitPx, cols, rows } };
      });
    },

    updateDraft(cardId: CardId, rect: GridRect) {
      update((s) => {
        const newDrafts = new Map<CardId, GridRect>(s.drafts);
        newDrafts.set(cardId, rect);

        // Check bounds
        const withinBounds = rectWithinBounds(rect, s.gridMetrics.cols, s.gridMetrics.rows);

        // Check collisions (exclude self)
        const others: GridRect[] = [];
        newDrafts.forEach((r, id) => {
          if (id !== cardId) others.push(r);
        });
        const collides = rectCollides(rect, others);

        return {
          ...s,
          drafts: newDrafts,
          collision: !withinBounds || collides,
        };
      });
    },

    setCardTemplate(cardId: CardId, templateId: string | undefined) {
      update((s) => {
        const newOverrides = new Map(s.templateOverrides);
        newOverrides.set(cardId, templateId);
        return { ...s, templateOverrides: newOverrides };
      });
    },

    // --- Card Actions (Edit Mode) ---

    // Adds a new card to the current editor session (draft)
    addCard(entityId: string) {
      update((s) => {
        if (!s.tabId) return s;

        // 1. Scan for first available 1x1 spot
        const cols = s.gridMetrics.cols;
        const rows = s.gridMetrics.rows;
        let x = 0,
          y = 0;
        let found = false;

        const newW = 1;
        const newH = 1;

        // Naive integer scan
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // Rect candidate
            const candidate = { col: c, row: r, w: newW, h: newH };

            // Check against all drafts
            let collision = false;
            for (const existing of s.drafts.values()) {
              // Simple overlap
              if (
                candidate.col < existing.col + existing.w &&
                candidate.col + candidate.w > existing.col &&
                candidate.row < existing.row + existing.h &&
                candidate.row + candidate.h > existing.row
              ) {
                collision = true;
                break;
              }
            }

            if (!collision) {
              x = c;
              y = r;
              found = true;
              break;
            }
          }
          if (found) break;
        }

        if (!found) {
          // Append to bottom
          let maxR = 0;
          s.drafts.forEach((r) => (maxR = Math.max(maxR, r.row + r.h)));
          y = Math.max(0, Math.ceil(maxR));
          x = 0;
        }

        const newId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        const newDrafts = new Map(s.drafts);
        newDrafts.set(newId, { col: x, row: y, w: 1, h: 1 });

        const newEntities = new Map(s.cardEntities);
        newEntities.set(newId, entityId);

        return {
          ...s,
          drafts: newDrafts,
          cardEntities: newEntities,
          selectedCardId: newId,
          collision: false,
        };
      });
    },

    deleteCard(cardId: CardId) {
      update((s) => {
        const newDrafts = new Map(s.drafts);
        const newEntities = new Map(s.cardEntities);
        const newOverrides = new Map(s.templateOverrides);

        newDrafts.delete(cardId);
        newEntities.delete(cardId);
        newOverrides.delete(cardId);

        return {
          ...s,
          drafts: newDrafts,
          cardEntities: newEntities,
          templateOverrides: newOverrides,
          selectedCardId: null,
        };
      });
    },

    clearAllCards() {
      update((s) => ({
        ...s,
        drafts: new Map(),
        cardEntities: new Map(),
        templateOverrides: new Map(),
        selectedCardId: null,
      }));
    },

    duplicateCard(cardId: CardId) {
      // Need to access dashboard store to find original template if it wasn't overridden
      const dashboard = get(dashboardStore);

      update((s) => {
        if (!s.tabId) return s;

        const sourceRect = s.drafts.get(cardId);
        const sourceEntity = s.cardEntities.get(cardId);

        if (!sourceRect || !sourceEntity) return s;

        // Find source template ID (either override or from persistent store)
        let sourceTemplateId = s.templateOverrides.get(cardId);
        if (sourceTemplateId === undefined) {
          // Fallback to store
          const originalCard = dashboard.tabs[s.tabId]?.cards.find((c) => c.id === cardId);
          sourceTemplateId = originalCard?.templateId;
        }

        // Create new ID
        const newId = `card_${Date.now()}`;

        // Offset slightly
        const newRect = {
          ...sourceRect,
          col: sourceRect.col,
          row: sourceRect.row + sourceRect.h,
        };

        const newDrafts = new Map(s.drafts);
        const newEntities = new Map(s.cardEntities);
        const newOverrides = new Map(s.templateOverrides);

        newDrafts.set(newId, newRect);
        newEntities.set(newId, sourceEntity);
        if (sourceTemplateId) {
          newOverrides.set(newId, sourceTemplateId);
        }

        return {
          ...s,
          drafts: newDrafts,
          cardEntities: newEntities,
          templateOverrides: newOverrides,
          selectedCardId: newId,
        };
      });
    },

    moveCardToTab(cardId: CardId, targetTabId: TabId) {
      const s = get({ subscribe });
      if (!s.tabId || !s.drafts.has(cardId)) return;

      const entityId = s.cardEntities.get(cardId);
      if (!entityId) return;

      // 1. Add to target tab (Persistent immediately - safe cross-tab action)
      // Note: This loses the template if it was just changed in this session.
      // For MVP we accept this limitation or we can pass templateId to addCard.
      dashboardStore.addCard(targetTabId, entityId);

      // 2. Remove from current session (Draft - will be persisted on Commit)
      this.deleteCard(cardId);
    },

    // --- History ---

    pushHistory(cardId: CardId, from: GridRect, to: GridRect) {
      const s = get({ subscribe });
      if (!s.tabId) return;

      editorHistory.push({
        type: 'transform',
        tabId: s.tabId,
        cardId,
        from,
        to,
      });
    },

    undo() {
      const cmd = editorHistory.undo();
      if (cmd) {
        // Apply 'from' state
        update((s) => {
          const newDrafts = new Map<CardId, GridRect>(s.drafts);
          newDrafts.set(cmd.cardId, cmd.from);
          return { ...s, drafts: newDrafts, selectedCardId: cmd.cardId, collision: false };
        });
      }
    },

    redo() {
      const cmd = editorHistory.redo();
      if (cmd) {
        // Apply 'to' state
        update((s) => {
          const newDrafts = new Map<CardId, GridRect>(s.drafts);
          newDrafts.set(cmd.cardId, cmd.to);
          return { ...s, drafts: newDrafts, selectedCardId: cmd.cardId, collision: false };
        });
      }
    },
  };
}

export const editorStore = createEditorStore();
