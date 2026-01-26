<script lang="ts">
  let {
    label,
    value = $bindable(),
    min = 0,
    max = 100,
    step = 1,
    unit = '',
  } = $props<{
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }>();

  const id = 'range-' + Math.random().toString(36).substr(2, 9);
</script>

<div class="control-group">
  <div class="header">
    <label for={id}>{label}</label>
    <span class="value">{value}{unit}</span>
  </div>
  <input {id} type="range" bind:value {min} {max} {step} class="range" />
</div>

<style>
  .control-group {
    margin-bottom: 1rem;
  }
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
  }
  .value {
    color: var(--accent-primary);
    font-family: monospace;
  }
  .range {
    width: 100%;
    cursor: pointer;
  }
</style>
