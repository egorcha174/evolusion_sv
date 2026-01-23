
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { createDefaultCardTemplate, type CardTemplate, type CardTemplateStyle } from '$lib/types';
  import { exportTemplate, importTemplate } from './io';
  import CardPreview from './components/CardPreview.svelte';
  import CardStylePanel from './components/CardStylePanel.svelte';
  import 'iconify-icon';

  let { mode = 'create', initialTemplate, onSave, onCancel } = $props<{
    mode?: 'create' | 'edit',
    initialTemplate?: CardTemplate,
    onSave: (t: CardTemplate) => void,
    onCancel: () => void
  }>();

  // Helper to safely clone objects, handling Svelte proxies if necessary
  function safeClone<T>(obj: T): T {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.error('Failed to clone template', e);
      // Fallback for types that JSON doesn't handle well, though CardTemplate is JSON-safe
      return structuredClone(obj);
    }
  }

  // State
  // We clone the initial template to avoid mutating props directly until save
  let template = $state<CardTemplate>(
    initialTemplate ? safeClone(initialTemplate) : createDefaultCardTemplate()
  );

  let activeTab = $state<'style' | 'content'>('style');
  let fileInput: HTMLInputElement;

  // Actions
  function handleStyleChange(newStyle: CardTemplateStyle) {
    template.style = newStyle;
  }

  function handleSave() {
    if (!template.name.trim()) {
      alert($t('templates.editor.alertName'));
      return;
    }
    // Return a plain object clone to strip any proxies before saving to store
    onSave(safeClone(template));
  }

  function handleExport() {
    exportTemplate(template);
  }

  function triggerImport() {
    fileInput.click();
  }

  async function handleImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const imported = await importTemplate(file);
      // In edit mode, we preserve the original ID to ensure we update the correct record
      if (mode === 'edit') {
        imported.id = template.id;
      }
      template = imported;
    } catch (err: any) {
      alert($t('templates.editor.alertImport') + err.message);
    } finally {
      // Reset input
      if (fileInput) fileInput.value = '';
    }
  }
</script>

<div class="template-editor-overlay">
  <div class="editor-window">
    <!-- Header -->
    <header class="editor-header">
      <div class="header-left">
        <div class="title-group">
          <h2>{mode === 'create' ? $t('templates.editor.new') : $t('templates.editor.edit')}</h2>
          <input 
            type="text" 
            class="name-input" 
            placeholder={$t('templates.editor.namePlaceholder')}
            bind:value={template.name}
          />
        </div>
      </div>

      <div class="header-right">
        <button class="btn secondary" onclick={triggerImport} title={$t('templates.editor.importJson')}>
          <iconify-icon icon="mdi:upload"></iconify-icon>
        </button>
        <button class="btn secondary" onclick={handleExport} title={$t('templates.editor.exportJson')}>
          <iconify-icon icon="mdi:download"></iconify-icon>
        </button>
        <div class="divider-v"></div>
        <button class="btn text" onclick={onCancel}>{$t('common.cancel')}</button>
        <button class="btn primary" onclick={handleSave}>
          <iconify-icon icon="mdi:check"></iconify-icon>
          {$t('common.save')}
        </button>
      </div>
    </header>

    <!-- Body -->
    <div class="editor-body">
      <!-- Left: Preview -->
      <div class="preview-pane">
        <CardPreview {template} />
      </div>

      <!-- Right: Settings -->
      <div class="settings-pane">
        <div class="tabs">
          <button 
            class="tab" 
            class:active={activeTab === 'style'} 
            onclick={() => activeTab = 'style'}
          >
            {$t('templates.editor.tabStyle')}
          </button>
          <button 
            class="tab" 
            class:active={activeTab === 'content'} 
            onclick={() => activeTab = 'content'}
          >
            {$t('templates.editor.tabContent')}
          </button>
        </div>

        <div class="panel-content">
          {#if activeTab === 'style'}
            <CardStylePanel 
              value={template.style} 
              onChange={handleStyleChange} 
            />
          {:else}
            <div class="placeholder-msg">
              <iconify-icon icon="mdi:cone" width="32"></iconify-icon>
              <p>{$t('templates.editor.contentPlaceholder')}</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Hidden Input for Import -->
<input 
  type="file" 
  hidden 
  accept=".json" 
  bind:this={fileInput} 
  onchange={handleImport}
/>

<style>
  .template-editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
  }

  .editor-window {
    width: 90vw;
    height: 85vh;
    max-width: 1200px;
    background: var(--bg-page);
    border-radius: 16px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Header */
  .editor-header {
    height: 64px;
    border-bottom: 1px solid var(--border-divider);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    background: var(--bg-panel);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .title-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-secondary);
  }

  .name-input {
    font-size: 1.1rem;
    font-weight: 500;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    padding: 0.25rem 0.5rem;
    color: var(--text-primary);
    transition: border-color 0.2s;
  }

  .name-input:focus {
    outline: none;
    border-bottom-color: var(--accent-primary);
    background: var(--bg-input);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .divider-v {
    width: 1px;
    height: 24px;
    background: var(--border-divider);
    margin: 0 0.5rem;
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .btn.primary {
    background: var(--accent-primary);
    color: white;
  }

  .btn.primary:hover {
    filter: brightness(1.1);
  }

  .btn.text {
    background: transparent;
    color: var(--text-primary);
  }
  
  .btn.text:hover {
    background: rgba(0,0,0,0.05);
  }

  .btn.secondary {
    background: transparent;
    border: 1px solid var(--border-primary);
    color: var(--text-primary);
    padding: 0.5rem;
  }

  .btn.secondary:hover {
    background: var(--bg-card-hover);
  }

  /* Body */
  .editor-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* Preview Pane */
  .preview-pane {
    flex: 1;
    background: var(--bg-secondary); /* Darker background to verify transparency */
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }

  /* Settings Pane */
  .settings-pane {
    width: 360px;
    background: var(--bg-panel);
    border-left: 1px solid var(--border-divider);
    display: flex;
    flex-direction: column;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border-divider);
  }

  .tab {
    flex: 1;
    padding: 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    font-weight: 500;
    color: var(--text-secondary);
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
    background: var(--bg-card-hover);
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .placeholder-msg {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    gap: 1rem;
    text-align: center;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
