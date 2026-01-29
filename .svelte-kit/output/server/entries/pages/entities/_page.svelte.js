import { s as store_get, c as attr_class, b as attr, u as unsubscribe_stores, a as attr_style, e as ensure_array_like, d as stringify } from "../../../chunks/index2.js";
import { b as $format } from "../../../chunks/runtime.js";
import { e as extractDomain, k as isToggleable, t as tabs, u as uiDashboardState, h as haStore, l as selectFilteredEntities } from "../../../chunks/store.js";
import { g as getIcon } from "../../../chunks/icons.js";
import "iconify-icon";
import { e as escape_html } from "../../../chunks/context.js";
import { D as DeviceCard } from "../../../chunks/DeviceCard.js";
function EntityRow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { entity, onAddToTab } = $$props;
    let isToggling = false;
    let domain = extractDomain(entity.entity_id);
    let displayName = entity.attributes.friendly_name || entity.entity_id;
    let isToggleable$1 = isToggleable(domain);
    let icon = getIcon(domain);
    let translatedState = (() => {
      if (entity.state === "on") return store_get($$store_subs ??= {}, "$t", $format)("common.on");
      if (entity.state === "off") return store_get($$store_subs ??= {}, "$t", $format)("common.off");
      if (entity.state === "unavailable") return store_get($$store_subs ??= {}, "$t", $format)("entities.status.unavailable");
      if (entity.state === "unknown") return store_get($$store_subs ??= {}, "$t", $format)("entities.status.unknown");
      return entity.state;
    })();
    let isOn = entity.state === "on" || entity.state === "open" || entity.state === "unlocked";
    $$renderer2.push(`<div${attr_class("entity-row svelte-oocbx9", void 0, { "active": isOn })}${attr("data-domain", domain)}><div class="entity-main svelte-oocbx9"><div${attr_class("icon-container svelte-oocbx9", void 0, { "active": isOn })}><iconify-icon${attr("icon", icon)} width="24" height="24" class="svelte-oocbx9"></iconify-icon></div> <div class="entity-info svelte-oocbx9"><div class="entity-name svelte-oocbx9"${attr("title", displayName)}>${escape_html(displayName)}</div> <div class="entity-id-row svelte-oocbx9"><span class="entity-id svelte-oocbx9">${escape_html(entity.entity_id)}</span> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="entity-actions svelte-oocbx9"><div class="state-badge-container svelte-oocbx9"><span${attr_class("state-badge svelte-oocbx9", void 0, { "on": isOn })}>${escape_html(translatedState)} `);
    if (entity.attributes.unit_of_measurement) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="unit svelte-oocbx9">${escape_html(entity.attributes.unit_of_measurement)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></span></div> <div class="actions-group svelte-oocbx9">`);
    if (onAddToTab) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="add-to-dashboard-btn svelte-oocbx9"${attr("title", store_get($$store_subs ??= {}, "$t", $format)("entities.addToTab.button", { default: "Add to Dashboard" }))}><iconify-icon icon="mdi:view-dashboard-plus-outline" width="18" height="18" class="svelte-oocbx9"></iconify-icon> <span class="btn-text svelte-oocbx9">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("common.add", { default: "Add" }))}</span></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (isToggleable$1) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button${attr("disabled", isToggling, true)}${attr_class("toggle-switch svelte-oocbx9", void 0, { "is-on": isOn })} aria-label="Toggle"><div class="switch-handle svelte-oocbx9">`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
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
  $$renderer.component(($$renderer2) => {
    let { entities = [], viewMode = "grid", onAddToTab } = $$props;
    const ITEM_HEIGHT = 80;
    $$renderer2.push(`<div${attr_class("entity-list-container svelte-t6avkx", void 0, { "list-mode": viewMode === "list" })}>`);
    if (viewMode === "list") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="virtual-list-wrapper svelte-t6avkx">`);
      {
        let children = function($$renderer3, { item }) {
          $$renderer3.push(`<div class="row-wrapper svelte-t6avkx">`);
          EntityRow($$renderer3, {
            entity: item,
            onAddToTab: () => onAddToTab?.(item.entity_id, item.attributes.friendly_name || item.entity_id)
          });
          $$renderer3.push(`<!----></div>`);
        };
        VirtualList($$renderer2, {
          items: entities,
          itemHeight: ITEM_HEIGHT,
          height: "100%",
          children
        });
      }
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid-wrapper svelte-t6avkx"><!--[-->`);
      const each_array = ensure_array_like(entities);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let entity = each_array[$$index];
        $$renderer2.push(`<div class="grid-item svelte-t6avkx">`);
        DeviceCard($$renderer2, {
          entity,
          onAddToTab: () => onAddToTab?.(entity.entity_id, entity.attributes.friendly_name || entity.entity_id)
        });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function AddToTabDialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { entityName } = $$props;
    $$renderer2.push(`<div class="dialog-overlay svelte-5h1skv" role="presentation"><div class="dialog-content svelte-5h1skv" role="dialog" aria-modal="true" tabindex="-1"><div class="dialog-header svelte-5h1skv"><h3 class="svelte-5h1skv">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.addToTab.title", { default: "Add to Dashboard" }))}</h3> <button class="close-btn svelte-5h1skv" aria-label="Close dialog"><iconify-icon icon="mdi:close" width="24" height="24"></iconify-icon></button></div> <div class="entity-preview svelte-5h1skv"><span class="label svelte-5h1skv">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.addToTab.entity", { default: "Entity:" }))}</span> <span class="name svelte-5h1skv">${escape_html(entityName)}</span></div> <div class="tabs-list svelte-5h1skv"><p class="instruction svelte-5h1skv">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.addToTab.selectTab", { default: "Select a tab to add this entity to:" }))}</p> <!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$tabs", tabs));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button class="tab-item svelte-5h1skv"><iconify-icon${attr("icon", tab.icon || "mdi:view-dashboard")} width="20" height="20" class="svelte-5h1skv"></iconify-icon> <span>${escape_html(tab.title)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let viewMode = "grid";
    let selectedEntityToMove = null;
    function openAddToTab(id, name) {
      selectedEntityToMove = { id, name };
    }
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
    $$renderer2.push(`<div class="page-entities svelte-1ipj8go"><div class="glass-background svelte-1ipj8go"></div> <header class="page-header svelte-1ipj8go"><div class="header-content svelte-1ipj8go"><h1 class="svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.title"))}</h1> <div class="view-toggles svelte-1ipj8go"><button${attr_class("toggle-btn svelte-1ipj8go", void 0, { "active": viewMode === "list" })} aria-label="List View"><iconify-icon icon="mdi:format-list-bulleted" width="20" class="svelte-1ipj8go"></iconify-icon></button> <button${attr_class("toggle-btn svelte-1ipj8go", void 0, { "active": viewMode === "grid" })} aria-label="Grid View"><iconify-icon icon="mdi:view-grid-outline" width="20" class="svelte-1ipj8go"></iconify-icon></button></div></div></header> `);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="state-container svelte-1ipj8go"><div class="spinner svelte-1ipj8go"></div> <p class="svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.loading"))}</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="state-container error svelte-1ipj8go"><div class="icon-wrapper svelte-1ipj8go"><iconify-icon icon="mdi:alert-circle-outline" width="64" class="svelte-1ipj8go"></iconify-icon></div> <h3 class="svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("common.error"))}</h3> <div class="message-box svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).error)}</div> <button class="btn primary svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.title"))}</button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (!store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="state-container warning svelte-1ipj8go"><div class="icon-wrapper svelte-1ipj8go"><iconify-icon icon="mdi:lan-disconnect" width="64" class="svelte-1ipj8go"></iconify-icon></div> <h3 class="svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.offline"))}</h3> <p class="message svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.noEntities"))}</p> <button class="btn primary svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.title"))}</button></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (store_get($$store_subs ??= {}, "$selectFilteredEntities", selectFilteredEntities).length === 0 && !store_get($$store_subs ??= {}, "$uiDashboardState", uiDashboardState).filters.search && !store_get($$store_subs ??= {}, "$uiDashboardState", uiDashboardState).filters.domain) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="state-container empty svelte-1ipj8go"><div class="icon-wrapper svelte-1ipj8go"><iconify-icon icon="mdi:package-variant-closed" width="64" class="svelte-1ipj8go"></iconify-icon></div> <p class="svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.noEntities"))}</p></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<div class="controls glass-panel svelte-1ipj8go"><div class="search-wrapper svelte-1ipj8go"><iconify-icon icon="mdi:magnify" class="search-icon svelte-1ipj8go"></iconify-icon> <input type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$t", $format)("entities.search"))}${attr("value", searchQuery)} class="search-input svelte-1ipj8go"/></div> <div class="filter-actions svelte-1ipj8go"><div class="select-wrapper svelte-1ipj8go">`);
            $$renderer2.select(
              {
                value: selectedDomain,
                onchange: updateFilters,
                class: "domain-select"
              },
              ($$renderer3) => {
                $$renderer3.option(
                  { value: "", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.allDomains"))}`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "light", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Lights`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "switch", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Switches`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "sensor", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Sensors`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "binary_sensor", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Binary Sensors`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "climate", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Climate`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "cover", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Covers`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "media_player", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Media Players`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "script", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Scripts`);
                  },
                  "svelte-1ipj8go"
                );
                $$renderer3.option(
                  { value: "automation", class: "" },
                  ($$renderer4) => {
                    $$renderer4.push(`Automations`);
                  },
                  "svelte-1ipj8go"
                );
              },
              "svelte-1ipj8go"
            );
            $$renderer2.push(` <iconify-icon icon="mdi:chevron-down" class="select-arrow svelte-1ipj8go"></iconify-icon></div> <div class="results-count svelte-1ipj8go">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.showing", {
              values: {
                count: store_get($$store_subs ??= {}, "$selectFilteredEntities", selectFilteredEntities).length
              }
            }))}</div></div></div> <div class="list-wrapper svelte-1ipj8go">`);
            EntityList($$renderer2, {
              entities: store_get($$store_subs ??= {}, "$selectFilteredEntities", selectFilteredEntities),
              viewMode,
              onAddToTab: openAddToTab
            });
            $$renderer2.push(`<!----></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    if (selectedEntityToMove) {
      $$renderer2.push("<!--[-->");
      AddToTabDialog($$renderer2, {
        entityId: selectedEntityToMove.id,
        entityName: selectedEntityToMove.name
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
