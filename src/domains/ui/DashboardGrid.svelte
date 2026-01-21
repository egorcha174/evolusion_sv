
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
  import GridOverlay from './editor/components/GridOverlay.svelte';
  
  // Get raw entities filtered by tab logic (for auto-population)
  let visibleEntities = $derived($selectVisibleDashboardCards);
  
  // Get Grid Config
  let gridConfig = $derived($dashboardStore.tabs[$activeTabId]);
  
  // Derived state for the specific tab
  let columns = $derived(gridConfig?.gridColumns ?? 8);
  let rows = $derived(gridConfig?.gridRows ?? 6);
  let cards = $derived(gridConfig?.cards ?? []);

  // --- Strict Geometry Calculation ---
  let container: HTMLDivElement;
  let containerWidth = $state(0);
  let containerHeight = $state(0);
  
  // Calculated metrics
  let halfUnitSize = $state(0);
  
  // FIXED GAP CONFIGURATION
  // A consistent gap ensures the grid looks uniform regardless of screen size.
  // The 'leftover' space will be distributed as margins around the grid (centering).
  const GAP_PX = 16; 

  function calculateGeometry() {
     if (!containerWidth || !containerHeight) return;

     // Internal grid resolution is double the user columns (for 0.5 unit support)
     const internalCols = columns * 2;
     const internalRows = rows * 2;
     
     // Calculate total space taken by gaps
     const totalGapWidth = Math.max(0, internalCols - 1) * GAP_PX;
     const totalGapHeight = Math.max(0, internalRows - 1) * GAP_PX;

     // 1. Calculate Max Possible Cell Size based on Width
     const wAvailable = containerWidth - totalGapWidth;
     const maxCellW = Math.floor(wAvailable / internalCols);

     // 2. Calculate Max Possible Cell Size based on Height
     const hAvailable = containerHeight - totalGapHeight;
     const maxCellH = Math.floor(hAvailable / internalRows);

     // 3. Strict Square Constraint: Take the smaller dimension
     let size = Math.min(maxCellW, maxCellH);
     
     // Safety clamp
     if (size < 10) size = 10;

     // Update State
     halfUnitSize = size;
  }

  // Recalculate whenever inputs change
  $effect(() => {
    // Dependency tracking
    const _c = columns; 
    const _r = rows;
    const _w = containerWidth;
    const _h = containerHeight;
    
    // Defer to next tick/frame to ensure robust values
    calculateGeometry();
  });
  
  onMount(() => {
     dashboardStore.init();
     dashboardStore.ensureTabConfig($activeTabId);
     
     const observer = new ResizeObserver(entries => {
       for(const entry of entries) {
         // Use contentRect for precise inner dimensions
         containerWidth = entry.contentRect.width;
         containerHeight = entry.contentRect.height;
       }
     });
     
     if (container) observer.observe(container);
     return () => observer.disconnect();
  });

  // Editor Session Management
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

  // Keep metrics updated in editor store
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
    --grid-gap: ${GAP_PX}px;
  `);
  
  // Calculate Base Cell Size (1x1 unit) for visualization overlay
  // A 1x1 unit visually covers 2 half-units plus the gap between them.
  let cell1x1Size = $derived(halfUnitSize * 2 + GAP_PX);
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
      <!-- Grid Visual Overlay (Cells) - Behind Items -->
      {#if $isEditMode}
         <GridOverlay 
            cols={columns} 
            rows={rows} 
            cellPx={cell1x1Size} 
            gapPx={GAP_PX} 
         />
      {/if}
      
      <!-- Items -->
      {#each cards as card (card.id)}
         {@const entity = getEntity(card.entityId)}
         {#if entity}
           <GridItem {card}>
             <DeviceCard {entity} />
           </GridItem>
         {/if}
      {/each}
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
    /* Strict overflow hidden to enforce no scrollbars */
    overflow: hidden; 
    padding: 0;
  }

  .grid-layout {
    display: grid;
    /* Strict size definition for square cells */
    grid-template-columns: repeat(var(--cols), var(--half-unit));
    grid-template-rows: repeat(var(--rows), var(--half-unit));
    
    /* Fixed gap */
    gap: var(--grid-gap);
    
    /* Center the grid within the container */
    justify-content: center;
    align-content: center;
    
    width: 100%;
    height: 100%;
    
    position: relative;
    transition: opacity 0.2s ease;
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
  }
  

  /* Mobile Layout: Stack (only when not editing) */
  @media (max-width: 768px) {
    .dashboard-container {
      height: auto;
      display: block;
      overflow-y: auto; /* Allow scroll on mobile stack */
      padding-bottom: 2rem;
    }
    
    /* When NOT in edit mode, stack them */
    .grid-layout:not(.edit-mode) {
      display: flex;
      flex-direction: column;
      gap: 12px;
      grid-template-columns: none;
      grid-template-rows: none;
      width: 100%;
      height: auto;
    }
    
    /* When in edit mode on mobile, keep grid but allow scroll if needed */
    .grid-layout.edit-mode {
       /* Ensure container allows scrolling the grid canvas if it overflows on tiny screens */
       min-width: 100%;
       min-height: 50vh; 
       justify-content: flex-start; /* Left align on mobile edit to avoid off-screen overflow issues */
       align-content: flex-start;
    }
  }
</style>