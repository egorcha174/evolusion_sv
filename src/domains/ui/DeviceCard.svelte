<script lang="ts">
  import type { HAEntity } from '$lib/types';
  import { toggleEntity } from '../ha/store';
  import { extractDomain } from '$lib/utils';
  import { getIcon } from '$lib/icons';
  
  let { entity }: { entity: HAEntity } = $props();
  
  let isToggling = $state(false);
  let error = $state<string | null>(null);
  
  async function handleToggle() {
    try {
      isToggling = true;
      error = null;
      await toggleEntity(entity.entity_id);
    } catch (err: any) {
      error = err.message || 'Failed to toggle';
    } finally {
      isToggling = false;
    }
  }
  
  let domain = $derived(extractDomain(entity.entity_id));
  let displayName = $derived(entity.attributes.friendly_name || entity.entity_id);
  let isOn = $derived(entity.state === 'on' || entity.state === 'open' || entity.state === 'unlocked');
  let isToggleable = $derived(['light', 'switch', 'cover', 'lock', 'input_boolean', 'script'].includes(domain));
  
  let icon = $derived(getIcon(domain));
</script>

<div class="card" data-domain={domain} data-state={isOn ? 'on' : 'off'}>
  <div class="card-header">
    <div class="icon">
      <iconify-icon icon={icon} width="24" height="24"></iconify-icon>
    </div>
    <div class="name" title={displayName}>{displayName}</div>
  </div>
  
  <div class="card-body">
    <div class="state-display">
      <span class="state-text">{entity.state}</span>
    </div>
    
    {#if entity.attributes.brightness !== undefined}
      <div class="attribute">
        {Math.round((entity.attributes.brightness / 255) * 100)}%
      </div>
    {/if}
    
    {#if entity.attributes.temperature !== undefined}
      <div class="attribute">
        {entity.attributes.temperature}°
      </div>
    {/if}
  </div>
  
  <div class="card-footer">
    {#if isToggleable}
      <button 
        onclick={handleToggle}
        disabled={isToggling}
        class="toggle-btn"
        class:on={isOn}
      >
        {isToggling ? '...' : isOn ? 'Off' : 'On'}
      </button>
    {/if}
  </div>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>

<style>
  .card {
    background: var(--bg-card, white);
    border-radius: 16px;
    box-shadow: var(--shadow-card, 0 2px 8px rgba(0, 0, 0, 0.04));
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid var(--border, rgba(0,0,0,0.05));
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08); /* Could var this too */
  }
  
  /* Domain specific styling */
  .card[data-domain="light"][data-state="on"] {
    border-color: var(--warning, #ffd700);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.15);
  }
  
  .card[data-domain="switch"][data-state="on"] {
    border-color: var(--success, #4caf50);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  }

  .card-header {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }
  
  .icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary, #555);
    background: var(--bg-page, #f5f5f5); /* Use page bg for neutral icon bg */
    border-radius: 50%;
    transition: all 0.3s;
  }

  .card[data-state="on"] .icon {
    background: rgba(33, 150, 243, 0.1);
    color: var(--primary, #2196f3);
  }

  .card[data-domain="light"][data-state="on"] .icon {
    background: rgba(255, 193, 7, 0.1);
    color: var(--warning, #ffc107);
  }

  .card[data-domain="switch"][data-state="on"] .icon {
    background: rgba(76, 175, 80, 0.1);
    color: var(--success, #4caf50);
  }
  
  .name {
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-primary, #333);
    flex: 1;
  }
  
  .card-body {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-height: 24px;
  }
  
  .state-display {
    padding: 0;
  }
  
  .state-text {
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: capitalize;
    color: var(--text-secondary, #777);
  }
  
  .attribute {
    font-size: 0.8rem;
    color: var(--text-secondary, #888);
    background: var(--bg-page, #f0f0f0);
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .card-footer {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
  }
  
  .toggle-btn {
    flex: 1;
    padding: 0.6rem;
    border: none;
    border-radius: 10px;
    background: var(--bg-page, #f0f0f0);
    color: var(--text-secondary, #444);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
  }
  
  .toggle-btn:hover:not(:disabled) {
    opacity: 0.8;
  }
  
  .toggle-btn.on {
    background: var(--primary, #2196f3);
    color: var(--text-inverted, white);
  }
  
  .error {
    color: var(--error, #d32f2f);
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
</style>