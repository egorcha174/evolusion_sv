
<script lang="ts">
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { selectVisibleDashboardCards, type DashboardGridItem } from './store';
  import { saveLayout } from '../app/store';
  import { activeTabId } from '../app/tabsStore';
  import DeviceCard from './DeviceCard.svelte';
  
  // We sync local state for DND performance, but source is store
  let items = $state<DashboardGridItem[]>([]);
  let isDragging = $state(false);
  const flipDurationMs = 200;
  
  $effect(() => {
    if (!isDragging) {
      items = $selectVisibleDashboardCards;
    }
  });

  function handleDndConsider(e: CustomEvent<DndEvent<DashboardGridItem>>) {
    items = e.detail.items;
    isDragging = true;
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<DashboardGridItem>>) {
    items = e.detail.items;
    isDragging = false;
    
    // Only save global layout if we are on Home tab (MVP limitation)
    if ($activeTabId === 'home') {
      const newOrder = items.map(i => i.id);
      saveLayout(newOrder);
    }
  }
</script>

<div class="dashboard-grid">
  {#if items.length === 0}
    <div class="empty-state">
      {#if $activeTabId === 'home'}
        No dashboard devices found.
      {:else}
        No devices found for "{$activeTabId.replace('_', ' ')}".
      {/if}
    </div>
  {:else}
    <div 
      class="grid"
      use:dndzone={{
        items, 
        flipDurationMs,
        dropTargetStyle: { outline: '2px dashed var(--accent-primary)', outlineOffset: '-2px', borderRadius: '12px' },
        dragDisabled: $activeTabId !== 'home'
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
    min-height: 100px;
  }
  
  .grid-item {
    display: flex;
    flex-direction: column;
  }

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
