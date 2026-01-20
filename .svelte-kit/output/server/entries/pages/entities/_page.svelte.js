import { d as attr, a as attr_style, e as ensure_array_like, s as stringify, b as store_get, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { e as extractDomain, b as isToggleable, u as uiDashboardState, h as haStore, s as selectFilteredEntities } from "../../../chunks/store.js";
import "clsx";
import { _ as escape_html } from "../../../chunks/context.js";
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
function VirtualList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { items, itemHeight, height = "100%", children } = $$props;
    let scrollTop = 0;
    let availableHeight = 0;
    const buffer = 5;
    let totalHeight = items.length * itemHeight;
    let visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    let visibleEndIndex = Math.min(items.length, Math.ceil((scrollTop + availableHeight) / itemHeight) + buffer);
    let visibleItems = items.slice(visibleStartIndex, visibleEndIndex).map((item, index) => ({
      item,
      index: visibleStartIndex + index,
      offset: (visibleStartIndex + index) * itemHeight
    }));
    $$renderer2.push(`<div class="virtual-container svelte-dzt997"${attr_style(`height: ${stringify(height)}`)}><div class="virtual-spacer svelte-dzt997"${attr_style(`height: ${stringify(totalHeight)}px`)}><!--[-->`);
    const each_array = ensure_array_like(visibleItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let { item, index, offset } = each_array[$$index];
      $$renderer2.push(`<div class="virtual-item svelte-dzt997"${attr_style(`transform: translateY(${stringify(offset)}px); height: ${stringify(itemHeight)}px`)}>`);
      children($$renderer2, { item, index });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function EntityList($$renderer, $$props) {
  let { entities = [] } = $$props;
  const ITEM_HEIGHT = 72;
  $$renderer.push(`<div class="entity-list-container svelte-t6avkx">`);
  {
    let children = function($$renderer2, { item }) {
      $$renderer2.push(`<div class="row-wrapper svelte-t6avkx">`);
      EntityRow($$renderer2, { entity: item });
      $$renderer2.push(`<!----></div>`);
    };
    VirtualList($$renderer, {
      items: entities,
      itemHeight: ITEM_HEIGHT,
      height: "calc(100vh - 200px)",
      children
    });
  }
  $$renderer.push(`<!----></div>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let searchQuery = store_get($$store_subs ??= {}, "$uiDashboardState", uiDashboardState).filters.search || "";
    let selectedDomain = store_get($$store_subs ??= {}, "$uiDashboardState", uiDashboardState).filters.domain || "";
    function updateFilters() {
      uiDashboardState.update((s) => ({
        ...s,
        filters: {
          ...s.filters,
          search: searchQuery,
          domain: selectedDomain === "" ? void 0 : selectedDomain
        }
      }));
    }
    $$renderer2.push(`<div class="page-entities svelte-1ipj8go"><div class="page-header svelte-1ipj8go"><h1>All Entities</h1></div> `);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading">Loading entities...</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="error svelte-1ipj8go">Error: ${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).error)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$selectFilteredEntities", selectFilteredEntities).length === 0 && !store_get($$store_subs ??= {}, "$uiDashboardState", uiDashboardState).filters.search && !store_get($$store_subs ??= {}, "$uiDashboardState", uiDashboardState).filters.domain) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p>No entities connected. Check your Home Assistant settings.</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="controls svelte-1ipj8go"><div class="filters svelte-1ipj8go"><input type="text" placeholder="Search entities..."${attr("value", searchQuery)} class="search-input svelte-1ipj8go"/> `);
          $$renderer2.select(
            {
              value: selectedDomain,
              onchange: updateFilters,
              class: "domain-select"
            },
            ($$renderer3) => {
              $$renderer3.option({ value: "" }, ($$renderer4) => {
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
              $$renderer3.option({ value: "script" }, ($$renderer4) => {
                $$renderer4.push(`Scripts`);
              });
              $$renderer3.option({ value: "automation" }, ($$renderer4) => {
                $$renderer4.push(`Automations`);
              });
            },
            "svelte-1ipj8go"
          );
          $$renderer2.push(`</div> <div class="results-count svelte-1ipj8go">Showing ${escape_html(store_get($$store_subs ??= {}, "$selectFilteredEntities", selectFilteredEntities).length)} entities</div></div> `);
          EntityList($$renderer2, {
            entities: store_get($$store_subs ??= {}, "$selectFilteredEntities", selectFilteredEntities)
          });
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
