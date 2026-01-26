
<script lang="ts">
  let { value = $bindable(), label, onChange } = $props<{ 
    value: string, 
    label?: string,
    onChange?: (val: string) => void
  }>();

  let inputRef: HTMLInputElement;

  function trigger() {
    inputRef?.click();
  }

  function handleInput(e: Event) {
    const newVal = (e.target as HTMLInputElement).value;
    value = newVal;
    if (onChange) onChange(newVal);
  }
</script>

<div class="color-row">
  {#if label}
    <span class="label">{label}</span>
  {/if}
  
  <div class="right-side">
    <span class="hex">{value?.toUpperCase() || '#000000'}</span>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="swatch-wrapper" onclick={trigger}>
      <div class="swatch" style:background-color={value}></div>
      <input 
        bind:this={inputRef}
        type="color" 
        value={value} 
        oninput={handleInput}
        class="hidden-input"
      />
    </div>
  </div>
</div>

<style>
  .color-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0;
    width: 100%;
  }

  .label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .right-side {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .hex {
    font-family: 'SF Mono', 'Roboto Mono', monospace;
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .swatch-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 8px; /* Rounded square like screenshot */
    border: 1px solid rgba(0,0,0,0.1);
    padding: 3px;
    cursor: pointer;
    background: var(--bg-card);
    transition: transform 0.1s;
    position: relative;
    overflow: hidden;
  }

  .swatch-wrapper:active {
    transform: scale(0.95);
  }

  .swatch {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
  }

  .hidden-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
</style>
