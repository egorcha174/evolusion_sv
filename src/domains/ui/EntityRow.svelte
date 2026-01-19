<script lang="ts">
  import type { HAEntity } from '$lib/types';
  import { extractDomain, isToggleable as checkToggleable } from '$lib/utils';
  
  let { entity }: { entity: HAEntity } = $props();
  
  let isToggling = $state(false);
  
  async function toggleEntity() {
    isToggling = true;
    console.log('Toggle entity:', entity.entity_id, 'current state:', entity.state);
    // TODO: Implement actual service call in E1-05
    setTimeout(() => { isToggling = false; }, 500);
  }
  
  let domain = $derived(extractDomain(entity.entity_id));
  let displayName = $derived(entity.attributes.friendly_name || entity.entity_id);
  let isToggleable = $derived(checkToggleable(domain));
</script>

<div class="entity-row" data-domain={domain}>
  <div class="entity-info">
    <div class="entity-name">{displayName}</div>
    <div class="entity-id">{entity.entity_id}</div>
  </div>
  
  <div class="entity-state">
    <div class="state-badge">{entity.state}</div>
  </div>
  
  {#if isToggleable}
    <button 
      onclick={toggleEntity} 
      disabled={isToggling}
      class="action-button"
    >
      {isToggling ? '...' : entity.state === 'on' ? 'Off' : 'On'}
    </button>
  {/if}
</div>

<style>
  .entity-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #f9f9f9;
  }
  
  .entity-row[data-domain="light"] { border-left: 4px solid #ffc107; }
  .entity-row[data-domain="switch"] { border-left: 4px solid #2196f3; }
  .entity-row[data-domain="sensor"] { border-left: 4px solid #4caf50; }
  .entity-row[data-domain="climate"] { border-left: 4px solid #ff9800; }
  .entity-row[data-domain="cover"] { border-left: 4px solid #9c27b0; }
  
  .entity-info {
    flex: 1;
    overflow: hidden;
  }
  
  .entity-name {
    font-weight: 500;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .entity-id {
    font-size: 0.85rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .entity-state {
    margin: 0 1rem;
  }
  
  .state-badge {
    padding: 0.25rem 0.75rem;
    background: #e0e0e0;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .action-button {
    padding: 0.5rem 1rem;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    min-width: 60px;
  }
  
  .action-button:hover:not(:disabled) {
    background: #1976d2;
  }
  
  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
