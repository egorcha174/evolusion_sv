<script lang="ts">
  import { t } from 'svelte-i18n';
  import { editorStore } from '../store';
  import { editorHistory } from '../history';
  import { isEditMode } from '../../../app/tabsStore';
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

  function toggleGrid() {
    editorStore.toggleGridSettings();
  }
  
  let canUndo = $derived(editorHistory.canUndo());
  let canRedo = $derived(editorHistory.canRedo());
  let showGridSettings = $derived($editorStore.showGridSettings);
</script>

<div class="edit-toolbar">
  <div class="group">
    <button class="tool-btn" class:active={showGridSettings} onclick={toggleGrid} title="Grid Settings">
       <iconify-icon icon="mdi:grid"></iconify-icon>
    </button>
  </div>

  <div class="divider"></div>

  <div class="group">
    <button class="tool-btn" disabled={!canUndo} onclick={undo} title="Undo">
      <iconify-icon icon="mdi:undo"></iconify-icon>
    </button>
    <button class="tool-btn" disabled={!canRedo} onclick={redo} title="Redo">
      <iconify-icon icon="mdi:redo"></iconify-icon>
    </button>
  </div>
  
  <div class="divider"></div>
  
  <div class="group actions">
    <button class="tool-btn cancel" onclick={cancel}>
      <iconify-icon icon="mdi:close"></iconify-icon>
      <span class="btn-text">{$t('common.cancel')}</span>
    </button>
    <button class="tool-btn primary" onclick={save}>
      <iconify-icon icon="mdi:check"></iconify-icon>
      <span class="btn-text">{$t('dashboard.done')}</span>
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
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-primary, rgba(0,0,0,0.1));
    border-radius: 40px; /* Pill shape */
    padding: 6px 12px;
    display: flex;
    gap: 12px;
    align-items: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.05);
    z-index: 1000;
    transition: all 0.2s ease;
  }
  
  .group {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  
  .group.actions {
    gap: 8px;
    margin-left: 4px;
  }

  .divider {
    width: 1px;
    height: 20px;
    background: var(--border-primary, rgba(0,0,0,0.1));
  }
  
  .tool-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: transparent;
    border: none;
    height: 36px;
    min-width: 36px;
    padding: 0 8px;
    border-radius: 18px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-secondary);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .tool-btn:hover:not(:disabled) {
    background: var(--bg-card-hover, rgba(0,0,0,0.05));
    color: var(--text-primary);
    transform: translateY(-1px);
  }
  
  .tool-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .tool-btn.active {
    background: var(--accent-primary);
    color: var(--text-on-accent, white);
  }
  
  .tool-btn:disabled {
    opacity: 0.3;
    cursor: default;
    pointer-events: none;
  }
  
  /* Primary Action (Done) */
  .tool-btn.primary {
    background: var(--accent-primary);
    color: var(--text-on-accent, #ffffff);
    padding: 0 16px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
  
  .tool-btn.primary:hover {
    filter: brightness(1.05);
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  }
  
  /* Cancel Action */
  .tool-btn.cancel {
    color: var(--text-secondary);
    padding: 0 12px;
  }
  
  .tool-btn.cancel:hover {
    background: rgba(244, 67, 54, 0.1);
    color: var(--accent-error);
  }
  
  .btn-text {
    font-size: 0.9rem;
    line-height: 1;
  }
  
  /* Mobile adjustments */
  @media (max-width: 480px) {
    .btn-text {
      display: none;
    }
    .tool-btn.primary, .tool-btn.cancel {
      padding: 0;
      width: 36px;
    }
    /* Show checkmark/close only */
  }
</style>