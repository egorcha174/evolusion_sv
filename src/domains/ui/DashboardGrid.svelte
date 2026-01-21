
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

  // --- Strict Geometry Calculation ---
  let container: HTMLDivElement;
  let containerWidth = $state(0);
  let containerHeight = $state(0);
  
  // Calculated metrics
  let halfUnitSize = $state(0);
  let gapX = $state(0);
  let gapY = $state(0);

  const MIN_GAP = 4; // Absolute minimum gap in pixels

  function calculateGeometry() {
     if (!containerWidth || !containerHeight) return;

     // Internal grid resolution is double the user columns (for 0.5 unit support)
     const internalCols = columns * 2;
     const internalRows = rows * 2;
     
     // 1. Calculate Max Possible Cell Size based on Width
     // Width = (Cols * Size) + ((Cols - 1) * MinGap)
     // Size = (Width - (Cols - 1) * MinGap) / Cols
     const wAvailable = containerWidth - ((internalCols - 1) * MIN_GAP);
     const maxCellW = Math.floor(wAvailable / internalCols);

     // 2. Calculate Max Possible Cell Size based on Height
     const hAvailable = containerHeight - ((internalRows - 1) * MIN_GAP);
     const maxCellH = Math.floor(hAvailable / internalRows);

     // 3. Strict Square Constraint: Take the smaller dimension
     // This ensures we never overflow either dimension
     let size = Math.min(maxCellW, maxCellH);
     if (size < 1) size = 1;

     // 4. Calculate actual gaps to fill the remaining space
     // RemainingSpace = ContainerSize - (Cols * FinalCellSize)
     // Gap = RemainingSpace / (Cols - 1)
     
     const usedWidth = size * internalCols;
     const remainingWidth = containerWidth - usedWidth;
     const newGapX = internalCols > 1 ? remainingWidth / (internalCols - 1) : 0;

     const usedHeight = size * internalRows;
     const remainingHeight = containerHeight - usedHeight;
     const newGapY = internalRows > 1 ? remainingHeight / (internalRows - 1) : 0;

     // Update State
     halfUnitSize = size;
     gapX = newGapX;
     gapY = newGapY;
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
    --gap-x: ${gapX}px;
    --gap-y: ${gapY}px;
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
    /* Strict overflow hidden to enforce no scrollbars */
    overflow: hidden; 
    padding: 0;
  }

  .grid-layout {
    display: grid;
    /* Strict size definition for square cells */
    grid-template-columns: repeat(var(--cols), var(--half-unit));
    grid-template-rows: repeat(var(--rows), var(--half-unit));
    
    /* Dynamic gaps calculated in JS */
    column-gap: var(--gap-x);
    row-gap: var(--gap-y);
    
    /* Center the grid within the container to handle any sub-pixel rendering diffs */
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
  
  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    
    /* Dim the background slightly to make lines pop on any wallpaper */
    background-color: var(--bg-page-dimmed, rgba(0, 0, 0, 0.05));

    /* 
      Grid Pattern Construction:
      Using Accent Primary for Major lines (2 units)
      Using Text Secondary for Minor lines (1 unit)
    */
    background-image: 
      /* Major Vertical (2px wide) */
      linear-gradient(to right, var(--accent-primary) 2px, transparent 2px),
      /* Major Horizontal (2px wide) */
      linear-gradient(to bottom, var(--accent-primary) 2px, transparent 2px),
      /* Minor Vertical (1px wide) */
      linear-gradient(to right, var(--text-secondary) 1px, transparent 1px),
      /* Minor Horizontal (1px wide) */
      linear-gradient(to bottom, var(--text-secondary) 1px, transparent 1px);
      
    /* 
       Exact calculation to match grid-template + gap.
       Major = 2 cells + 2 gaps
       Minor = 1 cell + 1 gap
       
       Using var(--gap-x) and var(--gap-y) specifically
    */
    background-size: 
      /* Major */
      calc(2 * var(--half-unit) + 2 * var(--gap-x)) calc(2 * var(--half-unit) + 2 * var(--gap-y)),
      calc(2 * var(--half-unit) + 2 * var(--gap-x)) calc(2 * var(--half-unit) + 2 * var(--gap-y)),
      /* Minor */
      calc(var(--half-unit) + var(--gap-x)) calc(var(--half-unit) + var(--gap-y)),
      calc(var(--half-unit) + var(--gap-x)) calc(var(--half-unit) + var(--gap-y));
      
    opacity: 0.5;
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
    }
    
    .grid-overlay {
      display: none;
    }
  }
</style>
