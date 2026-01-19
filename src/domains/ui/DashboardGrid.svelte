<script lang="ts">
  import { onMount } from 'svelte';
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { entityList } from '../ha/store';
  import { layoutConfig, saveLayout } from '../app/store';
  import DeviceCard from './DeviceCard.svelte';
  import { extractDomain } from '$lib/utils';
  
  // We need to extend the entity with an 'id' for svelte-dnd-action
  type GridItem = any & { id: string };

  let items = $state<GridItem[]>([]);
  let isDragging = $state(false);
  const flipDurationMs = 200;
  
  // Sync entities with layout order
  $effect(() => {
    // Prevent re-shuffling while user is dragging
    if (isDragging) return;

    const allEntities = $entityList;
    const order = $layoutConfig.cardOrder;
    
    // Filter for dashboard-relevant entities
    const relevant = allEntities.filter(entity => {
      const domain = extractDomain(entity.entity_id);
      return ['light', 'switch', 'climate', 'media_player', 'cover', 'lock', 'script'].includes(domain);
    });

    let sorted: GridItem[] = [];

    if (order.length > 0) {
      // 1. Map existing order to entities
      const orderedItems = order
        .map(id => relevant.find(e => e.entity_id === id))
        .filter(e => e !== undefined);
      
      // 2. Append new entities that are not yet in the order
      const newItems = relevant.filter(e => !order.includes(e.entity_id));
      
      sorted = [...orderedItems, ...newItems] as GridItem[];
    } else {
      sorted = relevant as GridItem[];
    }

    // Add 'id' required by dndzone
    items = sorted.map(e => ({ ...e, id: e.entity_id }));
  });

  function handleDndConsider(e: CustomEvent<DndEvent<GridItem>>) {
    items = e.detail.items;
    isDragging = true;
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<GridItem>>) {
    items = e.detail.items;
    isDragging = false;
    
    // Save new order
    const newOrder = items.map(i => i.entity_id);
    saveLayout(newOrder);
  }
</script>

<div class="dashboard-grid">
  {#if items.length === 0}
    <div class="empty-state">
      No dashboard devices found. Add lights, switches, or media players to Home Assistant.
    </div>
  {:else}
    <div 
      class="grid"
      use:dndzone={{
        items, 
        flipDurationMs,
        dropTargetStyle: { outline: '2px dashed #2196f3', outlineOffset: '-2px', borderRadius: '12px' } 
      }}
      onconsider={handleDndConsider}
      onfinalize={handleDndFinalize}
    >
      {#each items as item (item.id)}
        <div class="grid-item">
          <DeviceCard entity={item} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dashboard-grid {
    margin-top: 1rem;
    padding-bottom: 2rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    min-height: 100px; /* Ensure drop zone area */
  }
  
  /* Required for DnD animation */
  .grid-item {
    display: flex; /* Fix for some layout issues during drag */
    flex-direction: column;
  }

  /* Make sure the card fills the grid item height if needed */
  .grid-item :global(.card) {
    height: 100%;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem;
    background: #fff;
    border-radius: 8px;
    color: #757575;
    border: 1px dashed #ccc;
  }
  
  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>