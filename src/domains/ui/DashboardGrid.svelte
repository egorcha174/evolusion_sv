<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "svelte-i18n";
  import { selectVisibleDashboardCards, toggleAddDevice } from "./store"; // Import toggle
  import { dashboardStore } from "../app/dashboardStore";
  import { activeTabId, isEditMode, tabs } from "../app/tabsStore";
  import { haStore } from "../ha/store";
  import DeviceCard from "./DeviceCard.svelte";
  import GridItem from "./GridItem.svelte";
  import GridSettings from "./GridSettings.svelte";
  import CardSettingsDialog from "./CardSettingsDialog.svelte";
  import CameraCardWidget from "./widgets/CameraCardWidget.svelte";
  import CameraFullscreenModal from "./widgets/CameraFullscreenModal.svelte";
  import CameraSourceDialog from "./settings/CameraSourceDialog.svelte";
  import EventTimerWidget from "./widgets/EventTimerWidget.svelte";
  import BatteryMonitorWidget from "./widgets/BatteryMonitorWidget.svelte";
  import type {
    HAEntity,
    DashboardCardConfig,
    CardTemplate,
    CameraSourceConfig,
  } from "$lib/types";

  // Editor imports
  import { editorStore } from "./editor/store";
  import {
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } from "./editor/pointer";
  import EditToolbar from "./editor/components/EditToolbar.svelte";
  import GridOverlay from "./editor/components/GridOverlay.svelte";

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
          // Check for template overrides in editor first, then fall back to store
          const overrideTpl = $editorStore.templateOverrides.get(id);
          const originalCard = gridConfig.cards.find((c) => c.id === id);

          // Note: overrideTpl can be undefined (no change) or explicit set.
          // We need to know if it's in the map.
          const finalTemplateId = $editorStore.templateOverrides.has(id)
            ? overrideTpl
            : originalCard?.templateId;

          list.push({
            ...(originalCard || {}),
            id,
            entityId,
            position: { x: rect.col, y: rect.row, w: rect.w, h: rect.h },
            templateId: finalTemplateId,
          } as DashboardCardConfig);
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

    // Adjusted margin per user request
    const maxMargin = 10;
    const gridMaxWidth = Math.max(0, contentWidth - 2 * maxMargin);
    const gridMaxHeight = Math.max(0, contentHeight - 2 * maxMargin);

    // Safety check: Don't calculate if space is invalid
    if (gridMaxWidth <= 0 || gridMaxHeight <= 0) return;

    const minGapX = 8;
    const minGapY = 8;

    const cellSizeX = (gridMaxWidth - (cols - 1) * minGapX) / cols;
    const cellSizeY = (gridMaxHeight - (rws - 1) * minGapY) / rws;

    let size = Math.floor(Math.min(cellSizeX, cellSizeY));
    if (size < 1) size = 1;

    // Only update if changes are significant to prevent loops
    if (cellSize === size && Math.abs(containerWidth - contentWidth) < 1) {
      // Only skip if gaps/margins are also stable, but usually size change is main trigger
    }

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

    marginLeft = Math.min(mL, maxMargin);
    marginRight = Math.min(mR, maxMargin);
    marginTop = Math.min(mT, maxMargin);
    marginBottom = Math.min(mB, maxMargin);
  }

  $effect(() => {
    const _c = columns;
    const _r = rows;
    const _w = containerWidth;
    const _h = containerHeight;
    // Debounce simply by Svelte's batching, but we ensure calc only runs if inputs valid
    if (_w > 0 && _h > 0) {
      calculateGeometry();
    }
  });

  onMount(() => {
    // dashboardStore.init(); // Removed: handled by layout
    dashboardStore.ensureTabConfig($activeTabId);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Round values to prevent sub-pixel infinite loops
        const newW = Math.round(entry.contentRect.width);
        const newH = Math.round(entry.contentRect.height);

        // Only update if changed significantly
        if (
          Math.abs(newW - containerWidth) >= 1 ||
          Math.abs(newH - containerHeight) >= 1
        ) {
          containerWidth = newW;
          containerHeight = newH;
        }
      }
    });

    if (container) observer.observe(container);
    return () => observer.disconnect();
  });

  // ---------- Editor session ----------

  let isEditorEnabled = $derived($editorStore.enabled);

  // Automatically manage Editor Session based on Edit Mode AND Active Tab
  $effect(() => {
    if ($isEditMode) {
      // If we are in edit mode, ensure the editor session matches the ACTIVE tab.
      // This handles both initial entry AND tab switching.
      if (!isEditorEnabled || $editorStore.tabId !== $activeTabId) {
        // If switching tabs in edit mode, commit previous work (Auto-Save)
        if (isEditorEnabled && $editorStore.tabId) {
          editorStore.commit();
        }
        editorStore.initSession($activeTabId);
      }
    } else {
      // Exit edit mode
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

  function getTemplate(id?: string): CardTemplate | undefined {
    return id ? $dashboardStore.templates[id] : undefined;
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

  // ---------- Context menu & Template UI ----------

  let cmOpen = $state(false);
  let cmX = $state(0);
  let cmY = $state(0);
  let cmCardId = $state<string | null>(null);

  // Card Settings Modal State
  let showCardSettings = $state(false);
  let activeSettingsCard = $state<DashboardCardConfig | null>(null);

  // Camera Fullscreen Modal State
  let fullscreenCameraId = $state<string | null>(null);

  // Camera Source Dialog State
  let showCameraSourceDialog = $state(false);
  let activeCameraCard = $state<DashboardCardConfig | null>(null);

  function openCameraFullscreen(cameraId: string) {
    if (!$isEditMode) {
      fullscreenCameraId = cameraId;
    }
  }

  function closeCameraFullscreen() {
    fullscreenCameraId = null;
  }

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
    if (cmCardId) editorStore.moveCardToTab(cmCardId, targetTabId);
    cmOpen = false;
  }

  function cmOpenSettings() {
    if (cmCardId) {
      const card = cards.find((c) => c.id === cmCardId);
      if (card) {
        activeSettingsCard = card;
        showCardSettings = true;
      }
    }
    cmOpen = false;
  }

  function cmConfigureCamera() {
    if (cmCardId) {
      const card = cards.find((c) => c.id === cmCardId);
      if (card && card.widgetType === "camera") {
        activeCameraCard = card;
        showCameraSourceDialog = true;
      }
    }
    cmOpen = false;
  }

  function handleCameraSourceSave(config: CameraSourceConfig) {
    console.log("[DashboardGrid] Saving camera source config:", config);
    console.log("[DashboardGrid] Active camera card:", activeCameraCard);
    console.log("[DashboardGrid] Active tab ID:", $activeTabId);

    if (activeCameraCard) {
      dashboardStore.updateCardCameraSource(
        $activeTabId,
        activeCameraCard.id,
        config,
      );
    }
    showCameraSourceDialog = false;
    activeCameraCard = null;
  }
</script>

<svelte:window onclick={handleGlobalClick} />

<div class="dashboard-container" bind:this={container}>
  {#if cards.length === 0}
    <div class="empty-state">
      <div class="empty-content">
        {#if $activeTabId === "welcome" || gridConfig.title === "Welcome"}
          <div class="welcome-msg">
            <h1>Welcome!</h1>
            <p>Your dashboard is ready.</p>
          </div>
        {:else}
          <p>{$t("dashboard.noDevices")}</p>
        {/if}

        <button class="btn primary" onclick={toggleAddDevice}>
          <iconify-icon icon="mdi:plus"></iconify-icon>
          {$t("dashboard.addWidget")}
        </button>
      </div>
    </div>
  {:else}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="grid-layout"
      class:edit-mode={$isEditMode}
      style={gridStyle}
      role="region"
      aria-label="Dashboard Grid"
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerCancel}
      style:touch-action={$isEditMode ? "none" : "auto"}
    >
      {#if $isEditMode}
        <GridOverlay
          cols={columns}
          {rows}
          cellW={cellSize}
          cellH={cellSize}
          {gapX}
          {gapY}
        />
      {/if}

      {#each cards as card (card.id)}
        {#if card.widgetType === "camera"}
          <GridItem {card} oncontextmenu={handleCardContext}>
            <CameraCardWidget
              cameraSourceConfig={card.cameraSourceConfig}
              onFullscreen={() => openCameraFullscreen(card.id)}
            />
          </GridItem>
        {:else if card.widgetType === "event-timer"}
          <GridItem {card} oncontextmenu={handleCardContext}>
            <EventTimerWidget settings={card.settings} />
          </GridItem>
        {:else if card.widgetType === "battery-monitor"}
          <GridItem {card} oncontextmenu={handleCardContext}>
            <BatteryMonitorWidget settings={card.settings} />
          </GridItem>
        {:else}
          {@const entity = getEntity(card.entityId ?? "")}
          {#if entity}
            <GridItem {card} oncontextmenu={handleCardContext}>
              <DeviceCard {entity} template={getTemplate(card.templateId)} />
            </GridItem>
          {/if}
        {/if}
      {/each}
    </div>
  {/if}

  {#if $isEditMode}
    <EditToolbar />
    {#if $editorStore.showGridSettings}
      <GridSettings tabId={$activeTabId} cols={columns} {rows} />
    {/if}

    <!-- Floating Action Button for Adding Devices -->
    <button
      class="fab-add"
      onclick={toggleAddDevice}
      title={$t("dashboard.addWidget")}
    >
      <iconify-icon icon="mdi:plus"></iconify-icon>
    </button>
  {/if}
</div>

<!-- Context Menu -->
{#if cmOpen}
  <div
    class="context-menu"
    style="top: {cmY}px; left: {cmX}px"
    onclick={(e) => e.stopPropagation()}
    role="menu"
  >
    <button class="menu-item" onclick={cmOpenSettings}>
      <iconify-icon icon="mdi:palette-swatch-outline"></iconify-icon>
      {$t("dashboard.menu.appearance")}
    </button>

    {#if cmCardId}
      {@const card = cards.find((c) => c.id === cmCardId)}
      {#if card && card.widgetType === "camera"}
        <button class="menu-item" onclick={cmConfigureCamera}>
          <iconify-icon icon="mdi:cctv"></iconify-icon>
          {$t("dashboard.menu.configureCameraSource", {
            default: "Configure Source",
          })}
        </button>
      {/if}
    {/if}

    <div class="divider"></div>

    <button class="menu-item" onclick={cmDuplicate}>
      <iconify-icon icon="mdi:content-copy"></iconify-icon>
      {$t("dashboard.menu.duplicateCard")}
    </button>

    <div class="submenu-label">{$t("dashboard.menu.moveCard")}</div>
    {#each $tabs as tab}
      {#if tab.id !== $activeTabId}
        <button class="menu-item" onclick={() => cmMoveTo(tab.id)}>
          <iconify-icon icon="mdi:arrow-right"></iconify-icon>
          {tab.title}
        </button>
      {/if}
    {/each}

    <div class="divider"></div>

    <button class="menu-item danger" onclick={cmDelete}>
      <iconify-icon icon="mdi:delete"></iconify-icon>
      {$t("dashboard.menu.deleteCard")}
    </button>
  </div>
{/if}

<!-- Dialogs -->
{#if showCardSettings && activeSettingsCard}
  <CardSettingsDialog
    tabId={$activeTabId}
    card={activeSettingsCard}
    onClose={() => {
      showCardSettings = false;
      activeSettingsCard = null;
    }}
  />
{/if}

{#if fullscreenCameraId}
  <CameraFullscreenModal
    cameraId={fullscreenCameraId}
    onClose={closeCameraFullscreen}
  />
{/if}

{#if showCameraSourceDialog && activeCameraCard}
  <CameraSourceDialog
    currentConfig={activeCameraCard.cameraSourceConfig}
    onSave={handleCameraSourceSave}
    onClose={() => {
      showCameraSourceDialog = false;
      activeCameraCard = null;
    }}
  />
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

  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .welcome-msg h1 {
    font-size: 3rem;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-weight: 200;
  }

  .welcome-msg p {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-secondary);
  }

  /* FAB */
  .fab-add {
    position: absolute;
    bottom: 32px;
    right: 32px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent-primary);
    color: #ffffff;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1500;
  }

  .fab-add:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  }

  .fab-add:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    .dashboard-container {
      height: auto;
      display: block;
      overflow-y: auto;
      padding-bottom: 0.5rem;
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

      padding: 8px;
    }

    .grid-layout.edit-mode {
      min-width: 100%;
      min-height: 50vh;
    }

    .fab-add {
      bottom: 24px;
      right: 24px;
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

  .btn {
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .btn.primary {
    background: var(--accent-primary);
    color: white;
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
