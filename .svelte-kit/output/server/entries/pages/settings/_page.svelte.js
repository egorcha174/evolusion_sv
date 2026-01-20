import { b as store_get, e as ensure_array_like, d as attr, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { h as haStore, $ as $format } from "../../../chunks/runtime.js";
import { b as weatherSettings, t as themeStore, s as setLocale, c as currentLang, d as availableLanguages, w as weatherStore } from "../../../chunks/store.js";
import { g as get } from "../../../chunks/index.js";
import { _ as escape_html } from "../../../chunks/context.js";
const CHELYABINSK = {
  lat: 55.1644,
  lon: 61.4368,
  name: "Chelyabinsk (Fallback)"
};
function resolveCoordinates(settings) {
  if (settings.useCustomLocation && settings.customLocation) {
    return {
      lat: settings.customLocation.lat,
      lon: settings.customLocation.lon,
      name: settings.customLocation.name || "Custom Location"
    };
  }
  const state = get(haStore);
  const homeZone = state.entities.get("zone.home");
  if (homeZone && homeZone.attributes.latitude && homeZone.attributes.longitude) {
    return {
      lat: homeZone.attributes.latitude,
      lon: homeZone.attributes.longitude,
      name: homeZone.attributes.friendly_name || "Home"
    };
  }
  return CHELYABINSK;
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let url = "";
    let token = "";
    let wProvider = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).provider;
    let wApiKey = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).apiKey || "";
    let wUseCustom = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).useCustomLocation;
    let wLat = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).customLocation?.lat ?? 55.1644;
    let wLon = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).customLocation?.lon ?? 61.4368;
    let wShowForecast = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).showForecast;
    let wForecastDays = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastDays;
    let wIconPack = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).iconPack;
    let wForecastLayout = store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastLayout;
    let locationInfo = resolveCoordinates(store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings));
    function handleThemeModeChange(e) {
      const mode = e.target.value;
      themeStore.setMode(mode);
    }
    function handleThemeChange(e) {
      const activeThemeId = e.target.value;
      themeStore.setTheme(activeThemeId);
    }
    function handleLanguageChange(e) {
      e.target.value;
      setLocale();
    }
    $$renderer2.push(`<div class="settings-panel svelte-1i19ct2"><h1 class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.title"))}</h1> <section class="settings-section svelte-1i19ct2"><h2 class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.appearance"))}</h2> <div class="form-group svelte-1i19ct2"><label for="lang-select" class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.languageSelect"))}</label> `);
    $$renderer2.select(
      {
        id: "lang-select",
        value: store_get($$store_subs ??= {}, "$currentLang", currentLang),
        onchange: handleLanguageChange,
        class: ""
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$availableLanguages", availableLanguages));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let lang = each_array[$$index];
          $$renderer3.option({ value: lang.code }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(lang.name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-1i19ct2"
    );
    $$renderer2.push(`</div> <div class="form-group svelte-1i19ct2"><label for="lang-import" class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.importLanguage"))}</label> <div class="file-upload"><input type="file" id="lang-import" accept=".json" class="svelte-1i19ct2"/></div></div> <div class="divider svelte-1i19ct2"></div> <div class="form-group svelte-1i19ct2"><label for="theme-mode" class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeMode"))}</label> `);
    $$renderer2.select(
      {
        id: "theme-mode",
        value: store_get($$store_subs ??= {}, "$themeStore", themeStore).mode,
        onchange: handleThemeModeChange,
        class: ""
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "auto" }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeModeAuto"))}`);
        });
        $$renderer3.option({ value: "day" }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeModeDay"))}`);
        });
        $$renderer3.option({ value: "night" }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeModeNight"))}`);
        });
        $$renderer3.option({ value: "schedule" }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeModeSchedule"))}`);
        });
      },
      "svelte-1i19ct2"
    );
    $$renderer2.push(`</div> <div class="form-group svelte-1i19ct2"><label for="theme-select" class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.theme"))}</label> `);
    $$renderer2.select(
      {
        id: "theme-select",
        value: store_get($$store_subs ??= {}, "$themeStore", themeStore).currentThemeId,
        onchange: handleThemeChange,
        class: ""
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$themeStore", themeStore).availableThemes);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let theme = each_array_1[$$index_1];
          $$renderer3.option({ value: theme.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(theme.name)} ${escape_html(theme.isCustom ? "(Custom)" : "")}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-1i19ct2"
    );
    $$renderer2.push(`</div> `);
    if (store_get($$store_subs ??= {}, "$themeStore", themeStore).mode === "schedule") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="schedule-inputs svelte-1i19ct2"><div class="form-group svelte-1i19ct2"><label for="day-start" class="svelte-1i19ct2">Day Start</label> <input type="time" id="day-start"${attr("value", store_get($$store_subs ??= {}, "$themeStore", themeStore).schedule?.dayStart || "07:00")} class="svelte-1i19ct2"/></div> <div class="form-group svelte-1i19ct2"><label for="night-start" class="svelte-1i19ct2">Night Start</label> <input type="time" id="night-start"${attr("value", store_get($$store_subs ??= {}, "$themeStore", themeStore).schedule?.nightStart || "22:00")} class="svelte-1i19ct2"/></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="settings-section svelte-1i19ct2"><h2 class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.weather"))}</h2> <div class="form-group svelte-1i19ct2"><label for="w-provider" class="svelte-1i19ct2">Provider</label> `);
    $$renderer2.select(
      { id: "w-provider", value: wProvider, class: "" },
      ($$renderer3) => {
        $$renderer3.option({ value: "openmeteo" }, ($$renderer4) => {
          $$renderer4.push(`Open-Meteo (Free, No Key)`);
        });
        $$renderer3.option({ value: "openweathermap" }, ($$renderer4) => {
          $$renderer4.push(`OpenWeatherMap (Key Required)`);
        });
        $$renderer3.option({ value: "weatherapi" }, ($$renderer4) => {
          $$renderer4.push(`WeatherAPI (Key Required)`);
        });
      },
      "svelte-1i19ct2"
    );
    $$renderer2.push(`</div> `);
    if (wProvider !== "openmeteo") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="form-group svelte-1i19ct2"><label for="w-key" class="svelte-1i19ct2">API Key</label> <input id="w-key" type="password"${attr("value", wApiKey)} placeholder="Paste your API key here" class="svelte-1i19ct2"/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="form-group checkbox-group svelte-1i19ct2"><label class="svelte-1i19ct2"><input type="checkbox"${attr("checked", wShowForecast, true)} class="svelte-1i19ct2"/> Show Multi-day Forecast</label></div> `);
    if (wShowForecast) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="form-group svelte-1i19ct2"><label for="w-days" class="svelte-1i19ct2">Forecast Days: ${escape_html(wForecastDays)}</label> <input id="w-days" type="range" min="1" max="7" step="1"${attr("value", wForecastDays)} class="svelte-1i19ct2"/></div> <div class="form-group svelte-1i19ct2"><label class="svelte-1i19ct2">Forecast Layout</label> <div class="radio-group svelte-1i19ct2"><label class="svelte-1i19ct2"><input type="radio"${attr("checked", wForecastLayout === "vertical", true)} value="vertical" class="svelte-1i19ct2"/> Vertical</label> <label class="svelte-1i19ct2"><input type="radio"${attr("checked", wForecastLayout === "horizontal", true)} value="horizontal" class="svelte-1i19ct2"/> Horizontal</label></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="form-group svelte-1i19ct2"><label for="w-icon-pack" class="svelte-1i19ct2">Icon Pack</label> `);
    $$renderer2.select(
      { id: "w-icon-pack", value: wIconPack, class: "" },
      ($$renderer3) => {
        $$renderer3.option({ value: "default" }, ($$renderer4) => {
          $$renderer4.push(`Default`);
        });
        $$renderer3.option({ value: "outline" }, ($$renderer4) => {
          $$renderer4.push(`Outline`);
        });
        $$renderer3.option({ value: "filled" }, ($$renderer4) => {
          $$renderer4.push(`Filled`);
        });
      },
      "svelte-1i19ct2"
    );
    $$renderer2.push(`</div> <div class="form-group checkbox-group svelte-1i19ct2"><label class="svelte-1i19ct2"><input type="checkbox"${attr("checked", wUseCustom, true)} class="svelte-1i19ct2"/> Use Custom Coordinates</label></div> `);
    if (wUseCustom) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="schedule-inputs svelte-1i19ct2"><div class="form-group svelte-1i19ct2"><label for="w-lat" class="svelte-1i19ct2">Latitude</label> <input id="w-lat" type="number" step="0.0001"${attr("value", wLat)} class="svelte-1i19ct2"/></div> <div class="form-group svelte-1i19ct2"><label for="w-lon" class="svelte-1i19ct2">Longitude</label> <input id="w-lon" type="number" step="0.0001"${attr("value", wLon)} class="svelte-1i19ct2"/></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="info-box svelte-1i19ct2"><p>Using location from Home Assistant (zone.home):</p> <code class="svelte-1i19ct2">${escape_html(locationInfo.name)}: ${escape_html(locationInfo.lat)}, ${escape_html(locationInfo.lon)}</code></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="actions svelte-1i19ct2"><button class="btn-primary svelte-1i19ct2">Update Weather</button></div> `);
    if (store_get($$store_subs ??= {}, "$weatherStore", weatherStore).error) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="message error svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$weatherStore", weatherStore).error)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="settings-section svelte-1i19ct2"><h2 class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.connection"))}</h2> <p class="description svelte-1i19ct2">Configure your Home Assistant connection details.</p> <div class="form-group svelte-1i19ct2"><label for="url" class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.serverUrl"))}</label> <input id="url" type="url"${attr("value", url)} placeholder="http://homeassistant.local:8123" autocomplete="url" class="svelte-1i19ct2"/> <span class="hint svelte-1i19ct2">e.g. http://192.168.1.100:8123</span></div> <div class="form-group svelte-1i19ct2"><label for="token" class="svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.token"))}</label> <input id="token" type="password"${attr("value", token)} placeholder="eyJhbGciOi..." autocomplete="current-password" class="svelte-1i19ct2"/> <span class="hint svelte-1i19ct2">Create this in your HA profile settings.</span></div> <div class="actions svelte-1i19ct2"><button class="btn-secondary svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.testConnection"))}</button> <button class="btn-primary svelte-1i19ct2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.saveConfig"))}</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
