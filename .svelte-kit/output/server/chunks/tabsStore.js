import { w as writable } from "./index.js";
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
export {
  activeTabId as a,
  isEditMode as i,
  tabs as t
};
