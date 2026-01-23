<script lang="ts">
  import { slide } from 'svelte/transition';
  
  let { title, description, initiallyOpen = true, children } = $props<{
    title: string;
    description?: string;
    initiallyOpen?: boolean;
    children?: import('svelte').Snippet;
  }>();

  let isOpen = $state(initiallyOpen);

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="settings-section">
  <button class="section-header" onclick={toggle} type="button">
    <div class="header-content">
      <h3>{title}</h3>
      {#if description}
        <p class="description">{description}</p>
      {/if}
    </div>
    <div class="chevron" class:open={isOpen}>
      <iconify-icon icon="mdi:chevron-down" width="24"></iconify-icon>
    </div>
  </button>

  {#if isOpen}
    <div class="section-body" transition:slide={{ duration: 200 }}>
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .settings-section {
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1.5rem;
    transition: box-shadow 0.2s;
  }

  .settings-section:hover {
    box-shadow: var(--shadow-card);
  }

  .section-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    color: inherit;
  }

  .header-content h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .description {
    margin: 0.25rem 0 0 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .chevron {
    color: var(--text-muted);
    transition: transform 0.2s ease;
    display: flex;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .section-body {
    padding: 0 1.25rem 1.25rem 1.25rem;
    border-top: 1px solid transparent;
  }
  
  /* Add separator if open */
  :global(.settings-section:has(.chevron.open)) .section-body {
     border-top-color: var(--border-divider);
     padding-top: 1.25rem;
  }
</style>