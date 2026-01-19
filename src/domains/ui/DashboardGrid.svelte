<script lang="ts">
  import { entityList } from '../ha/store';
  import DeviceCard from './DeviceCard.svelte';
  import { extractDomain } from '$lib/utils';
  
  // Filter for dashboard-relevant entities
  let dashboardEntities = $derived($entityList.filter(entity => {
    const domain = extractDomain(entity.entity_id);
    return ['light', 'switch', 'climate', 'media_player', 'cover', 'lock', 'script'].includes(domain);
  }));
</script>

<div class="dashboard-grid">
  {#if dashboardEntities.length === 0}
    <div class="empty-state">
      No dashboard devices found. Add lights, switches, or media players to Home Assistant.
    </div>
  {:else}
    <div class="grid">
      {#each dashboardEntities as entity (entity.entity_id)}
        <DeviceCard {entity} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .dashboard-grid {
    margin-top: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem;
    background: #fff;
    border-radius: 8px;
    color: #757575;
    border: 1px dashed #ccc;
  }
  
  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
