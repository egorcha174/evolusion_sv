
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { haStore } from '../../domains/ha/store';
  import { uiDashboardState, selectFilteredEntities, toggleSettings } from '../../domains/ui/store';
  import EntityList from '../../domains/ui/EntityList.svelte';
  
  // Binding variables to update store
  let searchQuery = $state($uiDashboardState.filters.search || '');
  let selectedDomain = $state($uiDashboardState.filters.domain || '');
  
  function updateFilters() {
    uiDashboardState.update(s => ({
      ...s,
      filters: {
        ...s.filters,
        search: searchQuery,
        domain: selectedDomain === '' ? undefined : selectedDomain
      }
    }));
  }
</script>

<div class="page-entities">
  <div class="page-header">
    <h1>{$t('entities.title')}</h1>
  </div>
  
  {#if $haStore.isLoading}
    <div class="state-container">
       <div class="spinner"></div>
       <p>{$t('entities.loading')}</p>
    </div>
  {:else if $haStore.error}
    <div class="state-container error">
      <iconify-icon icon="mdi:alert-circle" width="64"></iconify-icon>
      <h3>{$t('common.error')}</h3>
      <p class="message">{$haStore.error}</p>
      <button class="btn primary" onclick={toggleSettings}>{$t('settings.title')}</button>
    </div>
  {:else if !$haStore.isConnected}
    <div class="state-container warning">
      <iconify-icon icon="mdi:lan-disconnect" width="64"></iconify-icon>
      <h3>{$t('sidebar.offline')}</h3>
      <p class="message">{$t('entities.noEntities')}</p>
      <button class="btn primary" onclick={toggleSettings}>{$t('settings.title')}</button>
    </div>
  {:else if $selectFilteredEntities.length === 0 && !$uiDashboardState.filters.search && !$uiDashboardState.filters.domain}
    <div class="state-container empty">
       <iconify-icon icon="mdi:package-variant-closed" width="64"></iconify-icon>
       <p>{$t('entities.noEntities')}</p>
    </div>
  {:else}
    <div class="controls">
      <div class="filters">
        <input 
          type="text" 
          placeholder={$t('entities.search')} 
          bind:value={searchQuery}
          oninput={updateFilters}
          class="search-input"
        />
        <select bind:value={selectedDomain} onchange={updateFilters} class="domain-select">
          <option value="">{$t('entities.allDomains')}</option>
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
      </div>
      
      <div class="results-count">
        {$t('entities.showing', { count: $selectFilteredEntities.length })}
      </div>
    </div>

    <EntityList entities={$selectFilteredEntities} />
  {/if}
</div>

<style>
  .page-entities {
    padding: 1rem;
    max-width: 1000px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    /* Prevent outer scroll */
    overflow: hidden; 
  }

  .page-header {
    margin-bottom: 1.5rem;
    flex-shrink: 0;
  }
  
  .controls {
    margin-bottom: 1rem;
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-primary);
    flex-shrink: 0;
  }
  
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }
  
  .search-input {
    flex: 1;
    min-width: 200px;
  }

  .domain-select {
    min-width: 150px;
  }
  
  .results-count {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-align: right;
  }
  
  /* State Containers */
  .state-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    color: var(--text-secondary);
    min-height: 300px;
    padding: 2rem;
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
  
  .state-container.error { color: var(--accent-error); }
  .state-container.error h3 { color: var(--accent-error); }
  
  .state-container.warning { color: var(--text-muted); }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-primary);
    border-top: 3px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .btn {
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    transition: opacity 0.2s;
    margin-top: 1rem;
  }
  .btn:hover { opacity: 0.9; }
  .btn.primary { background: var(--accent-primary); color: white; }
</style>