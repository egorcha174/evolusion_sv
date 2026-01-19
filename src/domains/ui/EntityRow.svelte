<script lang="ts">
  import type { HAEntity } from '$lib/types';
  import { extractDomain, isToggleable as checkToggleable } from '$lib/utils';
  import { toggleEntity } from '../ha/store';
  
  let { entity }: { entity: HAEntity } = $props();
  
  let isToggling = $state(false);
  let error = $state<string | null>(null);
  
  async function handleToggle() {
    try {
      isToggling = true;
      error = null;
      await toggleEntity(entity.entity_id);
      // Success! Entity updates via WebSocket subscription automatically
    } catch (err: any) {
      console.error('Toggle error:', err);
      error = err.message || 'Toggle failed';
    } finally {
      isToggling = false;
    }
  }
  
  let domain = $derived(extractDomain(entity.entity_id));
  let displayName = $derived(entity.attributes.friendly_name || entity.entity_id);
  let isToggleable = $derived(checkToggleable(domain));
</script>

<div class="entity-row" data-domain={domain}>
  <div class="entity-info">
    <div class="entity-name">{displayName}</div>
    <div class="entity-id">{entity.entity_id}</div>
    {#if error}
      <div class="error-text">{error}</div>
    {/if}
  </div>
  
  <div class="entity-state">
    <div class="state-badge">{entity.state}</div>
  </div>
  
  {#if isToggleable}
    <button 
      onclick={handleToggle} 
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
  .entity-row[data-domain="binary_sensor"] { border-left: 4px solid #8bc34a; }
  .entity-row[data-domain="climate"] { border-left: 4px solid #ff9800; }
  .entity-row[data-domain="cover"] { border-left: 4px solid #9c27b0; }
  .entity-row[data-domain="media_player"] { border-left: 4px solid #3f51b5; }
  .entity-row[data-domain="lock"] { border-left: 4px solid #e91e63; }
  
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

  .error-text {
    font-size: 0.75rem;
    color: #d32f2f;
    margin-top: 0.25rem;
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
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
