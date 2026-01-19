import { writable } from 'svelte/store';

export interface Tab {
  id: string;
  title: string;
  icon?: string;
}

const INITIAL_TABS: Tab[] = [
  { id: 'home', title: 'Dashboard', icon: 'mdi:view-dashboard' },
  { id: 'living_room', title: 'Living Room', icon: 'mdi:sofa' },
  { id: 'bedroom', title: 'Bedroom', icon: 'mdi:bed' }
];

function createTabsStore() {
  const { subscribe, set, update } = writable<Tab[]>(INITIAL_TABS);

  return {
    subscribe,
    addTab: () => update(tabs => {
      const newId = `tab_${Date.now()}`;
      return [...tabs, { id: newId, title: `New Tab ${tabs.length + 1}` }];
    }),
    removeTab: (id: string) => update(tabs => tabs.filter(t => t.id !== id)),
    reset: () => set(INITIAL_TABS)
  };
}

export const tabs = createTabsStore();
export const activeTabId = writable<string>(INITIAL_TABS[0].id);
export const isEditMode = writable<boolean>(false);

export function setActiveTab(id: string) {
  activeTabId.set(id);
}

export function toggleEditMode() {
  isEditMode.update(v => !v);
}
