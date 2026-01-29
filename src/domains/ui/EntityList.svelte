<script lang="ts">
  import type { HAEntity } from "$lib/types";
  import EntityRow from "./EntityRow.svelte";
  import DeviceCard from "./DeviceCard.svelte";
  import VirtualList from "./VirtualList.svelte";
  import { fade } from "svelte/transition";

  let {
    entities = [],
    viewMode = "grid",
    onAddToTab,
  }: {
    entities: HAEntity[];
    viewMode?: "list" | "grid";
    onAddToTab?: (id: string, name: string) => void;
  } = $props();

  // Estimate height of EntityRow (padding + content + border)
  const ITEM_HEIGHT = 80;
</script>

<div class="entity-list-container" class:list-mode={viewMode === "list"}>
  {#if viewMode === "list"}
    <div class="virtual-list-wrapper" in:fade={{ duration: 300 }}>
      <VirtualList
        items={entities}
        itemHeight={ITEM_HEIGHT}
        height="100%"
        keyField="entity_id"
      >
        {#snippet children({ item })}
          <div class="row-wrapper">
            <EntityRow
              entity={item}
              onAddToTab={() =>
                onAddToTab?.(
                  item.entity_id,
                  item.attributes.friendly_name || item.entity_id,
                )}
            />
          </div>
        {/snippet}
      </VirtualList>
    </div>
  {:else}
    <div class="grid-wrapper" in:fade={{ duration: 300 }}>
      {#each entities as entity (entity.entity_id)}
        <div class="grid-item">
          <DeviceCard
            {entity}
            onAddToTab={() =>
              onAddToTab?.(
                entity.entity_id,
                entity.attributes.friendly_name || entity.entity_id,
              )}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .entity-list-container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent container from growing */
  }

  .virtual-list-wrapper {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .entity-list-container.list-mode {
    background: var(--bg-card-glass, rgba(255, 255, 255, 0.4));
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid var(--border-light, rgba(255, 255, 255, 0.1));
  }

  .row-wrapper {
    padding: 0px 12px;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }

  .grid-wrapper {
    display: grid;
    /* Increased min-width to prevent squishing and overlap */
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
    overflow-y: auto;
    height: 100%;
    align-content: start;
  }

  /* Handle scrolling for the grid */
  .grid-wrapper::-webkit-scrollbar {
    width: 6px;
  }
  .grid-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }
  .grid-wrapper::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  .grid-wrapper::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
    border-color: transparent;
  }

  .grid-item {
    /* More flexible height/aspect-ratio to prevent content overlapping */
    min-height: 130px;
    height: auto;
  }
</style>
