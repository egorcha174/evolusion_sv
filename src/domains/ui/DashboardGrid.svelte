
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';
  import { selectVisibleDashboardCards } from './store';
  import { dashboardStore } from '../app/dashboardStore';
  import { activeTabId, isEditMode, tabs } from '../app/tabsStore';
  import { haStore } from '../ha/store';
  import DeviceCard from './DeviceCard.svelte';
  import GridItem from './GridItem.svelte';
  import GridSettings from './GridSettings.svelte';
  import type { HAEntity, DashboardCardConfig } from '$lib/types';
  
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
  
  // --- CARD RENDER LOGIC ---
  let cards = $derived.by(() => {
     if ($isEditMode && $editorStore.enabled) {
        // Construct cards from editor drafts
        const list: DashboardCardConfig[] = [];
        $editorStore.drafts.forEach((rect, id) => {
           const entityId = $editorStore.cardEntities.get(id);
           if (entityId) {
             list.push({
                id,
                entityId,
                position: { x: rect.col, y: rect.row, w: rect.w, h: rect.h }
             });
           }
        });
        return list;
     } else {
        return gridConfig?.cards ?? [];
     }
  });

  // --- Strict Geometry Calculation ---
  let container: HTMLDivElement;
  let containerWidth = $state(0);
  let containerHeight = $state(0);
  
  // Calculated metrics
  let halfUnitSize = $state(0);
  let gapX = $state(10);
  let gapY = $state(10);
  
  // Geometry Constants
  const MAX_MARGIN = 16; 
  const MIN_GAP = 10;

  function calculateGeometry() {
     if (!containerWidth || !containerHeight) return;

     const internalCols = columns * 2;
     const internalRows = rows * 2;
     
     // 1. Available space for the grid body (Container - 2 * Margin)
     // We treat the 16px margin as a boundary we must fit inside.
     const gridMaxWidth = Math.max(0, containerWidth - (MAX_MARGIN * 2));
     const gridMaxHeight = Math.max(0, containerHeight - (MAX_MARGIN * 2));

     if (gridMaxWidth <= 0 || gridMaxHeight <= 0) return;

     // 2. Calculate Max Cell Size that fits Width constraint
     // Formula: Width = cols * S + (cols - 1) * MIN_GAP
     // S <= (Width - (cols - 1) * MIN_GAP) / cols
     const maxS_W = (gridMaxWidth - (internalCols - 1) * MIN_GAP) / internalCols;

     // 3. Calculate Max Cell Size that fits Height constraint
     const maxS_H = (gridMaxHeight - (internalRows - 1) * MIN_GAP) / internalRows;

     // 4. Strict Square Constraint: Cell must fit in BOTH dimensions
     // We take the minimum of the two max sizes to ensure no overflow (no scrollbars)
     let size = Math.floor(Math.min(maxS_W, maxS_H));
     if (size < 1) size = 1; // Sanity check

     halfUnitSize = size;
     
     // 5. Recalculate Gaps to fill the remaining space exactly
     // This pushes the grid to the edges of the 16px margin boundary
     
     // Width Gaps
     const occupiedW = internalCols * size;
     const remainingW = Math.max(0, gridMaxWidth - occupiedW);
     gapX = internalCols > 1 ? Math.max(MIN_GAP, remainingW / (internalCols - 1)) : MIN_GAP;

     // Height Gaps
     const occupiedH = internalRows * size;
     const remainingH = Math.max(0, gridMaxHeight - occupiedH);
     gapY = internalRows > 1 ? Math.max(MIN_GAP, remainingH / (internalRows - 1)) : MIN_GAP;
  }

  $effect(() => {
    // Dependencies to trigger recalc
    const _c = columns; 
    const _r = rows; 
    const _w = containerWidth;
    const _h = containerHeight;
    calculateGeometry();
  });
  
  onMount(() => {
     dashboardStore.init();
     dashboardStore.ensureTabConfig($activeTabId);
     
     const observer = new ResizeObserver(entries => {
       for(const entry of entries) {
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

  $effect(() => {
     if (isEditorEnabled && halfUnitSize > 0) {
        editorStore.setGridMetrics(halfUnitSize, columns, rows);
     }
  });

  $effect(() => {
    if (!$isEditMode && $haStore.isConnected && visibleEntities.length > 0) {
       dashboardStore.syncEntitiesToGrid($activeTabId, visibleEntities);
    }
  });
  
  function getEntity(id: string): HAEntity | undefined {
    return $haStore.entities.get(id);
  }
  
  let gridStyle = $derived(`
    --cols: ${columns * 2};
    --rows: ${rows * 2};
    --half-unit: ${halfUnitSize}px;
    --gap-x: ${gapX}px;
    --gap-y: ${gapY}px;
  `);
  
  // Context Menu Logic
  let cmOpen = $state(false);
  let cmX = $state(0);
  let cmY = $state(0);
  let cmCardId = $state<string | null>(null);

  function handleCardContext(e: MouseEvent, cardId: string) {
    if (!$isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Position menu
    const menuWidth = 200;
    if (e.clientX + menuWidth > window.innerWidth) {
       cmX = e.clientX - menuWidth;
    } else {
       cmX = e.clientX;
    }
    cmY = e.clientY;
    
    cmCardId = cardId;
    cmOpen = true;
  }

  function handleGlobalClick() {
    cmOpen = false;
  }
  
  function cmDelete() {
    if (cmCardId) editorStore.deleteCard(cmCardId);
    cmOpen = false;
  }

  function cmDuplicate() {
    if (cmCardId) editorStore.duplicateCard(cmCardId);
    cmOpen = false;
  }

  function cmMoveTo(targetTabId: string) {
    if (cmCardId) editorStore.moveCardToTab(cmCardId, targetTabId);
    cmOpen = false;
  }
</script>

<svelte:window onclick={handleGlobalClick} />

<div class="dashboard-container" bind:this={container}>
  {#if cards.length === 0}
    <div class="empty-state">
       {$t('dashboard.noDevices')}
    </div>
  {:else}
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
      {#if $isEditMode}
         <GridOverlay 
            cols={columns * 2} 
            rows={rows * 2} 
            cellW={halfUnitSize}
            cellH={halfUnitSize} 
            gapX={gapX}
            gapY={gapY}
         />
      {/if}
      
      {#each cards as card (card.id)}
         {@const entity = getEntity(card.entityId)}
         {#if entity}
           <GridItem {card} oncontextmenu={handleCardContext}>
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

<!-- Card Context Menu -->
{#if cmOpen}
  <div 
    class="context-menu" 
    style="top: {cmY}px; left: {cmX}px"
    onclick={(e) => e.stopPropagation()}
  >
    <button class="menu-item" onclick={cmDuplicate}>
      <iconify-icon icon="mdi:content-copy"></iconify-icon> {$t('dashboard.menu.duplicateCard')}
    </button>

    <div class="divider"></div>
    
    <div class="submenu-label">{$t('dashboard.menu.moveCard')}</div>
    {#each $tabs as tab}
       {#if tab.id !== $activeTabId}
          <button class="menu-item" onclick={() => cmMoveTo(tab.id)}>
             <iconify-icon icon="mdi:arrow-right"></iconify-icon> {tab.title}
          </button>
       {/if}
    {/each}

    <div class="divider"></div>

    <button class="menu-item danger" onclick={cmDelete}>
      <iconify-icon icon="mdi:delete"></iconify-icon> {$t('dashboard.menu.deleteCard')}
    </button>
  </div>
{/if}

<style>
  .dashboard-container {
    width: 100%;
    height: 100%; 
    position: relative;
    overflow: hidden; 
    padding: 0;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: repeat(var(--cols), var(--half-unit));
    grid-template-rows: repeat(var(--rows), var(--half-unit));
    column-gap: var(--gap-x);
    row-gap: var(--gap-y);
    
    /* Center the grid within the calculated margins */
    justify-content: center;
    align-content: center;
    
    width: 100%;
    height: 100%;
    position: relative;
    transition: opacity 0.2s ease;
    box-sizing: border-box;
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
  }
  
  /* Mobile Layout */
  @media (max-width: 768px) {
    .dashboard-container {
      height: auto;
      display: block;
      overflow-y: auto; 
      padding-bottom: 2rem;
    }
    
    .grid-layout:not(.edit-mode) {
      display: flex;
      flex-direction: column;
      gap: 12px;
      grid-template-columns: none;
      grid-template-rows: none;
      width: 100%;
      height: auto;
      padding: 12px;
      /* Reset alignments for flex mode */
      justify-content: flex-start;
      align-content: flex-start;
    }
    
    .grid-layout.edit-mode {
       min-width: 100%;
       min-height: 50vh; 
       justify-content: flex-start;
       align-content: flex-start;
    }
  }

  /* Context Menu Styles */
  .context-menu {
    position: fixed;
    background: var(--bg-panel, rgba(255, 255, 255, 0.95));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 12px;
    box-shadow: var(--shadow-dropdown, 0 4px 12px rgba(0,0,0,0.15));
    padding: 0.5rem;
    border: 1px solid var(--border-primary, rgba(0,0,0,0.05));
    display: flex;
    flex-direction: column;
    z-index: 2000;
    min-width: 180px;
    animation: fadeIn 0.1s ease-out;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-size: 0.95rem;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: 8px;
    text-decoration: none;
  }
  
  .menu-item:hover {
    background: var(--bg-card-hover, rgba(0,0,0,0.05));
  }
  
  .menu-item.danger { color: var(--accent-error); }
  .menu-item.danger:hover { background: rgba(244, 67, 54, 0.1); }
  
  .divider {
    height: 1px;
    background: var(--border-divider, rgba(128,128,128,0.2));
    margin: 0.25rem 0;
  }

  .submenu-label {
    padding: 0.5rem 1rem 0.25rem 1rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
  }
  
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>
