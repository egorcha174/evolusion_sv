<script lang="ts">
  let {
    label,
    value = $bindable(),
    type = 'text',
    placeholder = '',
    hint = '',
    disabled = false,
  } = $props<{
    label: string;
    value: string | number;
    type?: string;
    placeholder?: string;
    hint?: string;
    disabled?: boolean;
  }>();

  // Generate unique ID for accessibility association
  const id = 'input-' + Math.random().toString(36).substr(2, 9);
</script>

<div class="control-group">
  <label class="label" for={id}>
    {label}
  </label>
  <input {id} {type} bind:value {placeholder} {disabled} class="input" />
  {#if hint}
    <span class="hint">{hint}</span>
  {/if}
</div>

<style>
  .control-group {
    margin-bottom: 1rem;
  }
  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--text-primary);
  }
  .input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-input);
    border-radius: 8px;
    background: var(--bg-input);
    color: var(--text-primary);
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  .input:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
  .input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .hint {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
</style>
