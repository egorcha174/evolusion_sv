<script lang="ts">
  import type { HAEntity } from '$lib/types';
  import EntityRow from './EntityRow.svelte';
  
  let { entities = [] }: { entities: HAEntity[] } = $props();
</script>

<div class="entity-list">
  {#each entities as entity (entity.entity_id)}
    <EntityRow {entity} />
  {/each}
</div>

<style>
  .entity-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
