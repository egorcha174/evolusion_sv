import { d as derived, w as writable } from "./index.js";
const haStore = writable({
  isConnected: false,
  isLoading: false,
  error: null,
  entities: /* @__PURE__ */ new Map(),
  latency: void 0
});
const entityList = derived(haStore, ($store) => {
  return Array.from($store.entities.values());
});
derived(haStore, ($store) => {
  return Array.from($store.entities.values()).filter((e) => e.state !== "unavailable");
});
export {
  entityList as e,
  haStore as h
};
