<script lang="ts">
  import { haStore, entityList } from '../../domains/ha/store';
  import EntityList from '../../domains/ui/EntityList.svelte';
  import { extractDomain } from '$lib/utils';
  
  let searchQuery = $state('');
  let selectedDomain = $state<string | null>(null);
  
  let filtered = $derived($entityList.filter((entity) => {
    const matchesSearch = 
      entity.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entity.attributes.friendly_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const domain = extractDomain(entity.entity_id);
    const matchesDomain = !selectedDomain || domain === selectedDomain;
    
    return matchesSearch && matchesDomain;
  }));
</script>

<div class="page-entities">
  <h1>All Entities</h1>
  
  {#if $haStore.isLoading}
    <p>Loading entities...</p>
  {:else if $haStore.error}
    <p class="error">Error: {$haStore.error}</p>
  {:else if $entityList.length === 0}
    <p>No entities connected. Check your Home Assistant settings.</p>
  {:else}
    <div class="filters">
      <input 
        type="text" 
        placeholder="Search entities..." 
        bind:value={searchQuery}
        class="search-input"
      />
      <select bind:value={selectedDomain} class="domain-select">
        <option value={null}>All domains</option>
        <option value="light">Lights</option>
        <option value="switch">Switches</option>
        <option value="sensor">Sensors</option>
        <option value="binary_sensor">Binary Sensors</option>
        <option value="climate">Climate</option>
        <option value="cover">Covers</option>
        <option value="media_player">Media Players</option>
      </select>
    </div>
    
    <div class="results-count">
      Showing {filtered.length} of {$entityList.length} entities
    </div>

    <EntityList entities={filtered} />
  {/if}
</div>

<style>
  .page-entities {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  
  .search-input {
    flex: 1;
    min-width: 200px;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .domain-select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    background-color: white;
  }
  
  .results-count {
    margin-bottom: 1rem;
    color: #666;
    font-size: 0.9rem;
  }
  
  .error {
    color: #d32f2f;
    padding: 1rem;
    background-color: #ffebee;
    border-radius: 4px;
  }
</style>
