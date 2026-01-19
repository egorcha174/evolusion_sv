import "clsx";
import "../../chunks/store.js";
import { a as attr_style, s as stringify, e as ensure_array_like, b as store_get, c as attr_class, u as unsubscribe_stores } from "../../chunks/index2.js";
import { e as escape_html } from "../../chunks/escaping.js";
import { w as writable } from "../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import "iconify-icon";
function InfoPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let width = 320;
    let timeStr = "";
    $$renderer2.push(`<aside class="info-panel svelte-rjw8n6"${attr_style(`width: ${stringify(width)}px`)}><div class="resize-handle svelte-rjw8n6"></div> <div class="panel-content svelte-rjw8n6"><div class="section clock-section svelte-rjw8n6"><div class="clock svelte-rjw8n6">${escape_html(timeStr)}</div></div> <div class="section weather-section svelte-rjw8n6"><div class="card weather-card svelte-rjw8n6"><span class="placeholder-text svelte-rjw8n6">Weather Widget (TODO)</span></div></div> <div class="section camera-section svelte-rjw8n6"><div class="card camera-card svelte-rjw8n6"><span class="placeholder-text svelte-rjw8n6">Camera Feed (TODO)</span></div></div></div></aside>`);
  });
}
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
function DashboardHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<header class="dashboard-header svelte-1ra6ezt"><div class="header-left svelte-1ra6ezt"><button class="icon-btn mobile-only svelte-1ra6ezt"><iconify-icon icon="mdi:menu" width="24"></iconify-icon></button> <div class="logo svelte-1ra6ezt"><iconify-icon icon="mdi:home-assistant" width="24" class="logo-icon svelte-1ra6ezt"></iconify-icon> <span class="logo-text">Evolusion</span></div> <nav class="desktop-tabs svelte-1ra6ezt"><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$tabs", tabs));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class("tab-btn svelte-1ra6ezt", void 0, {
        "active": store_get($$store_subs ??= {}, "$activeTabId", activeTabId) === tab.id
      })}>${escape_html(tab.title)} `);
      if (store_get($$store_subs ??= {}, "$isEditMode", isEditMode)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<iconify-icon icon="mdi:pencil" width="14" class="edit-icon svelte-1ra6ezt"></iconify-icon>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$isEditMode", isEditMode)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="tab-btn add-btn svelte-1ra6ezt"><iconify-icon icon="mdi:plus" width="20"></iconify-icon></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></nav></div> <div class="header-right svelte-1ra6ezt"><div class="search-wrapper desktop-only svelte-1ra6ezt"><iconify-icon icon="mdi:magnify" class="search-icon svelte-1ra6ezt"></iconify-icon> <input type="text" placeholder="Search devices..." class="search-input svelte-1ra6ezt"/></div> <div class="menu-container svelte-1ra6ezt"><button class="icon-btn svelte-1ra6ezt"><iconify-icon icon="mdi:dots-vertical" width="24"></iconify-icon></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></header> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    $$renderer2.push(`<div class="layout-container svelte-12qhfyh">`);
    InfoPanel($$renderer2);
    $$renderer2.push(`<!----> <div class="main-content svelte-12qhfyh">`);
    DashboardHeader($$renderer2);
    $$renderer2.push(`<!----> <main class="svelte-12qhfyh">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div></div>`);
  });
}
export {
  _layout as default
};
