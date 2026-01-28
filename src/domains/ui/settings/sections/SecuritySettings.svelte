
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { session } from '../../../app/session';
  import { appState, layoutConfig, saveServerConfig, saveSavedServers, saveLayout } from '../../../app/store';
  import { dashboardStore } from '../../../app/dashboardStore';
  import Section from '../Section.svelte';
  import LabeledInput from '../controls/LabeledInput.svelte';
  import 'iconify-icon';

  let newPin = $state('');
  let isProcessing = $state(false);
  let message = $state('');
  let messageType = $state<'success' | 'error'>('success');

  async function handleChangePin() {
    if (newPin.length < 4) {
      message = $t('settings.security.pinTooShort');
      messageType = 'error';
      return;
    }

    if (!confirm($t('settings.security.confirmChange'))) return;

    isProcessing = true;
    message = '';

    try {
      // 1. Change PIN (Updates session key and storage salt/verifier)
      const success = await session.changePin(newPin);
      
      if (!success) throw new Error('Failed to update PIN');

      // 2. Re-encrypt all data with new key
      // We must do this immediately to prevent data loss on next reload
      
      // Server Config
      if ($appState.activeServer) {
        await saveServerConfig($appState.activeServer);
      }
      
      // Saved Servers
      await saveSavedServers($appState.savedServers);
      
      // Layout
      await saveLayout($layoutConfig.cardOrder);
      
      // Dashboard Config (Tabs/Cards)
      await dashboardStore.save();

      message = $t('settings.security.success');
      messageType = 'success';
      newPin = '';
    } catch (e: any) {
      console.error(e);
      message = $t('settings.security.error') + ': ' + e.message;
      messageType = 'error';
    } finally {
      isProcessing = false;
    }
  }
</script>

<Section title={$t('settings.security.title')} description={$t('settings.security.description')}>
  <div class="security-panel">
    <div class="control-row">
      <LabeledInput 
        label={$t('settings.security.newPin')} 
        bind:value={newPin} 
        type="password" 
        placeholder="****"
        disabled={isProcessing}
      />
    </div>

    <div class="actions">
      <button 
        class="btn primary" 
        onclick={handleChangePin} 
        disabled={isProcessing || newPin.length < 4}
      >
        <iconify-icon icon="mdi:key-change"></iconify-icon>
        {$t('settings.security.updatePin')}
      </button>
    </div>

    {#if message}
      <div class="message" class:error={messageType === 'error'}>
        {message}
      </div>
    {/if}
  </div>
</Section>

<style>
  .security-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-row {
    margin-bottom: 0.5rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .btn {
    padding: 0.7rem 1.2rem; border-radius: 8px; border: none; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
    font-size: 0.95rem; transition: all 0.2s;
  }
  
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.primary:hover { filter: brightness(1.1); }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .message {
    padding: 0.75rem;
    border-radius: 8px;
    background: rgba(52, 199, 89, 0.1);
    color: var(--accent-success);
    font-size: 0.9rem;
    text-align: center;
  }
  
  .message.error {
    background: rgba(255, 59, 48, 0.1);
    color: var(--accent-error);
  }
</style>
