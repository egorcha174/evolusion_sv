import { s as store_get, c as attr_class, b as attr, a as attr_style, u as unsubscribe_stores } from "./index2.js";
import { b as $format } from "./runtime.js";
import { e as extractDomain } from "./store.js";
function getTemplateCssVariables(style) {
  const parts = [];
  if (style.backgroundType === "transparent") {
    parts.push("--card-background: transparent");
    parts.push("--card-background-on: transparent");
  } else {
    parts.push(`--card-background: ${style.backgroundColor}`);
    parts.push(`--card-background-on: ${style.backgroundColor}`);
  }
  parts.push(`--card-opacity: ${style.opacity}`);
  parts.push(`--card-padding: ${style.padding}px`);
  switch (style.shadow) {
    case "sm":
      parts.push("--shadow-card: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)");
      break;
    case "md":
      parts.push("--shadow-card: 0 4px 6px rgba(0,0,0,0.1)");
      break;
    case "lg":
      parts.push("--shadow-card: 0 10px 15px rgba(0,0,0,0.1)");
      break;
    case "none":
      parts.push("--shadow-card: none");
      break;
  }
  return parts.join("; ");
}
function DeviceCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { entity, template, onAddToTab } = $$props;
    let domain = extractDomain(entity.entity_id);
    entity.attributes.friendly_name || entity.entity_id;
    let isOn = entity.state === "on" || entity.state === "open" || entity.state === "unlocked";
    (() => {
      if (entity.state === "on") return store_get($$store_subs ??= {}, "$t", $format)("common.on");
      if (entity.state === "off") return store_get($$store_subs ??= {}, "$t", $format)("common.off");
      if (entity.state === "unavailable") return store_get($$store_subs ??= {}, "$t", $format)("entities.status.unavailable");
      if (entity.state === "unknown") return store_get($$store_subs ??= {}, "$t", $format)("entities.status.unknown");
      return entity.state;
    })();
    let customStyle = template ? getTemplateCssVariables(template.style) : "";
    let isVisualMode = template && template.elements && template.elements.length > 0;
    $$renderer2.push(`<div${attr_class("device-card svelte-vmg48c", void 0, { "active": isOn, "visual-mode": isVisualMode })}${attr("data-domain", domain)} role="button" tabindex="0"${attr_style(customStyle)}>`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="skeleton svelte-vmg48c"></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  DeviceCard as D
};
