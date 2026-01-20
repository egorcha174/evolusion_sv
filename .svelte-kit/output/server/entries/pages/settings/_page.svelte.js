import { b as store_get, e as ensure_array_like, d as attr, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { t as themeStore } from "../../../chunks/store2.js";
import { _ as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let url = "";
    let token = "";
    function handleThemeModeChange(e) {
      const mode = e.target.value;
      themeStore.setMode(mode);
    }
    function handleThemeChange(e) {
      const activeThemeId = e.target.value;
      themeStore.setTheme(activeThemeId);
    }
    $$renderer2.push(`<div class="settings-container svelte-1i19ct2"><h1 class="svelte-1i19ct2">Settings</h1> <section class="settings-section svelte-1i19ct2"><h2 class="svelte-1i19ct2">Appearance</h2> <div class="form-group svelte-1i19ct2"><label for="theme-mode" class="svelte-1i19ct2">Mode</label> `);
    $$renderer2.select(
      {
        id: "theme-mode",
        value: store_get($$store_subs ??= {}, "$themeStore", themeStore).mode,
        onchange: handleThemeModeChange,
        class: ""
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "auto" }, ($$renderer4) => {
          $$renderer4.push(`Auto (System)`);
        });
        $$renderer3.option({ value: "day" }, ($$renderer4) => {
          $$renderer4.push(`Day (Always Light)`);
        });
        $$renderer3.option({ value: "night" }, ($$renderer4) => {
          $$renderer4.push(`Night (Always Dark)`);
        });
        $$renderer3.option({ value: "schedule" }, ($$renderer4) => {
          $$renderer4.push(`Schedule`);
        });
      },
      "svelte-1i19ct2"
    );
    $$renderer2.push(`</div> <div class="form-group svelte-1i19ct2"><label for="theme-select" class="svelte-1i19ct2">Theme</label> `);
    $$renderer2.select(
      {
        id: "theme-select",
        value: store_get($$store_subs ??= {}, "$themeStore", themeStore).currentThemeId,
        onchange: handleThemeChange,
        class: ""
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$themeStore", themeStore).availableThemes);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let theme = each_array[$$index];
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
    $$renderer2.push(`<!--]--></section> <section class="settings-section svelte-1i19ct2"><h2 class="svelte-1i19ct2">Connection</h2> <p class="description svelte-1i19ct2">Configure your Home Assistant connection details.</p> <div class="form-group svelte-1i19ct2"><label for="url" class="svelte-1i19ct2">Server URL</label> <input id="url" type="url"${attr("value", url)} placeholder="http://homeassistant.local:8123" autocomplete="url" class="svelte-1i19ct2"/> <span class="hint svelte-1i19ct2">e.g. http://192.168.1.100:8123</span></div> <div class="form-group svelte-1i19ct2"><label for="token" class="svelte-1i19ct2">Long-Lived Access Token</label> <input id="token" type="password"${attr("value", token)} placeholder="eyJhbGciOi..." autocomplete="current-password" class="svelte-1i19ct2"/> <span class="hint svelte-1i19ct2">Create this in your HA profile settings.</span></div> <div class="actions svelte-1i19ct2"><button class="btn-secondary svelte-1i19ct2">Test Connection</button> <button class="btn-primary svelte-1i19ct2">Save Configuration</button></div> `);
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
