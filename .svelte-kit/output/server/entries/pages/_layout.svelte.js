import { s as store_get, u as unsubscribe_stores } from "../../chunks/index2.js";
import "clsx";
import { h as haStore } from "../../chunks/store.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    $$renderer2.push(`<div class="app-layout"><header class="app-header svelte-12qhfyh"><div class="brand svelte-12qhfyh">Evolusion</div> <nav class="svelte-12qhfyh"><a href="/" class="svelte-12qhfyh">Dashboard</a> <a href="/entities" class="svelte-12qhfyh">All Entities</a> <a href="/settings" class="svelte-12qhfyh">Settings</a></nav> <div class="status-indicator svelte-12qhfyh">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="badge loading svelte-12qhfyh">Connecting...</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="badge connected svelte-12qhfyh">Online</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$haStore", haStore).error) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="badge error svelte-12qhfyh">Error</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<span class="badge disconnected svelte-12qhfyh">Offline</span>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></header> <main class="svelte-12qhfyh">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
