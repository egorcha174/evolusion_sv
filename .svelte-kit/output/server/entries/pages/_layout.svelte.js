import { a as attr_style, s as stringify, b as store_get, u as unsubscribe_stores, c as attr_class, d as attr, e as ensure_array_like } from "../../chunks/index2.js";
import "clsx";
import { $ as $format, h as haStore, a as $isLoading } from "../../chunks/runtime.js";
import { a as activeScheme, w as weatherStore, b as weatherSettings } from "../../chunks/store.js";
import { t as tabs, a as activeTabId, i as isEditMode } from "../../chunks/store2.js";
import { r as readable, d as derived } from "../../chunks/index.js";
import { _ as escape_html } from "../../chunks/context.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import "iconify-icon";
function SolidBackground($$renderer, $$props) {
  let { color } = $$props;
  $$renderer.push(`<div class="solid-bg svelte-2mry8v"${attr_style("", { "background-color": color || "#1C1C1E" })}></div>`);
}
function GradientBackground($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { config } = $$props;
    let gradient = config ? `linear-gradient(${config.angle}deg, ${config.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})` : "linear-gradient(135deg, #EAEAEB 0%, #DCDCDC 100%)";
    $$renderer2.push(`<div class="gradient-bg svelte-rgxxro"${attr_style("", { "background-image": gradient })}></div>`);
  });
}
function ImageBackground($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { config } = $$props;
    if (config) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="image-bg svelte-d6med1"${attr_style("", {
        "background-image": `url(${stringify(config.url)})`,
        "background-size": config.size,
        "background-position": config.position,
        "background-repeat": config.repeat,
        opacity: config.opacity ?? 1,
        filter: config.blur ? `blur(${config.blur}px)` : "none"
      })}></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function AnimationBackground($$renderer, $$props) {
  $$renderer.push(`<div class="animation-bg svelte-bhgbb2"><div class="placeholder-gradient svelte-bhgbb2"></div></div>`);
}
function BackgroundRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div class="background-container svelte-wckzi8">`);
    if (store_get($$store_subs ??= {}, "$activeScheme", activeScheme).dashboardBackgroundType === "color") {
      $$renderer2.push("<!--[-->");
      SolidBackground($$renderer2, {
        color: store_get($$store_subs ??= {}, "$activeScheme", activeScheme).dashboardBackgroundColor
      });
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$activeScheme", activeScheme).dashboardBackgroundType === "gradient") {
        $$renderer2.push("<!--[-->");
        GradientBackground($$renderer2, {
          config: store_get($$store_subs ??= {}, "$activeScheme", activeScheme).dashboardGradient
        });
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$activeScheme", activeScheme).dashboardBackgroundType === "image") {
          $$renderer2.push("<!--[-->");
          ImageBackground($$renderer2, {
            config: store_get($$store_subs ??= {}, "$activeScheme", activeScheme).dashboardBackgroundImage
          });
        } else {
          $$renderer2.push("<!--[!-->");
          if (store_get($$store_subs ??= {}, "$activeScheme", activeScheme).dashboardBackgroundType === "animation") {
            $$renderer2.push("<!--[-->");
            AnimationBackground($$renderer2, {
              config: store_get($$store_subs ??= {}, "$activeScheme", activeScheme).dashboardBackgroundAnimation
            });
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
const time = readable(/* @__PURE__ */ new Date(), (set) => {
  return;
});
derived(time, ($time) => {
  return $time.getHours() * 60 + $time.getMinutes();
});
const timeString = derived(time, ($time) => {
  return $time.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });
});
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
    function formatDay(date) {
      return date.toLocaleDateString(store_get($$store_subs ??= {}, "$t", $format)("currentLang") || "en", { weekday: "short" });
    }
    $$renderer2.push(`<aside class="sidebar svelte-5d5q0c"${attr_style(`width: ${stringify(width)}px`)}><div${attr_class("resize-handle svelte-5d5q0c", void 0, { "active": isResizing })}></div> <div class="widget clock-widget svelte-5d5q0c"><div class="time svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$timeString", timeString))}</div> <div class="date svelte-5d5q0c">${escape_html((/* @__PURE__ */ new Date()).toLocaleDateString(store_get($$store_subs ??= {}, "$t", $format)("currentLang") || "en", { weekday: "long", month: "short", day: "numeric" }))}</div></div> <div class="widget weather-widget svelte-5d5q0c">`);
    if (store_get($$store_subs ??= {}, "$weatherStore", weatherStore).isLoading && !store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="spinner svelte-5d5q0c"></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$weatherStore", weatherStore).error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="weather-error svelte-5d5q0c"><iconify-icon icon="mdi:cloud-off-outline" width="24" class="svelte-5d5q0c"></iconify-icon></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="current-weather svelte-5d5q0c"><div class="weather-icon svelte-5d5q0c"><iconify-icon${attr("icon", store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.icon)} width="48" class="svelte-5d5q0c"></iconify-icon></div> <div class="weather-info svelte-5d5q0c"><div class="temp svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.temperature)}°</div> <div class="condition svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.condition)}</div></div></div> `);
          if (store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).showForecast && store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.forecast.length > 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div${attr_class("forecast-list svelte-5d5q0c", void 0, {
              "horizontal": store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastLayout === "horizontal"
            })}><!--[-->`);
            const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.forecast);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let day = each_array[$$index];
              $$renderer2.push(`<div class="forecast-item svelte-5d5q0c"><div class="forecast-day svelte-5d5q0c">${escape_html(formatDay(day.date))}</div> <div class="forecast-icon svelte-5d5q0c"><iconify-icon${attr("icon", day.icon)} width="20" class="svelte-5d5q0c"></iconify-icon></div> <div class="forecast-temp svelte-5d5q0c"><span class="max svelte-5d5q0c">${escape_html(day.maxTemp)}°</span> `);
              if (store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastLayout === "vertical") {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<span class="min svelte-5d5q0c">${escape_html(day.minTemp)}°</span>`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]--></div></div>`);
            }
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="current-weather svelte-5d5q0c"><div class="weather-icon svelte-5d5q0c"><iconify-icon icon="mdi:weather-partly-cloudy" width="48" class="svelte-5d5q0c"></iconify-icon></div> <div class="weather-info svelte-5d5q0c"><div class="temp svelte-5d5q0c">--°</div> <div class="condition svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.offline"))}</div></div></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div class="widget camera-widget svelte-5d5q0c"><div class="camera-placeholder svelte-5d5q0c"><iconify-icon icon="mdi:cctv" width="32" class="svelte-5d5q0c"></iconify-icon> <span class="svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.camera"))}</span></div></div> <div class="status-info svelte-5d5q0c"><div class="status-row svelte-5d5q0c">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="status-dot connected svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.connected"))}</span> `);
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
        $$renderer2.push(`<div class="status-dot loading svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.connecting"))}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="status-dot disconnected svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.offline"))}</span>`);
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
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    BackgroundRenderer($$renderer2);
    $$renderer2.push(`<!----> `);
    if (store_get($$store_subs ??= {}, "$isLoading", $isLoading)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading-screen svelte-12qhfyh"></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="layout-container svelte-12qhfyh">`);
      Sidebar($$renderer2);
      $$renderer2.push(`<!----> <div class="main-content svelte-12qhfyh">`);
      DashboardHeader($$renderer2);
      $$renderer2.push(`<!----> <main class="svelte-12qhfyh">`);
      children($$renderer2);
      $$renderer2.push(`<!----></main></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
