
<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { t } from 'svelte-i18n';
  import { isAddDeviceOpen } from '../store';
  import { haStore } from '../../ha/store';
  import { dashboardStore } from '../../app/dashboardStore';
  import { activeTabId } from '../../app/tabsStore';
  import { extractDomain } from '$lib/utils';
  import DeviceAddItem from './DeviceAddItem.svelte';
  import 'iconify-icon';

  // --- STATE ---
  let searchQuery = $state('');
  let selectedDomain = $state<string | null>(null);
  let inputElement: HTMLInputElement;

  // --- DOMAINS ---
  const COMMON_DOMAINS = [
    { id: 'light', icon: 'mdi:lightbulb' },
    { id: 'switch', icon: 'mdi:toggle-switch' },
    { id: 'sensor', icon: 'mdi:eye' },
    { id: 'binary_sensor', icon: 'mdi:circle-slice-8' },
    { id: 'climate', icon: 'mdi:thermostat' },
    { id: 'cover', icon: 'mdi:window-shutter' },
    { id: 'media_player', icon: 'mdi:cast-connected' },
    { id: 'script', icon: 'mdi:script-text' }
  ];

  // --- DERIVED ---
  
  // Get list of IDs already on current tab
  let existingIds = $derived.by(() => {
    const tab = $dashboardStore.tabs[$activeTabId];
    return new Set(tab?.cards.map(c => c.entityId) || []);
  });

  // Filter entities
  let filteredDevices = $derived.by(() => {
    const all = Array.from($haStore.entities.values());
    
    // Sort: Online first, then name
    const sorted = all.sort((a, b) => {
       if (a.state === 'unavailable' && b.state !== 'unavailable') return 1;
       if (a.state !== 'unavailable' && b.state === 'unavailable') return -1;
       
       const nameA = a.attributes.friendly_name || a.entity_id;
       const nameB = b.attributes.friendly_name || b.entity_id;
       return nameA.localeCompare(nameB);
    });

    return sorted.filter(e => {
      // Domain filter
      const d = extractDomain(e.entity_id);
      if (selectedDomain && d !== selectedDomain) return false;
      
      // Allowlist logic (hide internal/system entities unless searching)
      if (!selectedDomain && !searchQuery) {
         if (['zone', 'sun', 'person', 'update'].includes(d)) return false;
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
    dashboardStore.addCard($activeTabId, device.entity_id);
    // Optional: Toast logic here
  }

  function toggleDomain(d: string) {
    if (selectedDomain === d) selectedDomain = null;
    else selectedDomain = d;
  }

  onMount(() => {
    if (inputElement) inputElement.focus();
  });
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
      <h2>{$t('addDevice.title')}</h2>
      <button class="close-btn" onclick={close}>
        <iconify-icon icon="mdi:close" width="24"></iconify-icon>
      </button>
    </header>

    <!-- Search Area -->
    <div class="search-section">
      <div class="search-box">
        <iconify-icon icon="mdi:magnify"></iconify-icon>
        <input 
          bind:this={inputElement}
          type="text" 
          bind:value={searchQuery} 
          placeholder={$t('addDevice.search')}
        />
        {#if searchQuery}
          <button class="clear-btn" onclick={() => searchQuery = ''}>
            <iconify-icon icon="mdi:close-circle" width="16"></iconify-icon>
          </button>
        {/if}
      </div>

      <div class="filters">
        <button 
          class="pill" 
          class:active={selectedDomain === null}
          onclick={() => selectedDomain = null}
        >
          {$t('addDevice.all')}
        </button>
        {#each COMMON_DOMAINS as d}
          <button 
            class="pill" 
            class:active={selectedDomain === d.id}
            onclick={() => toggleDomain(d.id)}
            title={d.id}
          >
            <iconify-icon icon={d.icon}></iconify-icon>
          </button>
        {/each}
      </div>
    </div>

    <!-- List -->
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
           <iconify-icon icon="mdi:package-variant-closed" width="48"></iconify-icon>
           <p>{$t('entities.noEntities')}</p>
        </div>
      {/if}
    </div>
  </aside>
{/if}

<style>
  .backdrop {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: transparent;
    z-index: 2500;
  }

  .add-drawer {
    position: fixed;
    top: 0; right: 0;
    width: 420px;
    max-width: 100vw;
    height: 100%;
    background: var(--bg-panel, rgba(255, 255, 255, 0.95));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-left: 1px solid var(--border-primary);
    box-shadow: -10px 0 40px rgba(0,0,0,0.15);
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
  .close-btn:hover { color: var(--text-primary); }

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
    background: var(--bg-input, rgba(0,0,0,0.05));
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
  .clear-btn:hover { color: var(--text-secondary); }

  /* Filters */
  .filters {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }
  .filters::-webkit-scrollbar { display: none; }

  .pill {
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid var(--border-primary);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
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
</style>
