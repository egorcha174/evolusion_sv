<script lang="ts">
  let {
    id = Math.random().toString(36).substring(7),
    label,
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    unit = "",
    disabled = false,
    ...rest
  } = $props<{
    id?: string;
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    [key: string]: any;
  }>();
</script>

<div class="control-group">
  <div class="header">
    <label for={id}>{label}</label>
    <span class="value">{value}{unit}</span>
  </div>
  <input
    {id}
    type="range"
    bind:value
    {min}
    {max}
    {step}
    {disabled}
    {...rest}
    class="range"
  />
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
