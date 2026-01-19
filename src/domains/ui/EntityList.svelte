
<script lang="ts">
  import type { HAEntity } from '$lib/types';
  import EntityRow from './EntityRow.svelte';
  
  let { entities = [] }: { entities: HAEntity[] } = $props();
  
  const PAGE_SIZE = 20;
  let visibleCount = $state(PAGE_SIZE);
  
  // Reset visibility when list changes substantially
  $effect(() => {
    // dependency on entities length to reset
    if (entities.length < visibleCount) {
        visibleCount = Math.max(PAGE_SIZE, entities.length);
    }
  });

  let visibleEntities = $derived(entities.slice(0, visibleCount));
  
  function intersectionObserver(node: HTMLElement) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        visibleCount = Math.min(visibleCount + PAGE_SIZE, entities.length);
      }
    }, {
      rootMargin: '200px', // Load before user hits bottom
      threshold: 0
    });
    
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }
</script>

<div class="entity-list">
  {#each visibleEntities as entity (entity.entity_id)}
    <EntityRow {entity} />
  {/each}
  
  {#if visibleCount < entities.length}
    <div class="sentinel" use:intersectionObserver>
      Loading more...
    </div>
  {/if}
</div>

<style>
  .entity-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sentinel {
    height: 20px;
    margin-top: 1rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>
