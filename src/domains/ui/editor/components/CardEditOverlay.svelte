<script lang="ts">
  import { editorStore } from '../store';
  import ResizeHandles from './ResizeHandles.svelte';

  let { cardId } = $props<{ cardId: string }>();
  
  let isSelected = $derived($editorStore.selectedCardId === cardId);
  let isCollision = $derived(isSelected && $editorStore.collision);
</script>

{#if isSelected}
  <div class="edit-overlay" class:collision={isCollision}>
     <ResizeHandles {cardId} />
  </div>
{/if}

<style>
  .edit-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Stronger border */
    border: 3px solid var(--accent-primary);
    /* White outline + Shadow for contrast on all backgrounds */
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9), 0 4px 12px rgba(0,0,0,0.3);
    border-radius: var(--card-border-radius, 16px);
    pointer-events: none;
    z-index: 50;
    box-sizing: border-box;
  }

  .edit-overlay.collision {
    border-color: var(--accent-error);
    background: rgba(244, 67, 54, 0.2);
    box-shadow: 0 0 0 2px #fff, 0 0 10px var(--accent-error);
  }
</style>