<script lang="ts">
  import { t } from "svelte-i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import {
    tabs,
    activeTabId,
    isEditMode,
    setActiveTab,
    toggleEditMode,
  } from "../app/tabsStore";
  import { dashboardStore } from "../app/dashboardStore";
  import { haStore } from "../ha/store";
  import { editorStore } from "./editor/store";
  import { toggleSettings } from "./store"; // Import toggle function
  import "iconify-icon";

  import InputModal from "$domains/ui/InputModal.svelte";
  import ConfirmModal from "$domains/ui/ConfirmModal.svelte";

  let isMobileMenuOpen = $state(false);
  let isKebabMenuOpen = $state(false);

  // Modal State
  let showAddTabModal = $state(false);
  let showRenameTabModal = $state(false);
  let showClearTabModal = $state(false);
  let showDeleteTabModal = $state(false);

  // Tab Context Menu State
  let contextMenuOpen = $state(false);
  let contextMenuX = $state(0);
  let contextMenuY = $state(0);
  let contextTargetTabId = $state<string | null>(null);

  function handleContentClick() {
    isKebabMenuOpen = false;
    contextMenuOpen = false;
  }

  function handleTabClick(id: string) {
    setActiveTab(id);
    isMobileMenuOpen = false;

    // Check if we need to navigate home
    if ($page.url.pathname !== "/") {
      goto("/");
    }
  }

  function handleRefresh() {
    window.location.reload();
  }

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
    isKebabMenuOpen = false;
  }

  function toggleKebabMenu(e: MouseEvent) {
    e.stopPropagation();
    isKebabMenuOpen = !isKebabMenuOpen;
    isMobileMenuOpen = false;
  }

  function openSettings() {
    isKebabMenuOpen = false;
    toggleSettings();
  }

  // --- Tab Management ---

  function handleAddTab() {
    showAddTabModal = true;
  }

  function handleConfirmAddTab(title: string) {
    const id = dashboardStore.addTab(title);
    setActiveTab(id);
    showAddTabModal = false;
  }

  function handleTabContext(e: MouseEvent, id: string) {
    // RESTRICTION: Context menu only in Edit Mode
    if (!$isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    contextTargetTabId = id;

    // Simple bounds check for X axis
    const menuWidth = 200;
    if (e.clientX + menuWidth > window.innerWidth) {
      contextMenuX = e.clientX - menuWidth;
    } else {
      contextMenuX = e.clientX;
    }

    contextMenuY = e.clientY;
    contextMenuOpen = true;
  }

  function renameTab() {
    if (!contextTargetTabId) return;
    contextMenuOpen = false;
    showRenameTabModal = true;
  }

  function handleConfirmRenameTab(newTitle: string) {
    if (contextTargetTabId) {
      dashboardStore.renameTab(contextTargetTabId, newTitle);
    }
    showRenameTabModal = false;
  }

  function clearTab() {
    if (!contextTargetTabId) return;
    contextMenuOpen = false;
    showClearTabModal = true;
  }

  function handleConfirmClearTab() {
    if (!contextTargetTabId) return;

    // If we are editing THIS tab, use editor store to clear drafts
    if (contextTargetTabId === $activeTabId) {
      editorStore.clearAllCards();
    } else {
      dashboardStore.clearTab(contextTargetTabId);
    }
    showClearTabModal = false;
  }

  function deleteTab() {
    if (!contextTargetTabId) return;
    if ($tabs.length <= 1) {
      alert("Cannot delete the last tab.");
      return;
    }
    contextMenuOpen = false;
    showDeleteTabModal = true;
  }

  function handleConfirmDeleteTab() {
    if (contextTargetTabId) {
      dashboardStore.deleteTab(contextTargetTabId);
    }
    showDeleteTabModal = false;
  }
</script>

{#if showAddTabModal}
  <InputModal
    title={$t("dashboard.menu.addTab")}
    label="Tab Name"
    value="New Tab"
    confirmLabel="Add"
    onConfirm={handleConfirmAddTab}
    onCancel={() => (showAddTabModal = false)}
  />
{/if}

{#if showRenameTabModal}
  {@const currentTab = $tabs.find((t) => t.id === contextTargetTabId)}
  <InputModal
    title={$t("dashboard.menu.renameTab")}
    label="Tab Name"
    value={currentTab?.title || ""}
    confirmLabel="Rename"
    onConfirm={handleConfirmRenameTab}
    onCancel={() => (showRenameTabModal = false)}
  />
{/if}

{#if showClearTabModal}
  <ConfirmModal
    title={$t("dashboard.menu.clearTab")}
    message="Are you sure you want to clear all cards from this tab? This action cannot be undone."
    confirmLabel="Clear Cards"
    isDestructive={true}
    onConfirm={handleConfirmClearTab}
    onCancel={() => (showClearTabModal = false)}
  />
{/if}

{#if showDeleteTabModal}
  <ConfirmModal
    title={$t("dashboard.menu.deleteTab")}
    message="Are you sure you want to delete this tab? All cards within it will be lost."
    confirmLabel="Delete Tab"
    isDestructive={true}
    onConfirm={handleConfirmDeleteTab}
    onCancel={() => (showDeleteTabModal = false)}
  />
{/if}

<svelte:window onclick={handleContentClick} />

<header class="dashboard-header">
  <div class="header-left">
    <button
      class="icon-btn mobile-only"
      onclick={(e) => {
        e.stopPropagation();
        toggleMobileMenu();
      }}
    >
      <iconify-icon icon="mdi:menu" width="24"></iconify-icon>
    </button>

    <div class="logo">
      <iconify-icon icon="mdi:home-assistant" width="24" class="logo-icon"
      ></iconify-icon>
    </div>

    <nav class="desktop-tabs">
      {#each $tabs as tab (tab.id)}
        <button
          class="tab-btn"
          class:active={$activeTabId === tab.id}
          onclick={() => handleTabClick(tab.id)}
          oncontextmenu={(e) => handleTabContext(e, tab.id)}
        >
          {tab.title}
          {#if $isEditMode}
            <iconify-icon icon="mdi:pencil" width="14" class="edit-icon"
            ></iconify-icon>
          {/if}
        </button>
      {/each}

      {#if $isEditMode}
        <button
          class="tab-btn add-btn"
          onclick={handleAddTab}
          title={$t("dashboard.menu.addTab")}
        >
          <iconify-icon icon="mdi:plus" width="20"></iconify-icon>
        </button>
      {/if}
    </nav>
  </div>

  <div class="header-right">
    <div class="menu-container">
      <button class="icon-btn" onclick={toggleKebabMenu}>
        <iconify-icon icon="mdi:dots-vertical" width="24"></iconify-icon>
      </button>

      {#if isKebabMenuOpen}
        <div class="dropdown-menu" onclick={(e) => e.stopPropagation()}>
          <button class="menu-item" onclick={openSettings}>
            <iconify-icon icon="mdi:cog-outline"></iconify-icon>
            <span>{$t("settings.title")}</span>
          </button>
          <a
            href="/entities"
            class="menu-item"
            onclick={() => (isKebabMenuOpen = false)}
          >
            <iconify-icon icon="mdi:format-list-bulleted"></iconify-icon>
            <span>{$t("entities.title")}</span>
          </a>
          <a
            href="/cameras"
            class="menu-item"
            onclick={() => (isKebabMenuOpen = false)}
          >
            <iconify-icon icon="mdi:cctv"></iconify-icon>
            <span>{$t("cameras.title", { default: "Камеры" })}</span>
          </a>

          {#if $isEditMode}
            <button
              class="menu-item"
              onclick={() => {
                editorStore.openTemplateManager();
                isKebabMenuOpen = false;
              }}
            >
              <iconify-icon icon="mdi:palette-swatch-outline"></iconify-icon>
              <span>Templates</span>
            </button>
          {/if}

          <div class="divider"></div>
          <button class="menu-item" onclick={handleRefresh}>
            <iconify-icon icon="mdi:refresh"></iconify-icon>
            <span>{$t("dashboard.menu.refresh")}</span>
          </button>
          <div class="divider"></div>
          <button
            class="menu-item highlight"
            onclick={() => {
              toggleEditMode();
              isKebabMenuOpen = false;
            }}
          >
            <iconify-icon
              icon={$isEditMode
                ? "mdi:check"
                : "mdi:view-dashboard-edit-outline"}
            ></iconify-icon>
            <span
              >{$isEditMode ? $t("dashboard.done") : $t("dashboard.edit")}</span
            >
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>

<!-- Tab Context Menu -->
{#if contextMenuOpen}
  <div
    class="context-menu"
    style="top: {contextMenuY}px; left: {contextMenuX}px"
    onclick={(e) => e.stopPropagation()}
  >
    <button class="menu-item" onclick={renameTab}>
      <iconify-icon icon="mdi:rename-box"></iconify-icon>
      <span>{$t("dashboard.menu.renameTab")}</span>
    </button>
    <button
      class="menu-item"
      onclick={() => {
        handleAddTab();
        contextMenuOpen = false;
      }}
    >
      <iconify-icon icon="mdi:plus"></iconify-icon>
      <span>{$t("dashboard.menu.addTab")}</span>
    </button>

    <div class="divider"></div>

    <button class="menu-item" onclick={clearTab}>
      <iconify-icon icon="mdi:eraser"></iconify-icon>
      <span>{$t("dashboard.menu.clearTab")}</span>
    </button>
    <button class="menu-item danger" onclick={deleteTab}>
      <iconify-icon icon="mdi:delete"></iconify-icon>
      <span>{$t("dashboard.menu.deleteTab")}</span>
    </button>
  </div>
{/if}

<style>
  .dashboard-header {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 0.5rem;

    background: var(--bg-header);
    border-bottom: 1px solid var(--border-divider, rgba(0, 0, 0, 0.1));
    color: var(--text-primary);
  }

  .header-left,
  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.2rem;
    color: var(--text-primary);
    margin-right: 1.5rem;
  }
  :global(body.rtl) .logo {
    margin-right: 0;
    margin-left: 1.5rem;
  }

  .logo-icon {
    color: var(--accent-primary);
  }

  .desktop-tabs {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    height: 100%;
    overflow-x: auto;
  }

  .tab-btn {
    background: transparent;
    border: none;
    padding: 0 1rem;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .tab-btn:hover {
    color: var(--text-primary);
    background: var(--bg-chip, rgba(0, 0, 0, 0.05));
  }

  .tab-btn.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
  }

  .icon-btn {
    background: transparent;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: var(--bg-chip, rgba(0, 0, 0, 0.05));
  }

  .menu-container {
    position: relative;
  }

  /* --- Context Menu & Dropdown Styling (Redesigned) --- */

  .dropdown-menu,
  .context-menu {
    position: absolute;
    /* High quality surface styling */
    background: var(--bg-panel, #ffffff);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    border-radius: 16px; /* Larger radius */
    border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.08));

    /* Deep diffused shadow for floating effect */
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(0, 0, 0, 0.02);

    /* Inner spacing */
    padding: 8px;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    min-width: 240px;

    /* Animation origin */
    transform-origin: top right;
    animation: scaleIn 0.15s cubic-bezier(0.2, 0, 0.13, 1.5);
  }

  .dropdown-menu {
    top: calc(100% + 4px);
    right: 0;
  }

  .context-menu {
    position: fixed;
    transform-origin: top left;
  }

  :global(body.rtl) .dropdown-menu {
    right: auto;
    left: 0;
    transform-origin: top left;
  }

  /* --- Menu Items --- */

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px; /* Increased padding */
    margin: 1px 0;

    border: none;
    background: transparent;
    width: 100%;
    text-align: left;

    /* Typography */
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);

    /* Shape */
    border-radius: 8px; /* Internal radius */
    cursor: pointer;
    text-decoration: none;
    transition: background-color 0.1s ease;
  }

  .menu-item:hover {
    background: var(--bg-card-hover, rgba(0, 0, 0, 0.05));
  }

  .menu-item iconify-icon {
    font-size: 1.25rem;
    color: var(--text-secondary);
    min-width: 24px; /* Fixed alignment width */
  }

  .menu-item:hover iconify-icon {
    color: var(--text-primary);
  }

  .menu-item.highlight {
    color: var(--accent-primary);
  }
  .menu-item.highlight iconify-icon {
    color: var(--accent-primary);
  }

  .menu-item.danger {
    color: var(--accent-error);
  }
  .menu-item.danger iconify-icon {
    color: var(--accent-error);
  }
  .menu-item.danger:hover {
    background: rgba(244, 67, 54, 0.08);
  }

  .divider {
    height: 1px;
    background: var(--border-divider, rgba(128, 128, 128, 0.15));
    margin: 6px 0; /* More breathing room */
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-tabs {
      display: none;
    }
    .mobile-only {
      display: flex;
    }
  }
</style>
