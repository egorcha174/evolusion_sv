
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { dashboardStore } from '../../../app/dashboardStore';
  import { createDefaultCardTemplate, type CardTemplate } from '$lib/types';
  import CardTemplateEditor from './CardTemplateEditor.svelte';
  import 'iconify-icon';

  let { onClose } = $props<{ onClose: () => void }>();

  let templates = $derived(Object.values($dashboardStore.templates));
  
  // Editor State
  let showEditor = $state(false);
  let editMode = $state<'create' | 'edit'>('create');
  let selectedTemplate = $state<CardTemplate | undefined>(undefined);

  function handleCreate() {
    selectedTemplate = createDefaultCardTemplate();
    editMode = 'create';
    showEditor = true;
  }

  function handleEdit(tpl: CardTemplate) {
    selectedTemplate = tpl;
    editMode = 'edit';
    showEditor = true;
  }

  function handleDelete(id: string) {
    // $t returns a string, so this is safe for confirm
    // Note: get(t) could be used if not reactive, but inside event handler $t works if component is mounted
    if (confirm($t('templates.manager.confirmDelete'))) {
      dashboardStore.deleteTemplate(id);
    }
  }

  function handleSave(tpl: CardTemplate) {
    dashboardStore.saveTemplate(tpl);
    showEditor = false;
    selectedTemplate = undefined;
  }
</script>

<!-- If Editor is open, show it above the manager -->
{#if showEditor}
  <CardTemplateEditor 
    mode={editMode}
    initialTemplate={selectedTemplate}
    onSave={handleSave}
    onCancel={() => { showEditor = false; selectedTemplate = undefined; }}
  />
{/if}

<div class="manager-overlay" onclick={onClose}>
  <div class="manager-modal" onclick={(e) => e.stopPropagation()}>
    <header>
      <h3>{$t('templates.manager.title')}</h3>
      <button class="close-btn" onclick={onClose}>
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
    </header>

    <div class="content">
      {#if templates.length === 0}
        <div class="empty">{$t('templates.manager.empty')}</div>
      {:else}
        <div class="list">
          {#each templates as tpl (tpl.id)}
            <div class="item">
              <div class="info">
                <span class="name">{tpl.name}</span>
                <span class="id">{tpl.id.slice(0, 8)}...</span>
              </div>
              <div class="actions">
                <button class="icon-btn" onclick={() => handleEdit(tpl)} title={$t('templates.editor.edit')}>
                  <iconify-icon icon="mdi:pencil"></iconify-icon>
                </button>
                <button class="icon-btn danger" onclick={() => handleDelete(tpl.id)} title={$t('common.delete')}>
                  <iconify-icon icon="mdi:delete"></iconify-icon>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <footer>
      <button class="btn primary full" onclick={handleCreate}>
        <iconify-icon icon="mdi:plus"></iconify-icon>
        {$t('templates.manager.create')}
      </button>
    </footer>
  </div>
</div>

<style>
  .manager-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 1500;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .manager-modal {
    background: var(--bg-panel);
    width: 400px;
    max-height: 80vh;
    border-radius: 16px;
    box-shadow: var(--shadow-modal);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border-primary);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-divider);
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    display: flex;
  }

  .content {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
  }

  .empty {
    text-align: center;
    color: var(--text-muted);
    padding: 2rem 0;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .id {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: monospace;
  }

  .actions {
    display: flex;
    gap: 0.25rem;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    display: flex;
  }

  .icon-btn:hover {
    background: var(--bg-chip);
    color: var(--text-primary);
  }

  .icon-btn.danger:hover {
    background: rgba(244, 67, 54, 0.1);
    color: var(--accent-error);
  }

  footer {
    padding: 1rem;
    border-top: 1px solid var(--border-divider);
    background: var(--bg-secondary);
  }

  .btn {
    padding: 0.75rem;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn.primary {
    background: var(--accent-primary);
    color: white;
  }
  
  .full {
    width: 100%;
  }
</style>
