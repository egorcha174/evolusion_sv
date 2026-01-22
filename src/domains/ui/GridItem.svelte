
<script lang="ts">
  import { editorStore } from './editor/store';
  import { onCardPointerDown } from './editor/pointer';
  import CardEditOverlay from './editor/components/CardEditOverlay.svelte';
  import type { DashboardCardConfig } from '$lib/types';
  
  let { card, oncontextmenu } = $props<{ 
    card: DashboardCardConfig,
    oncontextmenu?: (e: MouseEvent, cardId: string) => void
  }>();

  // If editor is enabled, check if card exists in drafts. If not, it's deleted.
  let isDeleted = $derived($editorStore.enabled && !$editorStore.drafts.has(card.id));

  // Determine effective position (Draft if editing, or Source)
  let rect = $derived($editorStore.enabled && $editorStore.drafts.has(card.id)
    ? $editorStore.drafts.get(card.id)!
    : { col: card.position.x, row: card.position.y, w: card.position.w, h: card.position.h }
  );
  
  // Logic for internal gaps inside integer grid cells
  let style = $derived.by(() => {
    const gapSize = 6; // px - Internal gap between fractional items
    
    // 1. Grid Placement (Integer Tracks)
    // We map logical coordinates (e.g. 0, 0.5, 1.5) to integer grid lines.
    // A card at 0.5 with width 0.5 sits in column 1 (1-based CSS grid).
    const gridColStart = Math.floor(rect.col) + 1;
    const gridRowStart = Math.floor(rect.row) + 1;
    
    // Span covers the full integer range the card touches
    const gridColSpan = Math.ceil(rect.col + rect.w) - Math.floor(rect.col);
    const gridRowSpan = Math.ceil(rect.row + rect.h) - Math.floor(rect.row);
    
    let s = `grid-column: ${gridColStart} / span ${gridColSpan}; grid-row: ${gridRowStart} / span ${gridRowSpan};`;

    // 2. Internal Positioning (Margins & Size)
    // Handle Width for 0.5 unit items
    if (rect.w === 0.5) {
      s += `width: calc(50% - ${gapSize / 2}px);`;
      if (rect.col % 1 !== 0) {
        s += `margin-left: auto;`; // Right side
      } else {
        s += `margin-right: auto;`; // Left side
      }
    } else {
      s += `width: 100%;`;
    }

    // Handle Height for 0.5 unit items
    if (rect.h === 0.5) {
      s += `height: calc(50% - ${gapSize / 2}px);`;
      if (rect.row % 1 !== 0) {
        s += `margin-top: auto;`; // Bottom side
      } else {
        s += `margin-bottom: auto;`; // Top side
      }
    } else {
      s += `height: 100%;`;
    }

    return s;
  });

  let isSelected = $derived($editorStore.selectedCardId === card.id);
  let isDragging = $derived(isSelected && $editorStore.pointerOp.kind === 'drag');
  
  function handleContextMenu(e: MouseEvent) {
    if (oncontextmenu) {
      oncontextmenu(e, card.id);
    }
  }
</script>

{#if !isDeleted}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="grid-item"
    class:edit-mode={$editorStore.enabled}
    class:dragging={isDragging}
    style={style}
    data-card-id={card.id}
    onpointerdown={(e) => onCardPointerDown(e, card.id)}
    oncontextmenu={handleContextMenu}
  >
    <div class="content-wrapper">
      <slot />
    </div>

    <CardEditOverlay cardId={card.id} />
  </div>
{/if}

<style>
  .grid-item {
    position: relative;
    /* Transition for layout changes, but not during drag */
    transition: transform 0.1s;
    /* Default flex alignment to support margin: auto tricks */
    display: flex;
    flex-direction: column; 
  }
  
  /* Disable transition during active drag to feel responsive */
  .grid-item.dragging {
    transition: none;
    z-index: 100;
  }

  .content-wrapper {
    width: 100%;
    height: 100%;
    /* Enable container queries for responsive children (cards) */
    container-type: size;
  }
  
  /* Disable interaction with inner card in edit mode */
  .grid-item.edit-mode .content-wrapper :global(*) {
     pointer-events: none;
  }
  
  .grid-item.edit-mode {
    cursor: grab;
  }
  
  .grid-item.edit-mode:active {
    cursor: grabbing;
  }

  /* Mobile: Override Grid styles handled by parent media query */
  @media (max-width: 768px) {
    /* Only stack if NOT editing. If editing, we enforce grid layout in parent */
    :global(.grid-layout:not(.edit-mode)) .grid-item {
      grid-column: auto !important;
      grid-row: auto !important;
      height: auto !important;
      width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      min-height: 120px;
      margin-bottom: 1rem;
    }
  }
</style>
