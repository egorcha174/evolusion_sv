
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { editorStore } from '../store';
  import { editorHistory } from '../history';
  import { isEditMode, toggleEditMode } from '../../../app/tabsStore'; // Corrected path
  import 'iconify-icon';

  function save() {
    editorStore.commit();
    isEditMode.set(false);
  }

  function cancel() {
    editorStore.cancel();
    isEditMode.set(false);
  }
  
  function undo() {
    editorStore.undo();
  }
  
  function redo() {
    editorStore.redo();
  }
  
  let canUndo = $derived(editorHistory.canUndo());
  let canRedo = $derived(editorHistory.canRedo());
</script>

<div class="edit-toolbar">
  <div class="group">
    <button class="tool-btn" disabled={!canUndo} onclick={undo} title="Undo">
      <iconify-icon icon="mdi:undo"></iconify-icon>
    </button>
    <button class="tool-btn" disabled={!canRedo} onclick={redo} title="Redo">
      <iconify-icon icon="mdi:redo"></iconify-icon>
    </button>
  </div>
  
  <div class="group">
    <button class="tool-btn cancel" onclick={cancel}>
      <iconify-icon icon="mdi:close"></iconify-icon>
      {$t('common.cancel')}
    </button>
    <button class="tool-btn primary" onclick={save}>
      <iconify-icon icon="mdi:check"></iconify-icon>
      {$t('dashboard.done')}
    </button>
  </div>
</div>

<style>
  .edit-toolbar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-panel, rgba(255, 255, 255, 0.9));
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-primary);
    border-radius: 32px;
    padding: 8px 16px;
    display: flex;
    gap: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    z-index: 1000;
  }
  
  .group {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .tool-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-primary);
    transition: background 0.2s;
  }
  
  .tool-btn:hover:not(:disabled) {
    background: rgba(0,0,0,0.05);
  }
  
  .tool-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }
  
  .tool-btn.primary {
    background: var(--accent-primary);
    color: white;
  }
  
  .tool-btn.primary:hover {
    filter: brightness(1.1);
  }
  
  .tool-btn.cancel {
    color: var(--accent-error);
  }
</style>
