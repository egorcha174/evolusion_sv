<script lang="ts">
  import type { HAEntity } from '$lib/types';
  import { toggleEntity } from '../ha/store';
  import { extractDomain } from '$lib/utils';
  
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
  
  // Determine icon based on domain and state
  function getIcon(dom: string, state: boolean): string {
    const icons: Record<string, string> = {
      light: state ? '💡' : '🌙',
      switch: state ? '✅' : '❌',
      cover: '🪟',
      climate: '🌡️',
      media_player: '🎵',
      lock: state ? '🔓' : '🔒',
      script: '📜'
    };
    return icons[dom] || '📱';
  }

  let icon = $derived(getIcon(domain, isOn));
</script>

<div class="card" data-domain={domain} data-state={isOn ? 'on' : 'off'}>
  <div class="card-header">
    <div class="icon">{icon}</div>
    <div class="name" title={displayName}>{displayName}</div>
  </div>
  
  <div class="card-body">
    <div class="state-display">
      <span class="state-text">{entity.state}</span>
    </div>
    
    {#if entity.attributes.brightness !== undefined}
      <div class="attribute">
        Brightness: {Math.round((entity.attributes.brightness / 255) * 100)}%
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
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  /* Domain specific styling */
  .card[data-domain="light"][data-state="on"] {
    background: linear-gradient(135deg, #fff9c4, #fff176);
    border-color: #fdd835;
  }
  
  .card[data-domain="switch"][data-state="on"] {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    border-color: #64b5f6;
  }
  
  .card[data-domain="cover"][data-state="on"] {
    background: linear-gradient(135deg, #e0f2f1, #b2dfdb);
    border-color: #4db6ac;
  }

  .card[data-domain="lock"][data-state="on"] { /* Unlocked */
     background: linear-gradient(135deg, #ffebee, #ffcdd2);
     border-color: #e57373;
  }
  
  .card-header {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }
  
  .icon {
    font-size: 1.75rem;
    line-height: 1;
  }
  
  .name {
    font-weight: 600;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
  }
  
  .card-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }
  
  .state-display {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    text-align: center;
    align-self: flex-start;
    min-width: 60px;
  }
  
  .state-text {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #555;
    letter-spacing: 0.5px;
  }
  
  .attribute {
    font-size: 0.8rem;
    color: #666;
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
    border-radius: 8px;
    background: #e0e0e0;
    color: #333;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }
  
  .toggle-btn:hover:not(:disabled) {
    background: #d5d5d5;
  }
  
  .toggle-btn.on {
    background: #2196f3;
    color: white;
  }
  
  .toggle-btn.on:hover:not(:disabled) {
    background: #1976d2;
  }
  
  .toggle-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error {
    color: #d32f2f;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    background: #ffebee;
    padding: 0.25rem;
    border-radius: 4px;
  }
</style>
