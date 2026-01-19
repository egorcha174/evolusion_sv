<script lang="ts">
  import { tabs, activeTabId, isEditMode, setActiveTab, toggleEditMode } from '../app/tabsStore';
  import { goto } from '$app/navigation';
  import 'iconify-icon';

  let isMobileMenuOpen = $state(false);
  let isKebabMenuOpen = $state(false);

  // Close menus when clicking outside (simple implementation)
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
    e.stopPropagation(); // Prevent immediate close
    isKebabMenuOpen = !isKebabMenuOpen;
    isMobileMenuOpen = false;
  }
</script>

<svelte:window onclick={handleContentClick} />

<header class="dashboard-header">
  <!-- Left Section -->
  <div class="header-left">
    <!-- Mobile Hamburger -->
    <button class="icon-btn mobile-only" onclick={(e) => { e.stopPropagation(); toggleMobileMenu(); }}>
      <iconify-icon icon="mdi:menu" width="24"></iconify-icon>
    </button>
    
    <div class="logo">
      <iconify-icon icon="mdi:home-assistant" width="24" class="logo-icon"></iconify-icon>
      <span class="logo-text">Evolusion</span>
    </div>

    <!-- Desktop Tabs -->
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

  <!-- Right Section -->
  <div class="header-right">
    <div class="search-wrapper desktop-only">
      <iconify-icon icon="mdi:magnify" class="search-icon"></iconify-icon>
      <input type="text" placeholder="Search devices..." class="search-input" />
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

<!-- Mobile Drawer Overlay -->
{#if isMobileMenuOpen}
  <div class="mobile-drawer-overlay" onclick={() => isMobileMenuOpen = false}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="mobile-drawer" onclick={(e) => e.stopPropagation()}>
      <div class="drawer-header">
        <h3>Menu</h3>
        <button class="icon-btn" onclick={() => isMobileMenuOpen = false}>
          <iconify-icon icon="mdi:close" width="24"></iconify-icon>
        </button>
      </div>
      
      <div class="drawer-content">
        <h4>Dashboards</h4>
        <div class="drawer-tabs">
          {#each $tabs as tab}
            <button 
              class="drawer-item" 
              class:active={$activeTabId === tab.id}
              onclick={() => handleTabClick(tab.id)}
            >
              <iconify-icon icon={tab.icon || 'mdi:view-dashboard-outline'}></iconify-icon>
              {tab.title}
            </button>
          {/each}
        </div>

        <div class="divider"></div>

        <a href="/entities" class="drawer-item" onclick={() => isMobileMenuOpen = false}>
          <iconify-icon icon="mdi:format-list-bulleted"></iconify-icon> Entities
        </a>
        <a href="/settings" class="drawer-item" onclick={() => isMobileMenuOpen = false}>
          <iconify-icon icon="mdi:cog-outline"></iconify-icon> Settings
        </a>
      </div>
    </div>
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
    padding: 0 1.5rem;
    
    /* Glassmorphism */
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
  }

  /* Logo */
  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.2rem;
    color: #333;
    margin-right: 1.5rem;
  }
  .logo-icon { color: #03a9f4; }

  /* Desktop Tabs */
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
    color: #666;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .tab-btn:hover {
    color: #333;
    background: rgba(0,0,0,0.02);
  }

  .tab-btn.active {
    color: #03a9f4;
    border-bottom-color: #03a9f4;
  }

  .edit-icon { opacity: 0.5; }

  .add-btn {
    padding: 0 0.5rem;
    color: #999;
  }

  /* Search */
  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    background: rgba(0,0,0,0.05);
    border: none;
    border-radius: 20px;
    padding: 0.5rem 1rem 0.5rem 2.2rem;
    font-size: 0.9rem;
    width: 240px;
    transition: width 0.2s;
  }

  .search-input:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 2px rgba(3, 169, 244, 0.2);
    width: 280px;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    color: #777;
    pointer-events: none;
  }

  /* Menu Buttons */
  .icon-btn {
    background: transparent;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .icon-btn:hover {
    background: rgba(0,0,0,0.05);
  }

  /* Dropdown Menu */
  .menu-container {
    position: relative;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    width: 220px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    padding: 0.5rem;
    border: 1px solid rgba(0,0,0,0.05);
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
    color: #333;
    cursor: pointer;
    border-radius: 8px;
    text-decoration: none;
  }

  .menu-item:hover {
    background: #f5f5f5;
  }

  .menu-item.highlight {
    color: #03a9f4;
    font-weight: 500;
  }

  .divider {
    height: 1px;
    background: #eee;
    margin: 0.25rem 0;
  }

  /* Mobile Drawer */
  .mobile-drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.4);
    z-index: 100;
    backdrop-filter: blur(2px);
  }

  .mobile-drawer {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: white;
    box-shadow: 4px 0 20px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.2s ease-out;
  }

  .drawer-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .drawer-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .drawer-item {
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-radius: 8px;
    color: #444;
    background: transparent;
    border: none;
    text-align: left;
    font-size: 1rem;
    text-decoration: none;
    cursor: pointer;
  }

  .drawer-item:hover, .drawer-item.active {
    background: #e3f2fd;
    color: #0277bd;
  }

  h4 {
    margin: 0.5rem 0 0.5rem 0.5rem;
    font-size: 0.85rem;
    color: #888;
    text-transform: uppercase;
  }

  /* Responsive Utilities */
  .mobile-only { display: none; }
  
  @media (max-width: 768px) {
    .desktop-tabs, .desktop-only { display: none; }
    .mobile-only { display: flex; }
    .dashboard-header { padding: 0 1rem; }
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
</style>
