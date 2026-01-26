<script lang="ts">
  import type { HAEntity } from '$lib/types';
  import EntityRow from './EntityRow.svelte';
  import VirtualList from './VirtualList.svelte';

  let { entities = [] }: { entities: HAEntity[] } = $props();

  // Estimate height of EntityRow (padding + content + border)
  const ITEM_HEIGHT = 72;
</script>

<div class="entity-list-container">
  <VirtualList items={entities} itemHeight={ITEM_HEIGHT} height="100%" keyField="entity_id">
    {#snippet children({ item })}
      <div class="row-wrapper">
        <EntityRow entity={item} />
      </div>
    {/snippet}
  </VirtualList>
</div>

<style>
  .entity-list-container {
    width: 100%;
    height: 100%; /* Fill parent */
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid var(--border-primary);
    overflow: hidden;
    box-sizing: border-box;
  }

  .row-wrapper {
    padding: 4px 8px; /* External padding for row spacing */
    height: 100%;
    box-sizing: border-box;
  }
</style>
