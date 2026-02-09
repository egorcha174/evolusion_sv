
import { browser } from '$app/environment';
import { writable, derived, readable, type Readable } from 'svelte/store';
import { haStore } from '../ha/store';
import { activeTabId } from '../app/tabsStore';
import { layoutConfig } from '../app/store';
import { selectProblemEntities } from '../ha/selectors';
import type { HAEntity, HAStoreState, LayoutConfig } from '$lib/types';
import { extractDomain } from '$lib/utils';
import { createBatteryWidgetEntity, createTimerWidgetEntity, type TimerConfig } from '../ha/virtual-devices';

// --- UI Persistence (Existing Sidebar Logic) ---
export const sidebarWidth = writable<number>(280);
const SIDEBAR_STORAGE_KEY = 'evolusion.sidebar.width';
const TIMER_CONFIG_STORAGE_KEY = 'evolusion.widgets.timers';

// --- Timer Config Persistence ---
export const eventTimerConfigs = writable<TimerConfig[]>([]);

// --- Timer Tick (forces timer widgets to re-evaluate) ---
// Visibility-aware: pauses when tab is hidden to save CPU
export const timerNow = readable<number>(Date.now(), (set) => {
  if (!browser) return;

  let intervalId: ReturnType<typeof setInterval> | null = null;

  const tick = () => set(Date.now());

  const start = () => {
    if (!intervalId) {
      intervalId = setInterval(tick, 1000);
    }
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      stop();
    } else {
      tick(); // Immediate update when becoming visible
      start();
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);

  // Start only if visible
  if (!document.hidden) {
    start();
  }

  return () => {
    stop();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
});

// --- Sidebar Widgets Persistence ---
export const sidebarWidgets = writable<{ id: string, type: 'clock' | 'weather' | 'camera' }[]>([
  { id: 'widget-clock', type: 'clock' },
  { id: 'widget-weather', type: 'weather' },
  { id: 'widget-camera', type: 'camera' }
]);
const SIDEBAR_WIDGETS_KEY = 'evolusion.sidebar.widgets';


export function loadUIState(): void {
  if (!browser) return;
  try {
    // Sidebar
    const storedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (storedSidebar) {
      const w = parseInt(storedSidebar, 10);
      if (!isNaN(w) && w >= 200 && w <= 500) {
        sidebarWidth.set(w);
      }
    }

    // Sidebar Widgets
    const storedWidgets = localStorage.getItem(SIDEBAR_WIDGETS_KEY);
    if (storedWidgets) {
      try {
        const parsed = JSON.parse(storedWidgets);
        if (Array.isArray(parsed)) sidebarWidgets.set(parsed);
      } catch (e) {
        console.warn("Failed to parse sidebar widgets", e);
      }
    }

    // Timers
    const storedTimers = localStorage.getItem(TIMER_CONFIG_STORAGE_KEY);
    if (storedTimers) {
      try {
        const parsed = JSON.parse(storedTimers);
        if (Array.isArray(parsed)) {
          eventTimerConfigs.set(parsed);
        }
      } catch (e) {
        console.warn("Failed to parse timers", e);
      }
    }
  } catch (e) {
    console.error('Failed to load UI state', e);
  }
}

export function saveUIState(width: number): void {
  // We only save sidebar here explicitly usually, but let's keep it generic if needed.
  // Ideally we subscribe to stores to auto-save.
}

// Auto-save timers
if (browser) {
  eventTimerConfigs.subscribe(configs => {
    try {
      localStorage.setItem(TIMER_CONFIG_STORAGE_KEY, JSON.stringify(configs));
    } catch (e) { console.error(e); }
  });

  sidebarWidgets.subscribe(widgets => {
    try {
      localStorage.setItem(SIDEBAR_WIDGETS_KEY, JSON.stringify(widgets));
    } catch (e) { console.error(e); }
  });
}

export function resetEventTimer(timerId: string): void {
  const now = new Date().toISOString();
  eventTimerConfigs.update(configs =>
    configs.map(cfg =>
      cfg.id === timerId ? { ...cfg, lastResetDate: now } : cfg
    ),
  );
}

// --- Global UI State ---
export const isSettingsOpen = writable<boolean>(false);
export const isAddDeviceOpen = writable<boolean>(false);
export const isThemeGeneratorOpen = writable<boolean>(false);
export const isServerManagerOpen = writable<boolean>(false);

export function toggleSettings() {
  isSettingsOpen.update(v => !v);
}

export function toggleAddDevice() {
  isAddDeviceOpen.update(v => !v);
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
  [haStore, uiDashboardState, activeTabId, layoutConfig, eventTimerConfigs, timerNow],
  ([
    $haStore,
    $uiState,
    $activeTab,
    $layout,
    $timerConfigs,
    _now,
  ]: [HAStoreState, UIDashboardState, string, LayoutConfig, TimerConfig[], number]) => {
    const allEntities: HAEntity[] = Array.from($haStore.entities.values());

    // --- INJECT VIRTUAL ENTITIES ---
    // 1. Battery Widget
    const batteryWidget = createBatteryWidgetEntity(allEntities);
    if (batteryWidget) {
      allEntities.push(batteryWidget);
    }

    // 2. Timer Widgets
    $timerConfigs.forEach(config => {
      const timerEntity = createTimerWidgetEntity(config);
      allEntities.push(timerEntity);
    });
    // -------------------------------

    // 1. Initial Domain Filter for Dashboard (Allowlist)
    const RELEVANT_DOMAINS = new Set([
      'light', 'switch', 'climate', 'media_player',
      'cover', 'lock', 'script', 'input_boolean',
      'internal' // Allow our virtual domain
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
