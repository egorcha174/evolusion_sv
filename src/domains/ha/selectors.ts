import { derived, type Readable } from 'svelte/store';
import { haStore } from './store';
import type { HAEntity, HAStoreState } from '$lib/types';
import { extractDomain } from '$lib/utils';

// --- Domain Selector Memoization ---
// Cache selectors to prevent creating new derived stores on every component mount
const entitiesByDomainSelectors = new Map<string, Readable<HAEntity[]>>();

export function selectEntitiesByDomain(domain: string): Readable<HAEntity[]> {
  if (!entitiesByDomainSelectors.has(domain)) {
    const selector = derived(haStore, ($store: HAStoreState) => {
      // Optimization: Iterate once, filtering is O(N) but we only do it when store updates.
      // A more advanced approach would be to maintain domain indexes in the store,
      // but this is sufficient for typical HA instance sizes.
      const result: HAEntity[] = [];
      for (const entity of $store.entities.values()) {
        if (extractDomain(entity.entity_id) === domain) {
          result.push(entity);
        }
      }
      return result;
    });
    entitiesByDomainSelectors.set(domain, selector);
  }
  return entitiesByDomainSelectors.get(domain)!;
}

// --- Optimized Problem Entities Selector ---
// Uses the set maintained in the store (O(M) where M is number of problems, instead of O(N))
export const selectProblemEntities = derived(haStore, ($store: HAStoreState) => {
  const problems: HAEntity[] = [];
  for (const id of $store.problemEntities) {
    const entity = $store.entities.get(id);
    if (entity) {
      problems.push(entity);
    }
  }
  return problems;
});
