import "clsx";
import { h as haStore } from "../../chunks/store.js";
import { s as store_get, u as unsubscribe_stores, a as attr_class } from "../../chunks/index2.js";
import { e as escape_html } from "../../chunks/escaping.js";
import "iconify-icon";
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let timeStr = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    $$renderer2.push(`<div class="sidebar svelte-5d5q0c"><div class="weather-section svelte-5d5q0c"><div class="time svelte-5d5q0c">${escape_html(
      timeStr
    )}</div> <div class="weather-main svelte-5d5q0c"><div class="temp svelte-5d5q0c">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).entities.has("weather.home")) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).entities.get("weather.home")?.attributes.temperature ?? "--")}°`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`--°`);
    }
    $$renderer2.push(`<!--]--></div> <div class="condition svelte-5d5q0c">Home</div></div></div> <div class="quick-links svelte-5d5q0c"><a href="/" class="link svelte-5d5q0c"><iconify-icon icon="mdi:view-dashboard"></iconify-icon> Dashboard</a> <a href="/entities" class="link svelte-5d5q0c"><iconify-icon icon="mdi:format-list-bulleted"></iconify-icon> Entities</a> <a href="/settings" class="link svelte-5d5q0c"><iconify-icon icon="mdi:cog"></iconify-icon> Settings</a></div> <div class="status-info svelte-5d5q0c"><div class="status-item svelte-5d5q0c"><span class="label svelte-5d5q0c">Status:</span> <span class="value svelte-5d5q0c">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span style="color: #4caf50">●</span> Connected`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span style="color: #f44336">●</span> Offline`);
    }
    $$renderer2.push(`<!--]--></span></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div class="header svelte-olgnov"><div class="title-area svelte-olgnov"><h1 class="svelte-olgnov">Evolusion</h1></div> <div class="header-right svelte-olgnov"><div class="status svelte-olgnov"><span${attr_class("indicator svelte-olgnov", void 0, {
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
    $$renderer2.push(`<!--]--></span></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    $$renderer2.push(`<div class="layout-container">`);
    Sidebar($$renderer2);
    $$renderer2.push(`<!----> `);
    Header($$renderer2);
    $$renderer2.push(`<!----> <main class="svelte-12qhfyh">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div>`);
  });
}
export {
  _layout as default
};
