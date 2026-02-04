<script lang="ts">
  import { useDroppable } from '@dnd-kit-svelte/core';
  import type { Snippet } from 'svelte';

  const { col, row, isEditMode, children } = $props<{
    col: number;
    row: number;
    isEditMode: boolean;
    children?: Snippet;
  }>();

  const { setNodeRef, isOver } = useDroppable({
    id: () => `cell-${col}-${row}`,
    disabled: () => !isEditMode,
  });
</script>

<div
  use:setNodeRef
  class:is-over={isOver.current && isEditMode}
  class="w-full h-full rounded-xl transition-colors duration-200"
>
  {#if isOver.current && isEditMode}
    <div class="w-full h-full bg-blue-500/30 ring-2 ring-blue-500 rounded-xl"></div>
  {:else if isEditMode}
    <div class="w-full h-full border border-dashed border-gray-300 dark:border-gray-700 rounded-xl opacity-50"></div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .is-over {
    /* Styles are applied via classes in the template for better compatibility */
  }
</style>
