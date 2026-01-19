import "clsx";
import { h as haStore } from "../../chunks/store.js";
import { a as attr_style, s as stringify, e as ensure_array_like, b as store_get, c as attr_class, u as unsubscribe_stores, h as head } from "../../chunks/index2.js";
import { _ as escape_html } from "../../chunks/context.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { t as tabs, a as activeTabId, i as isEditMode } from "../../chunks/tabsStore.js";
import "iconify-icon";
import { t as themeState } from "../../chunks/store2.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function InfoPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let width = 320;
    let timeStr = "";
    $$renderer2.push(`<aside class="info-panel svelte-rjw8n6"${attr_style(`width: ${stringify(width)}px`)}><div class="resize-handle svelte-rjw8n6"></div> <div class="panel-content svelte-rjw8n6"><div class="section clock-section svelte-rjw8n6"><div class="clock svelte-rjw8n6">${escape_html(timeStr)}</div></div> <div class="section weather-section svelte-rjw8n6"><div class="card weather-card svelte-rjw8n6"><span class="placeholder-text svelte-rjw8n6">Weather Widget (TODO)</span></div></div> <div class="section camera-section svelte-rjw8n6"><div class="card camera-card svelte-rjw8n6"><span class="placeholder-text svelte-rjw8n6">Camera Feed (TODO)</span></div></div></div></aside>`);
  });
}
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
        $$renderer2.push(`<iconify-icon icon="mdi:pencil" width="14" class="edit-icon"></iconify-icon>`);
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
    $$renderer2.push(`<!--]--></nav></div> <div class="header-right svelte-1ra6ezt"><div class="status svelte-1ra6ezt"><span${attr_class("indicator svelte-1ra6ezt", void 0, {
      "connected": store_get($$store_subs ??= {}, "$haStore", haStore).isConnected
    })}></span> <span class="status-text">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`Connected`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`Connecting...`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`Disconnected`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></span></div> <div class="menu-container svelte-1ra6ezt"><button class="icon-btn svelte-1ra6ezt"><iconify-icon icon="mdi:dots-vertical" width="24"></iconify-icon></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></header>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ThemeInjector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    head("nh1qkz", $$renderer2, ($$renderer3) => {
      $$renderer3.push(`${html(`<style id="theme-styles">${store_get($$store_subs ??= {}, "$themeState", themeState).css}</style>`)}`);
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    ThemeInjector($$renderer2);
    $$renderer2.push(`<!----> <div class="layout-container svelte-12qhfyh">`);
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
