
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { dashboardStore } from '../app/dashboardStore';
  import { editorStore } from './editor/store';
  import { portal } from '$lib/portal';
  import type { DashboardCardConfig } from '$lib/types';
  
  let { card, onClose } = $props<{
    tabId: string, // Unused but kept for interface compat if needed later
    card: DashboardCardConfig,
    // Removed unused callbacks
    onEditTemplate?: any,
    onNewTemplate?: any,
    onClose: () => void
  }>();
  
  // Get available templates from store
  let templates = $derived(Object.values($dashboardStore.templates || {}));
  
  // Local state for the selection (don't commit to store yet)
  let selectedTemplateId = $state<string | undefined>(card.templateId);

  // Initialize selectedId from editor override if present
  $effect(() => {
    const override = $editorStore.templateOverrides.get(card.id);
    if (override !== undefined) {
      selectedTemplateId = override;
    }
  });
  
  function handleSave() {
    // Commit to editor store (which is still a draft until main Save/Done)
    editorStore.setCardTemplate(card.id, selectedTemplateId);
    onClose();
  }
</script>

<div class="card-settings-overlay" onclick={onClose} use:portal>
  <div class="card-settings-modal" onclick={(e) => e.stopPropagation()}>
    <h3>{$t('cardSettings.title')}</h3>
    
    <div class="field">
       <label for="tpl-select">{$t('cardSettings.template')}</label>
       <select id="tpl-select" bind:value={selectedTemplateId}>
         <option value={undefined}>{$t('cardSettings.noTemplate')}</option>
         {#each templates as t}
           <option value={t.id}>{t.name}</option>
         {/each}
       </select>
       <p class="hint">{$t('cardSettings.manageHint')}</p>
    </div>
    
    <div class="footer">
       <button class="btn text" onclick={onClose}>{$t('common.cancel')}</button>
       <button class="btn primary" onclick={handleSave}>{$t('common.save')}</button>
    </div>
  </div>
</div>

<style>
  .card-settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(2px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card-settings-modal {
    background: var(--bg-panel);
    border-radius: 12px;
    padding: 1.5rem;
    width: 320px;
    box-shadow: var(--shadow-modal);
    border: 1px solid var(--border-primary);
  }
  
  h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }
  
  .field {
    margin-bottom: 2rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
  
  select {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--border-input);
    background: var(--bg-input);
    color: var(--text-primary);
    font-size: 1rem;
  }
  
  .hint {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.95rem;
  }
  
  .btn.primary {
    background: var(--accent-primary);
    color: white;
  }
  
  .btn.text {
    background: transparent;
    color: var(--text-secondary);
  }
  .btn.text:hover {
    color: var(--text-primary);
    background: var(--bg-chip);
  }
</style>
