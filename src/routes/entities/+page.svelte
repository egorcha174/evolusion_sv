
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { haStore } from '../../domains/ha/store';
  import { uiDashboardState, selectFilteredEntities } from '../../domains/ui/store';
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
    <div class="loading">{$t('entities.loading')}</div>
  {:else if $haStore.error}
    <p class="error">Error: {$haStore.error}</p>
  {:else if $selectFilteredEntities.length === 0 && !$uiDashboardState.filters.search && !$uiDashboardState.filters.domain}
    <p>{$t('entities.noEntities')}</p>
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
  
  .error {
    color: var(--accent-error);
    padding: 1rem;
    background-color: var(--bg-chip);
    border-radius: 4px;
  }
</style>