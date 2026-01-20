
<script lang="ts">
  import { isEditMode } from '../app/tabsStore';
  import type { DashboardCardConfig } from '$lib/types';
  
  let { card, gridCols, gridRows, onUpdate } = $props<{ 
    card: DashboardCardConfig, 
    gridCols: number, 
    gridRows: number,
    onUpdate: (id: string, pos: any) => void 
  }>();

  // We use a 2x multiplier internally to handle 0.5 units
  // If user says x=1, w=0.5 -> css x=3, span=1
  // Formula: CSS Start = (UserVal * 2) + 1
  // Formula: CSS Span  = (UserSize * 2)

  let style = $derived(`
    grid-column: ${Math.round(card.position.x * 2) + 1} / span ${Math.round(card.position.w * 2)};
    grid-row: ${Math.round(card.position.y * 2) + 1} / span ${Math.round(card.position.h * 2)};
  `);

  // --- Drag Logic ---
  let isDragging = $state(false);
  let isResizing = $state(false);
  let startX = 0;
  let startY = 0;
  let currentTranslateX = $state(0);
  let currentTranslateY = $state(0);
  let element: HTMLDivElement;

  function getCellSize() {
    if (!element || !element.parentElement) return { w: 0, h: 0 };
    const gridRect = element.parentElement.getBoundingClientRect();
    // Total internal columns = gridCols * 2
    const cellW = gridRect.width / (gridCols * 2);
    const cellH = gridRect.height / (gridRows * 2);
    return { w: cellW, h: cellH };
  }

  function handleMouseDown(e: MouseEvent) {
    if (!$isEditMode) return;
    // Only drag via handle if specifically provided, or body if not resizing
    // Here we allow body drag
    e.stopPropagation(); // Prevent card click
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }

  function handleDragMove(e: MouseEvent) {
    if (!isDragging) return;
    currentTranslateX = e.clientX - startX;
    currentTranslateY = e.clientY - startY;
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);

    // Calculate new position
    const { w, h } = getCellSize();
    if (w === 0 || h === 0) {
        currentTranslateX = 0;
        currentTranslateY = 0;
        return;
    }

    const deltaXUnits = Math.round(currentTranslateX / w) / 2;
    const deltaYUnits = Math.round(currentTranslateY / h) / 2;

    let newX = card.position.x + deltaXUnits;
    let newY = card.position.y + deltaYUnits;

    // Boundaries
    newX = Math.max(0, Math.min(newX, gridCols - card.position.w));
    newY = Math.max(0, Math.min(newY, gridRows - card.position.h));

    // Reset transform
    currentTranslateX = 0;
    currentTranslateY = 0;

    // Commit
    if (newX !== card.position.x || newY !== card.position.y) {
       onUpdate(card.id, { ...card.position, x: newX, y: newY });
    }
  }

  // --- Resize Logic ---
  function handleResizeStart(e: MouseEvent) {
    if (!$isEditMode) return;
    e.stopPropagation();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  }

  function handleResizeMove(e: MouseEvent) {
    if (!isResizing) return;
    // Visual feedback for resize is harder without changing actual size, 
    // for MVP we just use a ghost or simple cursor, 
    // but here we just track delta to commit on end.
  }

  function handleResizeEnd(e: MouseEvent) {
    if (!isResizing) return;
    isResizing = false;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);

    const { w, h } = getCellSize();
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const deltaW = Math.round(deltaX / w) / 2;
    const deltaH = Math.round(deltaY / h) / 2;

    let newW = Math.max(0.5, card.position.w + deltaW);
    let newH = Math.max(0.5, card.position.h + deltaH);

    // Check bounds
    if (card.position.x + newW > gridCols) newW = gridCols - card.position.x;
    if (card.position.y + newH > gridRows) newH = gridRows - card.position.y;

    if (newW !== card.position.w || newH !== card.position.h) {
        onUpdate(card.id, { ...card.position, w: newW, h: newH });
    }
  }

  // Transform style for dragging
  let transform = $derived(isDragging 
    ? `translate(${currentTranslateX}px, ${currentTranslateY}px)` 
    : 'none');
  let zIndex = $derived(isDragging ? 100 : 1);
  let opacity = $derived(isDragging ? 0.8 : 1);

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  bind:this={element}
  class="grid-item"
  class:edit-mode={$isEditMode}
  class:dragging={isDragging}
  style="{style}; transform: {transform}; z-index: {zIndex}; opacity: {opacity};"
  onmousedown={handleMouseDown}
>
  <div class="content-wrapper">
    <slot />
  </div>

  {#if $isEditMode}
    <div class="resize-handle" onmousedown={handleResizeStart}></div>
  {/if}
</div>

<style>
  .grid-item {
    position: relative;
    width: 100%;
    height: 100%;
    /* Transition for layout changes, but not during drag */
    transition: transform 0.1s, opacity 0.2s;
  }
  
  .grid-item.dragging {
    transition: none;
    pointer-events: none; /* Let events pass to window */
  }

  .content-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  /* Disable interaction with inner card in edit mode */
  .grid-item.edit-mode .content-wrapper :global(*) {
     pointer-events: none;
  }
  
  .grid-item.edit-mode {
    cursor: grab;
    outline: 1px dashed rgba(128, 128, 128, 0.5);
    outline-offset: -1px;
    border-radius: var(--card-border-radius, 16px);
  }
  
  .grid-item.edit-mode:active {
    cursor: grabbing;
  }

  .resize-handle {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    background: var(--accent-primary);
    border-radius: 50% 0 50% 0;
    cursor: nwse-resize;
    z-index: 10;
    opacity: 0.8;
  }
  
  .resize-handle:hover {
    opacity: 1;
    transform: scale(1.2);
  }

  /* Mobile: Override Grid styles handled by parent media query usually, 
     but we can force reset here just in case */
  @media (max-width: 768px) {
    .grid-item {
      grid-column: auto !important;
      grid-row: auto !important;
      height: auto !important;
      min-height: 120px;
      margin-bottom: 1rem;
    }
  }
</style>
