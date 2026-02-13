<script lang="ts">
    import { onDestroy, untrack } from "svelte";
    import type { HAEntity } from "$lib/types";
    import { ThermostatController } from "./thermostat/core/thermostat.svelte";
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import "./thermostat/styles/thermostat.css";

    // Skins
    import ThermostatRing from "./thermostat/ThermostatRing.svelte";
    import ThermostatVertical from "./thermostat/ThermostatVertical.svelte";
    import ThermostatHorizontal from "./thermostat/ThermostatHorizontal.svelte";
    import ThermostatMinimal from "./thermostat/ThermostatMinimal.svelte";
    import ThermostatNeon from "./thermostat/ThermostatNeon.svelte";
    import ThermostatMushroom from "./thermostat/ThermostatMushroom.svelte";

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
    let skin = $derived(settings?.skin || "ring"); // ring, vertical, horizontal
</script>

<div class="thermostat-widget skin-{skin} thermostat-root">
    {#if controller}
        {#if skin === "vertical"}
            <ThermostatVertical {entity} {controller} />
        {:else if skin === "horizontal"}
            <ThermostatHorizontal {entity} {controller} />
        {:else if skin === "minimal" || skin === "ticks"}
            <ThermostatMinimal {entity} {controller} />
        {:else if skin === "neon"}
            <ThermostatNeon {entity} {controller} />
        {:else if skin === "mushroom"}
            <ThermostatMushroom {entity} {controller} />
        {:else}
            <ThermostatRing {entity} {controller} />
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
