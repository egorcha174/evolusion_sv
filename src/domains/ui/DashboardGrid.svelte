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

  // ---------- Состояние вкладки ----------

  let visibleEntities = $derived($selectVisibleDashboardCards);
  let gridConfig = $derived($dashboardStore.tabs[$activeTabId]);

  let columns = $derived(gridConfig?.gridColumns ?? 8);
  let rows = $derived(gridConfig?.gridRows ?? 6);

  let cards = $derived.by(() => {
    if ($isEditMode && $editorStore.enabled) {
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

  // ---------- Геометрия сетки ----------

  let container: HTMLDivElement;
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  // размер целой клетки
  let cellSize = $state(0);

  // промежутки
  let gapX = $state(10);
  let gapY = $state(10);

  // полушаг для редактора
  let halfStep = $state(0);

  // итоговые размеры и отступы
  let gridWidth = $state(0);
  let gridHeight = $state(0);
  let marginLeft = $state(0);
  let marginRight = $state(0);
  let marginTop = $state(0);
  let marginBottom = $state(0);

  function calculateGeometry() {
    if (!containerWidth || !containerHeight || !columns || !rows) return;

    const contentWidth = containerWidth;
    const contentHeight = containerHeight;
    const cols = columns;
    const rws = rows;

    const maxMargin = 16;
    const gridMaxWidth = Math.max(0, contentWidth - 2 * maxMargin);
    const gridMaxHeight = Math.max(0, contentHeight - 2 * maxMargin);
    if (gridMaxWidth <= 0 || gridMaxHeight <= 0) return;

    const minGapX = 10;
    const minGapY = 10;

    const cellSizeX = (gridMaxWidth - (cols - 1) * minGapX) / cols;
    const cellSizeY = (gridMaxHeight - (rws - 1) * minGapY) / rws;

    let size = Math.floor(Math.min(cellSizeX, cellSizeY));
    if (size < 1) size = 1;

    cellSize = size;
    halfStep = size / 2;

    const baseGridWidth = cols * size + (cols - 1) * minGapX;
    const baseGridHeight = rws * size + (rws - 1) * minGapY;

    const extraWidth = Math.max(gridMaxWidth - baseGridWidth, 0);
    const extraHeight = Math.max(gridMaxHeight - baseGridHeight, 0);

    let gX = cols > 1 ? minGapX + extraWidth / (cols - 1) : 0;
    let gY = rws > 1 ? minGapY + extraHeight / (rws - 1) : 0;

    if (cols > 1 && gX < minGapX) gX = minGapX;
    if (rws > 1 && gY < minGapY) gY = minGapY;

    gapX = gX;
    gapY = gY;

    const w = cols * size + (cols - 1) * gapX;
    const h = rws * size + (rws - 1) * gapY;

    gridWidth = w;
    gridHeight = h;

    let mL = Math.max((contentWidth - w) / 2, 0);
    let mT = Math.max((contentHeight - h) / 2, 0);
    let mR = Math.max(contentWidth - w - mL, 0);
    let mB = Math.max(contentHeight - h - mT, 0);

    marginLeft = Math.min(mL, 16);
    marginRight = Math.min(mR, 16);
    marginTop = Math.min(mT, 16);
    marginBottom = Math.min(mB, 16);
  }

  $effect(() => {
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
      for (const entry of entries) {
        containerWidth = entry.contentRect.width;
        containerHeight = entry.contentRect.height;
      }
    });

    if (container) observer.observe(container);
    return () => observer.disconnect();
  });

  // ---------- Editor session ----------

  let isEditorEnabled = $derived($editorStore.enabled);

  $effect(() => {
    if ($isEditMode) {
      if (!isEditorEnabled) editorStore.initSession($activeTabId);
    } else {
      if (isEditorEnabled) editorStore.reset();
    }
  });

  $effect(() => {
    if (isEditorEnabled && halfStep > 0) {
      editorStore.setGridMetrics(halfStep, columns, rows);
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

  // CSS‑переменные для сетки
  let gridStyle = $derived(`
    --cols: ${columns};
    --rows: ${rows};
    --cell-size: ${cellSize}px;
    --gap-x: ${gapX}px;
    --gap-y: ${gapY}px;
    --grid-width: ${gridWidth}px;
    --grid-height: ${gridHeight}px;
    --margin-left: ${marginLeft}px;
    --margin-right: ${marginRight}px;
    --margin-top: ${marginTop}px;
    --margin-bottom: ${marginBottom}px;
  `);

  // ---------- Context menu ----------

  let cmOpen = $state(false);
  let cmX = $state(0);
  let cmY = $state(0);
  let cmCardId = $state<string | null>(null);

  function handleCardContext(e: MouseEvent, cardId: string) {
    if (!$isEditMode) return;
    e.preventDefault();
    e.stopPropagation();

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
    if (cmCardId) editorStore.moveCardToTab(cmCardId);
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
          cols={columns}
          rows={rows}
          cellW={cellSize}
          cellH={cellSize}
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

{#if cmOpen}
  <div
    class="context-menu"
    style="top: {cmY}px; left: {cmX}px"
    onclick={(e) => e.stopPropagation()}
  >
    <button class="menu-item" onclick={cmDuplicate}>
      <iconify-icon icon="mdi:content-copy"></iconify-icon>
      {$t('dashboard.menu.duplicateCard')}
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
      <iconify-icon icon="mdi:delete"></iconify-icon>
      {$t('dashboard.menu.deleteCard')}
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
    grid-template-columns: repeat(var(--cols), var(--cell-size));
    grid-template-rows: repeat(var(--rows), var(--cell-size));
    column-gap: var(--gap-x);
    row-gap: var(--gap-y);

    width: var(--grid-width);
    height: var(--grid-height);
    margin-left: var(--margin-left);
    margin-right: var(--margin-right);
    margin-top: var(--margin-top);
    margin-bottom: var(--margin-bottom);

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

      width: 100% !important;
      height: auto !important;
      margin: 0 !important;

      padding: 12px;
    }

    .grid-layout.edit-mode {
      min-width: 100%;
      min-height: 50vh;
    }
  }

  .context-menu {
    position: fixed;
    background: var(--bg-panel, rgba(255, 255, 255, 0.95));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 12px;
    box-shadow: var(--shadow-dropdown, 0 4px 12px rgba(0, 0, 0, 0.15));
    padding: 0.5rem;
    border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.05));
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
    background: var(--bg-card-hover, rgba(0, 0, 0, 0.05));
  }

  .menu-item.danger {
    color: var(--accent-error);
  }

  .menu-item.danger:hover {
    background: rgba(244, 67, 54, 0.1);
  }

  .divider {
    height: 1px;
    background: var(--border-divider, rgba(128, 128, 128, 0.2));
    margin: 0.25rem 0;
  }

  .submenu-label {
    padding: 0.5rem 1rem 0.25rem 1rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>


