
import { derived } from 'svelte/store';
import { haStore } from './store';
import type { HAEntity, HAStoreState } from '$lib/types';
import { extractDomain } from '$lib/utils';

// Memoized grouping of entities by domain
export const entitiesByDomain = derived(haStore, ($store: HAStoreState) => {
  const map = new Map<string, HAEntity[]>();
  for (const entity of $store.entities.values()) {
    const domain = extractDomain(entity.entity_id);
    if (!map.has(domain)) {
      map.set(domain, []);
    }
    map.get(domain)!.push(entity);
  }
  return map;
});

// Selector creators (to be used in components or other stores)
export const selectEntitiesByDomain = (domain: string) => derived(entitiesByDomain, ($map) => {
  return $map.get(domain) || [];
});

export const selectUnavailableEntities = derived(haStore, ($store: HAStoreState) => {
  return Array.from($store.entities.values()).filter((e: HAEntity) => e.state === 'unavailable' || e.state === 'unknown');
});
