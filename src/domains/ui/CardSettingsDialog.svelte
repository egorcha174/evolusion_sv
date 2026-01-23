
<script lang="ts">
  import { dashboardStore } from '../app/dashboardStore';
  import type { DashboardCardConfig, CardTemplate } from '$lib/types';
  
  let { tabId, card, onEditTemplate, onNewTemplate, onClose } = $props<{
    tabId: string,
    card: DashboardCardConfig,
    onEditTemplate: (t: CardTemplate) => void,
    onNewTemplate: () => void,
    onClose: () => void
  }>();
  
  // Get available templates from store
  let templates = $derived(Object.values($dashboardStore.templates || {}));
  
  function handleTemplateChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    dashboardStore.assignTemplateToCard(tabId, card.id, val === '' ? undefined : val);
  }
  
  function editSelected() {
    if (card.templateId) {
       const tpl = $dashboardStore.templates[card.templateId];
       if (tpl) onEditTemplate(tpl);
    }
  }
</script>

<div class="card-settings-overlay" onclick={onClose}>
  <div class="card-settings-modal" onclick={(e) => e.stopPropagation()}>
    <h3>Card Settings</h3>
    
    <div class="field">
       <label for="tpl-select">Template</label>
       <select id="tpl-select" value={card.templateId || ''} onchange={handleTemplateChange}>
         <option value="">(No Template)</option>
         {#each templates as t}
           <option value={t.id}>{t.name}</option>
         {/each}
       </select>
    </div>
    
    <div class="actions">
       <button class="btn secondary" onclick={onNewTemplate}>New Template</button>
       <button 
         class="btn primary" 
         disabled={!card.templateId} 
         onclick={editSelected}
       >
         Edit Template
       </button>
    </div>
    
    <div class="footer">
       <button class="btn text" onclick={onClose}>Close</button>
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
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }
  
  .field {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
  
  select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--border-input);
    background: var(--bg-input);
    color: var(--text-primary);
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .btn {
    flex: 1;
    padding: 0.6rem;
    border-radius: 6px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn.primary {
    background: var(--accent-primary);
    color: white;
  }
  .btn.primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn.secondary {
    background: transparent;
    border: 1px solid var(--border-primary);
    color: var(--text-primary);
  }
  .btn.secondary:hover {
    background: var(--bg-card-hover);
  }
  
  .btn.text {
    background: transparent;
    color: var(--text-secondary);
    width: 100%;
  }
  .btn.text:hover {
    color: var(--text-primary);
  }
</style>
