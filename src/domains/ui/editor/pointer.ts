
import { get } from 'svelte/store';
import { editorStore } from './store';
import { applyMove, applyResize, type GridGeometry } from './geometry';
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

export function onPointerMove(e: PointerEvent, geometry: GridGeometry) {
  const state = get(editorStore);
  if (!state.enabled || state.pointerOp.kind === 'idle' || geometry.cellSize < 1) return;

  const { pointerOp } = state;
  
  // Calculate delta in pixels
  const dxPx = e.clientX - pointerOp.startX;
  const dyPx = e.clientY - pointerOp.startY;

  // Apply Drag Threshold logic only for drag op
  if (pointerOp.kind === 'drag') {
     const dist = Math.sqrt(dxPx*dxPx + dyPx*dyPx);
     if (dist < DRAG_THRESHOLD && !state.isDragging) {
        editorStore.update(s => ({...s, isDragging: true}));
     }
     if (dist < DRAG_THRESHOLD) return;
  }
  
  // Convert pixel delta to logical grid units (where 1 unit = 1 cellSize)
  const dCol = dxPx / geometry.cellSize;
  const dRow = dyPx / geometry.cellSize;

  let newRect;

  if (pointerOp.kind === 'drag') {
    newRect = applyMove(pointerOp.startRect, dCol, dRow);
  } else if (pointerOp.kind === 'resize') {
    newRect = applyResize(
        pointerOp.startRect, 
        pointerOp.handle, 
        dCol, 
        dRow,
        { maxCols: geometry.columns, maxRows: geometry.rows }
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
  editorStore.update(s => ({ ...s, isDragging: false, pointerOp: { kind: 'idle' }, collision: false }));
}

export function onPointerCancel(e: PointerEvent) {
  const state = get(editorStore);
  if (state.pointerOp.kind !== 'idle') {
    // Revert
    editorStore.updateDraft(state.pointerOp.cardId, state.pointerOp.startRect);
    editorStore.update(s => ({ ...s, isDragging: false, pointerOp: { kind: 'idle' }, collision: false }));
  }
}
