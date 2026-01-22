
import type { GridRect, GridUnit, ResizeHandle } from './types';

export const GRID_STEP = 0.5;

export interface GridGeometry {
  columns: number;
  rows: number;
  cellSize: number;
  gapX: number;
  gapY: number;
  gridWidth: number;
  gridHeight: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
}

export interface PixelRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Calculates the grid geometry based on the available space and grid configuration.
 * Follows the deterministic algorithm from the technical specification.
 */
export function calculateGridGeometry(
  contentWidth: number,
  contentHeight: number,
  columns: number,
  rows: number
): GridGeometry {
  const maxMargin = 16;
  const minGapX = 10;
  const minGapY = 10;

  const gridMaxWidth = contentWidth - 2 * maxMargin;
  const gridMaxHeight = contentHeight - 2 * maxMargin;

  const cellSizeX = (gridMaxWidth - (columns - 1) * minGapX) / columns;
  const cellSizeY = (gridMaxHeight - (rows - 1) * minGapY) / rows;
  const cellSize = Math.floor(Math.min(cellSizeX, cellSizeY));

  if (cellSize < 1) {
    return {
      columns, rows, cellSize: 0, gapX: minGapX, gapY: minGapY, gridWidth: 0, gridHeight: 0,
      marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0
    };
  }

  const baseGridWidth = columns * cellSize + (columns - 1) * minGapX;
  const baseGridHeight = rows * cellSize + (rows - 1) * minGapY;

  const extraWidth = Math.max(0, gridMaxWidth - baseGridWidth);
  const extraHeight = Math.max(0, gridMaxHeight - baseGridHeight);

  const gapX = columns > 1 ? minGapX + extraWidth / (columns - 1) : 0;
  const gapY = rows > 1 ? minGapY + extraHeight / (rows - 1) : 0;

  const gridWidth = columns * cellSize + (columns - 1) * gapX;
  const gridHeight = rows * cellSize + (rows - 1) * gapY;

  let marginLeft = (contentWidth - gridWidth) / 2;
  let marginTop = (contentHeight - gridHeight) / 2;
  
  let marginRight = contentWidth - gridWidth - marginLeft;
  let marginBottom = contentHeight - gridHeight - marginTop;

  marginLeft = Math.max(0, Math.min(marginLeft, maxMargin));
  marginRight = Math.max(0, Math.min(marginRight, maxMargin));
  marginTop = Math.max(0, Math.min(marginTop, maxMargin));
  marginBottom = Math.max(0, Math.min(marginBottom, maxMargin));

  const finalGridWidth = contentWidth - marginLeft - marginRight;
  const finalGridHeight = contentHeight - marginTop - marginBottom;

  return {
    columns, rows, cellSize, gapX, gapY,
    gridWidth: finalGridWidth,
    gridHeight: finalGridHeight,
    marginLeft, marginRight, marginTop, marginBottom
  };
}

/**
 * Converts a logical grid rect (in grid units) to a pixel rect (in px).
 * This is the core of the absolute positioning layout.
 */
export function getPixelRect(rect: GridRect, geometry: GridGeometry): PixelRect {
  const { cellSize, gapX, gapY } = geometry;
  if (cellSize === 0) return { top: 0, left: 0, width: 0, height: 0 };
  
  const { col, row, w, h } = rect;

  const left = col * cellSize + Math.floor(col) * gapX;
  const top = row * cellSize + Math.floor(row) * gapY;

  // Epsilon to handle floating point issues at integer boundaries, e.g., col+w = 2.0
  const epsilon = 0.0001; 
  const numGapsX = Math.floor(col + w - epsilon) - Math.floor(col);
  const numGapsY = Math.floor(row + h - epsilon) - Math.floor(row);

  const width = w * cellSize + numGapsX * gapX;
  const height = h * cellSize + numGapsY * gapY;

  return { left, top, width, height };
}


export function snapUnit(v: number): GridUnit {
  return Math.round(v * 2) / 2;
}

export function rectWithinBounds(rect: GridRect, cols: number, rows: number): boolean {
  return (
    rect.col >= 0 &&
    rect.row >= 0 &&
    rect.col + rect.w <= cols &&
    rect.row + rect.h <= rows
  );
}

export function rectCollides(rect: GridRect, others: GridRect[]): boolean {
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

export function applyMove(start: GridRect, dCol: number, dRow: number): GridRect {
  return {
    ...start,
    col: snapUnit(start.col + dCol),
    row: snapUnit(start.row + dRow)
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
  
  const dx = snapUnit(dCol);
  const dy = snapUnit(dRow);

  if (handle.includes('e')) r.w = Math.max(GRID_STEP, start.w + dx);
  if (handle.includes('s')) r.h = Math.max(GRID_STEP, start.h + dy);
  if (handle.includes('w')) {
    const newW = Math.max(GRID_STEP, start.w - dx);
    const shiftX = start.w - newW;
    r.col = start.col + shiftX;
    r.w = newW;
  }
  if (handle.includes('n')) {
    const newH = Math.max(GRID_STEP, start.h - dy);
    const shiftY = start.h - newH;
    r.row = start.row + shiftY;
    r.h = newH;
  }

  r.col = snapUnit(r.col);
  r.row = snapUnit(r.row);
  r.w = snapUnit(r.w);
  r.h = snapUnit(r.h);

  return r;
}
