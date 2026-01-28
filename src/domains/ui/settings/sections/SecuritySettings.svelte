
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { session } from '../../../app/session';
  import { appState, layoutConfig, saveServerConfig, saveSavedServers, saveLayout } from '../../../app/store';
  import { dashboardStore } from '../../../app/dashboardStore';
  import Section from '../Section.svelte';
  import LabeledInput from '../controls/LabeledInput.svelte';
  import Switch from '../controls/Switch.svelte';
  import 'iconify-icon';

  let newPin = $state('');
  let isProcessing = $state(false);
  let message = $state('');
  let messageType = $state<'success' | 'error'>('success');

  // Auto Login State
  let confirmPin = $state('');
  let showConfirm = $state(false);
  let confirmError = $state('');

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
      const success = await session.changePin(newPin);
      if (!success) throw new Error('Failed to update PIN');

      // Re-encrypt data
      if ($appState.activeServer) await saveServerConfig($appState.activeServer);
      await saveSavedServers($appState.savedServers);
      await saveLayout($layoutConfig.cardOrder);
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

  // Handle Switch Toggle
  function handleAutoLoginChange(newChecked: boolean) {
    if (newChecked) {
      // User is turning ON
      // 1. Immediately disable in store (revert visual state) until confirmed
      session.disableAutoLogin();
      
      // 2. Show confirmation dialog
      showConfirm = true;
      confirmPin = '';
      confirmError = '';
    } else {
      // User is turning OFF
      session.disableAutoLogin();
      showConfirm = false;
    }
  }

  async function confirmAutoLogin() {
    if (confirmPin.length < 4) return;
    
    // Validate PIN matches current session key before saving
    const isValid = await session.verifyPin(confirmPin);
    
    if (isValid) {
      // Now actually enable it (writes to localStorage)
      session.enableAutoLogin(confirmPin);
      showConfirm = false;
      confirmPin = '';
      confirmError = '';
    } else {
      confirmError = $t('settings.security.error') || 'Invalid PIN';
    }
  }
</script>

<Section title={$t('settings.security.title')} description={$t('settings.security.description')}>
  <div class="security-panel">
    
    <!-- Auto Login Toggle -->
    <div class="auto-login-section">
       <Switch 
         label={$t('settings.security.autoLogin')} 
         checked={$session.isAutoLogin} 
         onchange={handleAutoLoginChange}
         disabled={showConfirm}
       />
       <p class="hint">{$t('settings.security.autoLoginDesc')}</p>
       
       {#if showConfirm}
         <div class="confirm-box">
            <p>{$t('settings.security.confirmPin')}</p>
            <div class="row">
              <input type="password" bind:value={confirmPin} placeholder="PIN" class="pin-input" />
              <button class="btn primary" onclick={confirmAutoLogin} disabled={confirmPin.length < 4}>
                {$t('common.ok')}
              </button>
              <button class="btn text" onclick={() => showConfirm = false}>
                {$t('common.cancel')}
              </button>
            </div>
            {#if confirmError}
              <div class="error-inline">{confirmError}</div>
            {/if}
         </div>
       {/if}
    </div>

    <div class="divider"></div>

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
  
  .btn.text { background: transparent; color: var(--text-secondary); }
  .btn.text:hover { color: var(--text-primary); }

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
  
  .divider {
    height: 1px;
    background: var(--border-divider);
    margin: 0.5rem 0;
  }
  
  .hint {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: -0.5rem;
    margin-bottom: 1rem;
  }
  
  .confirm-box {
    background: var(--bg-input);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 1px solid var(--border-primary);
  }
  .confirm-box p { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--text-primary); }
  .row { display: flex; gap: 0.5rem; }
  .pin-input {
    flex: 1; padding: 0.5rem; border: 1px solid var(--border-input); border-radius: 6px;
    font-size: 1rem;
  }
  .error-inline { color: var(--accent-error); font-size: 0.85rem; margin-top: 0.5rem; }
</style>
