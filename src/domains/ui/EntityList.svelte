
<script lang="ts">
  import type { HAEntity } from '$lib/types';
  import EntityRow from './EntityRow.svelte';
  import VirtualList from './VirtualList.svelte';
  
  let { entities = [] }: { entities: HAEntity[] } = $props();
  
  // Estimate height of EntityRow (padding + content + border)
  const ITEM_HEIGHT = 72; 
</script>

<div class="entity-list-container">
  <VirtualList 
    items={entities} 
    itemHeight={ITEM_HEIGHT} 
    height="calc(100vh - 200px)"
    keyField="entity_id"
  >
    {#snippet default({ item })}
      <div class="row-wrapper">
        <EntityRow entity={item} />
      </div>
    {/snippet}
  </VirtualList>
</div>

<style>
  .entity-list-container {
    width: 100%;
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid var(--border-primary);
    overflow: hidden;
  }
  
  .row-wrapper {
    padding: 4px 8px; /* External padding for row spacing */
    height: 100%;
    box-sizing: border-box;
  }
</style>
