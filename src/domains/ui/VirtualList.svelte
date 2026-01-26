<script lang="ts" generics="T">
  import { onMount, type Snippet } from 'svelte';

  // Generic props
  interface Props {
    items: T[];
    itemHeight: number;
    height?: string;
    keyField?: keyof T;
    children: Snippet<[{ item: T; index: number }]>;
  }

  let { items, itemHeight, height = '100%', keyField, children }: Props = $props();

  let container: HTMLDivElement;
  let scrollTop = $state(0);
  let availableHeight = $state(0);

  // Buffer items above/below
  const buffer = 5;

  let totalHeight = $derived(items.length * itemHeight);

  let visibleStartIndex = $derived(Math.max(0, Math.floor(scrollTop / itemHeight) - buffer));
  let visibleEndIndex = $derived(
    Math.min(items.length, Math.ceil((scrollTop + availableHeight) / itemHeight) + buffer)
  );

  let visibleItems = $derived(
    items.slice(visibleStartIndex, visibleEndIndex).map((item, index) => ({
      item,
      index: visibleStartIndex + index,
      offset: (visibleStartIndex + index) * itemHeight,
    }))
  );

  function handleScroll(e: UIEvent) {
    scrollTop = (e.target as HTMLElement).scrollTop;
  }

  onMount(() => {
    if (container) {
      availableHeight = container.clientHeight;
      // Resize observer to handle dynamic container resizing
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          availableHeight = entry.contentRect.height;
        }
      });
      ro.observe(container);
      return () => ro.disconnect();
    }
  });
</script>

<div
  class="virtual-container"
  style="height: {height}"
  onscroll={handleScroll}
  bind:this={container}
>
  <div class="virtual-spacer" style="height: {totalHeight}px">
    {#each visibleItems as { item, index, offset } (keyField ? (item as any)[keyField] : index)}
      <div class="virtual-item" style="transform: translateY({offset}px); height: {itemHeight}px">
        {@render children({ item, index })}
      </div>
    {/each}
  </div>
</div>

<style>
  .virtual-container {
    overflow-y: auto;
    position: relative;
    width: 100%;
    /* Ensure hardware acceleration for smoother scrolling */
    will-change: transform;
  }

  .virtual-spacer {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .virtual-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
</style>
