
import { writable, derived, get } from 'svelte/store';
import { dashboardStore } from './dashboardStore';
import type { TabGridConfig } from '$lib/types';

export interface Tab {
  id: string;
  title: string;
  icon?: string;
}

// Derived store to transform DashboardConfig into Tab list
export const tabs = derived(dashboardStore, ($dashboard) => {
  const order = $dashboard.tabOrder || [];
  const tabConfigs = $dashboard.tabs || {};
  
  // Return sorted tabs
  return order
    .map(id => tabConfigs[id])
    .filter(Boolean)
    .map(config => ({
      id: config.id,
      title: config.title || config.id,
      icon: config.icon
    }));
});

export const activeTabId = writable<string>('home');
export const isEditMode = writable<boolean>(false);

// Ensure active tab is valid
dashboardStore.subscribe($d => {
  const current = get(activeTabId);
  if ($d.tabOrder && $d.tabOrder.length > 0) {
     if (!$d.tabOrder.includes(current)) {
        activeTabId.set($d.tabOrder[0]);
     }
  }
});

export function setActiveTab(id: string) {
  activeTabId.set(id);
}

export function toggleEditMode() {
  isEditMode.update(v => !v);
}
