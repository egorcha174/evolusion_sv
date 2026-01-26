<script lang="ts">
  let {
    label,
    checked = $bindable(),
    disabled = false,
  } = $props<{
    label: string;
    checked: boolean;
    disabled?: boolean;
  }>();

  const id = 'switch-' + Math.random().toString(36).substr(2, 9);
</script>

<div class="control-group">
  <label class="label" for={id}>
    {label}
  </label>

  <button
    class="switch"
    class:checked
    {disabled}
    onclick={() => !disabled && (checked = !checked)}
    role="switch"
    aria-checked={checked}
    {id}
  >
    <div class="thumb"></div>
  </button>
</div>

<style>
  .control-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  .label {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
  }

  .switch {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--bg-chip-active, #e0e0e0);
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
    padding: 2px;
    flex-shrink: 0;
  }

  /* Dark mode fallback adjustment if vars aren't set perfectly */
  :global([data-theme='dark']) .switch {
    background: #4a4a4a;
  }

  .switch.checked {
    background: var(--accent-primary);
  }

  .switch:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .thumb {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .switch.checked .thumb {
    transform: translateX(20px);
  }
</style>
