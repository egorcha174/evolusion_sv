<script lang="ts">
  // TODO: Implement dashboard header functionality
  export let title: string = 'Dashboard';
</script>

<div class="bg-gray-600 text-white p-4 flex justify-between items-center">
  <h1 class="text-2xl font-bold">{title}</h1>
  <div>
    <!-- Dashboard specific actions/buttons can go here -->
    <slot />
  </div>
</div>
