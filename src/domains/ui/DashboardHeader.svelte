<script lang="ts">
  import { tabs, activeTabId, isEditMode, setActiveTab, toggleEditMode } from '../app/tabsStore';
  import { haStore } from '../ha/store';
  import 'iconify-icon';

  let isMobileMenuOpen = $state(false);
  let isKebabMenuOpen = $state(false);

  function handleContentClick() {
    isKebabMenuOpen = false;
  }

  function handleTabClick(id: string) {
    setActiveTab(id);
    isMobileMenuOpen = false;
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
</script>

<svelte:window onclick={handleContentClick} />

<header class="dashboard-header">
  <div class="header-left">
    <button class="icon-btn mobile-only" onclick={(e) => { e.stopPropagation(); toggleMobileMenu(); }}>
      <iconify-icon icon="mdi:menu" width="24"></iconify-icon>
    </button>
    
    <div class="logo">
      <iconify-icon icon="mdi:home-assistant" width="24" class="logo-icon"></iconify-icon>
      <span class="logo-text">Evolusion</span>
    </div>

    <nav class="desktop-tabs">
      {#each $tabs as tab (tab.id)}
        <button 
          class="tab-btn" 
          class:active={$activeTabId === tab.id}
          onclick={() => handleTabClick(tab.id)}
        >
          {tab.title}
          {#if $isEditMode}
            <iconify-icon icon="mdi:pencil" width="14" class="edit-icon"></iconify-icon>
          {/if}
        </button>
      {/each}
      
      {#if $isEditMode}
        <button class="tab-btn add-btn" onclick={() => tabs.addTab()}>
          <iconify-icon icon="mdi:plus" width="20"></iconify-icon>
        </button>
      {/if}
    </nav>
  </div>

  <div class="header-right">
    <div class="status">
      <span class="indicator" class:connected={$haStore.isConnected}></span>
      <span class="status-text">
        {#if $haStore.isConnected}
          Connected
        {:else if $haStore.isLoading}
          Connecting...
        {:else}
          Disconnected
        {/if}
      </span>
    </div>

    <div class="menu-container">
      <button class="icon-btn" onclick={toggleKebabMenu}>
        <iconify-icon icon="mdi:dots-vertical" width="24"></iconify-icon>
      </button>

      {#if isKebabMenuOpen}
        <div class="dropdown-menu" onclick={(e) => e.stopPropagation()}>
          <a href="/settings" class="menu-item" onclick={() => isKebabMenuOpen = false}>
            <iconify-icon icon="mdi:cog-outline"></iconify-icon> Settings
          </a>
          <a href="/entities" class="menu-item" onclick={() => isKebabMenuOpen = false}>
            <iconify-icon icon="mdi:format-list-bulleted"></iconify-icon> All Entities
          </a>
          <div class="divider"></div>
          <button class="menu-item" onclick={handleRefresh}>
            <iconify-icon icon="mdi:refresh"></iconify-icon> Refresh Page
          </button>
          <div class="divider"></div>
          <button class="menu-item highlight" onclick={() => { toggleEditMode(); isKebabMenuOpen = false; }}>
            <iconify-icon icon={$isEditMode ? 'mdi:check' : 'mdi:view-dashboard-edit-outline'}></iconify-icon> 
            {$isEditMode ? 'Done' : 'Edit Dashboard'}
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  .dashboard-header {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 1.5rem;
    
    background: var(--bg-header);
    border-bottom: 1px solid var(--border-divider);
    color: var(--text-primary);
  }

  .header-left, .header-right {
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
  .logo-icon { color: var(--accent-primary); }

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
    color: var(--tab-inactive);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .tab-btn:hover {
    color: var(--tab-hover);
    background: var(--bg-chip);
  }

  .tab-btn.active {
    color: var(--tab-active);
    border-bottom-color: var(--tab-border-active);
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
    background: var(--bg-chip);
  }

  .menu-container { position: relative; }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    width: 220px;
    background: var(--bg-card); /* or bg-dropdown if defined in palette, using bg-card for now */
    border-radius: 12px;
    box-shadow: var(--shadow-dropdown);
    padding: 0.5rem;
    border: 1px solid var(--border-primary);
    display: flex;
    flex-direction: column;
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
    background: var(--bg-card-hover);
  }

  .menu-item.highlight {
    color: var(--accent-primary);
    font-weight: 500;
  }

  .divider {
    height: 1px;
    background: var(--border-divider);
    margin: 0.25rem 0;
  }
  
  .status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    background: var(--bg-chip);
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
  }
  
  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--state-off);
  }
  
  .indicator.connected {
    background: var(--accent-success);
  }

  .mobile-only { display: none; }
  
  @media (max-width: 768px) {
    .desktop-tabs { display: none; }
    .mobile-only { display: flex; }
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>