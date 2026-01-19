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
    background: var(--bg-card);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid var(--border-card);
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .card:hover {
    transform: translateY(-2px);
    background: var(--bg-card-hover);
  }
  
  /* Active Border Highlight */
  .card[data-state="on"] {
    border-color: var(--state-on);
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
    color: var(--text-secondary);
    background: var(--bg-page); 
    border-radius: 50%;
    transition: all 0.3s;
  }

  .card[data-state="on"] .icon {
    background: var(--state-on); /* Or a lighter opacity version if supported */
    color: var(--text-on-accent);
  }
  
  .name {
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-name);
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
    color: var(--text-status);
  }
  
  .attribute {
    font-size: 0.8rem;
    color: var(--text-muted);
    background: var(--bg-chip);
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
    background: var(--bg-chip);
    color: var(--text-secondary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
  }
  
  .toggle-btn:hover:not(:disabled) {
    background: var(--bg-chip-active);
  }
  
  .toggle-btn.on {
    background: var(--widget-switch-on);
    color: var(--text-on-accent);
  }
  
  .error {
    color: var(--accent-error);
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
</style>