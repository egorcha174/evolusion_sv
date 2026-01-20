import { w as writable, d as derived } from "./index.js";
const layoutConfig = writable({
  cardOrder: [],
  timestamp: Date.now()
});
const haStore = writable({
  isConnected: false,
  isLoading: false,
  error: null,
  entities: /* @__PURE__ */ new Map(),
  problemEntities: /* @__PURE__ */ new Set(),
  latency: void 0
});
derived(haStore, ($store) => {
  return Array.from($store.entities.values());
});
const INITIAL_TABS = [
  { id: "home", title: "Dashboard", icon: "mdi:view-dashboard" },
  { id: "living_room", title: "Living Room", icon: "mdi:sofa" },
  { id: "bedroom", title: "Bedroom", icon: "mdi:bed" }
];
function createTabsStore() {
  const { subscribe, set, update } = writable(INITIAL_TABS);
  return {
    subscribe,
    addTab: () => update((tabs2) => {
      const newId = `tab_${Date.now()}`;
      return [...tabs2, { id: newId, title: `New Tab ${tabs2.length + 1}` }];
    }),
    removeTab: (id) => update((tabs2) => tabs2.filter((t) => t.id !== id)),
    reset: () => set(INITIAL_TABS)
  };
}
const tabs = createTabsStore();
const activeTabId = writable(INITIAL_TABS[0].id);
const isEditMode = writable(false);
function extractDomain(entityId) {
  return entityId.split(".")[0];
}
function isToggleable(domain) {
  return ["light", "switch", "cover", "lock", "input_boolean", "automation", "script"].includes(domain);
}
derived(haStore, ($store) => {
  const problems = [];
  for (const id of $store.problemEntities) {
    const entity = $store.entities.get(id);
    if (entity) {
      problems.push(entity);
    }
  }
  return problems;
});
const initialDashboardState = {
  filters: {
    search: "",
    domain: void 0,
    showOnlyProblem: false
  },
  sort: {
    key: "name",
    direction: "asc"
  }
};
const uiDashboardState = writable(initialDashboardState);
function processEntities(entities, filters, sort, problemEntitiesSet) {
  let result = entities;
  if (filters.showOnlyProblem) {
    result = result.filter((e) => problemEntitiesSet.has(e.entity_id));
  }
  if (filters.domain) {
    result = result.filter((e) => extractDomain(e.entity_id) === filters.domain);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (e) => e.entity_id.includes(term) || e.attributes.friendly_name?.toLowerCase().includes(term)
    );
  }
  result.sort((a, b) => {
    let valA, valB;
    switch (sort.key) {
      case "domain":
        valA = extractDomain(a.entity_id);
        valB = extractDomain(b.entity_id);
        break;
      case "state":
        valA = a.state;
        valB = b.state;
        break;
      case "last_changed":
        valA = a.last_changed || "";
        valB = b.last_changed || "";
        break;
      case "name":
      default:
        valA = a.attributes.friendly_name || a.entity_id;
        valB = b.attributes.friendly_name || b.entity_id;
        break;
    }
    if (valA < valB) return sort.direction === "asc" ? -1 : 1;
    if (valA > valB) return sort.direction === "asc" ? 1 : -1;
    return 0;
  });
  return result;
}
const selectFilteredEntities = derived(
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
derived(
  [haStore, uiDashboardState, activeTabId, layoutConfig],
  ([$haStore, $uiState, $activeTab, $layout]) => {
    const allEntities = Array.from($haStore.entities.values());
    const RELEVANT_DOMAINS = /* @__PURE__ */ new Set([
      "light",
      "switch",
      "climate",
      "media_player",
      "cover",
      "lock",
      "script",
      "input_boolean"
    ]);
    let relevant = allEntities.filter((entity) => {
      const domain = extractDomain(entity.entity_id);
      return RELEVANT_DOMAINS.has(domain);
    });
    if ($activeTab !== "home") {
      const searchTerms = $activeTab.split("_");
      const lowerTerms = searchTerms.map((t) => t.toLowerCase());
      relevant = relevant.filter((e) => {
        const name = (e.attributes.friendly_name || "").toLowerCase();
        const id = e.entity_id.toLowerCase();
        return lowerTerms.some((term) => name.includes(term) || id.includes(term));
      });
    }
    if ($uiState.filters.search || $uiState.filters.domain) {
      relevant = processEntities(relevant, $uiState.filters, $uiState.sort, $haStore.problemEntities);
    }
    let sorted = [];
    const isDefaultView = $activeTab === "home" && !$uiState.filters.search && !$uiState.filters.domain;
    if (isDefaultView && $layout.cardOrder.length > 0) {
      const entries = relevant.map((e) => [e.entity_id, e]);
      const entityMap = new Map(entries);
      for (const id of $layout.cardOrder) {
        if (entityMap.has(id)) {
          const entity = entityMap.get(id);
          sorted.push({ ...entity, id });
          entityMap.delete(id);
        }
      }
      for (const entity of entityMap.values()) {
        sorted.push({ ...entity, id: entity.entity_id });
      }
    } else {
      if (!isDefaultView) {
        relevant = processEntities(relevant, { ...$uiState.filters, search: "", domain: void 0 }, $uiState.sort, $haStore.problemEntities);
      }
      sorted = relevant.map((e) => ({ ...e, id: e.entity_id }));
    }
    return sorted;
  }
);
export {
  activeTabId as a,
  isToggleable as b,
  extractDomain as e,
  haStore as h,
  isEditMode as i,
  selectFilteredEntities as s,
  tabs as t,
  uiDashboardState as u
};
