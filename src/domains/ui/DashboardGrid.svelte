
<script lang="ts">
  import { onMount } from 'svelte';
  import { selectVisibleDashboardCards } from './store';
  import { dashboardStore } from '../app/dashboardStore';
  import { activeTabId, isEditMode } from '../app/tabsStore';
  import { haStore } from '../ha/store';
  import DeviceCard from './DeviceCard.svelte';
  import GridItem from './GridItem.svelte';
  import type { HAEntity } from '$lib/types';
  
  // Editor imports
  import { editorStore } from './editor/store';
  import { onPointerMove, onPointerUp, onPointerCancel } from './editor/pointer';
  import EditToolbar from './editor/components/EditToolbar.svelte';
  
  // Get raw entities filtered by tab logic (for auto-population)
  let visibleEntities = $derived($selectVisibleDashboardCards);
  
  // Get Grid Config
  let gridConfig = $derived($dashboardStore.tabs[$activeTabId]);
  
  // Derived state for the specific tab
  let columns = $derived(gridConfig?.gridColumns ?? 8);
  let rows = $derived(gridConfig?.gridRows ?? 6);
  let cards = $derived(gridConfig?.cards ?? []);

  // --- Square Grid Calculation ---
  let container: HTMLDivElement;
  let containerWidth = $state(0);
  let containerHeight = $state(0);
  
  onMount(() => {
     dashboardStore.init();
     dashboardStore.ensureTabConfig($activeTabId);
     
     // Setup ResizeObserver for square cell calculation
     const observer = new ResizeObserver(entries => {
       for(const entry of entries) {
         containerWidth = entry.contentRect.width;
         containerHeight = entry.contentRect.height;
       }
     });
     
     if (container) observer.observe(container);
     return () => observer.disconnect();
  });

  // Calculate Cell Size (Internal Half-Unit size)
  let halfUnitSize = $derived.by(() => {
     if (!containerWidth || !containerHeight) return 0;
     
     const GAP = 8;
     const internalCols = columns * 2;
     const internalRows = rows * 2;
     
     // 1. Calculate size if limited by width
     const wAvailable = containerWidth - (internalCols - 1) * GAP;
     const sizeByWidth = wAvailable / internalCols;
     
     // 2. Calculate size if limited by height
     const hAvailable = containerHeight - (internalRows - 1) * GAP;
     const sizeByHeight = hAvailable / internalRows;
     
     // 3. Take the smaller one to ensure fit without overflow
     return Math.max(1, Math.min(sizeByWidth, sizeByHeight));
  });

  // Editor Session Management
  $effect(() => {
    if ($isEditMode) {
      if (!$editorStore.enabled) {
        editorStore.initSession($activeTabId);
      }
    } else {
      if ($editorStore.enabled) {
        editorStore.reset();
      }
    }
  });

  // Keep metrics updated
  $effect(() => {
     if ($editorStore.enabled && halfUnitSize > 0) {
        editorStore.setGridMetrics(halfUnitSize, columns, rows);
     }
  });

  // Auto-populate logic (Only when not editing)
  $effect(() => {
    if (!$isEditMode && $haStore.isConnected && visibleEntities.length > 0) {
       dashboardStore.syncEntitiesToGrid($activeTabId, visibleEntities);
    }
  });
  
  function getEntity(id: string): HAEntity | undefined {
    return $haStore.entities.get(id);
  }
  
  // CSS Vars for grid
  let gridStyle = $derived(`
    --cols: ${columns * 2};
    --rows: ${rows * 2};
    --half-unit: ${halfUnitSize}px;
    --gap: 8px;
  `);
</script>

<div class="dashboard-container" bind:this={container}>
  {#if cards.length === 0}
    <div class="empty-state">
       No devices configured for this view.
    </div>
  {:else}
    <!-- Interaction Layer for Global Pointer Events in Edit Mode -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="grid-layout" 
      class:edit-mode={$isEditMode} 
      style={gridStyle}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerCancel}
      style:touch-action={$isEditMode ? 'none' : 'auto'}
    >
      {#each cards as card (card.id)}
         {@const entity = getEntity(card.entityId)}
         {#if entity}
           <GridItem {card}>
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
    <EditToolbar />
  {/if}
</div>

<style>
  .dashboard-container {
    width: 100%;
    /* Fixed height minus header/padding to calculate aspect ratio properly */
    height: calc(100vh - 100px); 
    position: relative;
    padding-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden; 
  }

  .grid-layout {
    display: grid;
    /* Strict size definition for square cells */
    grid-template-columns: repeat(var(--cols), var(--half-unit));
    grid-template-rows: repeat(var(--rows), var(--half-unit));
    gap: var(--gap);
    
    position: relative;
    transition: all 0.2s ease;
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

  /* Mobile Layout: Stack (only when not editing) */
  @media (max-width: 768px) {
    .dashboard-container {
      height: auto;
      display: block;
      overflow-y: auto;
    }
    
    /* When NOT in edit mode, stack them */
    .grid-layout:not(.edit-mode) {
      display: flex;
      flex-direction: column;
      gap: 12px;
      grid-template-columns: none;
      grid-template-rows: none;
      width: 100%;
    }
    
    /* When in edit mode on mobile, keep grid but allow scroll if needed */
    .grid-layout.edit-mode {
       /* Ensure container allows scrolling the grid canvas if it overflows */
       min-width: 100%;
       min-height: 50vh; 
    }
    
    .grid-overlay {
      display: none;
    }
  }
</style>
