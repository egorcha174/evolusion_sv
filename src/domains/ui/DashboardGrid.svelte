
<script lang="ts">
  import { onMount } from 'svelte';
  import { selectVisibleDashboardCards } from './store';
  import { dashboardStore } from '../app/dashboardStore';
  import { activeTabId, isEditMode } from '../app/tabsStore';
  import { haStore } from '../ha/store';
  import DeviceCard from './DeviceCard.svelte';
  import GridItem from './GridItem.svelte';
  import GridSettings from './GridSettings.svelte';
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
  // Optimize dependency tracking: isolate enabled state
  let isEditorEnabled = $derived($editorStore.enabled);

  $effect(() => {
    if ($isEditMode) {
      if (!isEditorEnabled) {
        editorStore.initSession($activeTabId);
      }
    } else {
      if (isEditorEnabled) {
        editorStore.reset();
      }
    }
  });

  // Keep metrics updated
  $effect(() => {
     if (isEditorEnabled && halfUnitSize > 0) {
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
    {#if $editorStore.showGridSettings}
      <GridSettings tabId={$activeTabId} cols={columns} rows={rows} />
    {/if}
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
    z-index: 0;
    
    /* Subtle Border around the whole grid area */
    outline: 1px dashed var(--border-primary);

    /* 
      Grid Pattern Construction:
      1. Major Lines (Integers): Darker/Thicker. Repeat every 2 units.
      2. Minor Lines (0.5 Units): Lighter/Thinner. Repeat every 1 unit.
    */
    background-image: 
      /* Vertical Major */
      linear-gradient(to right, var(--text-secondary) 1px, transparent 1px),
      /* Horizontal Major */
      linear-gradient(to bottom, var(--text-secondary) 1px, transparent 1px),
      /* Vertical Minor */
      linear-gradient(to right, var(--border-primary) 1px, transparent 1px),
      /* Horizontal Minor */
      linear-gradient(to bottom, var(--border-primary) 1px, transparent 1px);
      
    background-size: 
      /* Major Size (Every 2 units = integer steps) */
      calc(200% / var(--cols)) 100%, 
      100% calc(200% / var(--rows)),
      /* Minor Size (Every 1 unit = half steps) */
      calc(100% / var(--cols)) 100%, 
      100% calc(100% / var(--rows));
      
    /* Blend the lines gently */
    opacity: 0.25;
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
