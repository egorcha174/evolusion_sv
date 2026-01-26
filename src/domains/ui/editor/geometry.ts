import type { GridRect, GridUnit, ResizeHandle } from './types';

export const GRID_STEP = 0.5;

export function snapUnit(v: number): GridUnit {
  return Math.round(v * 2) / 2;
}

export function rectWithinBounds(rect: GridRect, cols: number, rows: number): boolean {
  return rect.col >= 0 && rect.row >= 0 && rect.col + rect.w <= cols && rect.row + rect.h <= rows;
}

export function rectCollides(rect: GridRect, others: GridRect[]): boolean {
  // Convert 0.5 units to integer steps for safer collision math (multiply by 2)
  const r1 = {
    x1: rect.col * 2,
    y1: rect.row * 2,
    x2: (rect.col + rect.w) * 2,
    y2: (rect.row + rect.h) * 2,
  };

  for (const other of others) {
    const r2 = {
      x1: other.col * 2,
      y1: other.row * 2,
      x2: (other.col + other.w) * 2,
      y2: (other.row + other.h) * 2,
    };

    if (r1.x1 < r2.x2 && r1.x2 > r2.x1 && r1.y1 < r2.y2 && r1.y2 > r2.y1) {
      return true;
    }
  }

  return false;
}

export function applyMove(start: GridRect, dCol: number, dRow: number): GridRect {
  return {
    ...start,
    col: snapUnit(start.col + dCol),
    row: snapUnit(start.row + dRow),
  };
}

export function applyResize(
  start: GridRect,
  handle: ResizeHandle,
  dCol: number,
  dRow: number,
  constraints: { maxCols: number; maxRows: number }
): GridRect {
  const r = { ...start };

  // Calculate raw deltas
  const dx = snapUnit(dCol);
  const dy = snapUnit(dRow);

  // Apply based on handle
  if (handle.includes('e')) {
    r.w = Math.max(GRID_STEP, start.w + dx);
  }
  if (handle.includes('s')) {
    r.h = Math.max(GRID_STEP, start.h + dy);
  }
  if (handle.includes('w')) {
    const newW = Math.max(GRID_STEP, start.w - dx);
    const shiftX = start.w - newW; // How much we actually shrank/grew
    r.col = start.col + shiftX;
    r.w = newW;
  }
  if (handle.includes('n')) {
    const newH = Math.max(GRID_STEP, start.h - dy);
    const shiftY = start.h - newH;
    r.row = start.row + shiftY;
    r.h = newH;
  }

  // Sanity check strict snapping
  r.col = snapUnit(r.col);
  r.row = snapUnit(r.row);
  r.w = snapUnit(r.w);
  r.h = snapUnit(r.h);

  return r;
}
