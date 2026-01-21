
<script lang="ts">
  import { editorStore } from './editor/store';
  import { onCardPointerDown } from './editor/pointer';
  import CardEditOverlay from './editor/components/CardEditOverlay.svelte';
  import type { DashboardCardConfig } from '$lib/types';
  
  let { card } = $props<{ card: DashboardCardConfig }>();

  // Determine effective position (Draft if editing, or Source)
  let rect = $derived($editorStore.enabled && $editorStore.drafts.has(card.id)
    ? $editorStore.drafts.get(card.id)!
    : { col: card.position.x, row: card.position.y, w: card.position.w, h: card.position.h }
  );
  
  // We use a 2x multiplier internally to handle 0.5 units
  // If user says x=1, w=0.5 -> css x=3, span=1
  // Formula: CSS Start = (UserVal * 2) + 1
  // Formula: CSS Span  = (UserSize * 2)

  let style = $derived(`
    grid-column: ${Math.round(rect.col * 2) + 1} / span ${Math.round(rect.w * 2)};
    grid-row: ${Math.round(rect.row * 2) + 1} / span ${Math.round(rect.h * 2)};
  `);

  let isSelected = $derived($editorStore.selectedCardId === card.id);
  let isDragging = $derived(isSelected && $editorStore.pointerOp.kind === 'drag');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="grid-item"
  class:edit-mode={$editorStore.enabled}
  class:dragging={isDragging}
  style={style}
  data-card-id={card.id}
  onpointerdown={(e) => onCardPointerDown(e, card.id)}
>
  <div class="content-wrapper">
    <slot />
  </div>

  <CardEditOverlay cardId={card.id} />
</div>

<style>
  .grid-item {
    position: relative;
    width: 100%;
    height: 100%;
    /* Transition for layout changes, but not during drag */
    transition: transform 0.1s;
  }
  
  /* Disable transition during active drag to feel responsive */
  .grid-item.dragging {
    transition: none;
    z-index: 100;
  }

  .content-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
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
      min-height: 120px;
      margin-bottom: 1rem;
    }
  }
</style>