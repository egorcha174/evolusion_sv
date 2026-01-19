<script lang="ts">
  import { onMount } from 'svelte';
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { entityList } from '../ha/store';
  import { layoutConfig, saveLayout } from '../app/store';
  import { activeTabId } from '../app/tabsStore';
  import DeviceCard from './DeviceCard.svelte';
  import { extractDomain } from '$lib/utils';
  
  // We need to extend the entity with an 'id' for svelte-dnd-action
  type GridItem = any & { id: string };

  let items = $state<GridItem[]>([]);
  let isDragging = $state(false);
  const flipDurationMs = 200;
  
  // Sync entities with layout order and active tab
  $effect(() => {
    // Prevent re-shuffling while user is dragging
    if (isDragging) return;

    const allEntities = $entityList;
    const order = $layoutConfig.cardOrder;
    const currentTab = $activeTabId;
    
    // 1. Filter for dashboard-relevant entities
    let relevant = allEntities.filter(entity => {
      const domain = extractDomain(entity.entity_id);
      return ['light', 'switch', 'climate', 'media_player', 'cover', 'lock', 'script', 'input_boolean'].includes(domain);
    });

    // 2. Filter by Active Tab (Fake Room Logic for MVP)
    // If tab is 'home', show everything.
    // If tab is 'living_room', show entities with 'living' in ID or Name.
    if (currentTab !== 'home') {
      const searchTerms = currentTab.split('_'); // e.g. "living_room" -> ["living", "room"]
      
      relevant = relevant.filter(e => {
        const name = (e.attributes.friendly_name || '').toLowerCase();
        const id = e.entity_id.toLowerCase();
        // Check if any part of the tab ID is present in entity
        return searchTerms.some(term => name.includes(term) || id.includes(term));
      });
    }

    let sorted: GridItem[] = [];

    // 3. Apply Sort Order (Only for Home tab currently, as layoutConfig is global in MVP)
    if (currentTab === 'home' && order.length > 0) {
      // Map existing order to entities
      const orderedItems = order
        .map(id => relevant.find(e => e.entity_id === id))
        .filter(e => e !== undefined);
      
      // Append new entities that are not yet in the order
      const newItems = relevant.filter(e => !order.includes(e.entity_id));
      
      sorted = [...orderedItems, ...newItems] as GridItem[];
    } else {
      // For specific rooms, just default sort for now
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
    
    // Only save global layout if we are on Home tab (MVP limitation)
    if ($activeTabId === 'home') {
      const newOrder = items.map(i => i.entity_id);
      saveLayout(newOrder);
    }
  }
</script>

<div class="dashboard-grid">
  {#if items.length === 0}
    <div class="empty-state">
      {#if $activeTabId === 'home'}
        No dashboard devices found. Add lights, switches, or media players to Home Assistant.
      {:else}
        No devices found for "{$activeTabId.replace('_', ' ')}". <br>
        <small>Rename devices in Home Assistant to include the room name.</small>
      {/if}
    </div>
  {:else}
    <div 
      class="grid"
      use:dndzone={{
        items, 
        flipDurationMs,
        dropTargetStyle: { outline: '2px dashed var(--accent-primary)', outlineOffset: '-2px', borderRadius: '12px' },
        dragDisabled: $activeTabId !== 'home' /* Disable drag on filtered tabs for now */
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
    background: var(--bg-card);
    border-radius: 8px;
    color: var(--text-muted);
    border: 1px dashed var(--border-primary);
  }
  
  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>