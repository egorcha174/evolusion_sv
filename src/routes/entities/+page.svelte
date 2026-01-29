<script lang="ts">
  import { t } from "svelte-i18n";
  import { haStore } from "../../domains/ha/store";
  import {
    uiDashboardState,
    selectFilteredEntities,
    toggleSettings,
  } from "../../domains/ui/store";
  import EntityList from "../../domains/ui/EntityList.svelte";
  import AddToTabDialog from "../../domains/ui/AddToTabDialog.svelte";
  import "iconify-icon";
  import { fade, fly } from "svelte/transition";

  // Local state for view mode
  let viewMode = $state<"list" | "grid">("grid");
  let selectedEntityToMove = $state<{ id: string; name: string } | null>(null);

  function openAddToTab(id: string, name: string) {
    selectedEntityToMove = { id, name };
  }

  // Binding variables to update store
  let searchQuery = $state($uiDashboardState.filters.search || "");
  let selectedDomain = $state($uiDashboardState.filters.domain || "");

  function updateFilters() {
    uiDashboardState.update((s) => ({
      ...s,
      filters: {
        ...s.filters,
        search: searchQuery,
        domain: selectedDomain === "" ? undefined : selectedDomain,
      },
    }));
  }

  function setViewMode(mode: "list" | "grid") {
    viewMode = mode;
  }
</script>

