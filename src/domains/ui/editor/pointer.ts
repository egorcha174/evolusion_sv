
import { get } from 'svelte/store';
import { editorStore } from './store';
import { applyMove, applyResize } from './geometry';
import type { ResizeHandle } from './types';

const DRAG_THRESHOLD = 5; // px

export function onCardPointerDown(e: PointerEvent, cardId: string) {
  const state = get(editorStore);
  if (!state.enabled) return;

  // Setup Pointer Capture
  const target = e.target as HTMLElement;
  target.setPointerCapture(e.pointerId);

  // Select the card
  editorStore.selectCard(cardId);

  // Initial Op State
  const rect = state.drafts.get(cardId);
  if (rect) {
    editorStore.update(s => ({
      ...s,
      pointerOp: {
        kind: 'drag',
        cardId,
        startRect: { ...rect },
        startX: e.clientX,
        startY: e.clientY
      }
    }));
  }
}

export function onHandlePointerDown(e: PointerEvent, cardId: string, handle: ResizeHandle) {
  const state = get(editorStore);
  if (!state.enabled) return;
  e.stopPropagation(); // Stop card drag

  const target = e.target as HTMLElement;
  target.setPointerCapture(e.pointerId);

  const rect = state.drafts.get(cardId);
  if (rect) {
    editorStore.update(s => ({
      ...s,
      pointerOp: {
        kind: 'resize',
        cardId,
        handle,
        startRect: { ...rect },
        startX: e.clientX,
        startY: e.clientY
      }
    }));
  }
}

export function onPointerMove(e: PointerEvent) {
  const state = get(editorStore);
  if (!state.enabled || state.pointerOp.kind === 'idle') return;

  const { pointerOp, gridMetrics } = state;
  const unitPx = gridMetrics.halfUnitSizePx; // Size of 0.5 unit in pixels (from CSS)
  
  // Calculate raw delta in units
  const dxPx = e.clientX - pointerOp.startX;
  const dyPx = e.clientY - pointerOp.startY;

  // Apply Drag Threshold logic only for drag op
  if (pointerOp.kind === 'drag') {
     const dist = Math.sqrt(dxPx*dxPx + dyPx*dyPx);
     if (dist < DRAG_THRESHOLD) return;
  }
  
  const dCol = dxPx / unitPx / 2; // divide by 2 because halfUnitSizePx is size of grid cell (0.5 unit) -> wait.
  // Correction: CSS Grid definition:
  // --cols = N * 2;
  // --half-unit = calculated width of one column.
  // One column in CSS grid represents 0.5 logical units.
  // So if halfUnitSizePx is 50px, moving 50px means moving 1 CSS column, which is 0.5 logical unit.
  // dCol (logical) = dxPx / halfUnitSizePx * 0.5.
  
  const dColLogical = (dxPx / unitPx) * 0.5;
  const dRowLogical = (dyPx / unitPx) * 0.5;

  let newRect;

  if (pointerOp.kind === 'drag') {
    newRect = applyMove(pointerOp.startRect, dColLogical, dRowLogical);
  } else if (pointerOp.kind === 'resize') {
    newRect = applyResize(
        pointerOp.startRect, 
        pointerOp.handle, 
        dColLogical, 
        dRowLogical, 
        { maxCols: gridMetrics.cols, maxRows: gridMetrics.rows }
    );
  }

  if (newRect) {
    editorStore.updateDraft(pointerOp.cardId, newRect);
  }
}

export function onPointerUp(e: PointerEvent) {
  const state = get(editorStore);
  if (!state.enabled || state.pointerOp.kind === 'idle') return;

  const { pointerOp, collision, drafts } = state;

  // Release capture
  try {
     (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  } catch(err) { /* ignore */ }

  if (collision) {
    // Revert if invalid
    editorStore.updateDraft(pointerOp.cardId, pointerOp.startRect);
  } else {
    // Commit to history if changed
    const currentRect = drafts.get(pointerOp.cardId);
    if (currentRect) {
      const hasChanged = 
        currentRect.col !== pointerOp.startRect.col || 
        currentRect.row !== pointerOp.startRect.row ||
        currentRect.w !== pointerOp.startRect.w || 
        currentRect.h !== pointerOp.startRect.h;
        
      if (hasChanged) {
        editorStore.pushHistory(pointerOp.cardId, pointerOp.startRect, currentRect);
      }
    }
  }

  // Reset Op
  editorStore.update(s => ({ ...s, pointerOp: { kind: 'idle' }, collision: false }));
}

export function onPointerCancel(e: PointerEvent) {
  const state = get(editorStore);
  if (state.pointerOp.kind !== 'idle') {
    // Revert
    editorStore.updateDraft(state.pointerOp.cardId, state.pointerOp.startRect);
    editorStore.update(s => ({ ...s, pointerOp: { kind: 'idle' }, collision: false }));
  }
}
