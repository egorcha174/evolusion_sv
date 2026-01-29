import { g as get, w as writable } from "./index.js";
import { d as dashboardStore } from "./store.js";
const layoutAdapter = {
  loadLayout(tabId) {
    const state = get(dashboardStore);
    const tab = state.tabs[tabId];
    const cards = /* @__PURE__ */ new Map();
    const entities = /* @__PURE__ */ new Map();
    const cols = tab?.gridColumns ?? 8;
    const rows = tab?.gridRows ?? 6;
    if (tab) {
      tab.cards.forEach((c) => {
        cards.set(c.id, {
          col: c.position.x,
          row: c.position.y,
          w: c.position.w,
          h: c.position.h
        });
        entities.set(c.id, c.entityId);
      });
    }
    return { cards, entities, cols, rows };
  },
  saveLayout(tabId, drafts, cardEntities, templateOverrides) {
    const state = get(dashboardStore);
    const existingCards = state.tabs[tabId]?.cards || [];
    const existingMap = new Map(existingCards.map((c) => [c.id, c]));
    const newCards = [];
    drafts.forEach((rect, id) => {
      const entityId = cardEntities.get(id);
      if (entityId) {
        const existing = existingMap.get(id);
        let templateId = existing?.templateId;
        if (templateOverrides && templateOverrides.has(id)) {
          templateId = templateOverrides.get(id);
        }
        newCards.push({
          id,
          entityId,
          position: {
            x: rect.col,
            y: rect.row,
            w: rect.w,
            h: rect.h
          },
          templateId
        });
      }
    });
    dashboardStore.replaceTabCards(tabId, newCards);
  }
};
class EditorHistory {
  undoStack = [];
  redoStack = [];
  limit = 100;
  push(cmd) {
    this.undoStack.push(cmd);
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }
  canUndo() {
    return this.undoStack.length > 0;
  }
  canRedo() {
    return this.redoStack.length > 0;
  }
  undo() {
    const cmd = this.undoStack.pop();
    if (cmd) {
      this.redoStack.push(cmd);
      return cmd;
    }
    return null;
  }
  redo() {
    const cmd = this.redoStack.pop();
    if (cmd) {
      this.undoStack.push(cmd);
      return cmd;
    }
    return null;
  }
  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
const editorHistory = new EditorHistory();
function rectWithinBounds(rect, cols, rows) {
  return rect.col >= 0 && rect.row >= 0 && rect.col + rect.w <= cols && rect.row + rect.h <= rows;
}
function rectCollides(rect, others) {
  const r1 = {
    x1: rect.col * 2,
    y1: rect.row * 2,
    x2: (rect.col + rect.w) * 2,
    y2: (rect.row + rect.h) * 2
  };
  for (const other of others) {
    const r2 = {
      x1: other.col * 2,
      y1: other.row * 2,
      x2: (other.col + other.w) * 2,
      y2: (other.row + other.h) * 2
    };
    if (r1.x1 < r2.x2 && r1.x2 > r2.x1 && r1.y1 < r2.y2 && r1.y2 > r2.y1) {
      return true;
    }
  }
  return false;
}
const initialState = {
  enabled: false,
  tabId: null,
  selectedCardId: null,
  showGridSettings: false,
  isTemplateManagerOpen: false,
  pointerOp: { kind: "idle" },
  gridMetrics: { halfUnitSizePx: 0, cols: 8, rows: 6 },
  drafts: /* @__PURE__ */ new Map(),
  templateOverrides: /* @__PURE__ */ new Map(),
  cardEntities: /* @__PURE__ */ new Map(),
  collision: false
};
function createEditorStore() {
  const { subscribe, set, update } = writable(initialState);
  return {
    subscribe,
    update,
    // Expose update to allow pointer logic to modify state directly
    // --- Modals ---
    openTemplateManager() {
      update((s) => ({ ...s, isTemplateManagerOpen: true }));
    },
    closeTemplateManager() {
      update((s) => ({ ...s, isTemplateManagerOpen: false }));
    },
    // --- Lifecycle ---
    initSession(tabId) {
      const { cards, entities, cols, rows } = layoutAdapter.loadLayout(tabId);
      update((s) => ({
        ...s,
        enabled: true,
        tabId,
        drafts: cards,
        templateOverrides: /* @__PURE__ */ new Map(),
        // Clear overrides on init
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
      layoutAdapter.saveLayout(s.tabId, s.drafts, s.cardEntities, s.templateOverrides);
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
      update((s) => ({ ...s, showGridSettings: !s.showGridSettings }));
    },
    selectCard(cardId) {
      update((s) => ({ ...s, selectedCardId: cardId }));
    },
    setGridMetrics(halfUnitPx, cols, rows) {
      update((s) => {
        if (s.gridMetrics.halfUnitSizePx === halfUnitPx && s.gridMetrics.cols === cols && s.gridMetrics.rows === rows) {
          return s;
        }
        return { ...s, gridMetrics: { halfUnitSizePx: halfUnitPx, cols, rows } };
      });
    },
    updateDraft(cardId, rect) {
      update((s) => {
        const newDrafts = new Map(s.drafts);
        newDrafts.set(cardId, rect);
        const withinBounds = rectWithinBounds(rect, s.gridMetrics.cols, s.gridMetrics.rows);
        const others = [];
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
    setCardTemplate(cardId, templateId) {
      update((s) => {
        const newOverrides = new Map(s.templateOverrides);
        newOverrides.set(cardId, templateId);
        return { ...s, templateOverrides: newOverrides };
      });
    },
    // --- Card Actions (Edit Mode) ---
    // Adds a new card to the current editor session (draft)
    addCard(entityId) {
      update((s) => {
        if (!s.tabId) return s;
        const cols = s.gridMetrics.cols;
        const rows = s.gridMetrics.rows;
        let x = 0, y = 0;
        let found = false;
        const newW = 1;
        const newH = 1;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const candidate = { col: c, row: r, w: newW, h: newH };
            let collision = false;
            for (const existing of s.drafts.values()) {
              if (candidate.col < existing.col + existing.w && candidate.col + candidate.w > existing.col && candidate.row < existing.row + existing.h && candidate.row + candidate.h > existing.row) {
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
          let maxR = 0;
          s.drafts.forEach((r) => maxR = Math.max(maxR, r.row + r.h));
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
          collision: false
        };
      });
    },
    deleteCard(cardId) {
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
          selectedCardId: null
        };
      });
    },
    clearAllCards() {
      update((s) => ({
        ...s,
        drafts: /* @__PURE__ */ new Map(),
        cardEntities: /* @__PURE__ */ new Map(),
        templateOverrides: /* @__PURE__ */ new Map(),
        selectedCardId: null
      }));
    },
    duplicateCard(cardId) {
      const dashboard = get(dashboardStore);
      update((s) => {
        if (!s.tabId) return s;
        const sourceRect = s.drafts.get(cardId);
        const sourceEntity = s.cardEntities.get(cardId);
        if (!sourceRect || !sourceEntity) return s;
        let sourceTemplateId = s.templateOverrides.get(cardId);
        if (sourceTemplateId === void 0) {
          const originalCard = dashboard.tabs[s.tabId]?.cards.find((c) => c.id === cardId);
          sourceTemplateId = originalCard?.templateId;
        }
        const newId = `card_${Date.now()}`;
        const newRect = {
          ...sourceRect,
          col: sourceRect.col,
          row: sourceRect.row + sourceRect.h
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
          selectedCardId: newId
        };
      });
    },
    moveCardToTab(cardId, targetTabId) {
      const s = get({ subscribe });
      if (!s.tabId || !s.drafts.has(cardId)) return;
      const entityId = s.cardEntities.get(cardId);
      if (!entityId) return;
      dashboardStore.addCard(targetTabId, entityId);
      this.deleteCard(cardId);
    },
    // --- History ---
    pushHistory(cardId, from, to) {
      const s = get({ subscribe });
      if (!s.tabId) return;
      editorHistory.push({
        type: "transform",
        tabId: s.tabId,
        cardId,
        from,
        to
      });
    },
    undo() {
      const cmd = editorHistory.undo();
      if (cmd) {
        update((s) => {
          const newDrafts = new Map(s.drafts);
          newDrafts.set(cmd.cardId, cmd.from);
          return { ...s, drafts: newDrafts, selectedCardId: cmd.cardId, collision: false };
        });
      }
    },
    redo() {
      const cmd = editorHistory.redo();
      if (cmd) {
        update((s) => {
          const newDrafts = new Map(s.drafts);
          newDrafts.set(cmd.cardId, cmd.to);
          return { ...s, drafts: newDrafts, selectedCardId: cmd.cardId, collision: false };
        });
      }
    }
  };
}
const editorStore = createEditorStore();
export {
  editorHistory as a,
  editorStore as e
};
