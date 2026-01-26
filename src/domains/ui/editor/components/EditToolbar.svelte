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
    <button
      class="tool-btn"
      class:active={showGridSettings}
      onclick={toggleGrid}
      title="Grid Settings"
    >
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
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-panel, rgba(255, 255, 255, 0.95));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.1));
    border-radius: 100px; /* Full Pill */
    padding: 6px 8px;
    display: flex;
    gap: 8px;
    align-items: center;
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.05);
    z-index: 2000;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  }

  .group {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .group.actions {
    gap: 8px;
    margin-left: 4px;
    padding-left: 4px;
  }

  .divider {
    width: 1px;
    height: 24px;
    background: var(--border-divider, rgba(0, 0, 0, 0.1));
    margin: 0 4px;
  }

  .tool-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: none;
    height: 40px;
    min-width: 40px;
    padding: 0 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-secondary, #666);
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  }

  .tool-btn iconify-icon {
    font-size: 1.25rem;
  }

  .tool-btn:hover:not(:disabled) {
    background: var(--bg-card-hover, rgba(0, 0, 0, 0.05));
    color: var(--text-primary, #000);
    transform: translateY(-1px);
  }

  .tool-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.96);
  }

  .tool-btn.active {
    background: var(--accent-primary, var(--tab-indicator-color, #2196f3));
    color: #ffffff;
  }

  .tool-btn:disabled {
    opacity: 0.3;
    cursor: default;
    pointer-events: none;
  }

  /* Primary Action (Done) */
  .tool-btn.primary {
    /* Robust fallback: accentPrimary -> tabIndicator -> Blue */
    background: var(--accent-primary, var(--tab-indicator-color, #2196f3));
    color: #ffffff;
    padding: 0 20px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .tool-btn.primary:hover {
    filter: brightness(1.08);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  .tool-btn.primary:active {
    transform: translateY(0);
  }

  /* Cancel Action */
  .tool-btn.cancel {
    color: var(--text-secondary, #666);
    padding: 0 16px;
  }

  .tool-btn.cancel:hover {
    background: rgba(244, 67, 54, 0.1);
    color: var(--accent-error, #f44336);
  }

  .btn-text {
    line-height: 1;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .btn-text {
      display: none;
    }
    .tool-btn.primary,
    .tool-btn.cancel {
      padding: 0;
      width: 40px;
    }
    .divider {
      display: none;
    }
    .edit-toolbar {
      gap: 4px;
      padding: 4px;
    }
  }
</style>
