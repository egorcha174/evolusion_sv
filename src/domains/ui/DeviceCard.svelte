
<script lang="ts">
  import { t } from 'svelte-i18n';
  import type { HAEntity } from '$lib/types';
  import { toggleEntity } from '../ha/store';
  import { extractDomain } from '$lib/utils';
  import { getIcon } from '$lib/icons';
  import { lazyLoad } from '$lib/actions';
  
  let { entity }: { entity: HAEntity } = $props();
  
  let isToggling = $state(false);
  let error = $state<string | null>(null);
  let isLoaded = $state(false);
  
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
  
  function handleEnter() {
    isLoaded = true;
  }
  
  let domain = $derived(extractDomain(entity.entity_id));
  let displayName = $derived(entity.attributes.friendly_name || entity.entity_id);
  let isOn = $derived(entity.state === 'on' || entity.state === 'open' || entity.state === 'unlocked');
  let isToggleable = $derived(['light', 'switch', 'cover', 'lock', 'input_boolean', 'script'].includes(domain));
  
  let icon = $derived(getIcon(domain));
  
  let translatedState = $derived.by(() => {
     if (entity.state === 'on') return $t('common.on');
     if (entity.state === 'off') return $t('common.off');
     if (entity.state === 'unavailable') return $t('entities.status.unavailable');
     if (entity.state === 'unknown') return $t('entities.status.unknown');
     return entity.state;
  });
</script>

<div 
  class="device-card" 
  class:active={isOn}
  data-domain={domain}
  use:lazyLoad
  onenter={handleEnter}
  onclick={isToggleable ? handleToggle : undefined}
>
  {#if !isLoaded}
    <div class="skeleton"></div>
  {:else}
    <div class="card-header">
      <div class="icon">
        <iconify-icon icon={icon} width="24" height="24"></iconify-icon>
      </div>
      <div class="device-name" title={displayName}>{displayName}</div>
    </div>
    
    <div class="card-body">
      <div class="state-container">
        <span class="device-value">{translatedState}</span>
        {#if entity.attributes.unit_of_measurement}
          <span class="device-unit">{entity.attributes.unit_of_measurement}</span>
        {/if}
      </div>
      
      {#if entity.attributes.brightness !== undefined}
        <div class="attribute">
          {Math.round((entity.attributes.brightness / 255) * 100)}%
        </div>
      {/if}
    </div>

    {#if error}
      <div class="error">{error}</div>
    {/if}
  {/if}
</div>

<style>
  .device-card {
    /* Background */
    background: var(--card-background, rgba(255, 255, 255, 0.8));
    
    /* Border */
    border: var(--card-border-width, 0px) solid var(--card-border-color, transparent);
    border-radius: var(--card-border-radius, 16px);
    
    /* Opacity */
    opacity: var(--card-opacity, 0.85);
    
    /* Other Styles */
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    /* Shadow */
    box-shadow: var(--shadow-card, 0 2px 8px rgba(0, 0, 0, 0.1));
    
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    min-height: 120px;
    position: relative;
    overflow: hidden;
  }
  
  .device-card:hover {
    transform: translateY(-2px);
    opacity: 1; /* Brighten on hover */
  }
  
  /* Active State */
  .device-card.active {
    background: var(--card-background-on, rgba(255, 255, 255, 0.95));
    border-color: var(--card-border-color-on, #0A84FF);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .card-header {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--status-text-color);
    background: rgba(0,0,0,0.05);
    border-radius: 50%;
    transition: all 0.3s;
  }

  .device-card.active .icon {
    background: var(--accent-primary);
    color: #fff;
  }
  
  .device-name {
    color: var(--name-text-color, #1D1D1F);
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  
  .device-card.active .device-name {
    color: var(--name-text-color-on, #1D1D1F);
  }
  
  .card-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
  }
  
  .device-value {
    color: var(--value-text-color, #1D1D1F);
    font-size: 1.1rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .device-card.active .device-value {
    color: var(--value-text-color-on, #1D1D1F);
  }
  
  .device-unit {
    color: var(--unit-text-color, #1D1D1F);
    font-size: 0.85rem;
    margin-left: 2px;
  }
  
  .device-card.active .device-unit {
    color: var(--unit-text-color-on, #1D1D1F);
  }
  
  .attribute {
    font-size: 0.8rem;
    color: var(--text-muted);
    background: rgba(0,0,0,0.05);
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .error {
    color: var(--accent-error);
    font-size: 0.75rem;
    margin-top: auto;
  }

  .skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
