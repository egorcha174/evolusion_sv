
<script lang="ts">
  import { slide } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  
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

<div class="settings-section" class:open={isOpen}>
  <button class="section-header" onclick={toggle} type="button" aria-expanded={isOpen}>
    <div class="header-content">
      <h3>{title}</h3>
      {#if description}
        <p class="description">{description}</p>
      {/if}
    </div>
    <div class="chevron-wrapper">
      <div class="chevron" class:open={isOpen}>
        <iconify-icon icon="mdi:chevron-down" width="24"></iconify-icon>
      </div>
    </div>
  </button>

  {#if isOpen}
    <div class="section-body" transition:slide={{ duration: 250, easing: cubicInOut }}>
      <div class="body-inner">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-section {
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .settings-section:hover, .settings-section.open {
    border-color: var(--border-focus);
  }
  
  .settings-section.open {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .section-header {
    width: 100%;
    display: flex;
    align-items: flex-start; /* Align top for multi-line description */
    justify-content: space-between;
    padding: 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    color: inherit;
    gap: 1rem;
  }

  .header-content {
    flex: 1;
  }

  .header-content h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .description {
    margin: 0.15rem 0 0 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.3;
  }

  .chevron-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding-top: 2px; /* Align with title */
  }

  .chevron {
    color: var(--text-muted);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
  }

  .chevron.open {
    transform: rotate(180deg);
    color: var(--accent-primary);
  }

  .section-body {
    border-top: 1px solid var(--border-divider);
    background: var(--bg-secondary); /* Slight contrast for content area */
  }
  
  .body-inner {
    padding: 1.25rem;
  }
</style>
