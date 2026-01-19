import "clsx";
import { h as haStore } from "../../chunks/store.js";
import { a as attr_style, b as attr_class, s as store_get, c as stringify, u as unsubscribe_stores, e as ensure_array_like, h as head } from "../../chunks/index2.js";
import { _ as escape_html } from "../../chunks/context.js";
import { t as timeString, a as themeState } from "../../chunks/store2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { t as tabs, a as activeTabId, i as isEditMode } from "../../chunks/tabsStore.js";
import "iconify-icon";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let width = 280;
    let isResizing = false;
    function getLatencyColor(ms) {
      if (ms === void 0) return "var(--text-muted)";
      if (ms < 50) return "var(--accent-success)";
      if (ms < 150) return "var(--accent-warning)";
      return "var(--accent-error)";
    }
    $$renderer2.push(`<aside class="sidebar svelte-5d5q0c"${attr_style(`width: ${stringify(width)}px`)}><div${attr_class("resize-handle svelte-5d5q0c", void 0, { "active": isResizing })}></div> <div class="widget clock-widget svelte-5d5q0c"><div class="time svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$timeString", timeString))}</div> <div class="date svelte-5d5q0c">${escape_html((/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }))}</div></div> <div class="widget weather-widget svelte-5d5q0c"><div class="weather-icon svelte-5d5q0c"><iconify-icon icon="mdi:weather-partly-cloudy" width="48" class="svelte-5d5q0c"></iconify-icon></div> <div class="weather-info svelte-5d5q0c"><div class="temp svelte-5d5q0c">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).entities.has("weather.home")) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).entities.get("weather.home")?.attributes.temperature ?? "--")}°`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`--°`);
    }
    $$renderer2.push(`<!--]--></div> <div class="condition svelte-5d5q0c">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).entities.has("weather.home")) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).entities.get("weather.home")?.state ?? "Unknown")}`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`Home`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="widget camera-widget svelte-5d5q0c"><div class="camera-placeholder svelte-5d5q0c"><iconify-icon icon="mdi:cctv" width="32" class="svelte-5d5q0c"></iconify-icon> <span class="svelte-5d5q0c">Front Door</span></div></div> <div class="status-info svelte-5d5q0c"><div class="status-row svelte-5d5q0c">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="status-dot connected svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">Connected</span> `);
      if (store_get($$store_subs ??= {}, "$haStore", haStore).latency !== void 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="latency svelte-5d5q0c"${attr_style(`color: ${stringify(getLatencyColor(store_get($$store_subs ??= {}, "$haStore", haStore).latency))}`)}>(${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).latency)}ms)</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="status-dot loading svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">Connecting...</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="status-dot disconnected svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">Offline</span>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></aside>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DashboardHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<header class="dashboard-header svelte-1ra6ezt"><div class="header-left svelte-1ra6ezt"><button class="icon-btn mobile-only svelte-1ra6ezt"><iconify-icon icon="mdi:menu" width="24"></iconify-icon></button> <div class="logo svelte-1ra6ezt"><iconify-icon icon="mdi:home-assistant" width="24" class="logo-icon svelte-1ra6ezt"></iconify-icon></div> <nav class="desktop-tabs svelte-1ra6ezt"><!--[-->`);
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
    $$renderer2.push(`<!--]--></nav></div> <div class="header-right svelte-1ra6ezt"><div class="menu-container svelte-1ra6ezt"><button class="icon-btn svelte-1ra6ezt"><iconify-icon icon="mdi:dots-vertical" width="24"></iconify-icon></button> `);
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
    Sidebar($$renderer2);
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
