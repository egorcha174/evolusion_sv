
import { writable, get } from 'svelte/store';
import type { EditorState, GridRect, CardId, TabId } from './types';
import { dashboardStore } from '../../app/dashboardStore';
import { editorHistory } from './history';
import { rectWithinBounds, rectCollides } from './geometry';

const initialState: EditorState = {
  enabled: false,
  tabId: null,
  selectedCardId: null,
  showGridSettings: false,
  pointerOp: { kind: 'idle' },
  gridMetrics: { halfUnitSizePx: 0, cols: 8, rows: 6 },
  drafts: new Map(),
  collision: false
};

function createEditorStore() {
  const { subscribe, set, update } = writable<EditorState>(initialState);

  return {
    subscribe,
    update, // Expose update to allow pointer logic to modify state directly
    
    // --- Lifecycle ---

    initSession(tabId: string) {
      // Load current layout from DashboardStore into drafts
      const dashState = get(dashboardStore);
      const tabConfig = dashState.tabs[tabId];
      
      const drafts = new Map<CardId, GridRect>();
      if (tabConfig) {
        tabConfig.cards.forEach(c => {
          drafts.set(c.id, { col: c.position.x, row: c.position.y, w: c.position.w, h: c.position.h });
        });
        
        update(s => ({
          ...s,
          enabled: true,
          tabId,
          drafts,
          selectedCardId: null,
          showGridSettings: false,
          collision: false,
          gridMetrics: {
            ...s.gridMetrics,
            cols: tabConfig.gridColumns,
            rows: tabConfig.gridRows
          }
        }));
      }
      editorHistory.clear();
    },

    commit() {
      const s = get({ subscribe });
      if (!s.tabId) return;

      // Write drafts back to DashboardStore
      const updates: Array<{ id: string, pos: any }> = [];
      s.drafts.forEach((rect, id) => {
        updates.push({ 
          id, 
          pos: { x: rect.col, y: rect.row, w: rect.w, h: rect.h } 
        });
      });

      // We need to batch update dashboard store (adapter logic)
      updates.forEach(u => {
        dashboardStore.updateCardPosition(s.tabId!, u.id, u.pos);
      });

      this.reset();
    },

    cancel() {
      this.reset();
    },
    
    reset() {
      set(initialState);
      editorHistory.clear();
    },

    // --- Interaction ---
    
    toggleGridSettings() {
      update(s => ({ ...s, showGridSettings: !s.showGridSettings }));
    },

    selectCard(cardId: CardId | null) {
      update(s => ({ ...s, selectedCardId: cardId }));
    },

    setGridMetrics(halfUnitPx: number, cols: number, rows: number) {
      update(s => {
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
      update(s => {
        const newDrafts = new Map(s.drafts);
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
          collision: !withinBounds || collides
        };
      });
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
        to
      });
    },

    undo() {
      const cmd = editorHistory.undo();
      if (cmd) {
        // Apply 'from' state
        update(s => {
          const newDrafts = new Map(s.drafts);
          newDrafts.set(cmd.cardId, cmd.from);
          return { ...s, drafts: newDrafts, selectedCardId: cmd.cardId, collision: false };
        });
      }
    },

    redo() {
      const cmd = editorHistory.redo();
      if (cmd) {
        // Apply 'to' state
        update(s => {
           const newDrafts = new Map(s.drafts);
           newDrafts.set(cmd.cardId, cmd.to);
           return { ...s, drafts: newDrafts, selectedCardId: cmd.cardId, collision: false };
        });
      }
    }
  };
}

export const editorStore = createEditorStore();
