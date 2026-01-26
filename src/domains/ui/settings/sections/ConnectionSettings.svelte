<script lang="ts">
  import { t } from 'svelte-i18n';
  import { appState, clearServerConfig } from '../../../app/store';
  import { haStore, disconnectHA } from '../../../ha/store';
  import Section from '../Section.svelte';
  import ServerManager from '../ServerManager.svelte';
  import 'iconify-icon';

  let isServerManagerOpen = $state(false);

  function disconnectServer() {
    if (confirm($t('settings.messages.confirmDisconnect') || 'Disconnect?')) {
      disconnectHA();
      clearServerConfig();
    }
  }
</script>

<Section title={$t('settings.connection')} description={$t('settings.connectionDesc')}>
  {#if $haStore.isConnected}
      <div class="connected-state">
        <div class="server-info">
          <div class="status-icon success">
            <iconify-icon icon="mdi:home-assistant" width="32"></iconify-icon>
          </div>
          <div class="server-details">
            <div class="server-name">{$appState.activeServer?.name || 'Home Assistant'}</div>
            <div class="server-url">{$appState.activeServer?.url}</div>
          </div>
        </div>
        <div class="connected-actions">
          <button class="btn danger outline full" onclick={disconnectServer}>
            {$t('settings.disconnect')}
          </button>
        </div>
      </div>
  {:else}
      <div class="disconnected-state">
        <div class="status-icon error">
            <iconify-icon icon="mdi:alert-circle" width="24"></iconify-icon>
        </div>
        <span>{$t('settings.notConnected')}</span>
      </div>
  {/if}

  <div class="connection-actions">
      <button class="btn secondary full" onclick={() => isServerManagerOpen = true}>
        <iconify-icon icon="mdi:server-network"></iconify-icon> {$t('settings.manageServers')}
      </button>
  </div>
</Section>

{#if isServerManagerOpen}
  <ServerManager onClose={() => isServerManagerOpen = false} />
{/if}

<style>
  /* Copied styles relevant to connection */
  .connected-state, .disconnected-state {
    display: flex; gap: 1rem; padding: 1.25rem; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-primary); margin-bottom: 1rem;
  }
  .connected-state { flex-direction: column; }
  .disconnected-state { align-items: center; justify-content: center; color: var(--text-muted); padding: 0.75rem; gap: 0.5rem; }
  
  .server-info { display: flex; align-items: flex-start; gap: 1rem; width: 100%; }
  .status-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .status-icon.success { color: var(--accent-success); }
  .status-icon.error { color: var(--accent-error); }
  
  .server-details { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 0.25rem; }
  .server-name { font-weight: 600; color: var(--text-primary); word-break: break-word; line-height: 1.3; font-size: 1rem; }
  .server-url { font-size: 0.85rem; color: var(--text-secondary); word-break: break-all; line-height: 1.3; }
  
  .connected-actions { width: 100%; }
  .connection-actions { display: flex; flex-direction: column; gap: 0.5rem; }

  .btn {
    padding: 0.7rem 1.2rem; border-radius: 8px; border: none; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
    font-size: 0.95rem; transition: all 0.2s; white-space: normal; text-align: center; line-height: 1.2;
    min-height: 48px;
  }
  .btn:hover { transform: translateY(-1px); filter: brightness(0.95); }
  
  .btn.secondary { 
    background: var(--bg-chip, #e0e0e0); 
    color: var(--text-primary, #333); 
  }
  
  .btn.danger.outline { 
    border: 1px solid var(--accent-error, #f44336); 
    background: transparent; 
    color: var(--accent-error, #f44336);
  }
  .btn.danger.outline:hover { background: rgba(244, 67, 54, 0.05); }
  .btn.full { width: 100%; }
</style>