
<script lang="ts">
  import { t } from 'svelte-i18n';
  import type { HAEntity } from '$lib/types';
  import { extractDomain } from '$lib/utils';
  import { getIcon } from '$lib/icons';
  import 'iconify-icon';

  let { device, isAdded, onAdd } = $props<{
    device: HAEntity;
    isAdded: boolean;
    onAdd: (device: HAEntity) => void;
  }>();

  let domain = $derived(extractDomain(device.entity_id));
  let icon = $derived(getIcon(domain));
  let name = $derived(device.attributes.friendly_name || device.entity_id);
  
  let stateLabel = $derived.by(() => {
     if (device.state === 'on') return $t('common.on');
     if (device.state === 'off') return $t('common.off');
     return device.state;
  });

  // State color logic
  let isOn = $derived(device.state === 'on' || device.state === 'open' || device.state === 'unlocked');
  let isUnavailable = $derived(device.state === 'unavailable' || device.state === 'unknown');
</script>

<div class="device-item" class:added={isAdded}>
  <div class="icon-wrapper" class:active={isOn} class:unavailable={isUnavailable}>
    <iconify-icon icon={icon} width="24"></iconify-icon>
  </div>
  
  <div class="info">
    <div class="name">{name}</div>
    <div class="meta">
      <span class="id">{device.entity_id}</span>
      <span class="separator">•</span>
      <span class="state">{stateLabel}</span>
    </div>
  </div>

  <button 
    class="add-btn" 
    disabled={isAdded}
    onclick={() => onAdd(device)}
    aria-label={isAdded ? $t('addDevice.added') : $t('addDevice.add')}
  >
    {#if isAdded}
      <iconify-icon icon="mdi:check"></iconify-icon>
    {:else}
      <iconify-icon icon="mdi:plus"></iconify-icon>
    {/if}
  </button>
</div>

<style>
  .device-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border-radius: 12px;
    transition: background 0.2s;
    user-select: none;
  }

  .device-item:hover {
    background: var(--bg-card-hover, rgba(0,0,0,0.04));
  }

  .device-item.added {
    opacity: 0.6;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-chip, rgba(0,0,0,0.05));
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .icon-wrapper.active {
    background: var(--accent-primary);
    color: #fff;
  }
  
  .icon-wrapper.unavailable {
    opacity: 0.5;
    background: transparent;
    border: 1px dashed var(--text-muted);
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .name {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.95rem;
  }

  .meta {
    font-size: 0.8rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .id {
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .separator { opacity: 0.4; }
  
  .state {
    font-weight: 500;
    text-transform: capitalize;
  }

  .add-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: var(--bg-chip);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .add-btn:hover:not(:disabled) {
    background: var(--accent-primary);
    color: white;
    transform: scale(1.1);
  }

  .add-btn:disabled {
    background: transparent;
    color: var(--accent-success);
    cursor: default;
  }
</style>
