import { a as attr } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let url = "";
    let token = "";
    $$renderer2.push(`<div class="settings-container svelte-1i19ct2"><h1 class="svelte-1i19ct2">Settings</h1> <p class="description svelte-1i19ct2">Configure your Home Assistant connection details.</p> <div class="form-group svelte-1i19ct2"><label for="url" class="svelte-1i19ct2">Server URL</label> <input id="url" type="url"${attr("value", url)} placeholder="http://homeassistant.local:8123" autocomplete="url" class="svelte-1i19ct2"/> <span class="hint svelte-1i19ct2">e.g. http://192.168.1.100:8123</span></div> <div class="form-group svelte-1i19ct2"><label for="token" class="svelte-1i19ct2">Long-Lived Access Token</label> <input id="token" type="password"${attr("value", token)} placeholder="eyJhbGciOi..." autocomplete="current-password" class="svelte-1i19ct2"/> <span class="hint svelte-1i19ct2">Create this in your HA profile settings.</span></div> <div class="actions svelte-1i19ct2"><button class="btn-secondary svelte-1i19ct2">Test Connection</button> <button class="btn-primary svelte-1i19ct2">Save Configuration</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
