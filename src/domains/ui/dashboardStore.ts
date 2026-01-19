
import { derived } from 'svelte/store';
import { entityList } from '../ha/store';
import { activeTabId } from '../app/tabsStore';
import { layoutConfig } from '../app/store';
import { extractDomain } from '$lib/utils';
import type { HAEntity } from '$lib/types';

// We extend the entity with an 'id' for svelte-dnd-action compatibility
export type GridItem = HAEntity & { id: string };

export const dashboardItems = derived(
  [entityList, activeTabId, layoutConfig],
  ([$entities, $tab, $layout]) => {
    // 1. Filter for dashboard-relevant entities
    // Optimized: Check domain allowlist
    const RELEVANT_DOMAINS = new Set([
      'light', 'switch', 'climate', 'media_player', 
      'cover', 'lock', 'script', 'input_boolean'
    ]);

    let relevant = $entities.filter(entity => {
      const domain = extractDomain(entity.entity_id);
      return RELEVANT_DOMAINS.has(domain);
    });

    // 2. Filter by Active Tab (Fake Room Logic for MVP)
    if ($tab !== 'home') {
      const searchTerms = $tab.split('_'); // e.g. "living_room" -> ["living", "room"]
      const lowerTerms = searchTerms.map(t => t.toLowerCase());
      
      relevant = relevant.filter(e => {
        const name = (e.attributes.friendly_name || '').toLowerCase();
        const id = e.entity_id.toLowerCase();
        return lowerTerms.some(term => name.includes(term) || id.includes(term));
      });
    }

    // 3. Apply Sort Order (Only for Home tab)
    let sorted: GridItem[] = [];
    
    if ($tab === 'home' && $layout.cardOrder.length > 0) {
      // Create a map for O(1) lookups
      const entityMap = new Map(relevant.map(e => [e.entity_id, e]));
      
      // Add items in order
      for (const id of $layout.cardOrder) {
        if (entityMap.has(id)) {
          sorted.push(entityMap.get(id) as GridItem);
          entityMap.delete(id); // Remove handled items
        }
      }
      
      // Append remaining new items
      for (const entity of entityMap.values()) {
        sorted.push(entity as GridItem);
      }
    } else {
      sorted = relevant as GridItem[];
    }

    // Add 'id' required by dndzone
    return sorted.map(e => ({ ...e, id: e.entity_id }));
  }
);
