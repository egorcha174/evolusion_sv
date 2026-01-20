
<script lang="ts">
  import { onMount } from 'svelte';
  import { selectVisibleDashboardCards } from './store';
  import { dashboardStore } from '../app/dashboardStore';
  import { activeTabId, isEditMode } from '../app/tabsStore';
  import { haStore } from '../ha/store';
  import DeviceCard from './DeviceCard.svelte';
  import GridItem from './GridItem.svelte';
  import GridSettings from './GridSettings.svelte';
  import type { TabGridConfig, HAEntity } from '$lib/types';
  
  // Get raw entities filtered by tab logic (for auto-population)
  let visibleEntities = $derived($selectVisibleDashboardCards);
  
  // Get Grid Config
  let gridConfig = $derived($dashboardStore.tabs[$activeTabId]);
  
  // Derived state for the specific tab
  let columns = $derived(gridConfig?.gridColumns ?? 8);
  let rows = $derived(gridConfig?.gridRows ?? 6);
  let cards = $derived(gridConfig?.cards ?? []);
  
  // Auto-populate logic
  $effect(() => {
    // If we have visible entities but no config, or new entities appeared
    // The store handles deduplication, so we can call this safely.
    if ($haStore.isConnected && visibleEntities.length > 0) {
       // Convert GridItems (from old store logic) back to raw HAEntity if needed, 
       // but selectVisibleDashboardCards returns mixed types.
       // We map them to ensure we pass HAEntity-like objects.
       dashboardStore.syncEntitiesToGrid($activeTabId, visibleEntities);
    }
  });

  // Init store on mount
  onMount(() => {
     dashboardStore.init();
     dashboardStore.ensureTabConfig($activeTabId);
  });
  
  // Update handler
  function handleCardUpdate(cardId: string, pos: any) {
    dashboardStore.updateCardPosition($activeTabId, cardId, pos);
  }
  
  // Helper to find entity data for a card config
  function getEntity(id: string): HAEntity | undefined {
    return $haStore.entities.get(id);
  }
  
  // CSS Vars for grid
  // We use * 2 multiplier for 0.5 granularity
  let gridStyle = $derived(`
    --cols: ${columns * 2};
    --rows: ${rows * 2};
  `);
</script>

<div class="dashboard-container" style={gridStyle}>
  {#if cards.length === 0}
    <div class="empty-state">
       No devices configured for this view.
    </div>
  {:else}
    <div class="grid-layout" class:edit-mode={$isEditMode}>
      {#each cards as card (card.id)}
         {@const entity = getEntity(card.entityId)}
         {#if entity}
           <GridItem 
             {card} 
             gridCols={columns} 
             gridRows={rows}
             onUpdate={handleCardUpdate}
           >
             <DeviceCard {entity} />
           </GridItem>
         {/if}
      {/each}
      
      <!-- Visual Grid Lines (only in edit mode) -->
      {#if $isEditMode}
         <div class="grid-overlay"></div>
      {/if}
    </div>
  {/if}

  {#if $isEditMode}
    <GridSettings 
       tabId={$activeTabId} 
       cols={columns} 
       rows={rows} 
    />
  {/if}
</div>

<style>
  .dashboard-container {
    width: 100%;
    /* Calculate height: 100vh - header(64) - padding(approx 32) */
    height: calc(100vh - 100px); 
    position: relative;
    padding-bottom: 2rem;
  }

  .grid-layout {
    display: grid;
    /* Multiply by 2 for fractional units */
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    gap: 8px; /* Visual gap */
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
  }
  
  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-image: 
      linear-gradient(to right, rgba(128,128,128,0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(128,128,128,0.1) 1px, transparent 1px);
    background-size: calc(100% / var(--cols)) calc(100% / var(--rows));
    z-index: 0;
    border: 1px dashed rgba(128,128,128,0.2);
  }

  /* Mobile Layout: Stack */
  @media (max-width: 768px) {
    .dashboard-container {
      height: auto;
    }
    
    .grid-layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .grid-overlay {
      display: none;
    }
  }
</style>
