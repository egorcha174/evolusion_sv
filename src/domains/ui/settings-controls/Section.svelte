<script lang="ts">
  import Icon from '@iconify/svelte';

  const { title, description = undefined, defaultOpen = false, children } = $props<{
    title: string;
    description?: string;
    defaultOpen?: boolean;
    children: any; // For slot content
  }>();

  let isOpen = $state(defaultOpen);
  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
  <button on:click={toggle} class="w-full flex justify-between items-center text-left group">
    <div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
      {#if description}
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      {/if}
    </div>
    <Icon icon="mdi:chevron-down" class={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
  {#if isOpen}
    <div class="mt-4 space-y-4">
      <slot>{children}</slot>
    </div>
  {/if}
</div>
