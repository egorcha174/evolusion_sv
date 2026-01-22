
import { writable, get } from 'svelte/store';
import type { EditorState, GridRect, CardId, TabId } from './types';
import { layoutAdapter } from './layoutAdapter';
import { editorHistory } from './history';
import { rectWithinBounds, rectCollides } from './geometry';
import { dashboardStore } from '../../app/dashboardStore';

const initialState: EditorState = {
  enabled: false,
  tabId: null,
  selectedCardId: null,
  showGridSettings: false,
  pointerOp: { kind: 'idle' },
  gridMetrics: { halfUnitSizePx: 0, cols: 8, rows: 6 },
  drafts: new Map(),
  cardEntities: new Map(),
  collision: false
};

function createEditorStore() {
  const { subscribe, set, update } = writable<EditorState>(initialState);

  return {
    subscribe,
    update, // Expose update to allow pointer logic to modify state directly
    
    // --- Lifecycle ---

    initSession(tabId: string) {
      // Load current layout via Adapter
      const { cards, entities, cols, rows } = layoutAdapter.loadLayout(tabId);
      
      update(s => ({
        ...s,
        enabled: true,
        tabId,
        drafts: cards,
        cardEntities: entities,
        selectedCardId: null,
        showGridSettings: false,
        collision: false,
        gridMetrics: {
          ...s.gridMetrics,
          cols,
          rows
        }
      }));
      editorHistory.clear();
    },

    commit() {
      const s = get({ subscribe });
      if (!s.tabId) return;

      // Save complete state (drafts + deletions + additions) via Adapter
      layoutAdapter.saveLayout(s.tabId, s.drafts, s.cardEntities);

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
          collision: !withinBounds || collides
        };
      });
    },

    // --- Card Actions (Edit Mode) ---

    deleteCard(cardId: CardId) {
      update(s => {
        const newDrafts = new Map(s.drafts);
        const newEntities = new Map(s.cardEntities);
        
        newDrafts.delete(cardId);
        newEntities.delete(cardId);
        
        return { 
          ...s, 
          drafts: newDrafts, 
          cardEntities: newEntities,
          selectedCardId: null 
        };
      });
    },

    clearAllCards() {
      update(s => ({ 
        ...s, 
        drafts: new Map(), 
        cardEntities: new Map(),
        selectedCardId: null 
      }));
    },

    duplicateCard(cardId: CardId) {
      update(s => {
        const sourceRect = s.drafts.get(cardId);
        const sourceEntity = s.cardEntities.get(cardId);
        
        if (!sourceRect || !sourceEntity) return s;
        
        // Create new ID
        const newId = `card_${Date.now()}`;
        
        // Offset slightly
        const newRect = { 
           ...sourceRect, 
           col: sourceRect.col, 
           row: sourceRect.row + sourceRect.h 
        };
        
        // Check bounds? For now just place it, collision detection will highlight if needed
        
        const newDrafts = new Map(s.drafts);
        const newEntities = new Map(s.cardEntities);
        
        newDrafts.set(newId, newRect);
        newEntities.set(newId, sourceEntity);

        // We also need to update collision state immediately
        // reuse logic from updateDraft? Or just rely on user moving it.
        // Let's rely on user moving it for now or collision logic in UI

        return { 
           ...s, 
           drafts: newDrafts, 
           cardEntities: newEntities,
           selectedCardId: newId 
        };
      });
    },

    moveCardToTab(cardId: CardId, targetTabId: TabId) {
       const s = get({ subscribe });
       if (!s.tabId || !s.drafts.has(cardId)) return;

       const entityId = s.cardEntities.get(cardId);
       if (!entityId) return;

       // 1. Add to target tab (Persistent immediately - safe cross-tab action)
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
        to
      });
    },

    undo() {
      const cmd = editorHistory.undo();
      if (cmd) {
        // Apply 'from' state
        update(s => {
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
        update(s => {
           const newDrafts = new Map<CardId, GridRect>(s.drafts);
           newDrafts.set(cmd.cardId, cmd.to);
           return { ...s, drafts: newDrafts, selectedCardId: cmd.cardId, collision: false };
        });
      }
    }
  };
}

export const editorStore = createEditorStore();
