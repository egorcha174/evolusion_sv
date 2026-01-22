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
  import { calculateGridGeometry, type GridGeometry } from './editor/geometry';
  import { onPointerMove, onPointerUp, onPointerCancel } from './editor/pointer';
  import EditToolbar from './editor/components/EditToolbar.svelte';
  import GridOverlay from './editor/components/GridOverlay.svelte';

  // ---------- Tab State ----------

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

  // ---------- Grid Geometry ----------

  let container: HTMLDivElement;
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  let geometry: GridGeometry = $derived(
    calculateGridGeometry(containerWidth, containerHeight, columns, rows)
  );

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
    if (!$isEditMode && $haStore.isConnected && visibleEntities.length > 0) {
      dashboardStore.syncEntitiesToGrid($activeTabId, visibleEntities);
    }
  });

  function getEntity(id: string): HAEntity | undefined {
    return $haStore.entities.get(id);
  }

  // CSS variables for child components
  let gridStyle = $derived(`
    --cols: ${geometry.columns};
    --rows: ${geometry.rows};
    --cell-size: ${geometry.cellSize}px;
    --gap-x: ${geometry.gapX}px;
    --gap-y: ${geometry.gapY}px;
    --grid-width: ${geometry.gridWidth}px;
    --grid-height: ${geometry.gridHeight}px;
    --margin-left: ${geometry.marginLeft}px;
    --margin-right: ${geometry.marginRight}px;
    --margin-top: ${geometry.marginTop}px;
    --margin-bottom: ${geometry.marginBottom}px;
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
    cmX = e.clientX;
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
    // This logic seems incomplete in the original, needs implementation
    cmOpen = false;
  }
</script>

<svelte:window onclick={handleGlobalClick} />

<div class="dashboard-container" bind:this={container}>
  {#if cards.length === 0 && !$isEditMode}
    <div class="empty-state">{$t('dashboard.noDevices')}</div>
  {:else}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="grid-layout"
      class:edit-mode={$isEditMode}
      style={gridStyle}
      onpointermove={(e) => onPointerMove(e, geometry)}
      onpointerup={onPointerUp}
      onpointercancel={onPointerCancel}
      style:touch-action={$isEditMode ? 'none' : 'auto'}
    >
      {#if $isEditMode}
        <GridOverlay />
      {/if}

      {#each cards as card (card.id)}
        {@const entity = getEntity(card.entityId)}
        {#if entity}
          <GridItem {card} {geometry} oncontextmenu={handleCardContext}>
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
  <!-- Context Menu implementation -->
{/if}

<style>
  .dashboard-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .grid-layout {
    /* This is now a simple relative container for absolute children */
    position: relative;
    width: var(--grid-width);
    height: var(--grid-height);
    margin-left: var(--margin-left);
    margin-top: var(--margin-top);
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

  /* Mobile and other styles remain the same */
</style>
