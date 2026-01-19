import { d as attr, e as ensure_array_like, b as store_get, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { e as entityList, h as haStore } from "../../../chunks/store.js";
import { _ as escape_html } from "../../../chunks/context.js";
import { e as extractDomain, i as isToggleable } from "../../../chunks/utils2.js";
function EntityRow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { entity } = $$props;
    let isToggling = false;
    let domain = extractDomain(entity.entity_id);
    let displayName = entity.attributes.friendly_name || entity.entity_id;
    let isToggleable$1 = isToggleable(domain);
    $$renderer2.push(`<div class="entity-row svelte-oocbx9"${attr("data-domain", domain)}><div class="entity-info svelte-oocbx9"><div class="entity-name svelte-oocbx9">${escape_html(displayName)}</div> <div class="entity-id svelte-oocbx9">${escape_html(entity.entity_id)}</div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="entity-state svelte-oocbx9"><div class="state-badge svelte-oocbx9">${escape_html(entity.state)}</div></div> `);
    if (isToggleable$1) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button${attr("disabled", isToggling, true)} class="action-button svelte-oocbx9">${escape_html(entity.state === "on" ? "Off" : "On")}</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function EntityList($$renderer, $$props) {
  let { entities = [] } = $$props;
  $$renderer.push(`<div class="entity-list svelte-t6avkx"><!--[-->`);
  const each_array = ensure_array_like(entities);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let entity = each_array[$$index];
    EntityRow($$renderer, { entity });
  }
  $$renderer.push(`<!--]--></div>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let searchQuery = "";
    let selectedDomain = null;
    let filtered = store_get($$store_subs ??= {}, "$entityList", entityList).filter((entity) => {
      const matchesSearch = entity.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) || (entity.attributes.friendly_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      extractDomain(entity.entity_id);
      const matchesDomain = !selectedDomain;
      return matchesSearch && matchesDomain;
    });
    $$renderer2.push(`<div class="page-entities svelte-1ipj8go"><h1>All Entities</h1> `);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Loading entities...</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="error svelte-1ipj8go">Error: ${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).error)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$entityList", entityList).length === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p>No entities connected. Check your Home Assistant settings.</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="filters svelte-1ipj8go"><input type="text" placeholder="Search entities..."${attr("value", searchQuery)} class="search-input svelte-1ipj8go"/> `);
          $$renderer2.select(
            { value: selectedDomain, class: "domain-select" },
            ($$renderer3) => {
              $$renderer3.option({ value: null }, ($$renderer4) => {
                $$renderer4.push(`All domains`);
              });
              $$renderer3.option({ value: "light" }, ($$renderer4) => {
                $$renderer4.push(`Lights`);
              });
              $$renderer3.option({ value: "switch" }, ($$renderer4) => {
                $$renderer4.push(`Switches`);
              });
              $$renderer3.option({ value: "sensor" }, ($$renderer4) => {
                $$renderer4.push(`Sensors`);
              });
              $$renderer3.option({ value: "binary_sensor" }, ($$renderer4) => {
                $$renderer4.push(`Binary Sensors`);
              });
              $$renderer3.option({ value: "climate" }, ($$renderer4) => {
                $$renderer4.push(`Climate`);
              });
              $$renderer3.option({ value: "cover" }, ($$renderer4) => {
                $$renderer4.push(`Covers`);
              });
              $$renderer3.option({ value: "media_player" }, ($$renderer4) => {
                $$renderer4.push(`Media Players`);
              });
            },
            "svelte-1ipj8go"
          );
          $$renderer2.push(`</div> <div class="results-count svelte-1ipj8go">Showing ${escape_html(filtered.length)} of ${escape_html(store_get($$store_subs ??= {}, "$entityList", entityList).length)} entities</div> `);
          EntityList($$renderer2, { entities: filtered });
          $$renderer2.push(`<!---->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
