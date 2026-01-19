import { b as store_get, d as attr, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { t as themeSettings } from "../../../chunks/store2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let url = "";
    let token = "";
    function handleThemeModeChange(e) {
      const mode = e.target.value;
      themeSettings.update((s) => {
        const next = { ...s, mode };
        themeSettings.save(next);
        return next;
      });
    }
    $$renderer2.push(`<div class="settings-container svelte-1i19ct2"><h1 class="svelte-1i19ct2">Settings</h1> <section class="settings-section svelte-1i19ct2"><h2 class="svelte-1i19ct2">Appearance</h2> <div class="form-group svelte-1i19ct2"><label for="theme-mode" class="svelte-1i19ct2">Theme Mode</label> `);
    $$renderer2.select(
      {
        id: "theme-mode",
        value: store_get($$store_subs ??= {}, "$themeSettings", themeSettings).mode,
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
    $$renderer2.push(`</div> `);
    if (store_get($$store_subs ??= {}, "$themeSettings", themeSettings).mode === "schedule") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="schedule-inputs svelte-1i19ct2"><div class="form-group svelte-1i19ct2"><label for="dark-start" class="svelte-1i19ct2">Dark Mode Start</label> <input type="time" id="dark-start"${attr("value", store_get($$store_subs ??= {}, "$themeSettings", themeSettings).schedule.darkStart)} class="svelte-1i19ct2"/></div> <div class="form-group svelte-1i19ct2"><label for="dark-end" class="svelte-1i19ct2">Dark Mode End</label> <input type="time" id="dark-end"${attr("value", store_get($$store_subs ??= {}, "$themeSettings", themeSettings).schedule.darkEnd)} class="svelte-1i19ct2"/></div></div>`);
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
