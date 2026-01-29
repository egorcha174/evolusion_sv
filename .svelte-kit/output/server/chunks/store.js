import { w as writable, d as derived, g as get } from "./index.js";
const PBKDF2_ITERATIONS = 1e5;
const SALT_SIZE = 16;
const KEY_LENGTH = 256;
function strToBuf(str) {
  return new TextEncoder().encode(str);
}
function bufToBase64(buf) {
  let binary = "";
  const len = buf.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary);
}
function base64ToBuf(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function generateSalt() {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  return bufToBase64(salt);
}
async function deriveKey(pin, saltBase64) {
  const salt = base64ToBuf(saltBase64);
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    strToBuf(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    // Key is non-extractable!
    ["encrypt", "decrypt"]
  );
}
async function encrypt(data, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = strToBuf(data);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return bufToBase64(combined);
}
async function decrypt(encryptedBase64, key) {
  const combined = base64ToBuf(encryptedBase64);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}
async function createVerifier(key) {
  return encrypt("valid-pin-verifier", key);
}
async function checkVerifier(verifierBase64, key) {
  try {
    const result = await decrypt(verifierBase64, key);
    return result === "valid-pin-verifier";
  } catch (e) {
    return false;
  }
}
const SALT_KEY = "auth_salt";
const VERIFIER_KEY = "auth_verifier";
const AUTO_LOGIN_KEY = "auth_auto_pin";
function createSessionStore() {
  const { subscribe, set, update } = writable({
    state: "loading",
    key: null,
    error: null,
    isAutoLogin: false
  });
  return {
    subscribe,
    init: async () => {
      {
        update((s) => ({ ...s, state: "setup" }));
        return;
      }
    },
    verifyPin: async (pin) => {
      return false;
    },
    unlock: async (pin) => {
      update((s) => ({ ...s, error: null }));
      const salt = localStorage.getItem(SALT_KEY);
      const verifier = localStorage.getItem(VERIFIER_KEY);
      if (!salt || !verifier) {
        update((s) => ({ ...s, state: "setup" }));
        return false;
      }
      try {
        const key = await deriveKey(pin, salt);
        const isValid = await checkVerifier(verifier, key);
        if (isValid) {
          const isAuto = !!localStorage.getItem(AUTO_LOGIN_KEY);
          update((s) => ({ ...s, state: "active", key, isAutoLogin: isAuto }));
          return true;
        } else {
          update((s) => ({ ...s, error: "Invalid PIN" }));
          return false;
        }
      } catch (e) {
        console.error(e);
        update((s) => ({ ...s, error: "Unlock failed" }));
        return false;
      }
    },
    setup: async (pin) => {
      try {
        const salt = generateSalt();
        const key = await deriveKey(pin, salt);
        const verifier = await createVerifier(key);
        localStorage.setItem(SALT_KEY, salt);
        localStorage.setItem(VERIFIER_KEY, verifier);
        localStorage.removeItem(AUTO_LOGIN_KEY);
        localStorage.removeItem("app_server_config_encrypted");
        update((s) => ({ ...s, state: "active", key, error: null, isAutoLogin: false }));
        return true;
      } catch (e) {
        console.error(e);
        update((s) => ({ ...s, error: "Setup failed" }));
        return false;
      }
    },
    changePin: async (newPin) => {
      try {
        const salt = generateSalt();
        const key = await deriveKey(newPin, salt);
        const verifier = await createVerifier(key);
        localStorage.setItem(SALT_KEY, salt);
        localStorage.setItem(VERIFIER_KEY, verifier);
        if (localStorage.getItem(AUTO_LOGIN_KEY)) {
          localStorage.setItem(AUTO_LOGIN_KEY, btoa(newPin));
        }
        update((s) => ({ ...s, key, error: null }));
        return true;
      } catch (e) {
        console.error(e);
        update((s) => ({ ...s, error: "Change PIN failed" }));
        return false;
      }
    },
    lock: () => {
      update((s) => ({ ...s, state: "locked", key: null }));
    },
    enableAutoLogin: (pin) => {
      return;
    },
    disableAutoLogin: () => {
      return;
    }
  };
}
const session = createSessionStore();
const appState = writable({
  activeServer: null,
  savedServers: []
});
const layoutConfig = writable({
  cardOrder: [],
  timestamp: Date.now()
});
const DEFAULT_COLS = 8;
const DEFAULT_ROWS = 6;
function createDefaultTabConfig(id, title) {
  return {
    id,
    title,
    icon: "mdi:view-dashboard",
    gridColumns: DEFAULT_COLS,
    gridRows: DEFAULT_ROWS,
    cards: [],
    provisioned: false
  };
}
const initialState = {
  version: 3,
  tabOrder: ["welcome"],
  tabs: {
    "welcome": {
      id: "welcome",
      title: "Welcome",
      icon: "mdi:hand-wave",
      gridColumns: DEFAULT_COLS,
      gridRows: DEFAULT_ROWS,
      cards: [],
      provisioned: true
      // Prevent auto-fill so it stays empty with Welcome message
    }
  },
  templates: {}
};
function createDashboardStore() {
  const { subscribe, set, update } = writable(initialState);
  return {
    subscribe,
    set,
    // Initialize or load configuration
    async init() {
      return;
    },
    // Save current state
    async save() {
      return;
    },
    // --- Tab Management ---
    ensureTabConfig(tabId) {
      update((state) => {
        if (!state.tabs[tabId]) {
          const newTab = createDefaultTabConfig(tabId, "New Tab");
          return {
            ...state,
            tabOrder: [...state.tabOrder, tabId],
            tabs: {
              ...state.tabs,
              [tabId]: newTab
            }
          };
        }
        return state;
      });
    },
    addTab(title) {
      const id = `tab_${Date.now()}`;
      update((state) => ({
        ...state,
        tabOrder: [...state.tabOrder, id],
        tabs: {
          ...state.tabs,
          [id]: createDefaultTabConfig(id, title)
        }
      }));
      this.save();
      return id;
    },
    deleteTab(id) {
      update((state) => {
        if (state.tabOrder.length <= 1) return state;
        const newTabs = { ...state.tabs };
        delete newTabs[id];
        return {
          ...state,
          tabOrder: state.tabOrder.filter((t) => t !== id),
          tabs: newTabs
        };
      });
      this.save();
    },
    renameTab(id, title) {
      update((state) => {
        if (!state.tabs[id]) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [id]: { ...state.tabs[id], title }
          }
        };
      });
      this.save();
    },
    clearTab(id) {
      update((state) => {
        if (!state.tabs[id]) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            // Mark as provisioned so auto-sync doesn't refill it immediately
            [id]: { ...state.tabs[id], cards: [], provisioned: true }
          }
        };
      });
      this.save();
    },
    updateTabSettings(tabId, cols, rows) {
      update((state) => {
        const tab = state.tabs[tabId] || createDefaultTabConfig(tabId, tabId);
        const newTabs = {
          ...state.tabs,
          [tabId]: { ...tab, gridColumns: cols, gridRows: rows }
        };
        return { ...state, tabs: newTabs };
      });
      this.save();
    },
    // --- Template Management ---
    saveTemplate(template) {
      update((state) => ({
        ...state,
        templates: {
          ...state.templates,
          [template.id]: template
        }
      }));
      this.save();
    },
    deleteTemplate(id) {
      update((state) => {
        const newTemplates = { ...state.templates };
        delete newTemplates[id];
        return { ...state, templates: newTemplates };
      });
      this.save();
    },
    // --- Card Management ---
    replaceTabCards(tabId, cards) {
      update((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            // Explicit user action implies this tab is now manually managed (provisioned)
            [tabId]: { ...tab, cards, provisioned: true }
          }
        };
      });
      this.save();
    },
    updateCardPosition(tabId, cardId, pos) {
      update((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        const cards = tab.cards.map((c) => c.id === cardId ? { ...c, position: pos } : c);
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards, provisioned: true }
          }
        };
      });
      this.save();
    },
    assignTemplateToCard(tabId, cardId, templateId) {
      update((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        const cards = tab.cards.map(
          (c) => c.id === cardId ? { ...c, templateId } : c
        );
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards, provisioned: true }
          }
        };
      });
      this.save();
    },
    addCard(tabId, entityId) {
      update((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        let x = 0, y = 0;
        let found = false;
        const occupied = /* @__PURE__ */ new Set();
        tab.cards.forEach((c) => {
          for (let dx = 0; dx < c.position.w; dx++) {
            for (let dy = 0; dy < c.position.h; dy++) {
              occupied.add(`${c.position.x + dx},${c.position.y + dy}`);
            }
          }
        });
        const cols = tab.gridColumns;
        const rows = tab.gridRows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (!occupied.has(`${c},${r}`)) {
              x = c;
              y = r;
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (!found) {
          x = 0;
          y = rows;
        }
        const newCard = {
          id: `card_${Date.now()}`,
          entityId,
          position: { x, y, w: 1, h: 1 }
        };
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards: [...tab.cards, newCard], provisioned: true }
          }
        };
      });
      this.save();
    },
    deleteCard(tabId, cardId) {
      update((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [tabId]: { ...tab, cards: tab.cards.filter((c) => c.id !== cardId), provisioned: true }
          }
        };
      });
      this.save();
    },
    // Auto-layout helper: Takes a list of entities and arranges them in the grid if not already present
    syncEntitiesToGrid(tabId, entities) {
      update((state) => {
        const tab = state.tabs[tabId] || createDefaultTabConfig(tabId, tabId);
        if (tab.provisioned) return state;
        const existingMap = new Map(tab.cards.map((c) => [c.entityId, c]));
        const newCards = [];
        let x = 0;
        let y = 0;
        const cols = tab.gridColumns;
        let maxY = 0;
        tab.cards.forEach((c) => {
          newCards.push(c);
          maxY = Math.max(maxY, c.position.y + c.position.h);
        });
        if (newCards.length > 0) {
          y = Math.ceil(maxY);
        }
        let addedCount = 0;
        entities.forEach((entity) => {
          if (!existingMap.has(entity.entity_id)) {
            const w = 1;
            const h = 1;
            if (x + w > cols) {
              x = 0;
              y++;
            }
            newCards.push({
              id: entity.entity_id,
              // Use entity_id as ID for simplicity
              entityId: entity.entity_id,
              position: { x, y, w, h }
            });
            x += w;
            addedCount++;
          }
        });
        if (addedCount > 0 || !tab.provisioned) {
          return {
            ...state,
            tabs: {
              ...state.tabs,
              [tabId]: { ...tab, cards: newCards, provisioned: true }
            }
          };
        }
        return state;
      });
    }
  };
}
const dashboardStore = createDashboardStore();
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
const tabs = derived(dashboardStore, ($dashboard) => {
  const order = $dashboard.tabOrder || [];
  const tabConfigs = $dashboard.tabs || {};
  return order.map((id) => tabConfigs[id]).filter(Boolean).map((config) => ({
    id: config.id,
    title: config.title || config.id,
    icon: config.icon
  }));
});
const activeTabId = writable("home");
const isEditMode = writable(false);
dashboardStore.subscribe(($d) => {
  const current = get(activeTabId);
  if ($d.tabOrder && $d.tabOrder.length > 0) {
    if (!$d.tabOrder.includes(current)) {
      activeTabId.set($d.tabOrder[0]);
    }
  }
});
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
const isSettingsOpen = writable(false);
const isAddDeviceOpen = writable(false);
const isThemeGeneratorOpen = writable(false);
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
const selectVisibleDashboardCards = derived(
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
  appState as b,
  isSettingsOpen as c,
  dashboardStore as d,
  extractDomain as e,
  isAddDeviceOpen as f,
  isThemeGeneratorOpen as g,
  haStore as h,
  isEditMode as i,
  selectVisibleDashboardCards as j,
  isToggleable as k,
  selectFilteredEntities as l,
  session as s,
  tabs as t,
  uiDashboardState as u
};
