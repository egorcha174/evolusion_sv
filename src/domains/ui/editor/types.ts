export type TabId = string;
export type CardId = string;

// Allow 0.5 steps
export type GridUnit = number;

export type GridRect = {
  col: GridUnit; // x position
  row: GridUnit; // y position
  w: GridUnit; // width
  h: GridUnit; // height
};

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type PointerOp =
  | { kind: 'idle' }
  | { kind: 'drag'; cardId: CardId; startRect: GridRect; startX: number; startY: number }
  | {
      kind: 'resize';
      cardId: CardId;
      handle: ResizeHandle;
      startRect: GridRect;
      startX: number;
      startY: number;
    };

export type EditSessionSnapshot = {
  tabId: TabId;
  // We store a map of IDs to Rects to restore state
  layoutSnapshot: Map<CardId, GridRect>;
};

export type EditorState = {
  enabled: boolean;
  tabId: TabId | null;
  selectedCardId: CardId | null;
  showGridSettings: boolean;

  // Interaction state
  pointerOp: PointerOp;

  // Configuration derived from UI
  gridMetrics: {
    halfUnitSizePx: number;
    cols: number;
    rows: number;
  };

  // Draft state (the "dirty" layer)
  drafts: Map<CardId, GridRect>;

  // Template overrides (dirty templates)
  // Maps CardId -> TemplateId (or undefined to unassign)
  templateOverrides: Map<CardId, string | undefined>;

  // Store Entity ID mapping to support duplication/creation
  cardEntities: Map<CardId, string>;

  // Validation state
  collision: boolean;
};
