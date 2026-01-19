import { d as attr, b as attr_class, s as store_get, e as ensure_array_like, u as unsubscribe_stores } from "../../chunks/index2.js";
import { h as haStore } from "../../chunks/store.js";
import { _ as escape_html } from "../../chunks/context.js";
import "clsx";
import { a as activeTabId } from "../../chunks/tabsStore.js";
import { e as extractDomain } from "../../chunks/utils2.js";
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var FEATURE_FLAG_NAMES = Object.freeze({
  // This flag exists as a workaround for issue 454 (basically a browser bug) - seems like these rect values take time to update when in grid layout. Setting it to true can cause strange behaviour in the REPL for non-grid zones, see issue 470
  USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT: "USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT"
});
_defineProperty({}, FEATURE_FLAG_NAMES.USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT, false);
var _ID_TO_INSTRUCTION;
var INSTRUCTION_IDs$1 = {
  DND_ZONE_ACTIVE: "dnd-zone-active",
  DND_ZONE_DRAG_DISABLED: "dnd-zone-drag-disabled"
};
_ID_TO_INSTRUCTION = {}, _defineProperty(_ID_TO_INSTRUCTION, INSTRUCTION_IDs$1.DND_ZONE_ACTIVE, "Tab to one the items and press space-bar or enter to start dragging it"), _defineProperty(_ID_TO_INSTRUCTION, INSTRUCTION_IDs$1.DND_ZONE_DRAG_DISABLED, "This is a disabled drag and drop list"), _ID_TO_INSTRUCTION;
const iconMap = {
  light: "mdi:lightbulb",
  switch: "mdi:power-plug",
  cover: "mdi:window-closed",
  climate: "mdi:thermometer",
  media_player: "mdi:music",
  sensor: "mdi:gauge",
  binary_sensor: "mdi:circle-outline",
  lock: "mdi:lock",
  weather: "mdi:weather-partly-cloudy",
  script: "mdi:script-text-outline",
  input_boolean: "mdi:toggle-switch"
};
function getIcon(domain) {
  return iconMap[domain] || "mdi:help-circle";
}
function DeviceCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { entity } = $$props;
    let isToggling = false;
    let domain = extractDomain(entity.entity_id);
    let displayName = entity.attributes.friendly_name || entity.entity_id;
    let isOn = entity.state === "on" || entity.state === "open" || entity.state === "unlocked";
    let isToggleable = [
      "light",
      "switch",
      "cover",
      "lock",
      "input_boolean",
      "script"
    ].includes(domain);
    let icon = getIcon(domain);
    $$renderer2.push(`<div class="card svelte-vmg48c"${attr("data-domain", domain)}${attr("data-state", isOn ? "on" : "off")}><div class="card-header svelte-vmg48c"><div class="icon svelte-vmg48c"><iconify-icon${attr("icon", icon)} width="24" height="24"></iconify-icon></div> <div class="name svelte-vmg48c"${attr("title", displayName)}>${escape_html(displayName)}</div></div> <div class="card-body svelte-vmg48c"><div class="state-display svelte-vmg48c"><span class="state-text svelte-vmg48c">${escape_html(entity.state)}</span></div> `);
    if (entity.attributes.brightness !== void 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="attribute svelte-vmg48c">${escape_html(Math.round(entity.attributes.brightness / 255 * 100))}%</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="card-footer svelte-vmg48c">`);
    if (isToggleable) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button${attr("disabled", isToggling, true)}${attr_class("toggle-btn svelte-vmg48c", void 0, { "on": isOn })}>${escape_html(isOn ? "Off" : "On")}</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function DashboardGrid($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let items = [];
    $$renderer2.push(`<div class="dashboard-grid svelte-wf2j5s">`);
    if (items.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="empty-state svelte-wf2j5s">`);
      if (store_get($$store_subs ??= {}, "$activeTabId", activeTabId) === "home") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`No dashboard devices found. Add lights, switches, or media players to Home Assistant.`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`No devices found for "${escape_html(store_get($$store_subs ??= {}, "$activeTabId", activeTabId).replace("_", " "))}". <br/> <small>Rename devices in Home Assistant to include the room name.</small>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid svelte-wf2j5s"><!--[-->`);
      const each_array = ensure_array_like(items);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let item = each_array[$$index];
        $$renderer2.push(`<div class="grid-item svelte-wf2j5s">`);
        DeviceCard($$renderer2, { entity: item });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div class="dashboard-page svelte-1uha8ag">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="status-message svelte-1uha8ag"><div class="spinner svelte-1uha8ag"></div> <p class="svelte-1uha8ag">Connecting to Home Assistant...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="status-message error svelte-1uha8ag"><iconify-icon icon="mdi:alert-circle" width="48" class="svelte-1uha8ag"></iconify-icon> <h3 class="svelte-1uha8ag">Connection Error</h3> <p class="svelte-1uha8ag">${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).error)}</p> <a href="/settings" class="btn svelte-1uha8ag">Check Settings</a></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (!store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="status-message warning svelte-1uha8ag"><iconify-icon icon="mdi:lan-disconnect" width="48" class="svelte-1uha8ag"></iconify-icon> <h3 class="svelte-1uha8ag">Not Connected</h3> <p class="svelte-1uha8ag">Please configure your server connection in Settings.</p> <a href="/settings" class="btn svelte-1uha8ag">Go to Settings</a></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
          DashboardGrid($$renderer2);
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
