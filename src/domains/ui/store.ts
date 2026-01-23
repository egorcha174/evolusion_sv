
import { browser } from '$app/environment';
import { writable, derived, type Readable } from 'svelte/store';
import { haStore } from '../ha/store';
import { activeTabId } from '../app/tabsStore';
import { layoutConfig } from '../app/store';
import { selectProblemEntities } from '../ha/selectors';
import type { HAEntity, HAStoreState, LayoutConfig } from '$lib/types';
import { extractDomain } from '$lib/utils';

// --- UI Persistence (Existing Sidebar Logic) ---
export const sidebarWidth = writable<number>(280);
const SIDEBAR_STORAGE_KEY = 'evolusion.sidebar.width';

export function loadUIState(): void {
  if (!browser) return;
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored) {
      const w = parseInt(stored, 10);
      if (!isNaN(w) && w >= 200 && w <= 500) {
        sidebarWidth.set(w);
      }
    }
  } catch (e) {
    console.error('Failed to load UI state', e);
  }
}

export function saveUIState(width: number): void {
  if (!browser) return;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, width.toString());
    sidebarWidth.set(width);
  } catch (e) {
    console.error('Failed to save UI state', e);
  }
}

// --- Global UI State ---
export const isSettingsOpen = writable<boolean>(false);

export function toggleSettings() {
  isSettingsOpen.update(v => !v);
}

// --- New UI Dashboard State ---

export interface UISortMode {
  key: 'name' | 'domain' | 'state' | 'last_changed';
  direction: 'asc' | 'desc';
}

export interface UIFilters {
  domain?: string;
  search?: string;
  showOnlyProblem?: boolean;
}

export interface UIDashboardState {
  filters: UIFilters;
  sort: UISortMode;
}

const initialDashboardState: UIDashboardState = {
  filters: {
    search: '',
    domain: undefined,
    showOnlyProblem: false
  },
  sort: {
    key: 'name',
    direction: 'asc'
  }
};

export const uiDashboardState = writable<UIDashboardState>(initialDashboardState);

// --- Selectors for UI ---

// Helper to filter/sort entities
function processEntities(
  entities: HAEntity[], 
  filters: UIFilters, 
  sort: UISortMode, 
  problemEntitiesSet: Set<string>
): HAEntity[] {
  let result = entities;

  // 1. Filter: Problems
  if (filters.showOnlyProblem) {
    result = result.filter(e => problemEntitiesSet.has(e.entity_id));
  }

  // 2. Filter: Domain
  if (filters.domain) {
    result = result.filter(e => extractDomain(e.entity_id) === filters.domain);
  }

  // 3. Filter: Search
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(e => 
      e.entity_id.includes(term) || 
      (e.attributes.friendly_name?.toLowerCase().includes(term))
    );
  }

  // 4. Sort
  result.sort((a, b) => {
    let valA, valB;

    switch (sort.key) {
      case 'domain':
        valA = extractDomain(a.entity_id);
        valB = extractDomain(b.entity_id);
        break;
      case 'state':
        valA = a.state;
        valB = b.state;
        break;
      case 'last_changed':
        valA = a.last_changed || '';
        valB = b.last_changed || '';
        break;
      case 'name':
      default:
        valA = a.attributes.friendly_name || a.entity_id;
        valB = b.attributes.friendly_name || b.entity_id;
        break;
    }

    if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
}

// Selector for EntityList page
export const selectFilteredEntities = derived(
  [haStore, uiDashboardState],
  ([$haStore, $uiState]) => {
    return processEntities(
      Array.from($haStore.entities.values()),
      $uiState.filters,
      $uiState.sort,
      $haStore.problemEntities
    );
  }
);

// Extended Grid Item Type for DND
export type DashboardGridItem = HAEntity & { id: string };

// Selector for DashboardGrid (Cards)
export const selectVisibleDashboardCards = derived(
  [haStore, uiDashboardState, activeTabId, layoutConfig],
  ([$haStore, $uiState, $activeTab, $layout]: [HAStoreState, UIDashboardState, string, LayoutConfig]) => {
    const allEntities: HAEntity[] = Array.from($haStore.entities.values());
    
    // 1. Initial Domain Filter for Dashboard (Allowlist)
    const RELEVANT_DOMAINS = new Set([
      'light', 'switch', 'climate', 'media_player', 
      'cover', 'lock', 'script', 'input_boolean'
    ]);

    let relevant: HAEntity[] = allEntities.filter(entity => {
      const domain = extractDomain(entity.entity_id);
      return RELEVANT_DOMAINS.has(domain);
    });

    // 2. Tab Filter (Fake Room Logic)
    if ($activeTab !== 'home') {
      const searchTerms = $activeTab.split('_');
      const lowerTerms = searchTerms.map(t => t.toLowerCase());
      
      relevant = relevant.filter(e => {
        const name = (e.attributes.friendly_name || '').toLowerCase();
        const id = e.entity_id.toLowerCase();
        return lowerTerms.some(term => name.includes(term) || id.includes(term));
      });
    }

    // 3. Apply UI State Filters (Search/Domain from UI controls)
    // Note: We ignore 'showOnlyProblem' for the main dashboard usually, but can apply it if needed.
    // Here we apply strict dashboard logic first, then optional UI filters if user typed something.
    if ($uiState.filters.search || $uiState.filters.domain) {
      relevant = processEntities(relevant, $uiState.filters, $uiState.sort, $haStore.problemEntities);
    }

    // 4. Custom Sort Order (Only for Home Tab & No Search active)
    let sorted: DashboardGridItem[] = [];
    const isDefaultView = $activeTab === 'home' && !$uiState.filters.search && !$uiState.filters.domain;

    if (isDefaultView && $layout.cardOrder.length > 0) {
      // Cast array to specific tuple type to help Map constructor inference
      const entries = relevant.map(e => [e.entity_id, e] as const);
      const entityMap = new Map<string, HAEntity>(entries);
      
      for (const id of $layout.cardOrder) {
        if (entityMap.has(id)) {
          const entity = entityMap.get(id)!;
          sorted.push({ ...entity, id });
          entityMap.delete(id);
        }
      }
      for (const entity of entityMap.values()) {
        sorted.push({ ...entity, id: entity.entity_id });
      }
    } else {
      // If not custom sorting, use the UI Sort preference
      if (!isDefaultView) {
        relevant = processEntities(relevant, { ...$uiState.filters, search: '', domain: undefined }, $uiState.sort, $haStore.problemEntities);
      }
      sorted = relevant.map(e => ({ ...e, id: e.entity_id }));
    }

    return sorted;
  }
);
