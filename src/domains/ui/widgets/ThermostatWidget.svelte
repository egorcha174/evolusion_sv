<script lang="ts">
    import { onDestroy, untrack } from "svelte";
    import type { HAEntity } from "$lib/types";
    import { ThermostatController } from "./thermostat/core/thermostat.svelte";
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import "./thermostat/styles/thermostat.css";

    // Skins
    import ThermostatNeon from "./thermostat/ThermostatNeon.svelte";
    import ThermostatMain from "./thermostat/ThermostatMain.svelte";
    import ThermostatVertical from "./thermostat/ThermostatVertical.svelte";

    let { entity, settings }: { entity: HAEntity; settings?: any } = $props();

    let controller = $state<ThermostatController>();

    $effect(() => {
        const entityId = entity.entity_id; // Reactive to ID changes

        // Recreate controller if ID changes, using current entity data without tracking it
        const currentEntity = untrack(() => entity);

        const ctrl = new ThermostatController(entityId, currentEntity);
        controller = ctrl;

        return () => {
            ctrl.destroy();
        };
    });

    // If `settings` prop is passed, use it.
    let skin = $derived(settings?.skin || "main"); // neon, main, minimalist
</script>

<div class="thermostat-widget skin-{skin} thermostat-root">
    {#if controller}
        {#if skin === "neon"}
            <ThermostatNeon {entity} {controller} />
        {:else if skin === "vertical"}
            <ThermostatVertical {entity} {controller} />
        {:else}
            <ThermostatMain {entity} {controller} />
        {/if}
    {/if}
</div>

<style>
    .thermostat-widget {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
