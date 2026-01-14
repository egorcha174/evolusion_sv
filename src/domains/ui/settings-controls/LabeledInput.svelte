<script lang="ts">
  let { label, description, id }: { label: string; description?: string; id: string } = $props(); // id is now required
</script>

<div class="grid grid-cols-2 items-center gap-4">
  <div>
    <label for={id} class="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</label>
    {#if description}
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
    {/if}
  </div>
  <div class="flex justify-end">
    <slot />
  </div>
</div>