<div class="page-entities">
  <div class="glass-background"></div>

  <header class="page-header" in:fly={{ y: -20, duration: 600 }}>
    <div class="header-content">
      <h1>{$t("entities.title")}</h1>
      <div class="view-toggles">
        <button
          class="toggle-btn"
          class:active={viewMode === "list"}
          onclick={() => setViewMode("list")}
          aria-label="List View"
        >
          <iconify-icon icon="mdi:format-list-bulleted" width="20"
          ></iconify-icon>
        </button>
        <button
          class="toggle-btn"
          class:active={viewMode === "grid"}
          onclick={() => setViewMode("grid")}
          aria-label="Grid View"
        >
          <iconify-icon icon="mdi:view-grid-outline" width="20"></iconify-icon>
        </button>
      </div>
    </div>
  </header>

  {#if $haStore.isLoading}
    <div class="state-container" in:fade>
      <div class="spinner"></div>
      <p>{$t("entities.loading")}</p>
    </div>
  {:else if $haStore.error}
    <div class="state-container error" in:fade>
      <div class="icon-wrapper">
        <iconify-icon icon="mdi:alert-circle-outline" width="64"></iconify-icon>
      </div>
      <h3>{$t("common.error")}</h3>
      <div class="message-box">
        {$haStore.error}
      </div>
      <button class="btn primary" onclick={toggleSettings}
        >{$t("settings.title")}</button
      >
    </div>
  {:else if !$haStore.isConnected}
    <div class="state-container warning" in:fade>
      <div class="icon-wrapper">
        <iconify-icon icon="mdi:lan-disconnect" width="64"></iconify-icon>
      </div>
      <h3>{$t("sidebar.offline")}</h3>
      <p class="message">{$t("entities.noEntities")}</p>
      <button class="btn primary" onclick={toggleSettings}
        >{$t("settings.title")}</button
      >
    </div>
  {:else if $selectFilteredEntities.length === 0 && !$uiDashboardState.filters.search && !$uiDashboardState.filters.domain}
    <div class="state-container empty" in:fade>
      <div class="icon-wrapper">
        <iconify-icon icon="mdi:package-variant-closed" width="64"
        ></iconify-icon>
      </div>
      <p>{$t("entities.noEntities")}</p>
    </div>
  {:else}
    <div
      class="controls glass-panel"
      in:fly={{ y: 20, duration: 600, delay: 100 }}
    >
      <div class="search-wrapper">
        <iconify-icon icon="mdi:magnify" class="search-icon"></iconify-icon>
        <input
          type="text"
          placeholder={$t("entities.search")}
          bind:value={searchQuery}
          oninput={updateFilters}
          class="search-input"
        />
      </div>

      <div class="filter-actions">
        <div class="select-wrapper">
          <select
            bind:value={selectedDomain}
            onchange={updateFilters}
            class="domain-select"
          >
            <option value="">{$t("entities.allDomains")}</option>
            <option value="light">Lights</option>
            <option value="switch">Switches</option>
            <option value="sensor">Sensors</option>
            <option value="binary_sensor">Binary Sensors</option>
            <option value="climate">Climate</option>
            <option value="cover">Covers</option>
            <option value="media_player">Media Players</option>
            <option value="script">Scripts</option>
            <option value="automation">Automations</option>
          </select>
          <iconify-icon icon="mdi:chevron-down" class="select-arrow"
          ></iconify-icon>
        </div>

        <div class="results-count">
          {$t("entities.showing", {
            values: { count: $selectFilteredEntities.length },
          })}
        </div>
      </div>
    </div>

    <div class="list-wrapper" in:fly={{ y: 20, duration: 600, delay: 200 }}>
      <EntityList
        entities={$selectFilteredEntities}
        {viewMode}
        onAddToTab={openAddToTab}
      />
    </div>
  {/if}

  {#if selectedEntityToMove}
    <AddToTabDialog
      entityId={selectedEntityToMove.id}
      entityName={selectedEntityToMove.name}
      onclose={() => (selectedEntityToMove = null)}
    />
  {/if}
</div>

<style>
  .page-entities {
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  /* Ambient Background */
  .glass-background {
    position: absolute;
    top: -20%;
    left: -20%;
    width: 140%;
    height: 140%;
    background: radial-gradient(
        circle at 10% 20%,
        rgba(var(--accent-rgb, 0, 122, 255), 0.08) 0%,
        transparent 40%
      ),
      radial-gradient(
        circle at 90% 80%,
        rgba(var(--accent-rgb, 0, 122, 255), 0.05) 0%,
        transparent 40%
      );
    pointer-events: none;
    z-index: 0;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    z-index: 1;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(
      135deg,
      var(--text-primary) 0%,
      var(--text-secondary) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
  }

  /* View Toggles */
  .view-toggles {
    display: flex;
    background: var(--bg-secondary);
    padding: 4px;
    border-radius: 12px;
    gap: 4px;
  }

  .toggle-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-btn:hover {
    color: var(--text-primary);
    background: rgba(var(--text-rgb), 0.05);
  }

  .toggle-btn.active {
    background: var(--bg-card);
    color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  /* Glass Panel Controls */
  .controls {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
    border-radius: 16px;
    margin-bottom: 0.5rem;
  }

  .glass-panel {
    background: var(--glass-surface-active);
    backdrop-filter: var(--glass-blur-lg, blur(24px));
    -webkit-backdrop-filter: var(--glass-blur-lg, blur(24px));
    border: 1px solid var(--glass-border-light, rgba(255, 255, 255, 0.15));
    box-shadow: var(--glass-shadow);
  }

  .search-wrapper {
    position: relative;
    flex: 1;
    min-width: 250px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    border-radius: 10px;
    border: 1px solid var(--glass-border-light, var(--border-primary));
    background: var(--bg-input, var(--glass-surface-active));
    color: var(--text-primary, #ffffff);
    font-size: 0.95rem;
    transition: all 0.2s;
    backdrop-filter: var(--glass-blur-sm);
  }

  .search-input::placeholder {
    color: var(--text-primary, #ffffff);
    opacity: 0.5;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
    background: var(--bg-card);
  }

  .filter-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .select-wrapper {
    position: relative;
    min-width: 180px;
  }

  .domain-select {
    width: 100%;
    padding: 10px 32px 10px 14px;
    border-radius: 10px;
    border: 1px solid var(--glass-border-light, var(--border-primary));
    background: var(--bg-input, var(--glass-surface-active));
    color: var(--text-primary, #ffffff);
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: var(--glass-blur-sm);
  }

  .domain-select:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  .select-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }

  .results-count {
    color: var(--text-primary, #ffffff);
    opacity: 0.9;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .list-wrapper {
    flex: 1;
    min-height: 0;
    z-index: 1;
    position: relative;
  }

  /* State Containers */
  .state-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 1.5rem;
    color: var(--text-primary);
    min-height: 300px;
    padding: 2rem;
    background: var(--glass-surface);
    border-radius: 20px;
    margin: 20px;
    backdrop-filter: var(--glass-blur-sm);
  }

  .state-container h3 {
    margin: 0;
    font-weight: 600;
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  .message {
    max-width: 400px;
    margin: 0;
    font-size: 1rem;
  }

  /* Error State Styles */
  .state-container.error .icon-wrapper {
    color: var(--accent-error);
  }
  .state-container.error h3 {
    color: var(--text-primary);
  }

  .message-box {
    max-width: 450px;
    background: var(--bg-secondary);
    border-left: 4px solid var(--accent-error);
    border-radius: 4px;
    color: var(--text-primary);
    padding: 1rem 1.5rem;
    font-family: monospace;
    font-size: 0.9rem;
    word-break: break-word;
    text-align: left;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .state-container.warning .icon-wrapper {
    color: var(--text-muted);
  }
  .state-container.empty .icon-wrapper {
    color: var(--text-muted);
    opacity: 0.5;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-primary);
    border-top: 3px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .btn {
    padding: 0.8rem 1.8rem;
    border-radius: 12px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
  .btn.primary {
    background: var(--accent-primary);
    color: white;
  }
</style>
