<script lang="ts">
  import { editorStore } from './editor/store';
  import { onCardPointerDown } from './editor/pointer';
  import { getPixelRect, type GridGeometry } from './editor/geometry';
  import CardEditOverlay from './editor/components/CardEditOverlay.svelte';
  import type { DashboardCardConfig } from '$lib/types';
  
  let { card, geometry, oncontextmenu } = $props<{ 
    card: DashboardCardConfig,
    geometry: GridGeometry,
    oncontextmenu?: (e: MouseEvent, cardId: string) => void
  }>();

  // If editor is enabled, check if card exists in drafts. If not, it's deleted.
  let isDeleted = $derived($editorStore.enabled && !$editorStore.drafts.has(card.id));

  let logicalRect = $derived($editorStore.enabled && $editorStore.drafts.has(card.id)
    ? $editorStore.drafts.get(card.id)!
    : { col: card.position.x, row: card.position.y, w: card.position.w, h: card.position.h }
  );

  let pixelRect = $derived(getPixelRect(logicalRect, geometry));
  
  let positionStyle = $derived(`
    transform: translate(${pixelRect.left}px, ${pixelRect.top}px);
    width: ${pixelRect.width}px;
    height: ${pixelRect.height}px;
  `);

  // Add inner gaps for sub-cell cards
  let paddingStyle = $derived(() => {
    const subGap = 2; // px, creates a 4px total gap between two items
    const epsilon = 0.001;
    const rect = logicalRect;

    const endsHalfCol = Math.abs((rect.col + rect.w) % 1 - 0.5) < epsilon;
    const endsHalfRow = Math.abs((rect.row + rect.h) % 1 - 0.5) < epsilon;
    const startsHalfCol = Math.abs(rect.col % 1 - 0.5) < epsilon;
    const startsHalfRow = Math.abs(rect.row % 1 - 0.5) < epsilon;

    return `
      padding-top: ${startsHalfRow ? subGap : 0}px;
      padding-right: ${endsHalfCol ? subGap : 0}px;
      padding-bottom: ${endsHalfRow ? subGap : 0}px;
      padding-left: ${startsHalfCol ? subGap : 0}px;
    `;
  });

  let isSelected = $derived($editorStore.selectedCardId === card.id);
  let isDragging = $derived(isSelected && $editorStore.isDragging);
  
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
    style={positionStyle + paddingStyle}
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
    position: absolute;
    transition: transform 0.2s, width 0.2s, height 0.2s;
    will-change: transform, width, height;
    touch-action: none;
    box-sizing: border-box; /* Crucial for padding to create inner gaps */
  }
  
  .grid-item.dragging {
    transition: none;
    z-index: 100;
  }

  .content-wrapper {
    width: 100%;
    height: 100%;
    container-type: size;
    border-radius: var(--card-border-radius, 12px);
    overflow: hidden;
  }
  
  .grid-item.edit-mode .content-wrapper :global(*) {
     pointer-events: none;
  }
  
  .grid-item.edit-mode {
    cursor: grab;
  }
  
  .grid-item.edit-mode.dragging {
    cursor: grabbing;
  }
</style>
