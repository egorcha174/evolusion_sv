<script lang="ts">
  import { t } from 'svelte-i18n';
  import { exportAllSettings, importAllSettings, clearAllData } from '../../../app/backup';
  import Section from '../Section.svelte';
  import 'iconify-icon';

  let fileInput: HTMLInputElement;

  async function handleBackupImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      if (confirm($t('settings.backupConfirm'))) {
        try {
          await importAllSettings(file);
        } catch (err: any) {
          alert('Import failed: ' + err.message);
        }
      }
    }
  }

  function handleReset() {
    if (confirm($t('settings.resetConfirm'))) {
      clearAllData();
    }
  }
</script>

<Section title={$t('settings.backup')} description={$t('settings.backupDesc')}>
  <div class="backup-actions">
    <button class="btn primary flex-grow" onclick={exportAllSettings}>
      <iconify-icon icon="mdi:download"></iconify-icon> {$t('settings.exportBtn')}
    </button>

    <button class="btn secondary flex-grow" onclick={() => fileInput.click()}>
      <iconify-icon icon="mdi:upload"></iconify-icon> {$t('settings.importBtn')}
    </button>
    <input type="file" hidden bind:this={fileInput} accept=".zip" onchange={handleBackupImport} />
  </div>

  <div class="danger-zone">
     <div class="dz-label">{$t('settings.dangerZone')}</div>
     <button class="btn danger outline full" onclick={handleReset}>
       {$t('settings.reset')}
     </button>
  </div>
</Section>

<style>
  .backup-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; }
  
  .danger-zone { border-top: 1px solid var(--border-divider); padding-top: 1.5rem; }
  .dz-label { color: var(--accent-error, #f44336); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }

  .btn {
    padding: 0.7rem 1.2rem; border-radius: 8px; border: none; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
    font-size: 0.95rem; transition: all 0.2s; white-space: normal; text-align: center; line-height: 1.2;
    min-height: 48px;
  }
  .btn:hover { transform: translateY(-1px); filter: brightness(0.95); }
  
  .btn.primary { 
    background: var(--accent-primary, #2196f3); 
    color: var(--text-on-accent, #ffffff);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  }
  
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
  .btn.flex-grow { flex-grow: 1; }
</style>