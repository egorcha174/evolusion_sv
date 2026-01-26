<script lang="ts">
  import { t } from 'svelte-i18n';
  import { dashboardStore } from '../app/dashboardStore';

  let { tabId, cols, rows } = $props<{ tabId: string; cols: number; rows: number }>();

  let localCols = $state(cols);
  let localRows = $state(rows);

  function apply() {
    dashboardStore.updateTabSettings(tabId, localCols, localRows);
  }

  // Watch for external changes
  $effect(() => {
    localCols = cols;
    localRows = rows;
  });
</script>

<div class="grid-settings">
  <h3>{$t('dashboard.edit')}</h3>

  <div class="control">
    <label for="cols">{$t('dashboard.grid.columns')}: {localCols}</label>
    <input
      id="cols"
      type="range"
      min="4"
      max="16"
      step="1"
      bind:value={localCols}
      onchange={apply}
    />
  </div>

  <div class="control">
    <label for="rows">{$t('dashboard.grid.rows')}: {localRows}</label>
    <input
      id="rows"
      type="range"
      min="3"
      max="12"
      step="1"
      bind:value={localRows}
      onchange={apply}
    />
  </div>

  <div class="hint">
    {$t('dashboard.grid.hint')}
  </div>
</div>

<style>
  .grid-settings {
    position: absolute;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-panel);
    backdrop-filter: blur(12px);
    padding: 1rem;
    border-radius: 12px;
    box-shadow: var(--shadow-modal);
    z-index: 1000;
    width: 280px;
    border: 1px solid var(--border-primary);
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    text-align: center;
    color: var(--text-primary);
  }

  .control {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  input {
    width: 100%;
  }

  .hint {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-align: center;
  }
</style>
