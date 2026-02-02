<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { t } from "svelte-i18n";
  import { isAddDeviceOpen } from "../store";
  import { haStore } from "../../ha/store";
  import { dashboardStore } from "../../app/dashboardStore";
  import { activeTabId, isEditMode } from "../../app/tabsStore";
  import { editorStore } from "../editor/store";
  import { extractDomain } from "$lib/utils";
  import { cameraStore } from "$lib/stores/camera.store.svelte";
  import DeviceAddItem from "./DeviceAddItem.svelte";
  import "iconify-icon";

  // --- STATE ---
  let searchQuery = $state("");
  let selectedDomain = $state<string | null>(null);
  let inputElement: HTMLInputElement;
  let activeTab = $state<"entities" | "cameras" | "widgets">("entities");

  // --- DOMAINS ---
  const COMMON_DOMAINS = [
    { id: "light", icon: "mdi:lightbulb" },
    { id: "switch", icon: "mdi:toggle-switch" },
    { id: "sensor", icon: "mdi:eye" },
    { id: "binary_sensor", icon: "mdi:circle-slice-8" },
    { id: "climate", icon: "mdi:thermostat" },
    { id: "cover", icon: "mdi:window-shutter" },
    { id: "media_player", icon: "mdi:cast-connected" },
    { id: "script", icon: "mdi:script-text" },
  ];

  // --- DERIVED ---

  // Get list of IDs already on current tab (Handle both Edit Mode and View Mode)
  let existingIds = $derived.by(() => {
    if ($isEditMode && $editorStore.enabled) {
      // In Edit Mode, use live entities from editor store
      return new Set($editorStore.cardEntities.values());
    } else {
      // In View Mode, use persistent store
      const tab = $dashboardStore.tabs[$activeTabId];
      return new Set(tab?.cards.map((c) => c.entityId) || []);
    }
  });

  // Filter entities
  let filteredDevices = $derived.by(() => {
    const all = Array.from($haStore.entities.values());

    // Sort: Online first, then name
    const sorted = all.sort((a, b) => {
      if (a.state === "unavailable" && b.state !== "unavailable") return 1;
      if (a.state !== "unavailable" && b.state === "unavailable") return -1;

      const nameA = a.attributes.friendly_name || a.entity_id;
      const nameB = b.attributes.friendly_name || b.entity_id;
      return nameA.localeCompare(nameB);
    });

    return sorted.filter((e) => {
      // Domain filter
      const d = extractDomain(e.entity_id);
      if (selectedDomain && d !== selectedDomain) return false;

      // Allowlist logic (hide internal/system entities unless searching)
      if (!selectedDomain && !searchQuery) {
        if (["zone", "sun", "person", "update"].includes(d)) return false;
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = e.attributes.friendly_name?.toLowerCase().includes(q);
        const matchId = e.entity_id.toLowerCase().includes(q);
        return matchName || matchId;
      }

      return true;
    });
  });

  // --- ACTIONS ---

  function close() {
    isAddDeviceOpen.set(false);
  }

  function handleAdd(device: any) {
    if ($isEditMode && $editorStore.enabled) {
      // If editing, add to drafts
      editorStore.addCard(device.entity_id);
    } else {
      // If viewing (fallback), persist immediately
      dashboardStore.addCard($activeTabId, device.entity_id);
    }
  }

  function handleAddCamera(cameraId: string) {
    // Always persist camera widget immediately
    dashboardStore.addCameraWidget($activeTabId, cameraId);

    // If in edit mode, reinit editor session to pick up the new card
    if ($isEditMode && $editorStore.enabled) {
      editorStore.initSession($activeTabId);
    }
  }

  // Check if camera is already added
  let existingCameraIds = $derived.by(() => {
    const tab = $dashboardStore.tabs[$activeTabId];
    return new Set(
      tab?.cards
        .filter((c) => c.widgetType === "camera")
        .map((c) => c.cameraId) ?? [],
    );
  });

  function toggleDomain(d: string) {
    if (selectedDomain === d) selectedDomain = null;
    else selectedDomain = d;
  }

  onMount(() => {
    if (inputElement) inputElement.focus();
    // Load cameras when drawer opens
    cameraStore.loadCameras();
  });

  function handleAddWidget(type: string) {
    dashboardStore.addWidget($activeTabId, type);

    if ($isEditMode && $editorStore.enabled) {
      editorStore.initSession($activeTabId);
    }
  }

  function switchTab(tab: "entities" | "cameras" | "widgets") {
    activeTab = tab;
    searchQuery = "";
    selectedDomain = null;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if $isAddDeviceOpen}
  <div class="backdrop" onclick={close}></div>

  <aside
    class="add-drawer"
    transition:fly={{ x: 400, duration: 300, opacity: 1 }}
  >
    <!-- Header -->
    <header class="drawer-header">
      <h2>{$t("addDevice.title")}</h2>
      <button class="close-btn" onclick={close}>
        <iconify-icon icon="mdi:close" width="24"></iconify-icon>
      </button>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        class:active={activeTab === "entities"}
        onclick={() => switchTab("entities")}
      >
        <iconify-icon icon="mdi:devices"></iconify-icon>
        {$t("addDevice.entities", { default: "Devices" })}
      </button>
      <button
        class="tab"
        class:active={activeTab === "cameras"}
        onclick={() => switchTab("cameras")}
      >
        <iconify-icon icon="mdi:video"></iconify-icon>
        {$t("addDevice.cameras", { default: "Cameras" })}
      </button>
      <button
        class="tab"
        class:active={activeTab === "widgets"}
        onclick={() => switchTab("widgets")}
      >
        <iconify-icon icon="mdi:widgets-outline"></iconify-icon>
        {$t("addDevice.widgets", { default: "Widgets" })}
      </button>
    </div>

    {#if activeTab === "entities"}
      <!-- Search Area (Entities) -->
      <div class="search-section">
        <div class="search-box">
          <iconify-icon icon="mdi:magnify"></iconify-icon>
          <input
            bind:this={inputElement}
            type="text"
            bind:value={searchQuery}
            placeholder={$t("addDevice.search")}
          />
          {#if searchQuery}
            <button class="clear-btn" onclick={() => (searchQuery = "")}>
              <iconify-icon icon="mdi:close-circle" width="16"></iconify-icon>
            </button>
          {/if}
        </div>

        <div class="filters">
          <button
            class="pill"
            class:active={selectedDomain === null}
            onclick={() => (selectedDomain = null)}
          >
            {$t("addDevice.all")}
          </button>
          {#each COMMON_DOMAINS as d}
            <button
              class="pill"
              class:active={selectedDomain === d.id}
              onclick={() => toggleDomain(d.id)}
              title={d.id}
            >
              <iconify-icon icon={d.icon}></iconify-icon>
              <span>{$t(`entities.domains.${d.id}`) || d.id}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Entity List -->
      <div class="device-list">
        {#each filteredDevices as device (device.entity_id)}
          <DeviceAddItem
            {device}
            isAdded={existingIds.has(device.entity_id)}
            onAdd={handleAdd}
          />
        {/each}

        {#if filteredDevices.length === 0}
          <div class="empty">
            <iconify-icon icon="mdi:package-variant-closed" width="48"
            ></iconify-icon>
            <p>{$t("entities.noEntities")}</p>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Camera List -->
      <div class="device-list">
        {#if cameraStore.isLoading}
          <div class="empty">
            <iconify-icon icon="mdi:loading" width="48" class="spinning"
            ></iconify-icon>
            <p>{$t("common.loading", { default: "Loading..." })}</p>
          </div>
        {:else if cameraStore.cameras.length === 0}
          <div class="empty">
            <iconify-icon icon="mdi:camera-off" width="48"></iconify-icon>
            <p>
              {$t("addDevice.noCameras", { default: "No cameras configured" })}
            </p>
            <p class="hint">
              {$t("addDevice.noCamerasHint", {
                default: "Configure cameras in go2rtc",
              })}
            </p>
          </div>
        {:else}
          {#each cameraStore.cameras as camera (camera.id)}
            <button
              class="camera-item"
              class:added={existingCameraIds.has(camera.id)}
              onclick={() => handleAddCamera(camera.id)}
              disabled={existingCameraIds.has(camera.id)}
            >
              <div class="camera-info">
                <iconify-icon icon="mdi:video" width="24"></iconify-icon>
                <div class="camera-details">
                  <span class="camera-name">{camera.name}</span>
                  <span class="camera-source">{camera.source}</span>
                </div>
              </div>
              {#if existingCameraIds.has(camera.id)}
                <span class="added-badge"
                  >{$t("addDevice.added", { default: "Added" })}</span
                >
              {:else}
                <iconify-icon icon="mdi:plus" width="20"></iconify-icon>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    {/if}
  </aside>
{/if}

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: transparent;
    z-index: 2500;
  }

  .add-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    max-width: 100vw;
    height: 100%;
    background: var(--bg-panel, rgba(255, 255, 255, 0.95));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-left: 1px solid var(--border-primary);
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15);
    z-index: 2501;
    display: flex;
    flex-direction: column;
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    flex-shrink: 0;
  }

  .drawer-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  .close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
  }
  .close-btn:hover {
    color: var(--text-primary);
  }

  /* Search */
  .search-section {
    padding: 0 1.5rem 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-bottom: 1px solid var(--border-divider);
    flex-shrink: 0;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: var(--bg-input, rgba(0, 0, 0, 0.05));
    border-radius: 12px;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    color: var(--text-secondary);
    transition: all 0.2s;
    border: 2px solid transparent;
  }

  .search-box:focus-within {
    background: var(--bg-card);
    border-color: var(--accent-primary);
    color: var(--text-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .search-box input {
    border: none;
    background: transparent;
    width: 100%;
    font-size: 1rem;
    color: var(--text-primary);
    outline: none;
  }

  .clear-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    padding: 0;
    display: flex;
  }
  .clear-btn:hover {
    color: var(--text-secondary);
  }

  /* Filters */
  .filters {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }
  .filters::-webkit-scrollbar {
    display: none;
  }

  .pill {
    padding: 8px 14px; /* Default size pill */
    border-radius: 20px;
    border: 1px solid var(--border-primary);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pill:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }

  .pill.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
  }

  .pill iconify-icon {
    font-size: 1.1rem;
  }

  /* List */
  .device-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    gap: 1rem;
    padding-top: 4rem;
  }

  .empty .hint {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  /* Tabs */
  .tabs {
    display: flex;
    padding: 0 1.5rem;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border-divider);
  }

  .tab {
    flex: 1;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .tab:hover {
    color: var(--text-primary);
    background: var(--bg-card-hover);
  }

  .tab.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
  }

  /* Camera Items */
  .camera-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    text-align: left;
  }

  .camera-item:hover:not(:disabled) {
    background: var(--bg-card-hover);
    border-color: var(--accent-primary);
    transform: translateX(4px);
  }

  .camera-item:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .camera-item.added {
    background: var(--bg-success, rgba(34, 197, 94, 0.1));
    border-color: var(--color-success, #22c55e);
  }

  .camera-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .camera-info iconify-icon {
    color: var(--accent-primary);
  }

  .camera-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .camera-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  .camera-source {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: capitalize;
  }

  .added-badge {
    font-size: 0.8rem;
    color: var(--color-success, #22c55e);
    font-weight: 600;
  }

  .camera-item > iconify-icon {
    color: var(--text-secondary);
    transition: color 0.2s;
  }

  .camera-item:hover:not(:disabled) > iconify-icon {
    color: var(--accent-primary);
  }

  /* Spinning animation */
  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
