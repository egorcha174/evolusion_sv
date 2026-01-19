import "clsx";
import { h as haStore } from "../../chunks/store.js";
import { a as attr_style, s as stringify, b as attr_class, c as store_get, u as unsubscribe_stores } from "../../chunks/index2.js";
import { e as escape_html } from "../../chunks/escaping.js";
import "iconify-icon";
function InfoPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let width = 320;
    let timeStr = "";
    $$renderer2.push(`<aside class="info-panel svelte-rjw8n6"${attr_style(`width: ${stringify(width)}px`)}><div class="resize-handle svelte-rjw8n6"></div> <div class="panel-content svelte-rjw8n6"><div class="section clock-section svelte-rjw8n6"><div class="clock svelte-rjw8n6">${escape_html(timeStr)}</div></div> <div class="section weather-section svelte-rjw8n6"><div class="card weather-card svelte-rjw8n6"><span class="placeholder-text svelte-rjw8n6">Weather Widget (TODO)</span></div></div> <div class="section camera-section svelte-rjw8n6"><div class="card camera-card svelte-rjw8n6"><span class="placeholder-text svelte-rjw8n6">Camera Feed (TODO)</span></div></div></div></aside>`);
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
    $$renderer2.push(`<div class="layout-container svelte-12qhfyh">`);
    InfoPanel($$renderer2);
    $$renderer2.push(`<!----> <div class="main-content svelte-12qhfyh"><div class="header-wrapper">`);
    Header($$renderer2);
    $$renderer2.push(`<!----></div> <main class="svelte-12qhfyh">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div></div>`);
  });
}
export {
  _layout as default
};
