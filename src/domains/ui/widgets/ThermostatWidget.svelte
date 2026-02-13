<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { get } from "svelte/store";
    import type { HAEntity } from "$lib/types";
    import {
        createThermostatController,
        type ThermostatState,
    } from "./thermostatStore";
    import { t } from "svelte-i18n";
    import "iconify-icon";

    // Skins
    import ThermostatRing from "./thermostat/ThermostatRing.svelte";
    import ThermostatVertical from "./thermostat/ThermostatVertical.svelte";
    import ThermostatHorizontal from "./thermostat/ThermostatHorizontal.svelte";
    import ThermostatTicks from "./thermostat/ThermostatTicks.svelte";
    import ThermostatNeon from "./thermostat/ThermostatNeon.svelte";
    import ThermostatMushroom from "./thermostat/ThermostatMushroom.svelte";

    let { entity, settings }: { entity: HAEntity; settings?: any } = $props();

    // Create/Get controller for this entity
    // Capture ID to avoid local state reference issues
    let entityId = $derived(entity.entity_id);

    // Create/Get controller for this entity - reactive to prop changes
    let controller = $derived(createThermostatController(entityId, entity));

    // Local reactive state from controller store
    // Initial value using get() to prevent flicker, then subscribe via effect
    let tsState = $state<ThermostatState>(
        get(createThermostatController(entity.entity_id, entity).state),
    );

    $effect(() => {
        const unsub = controller.state.subscribe((value) => {
            tsState = value;
        });
        return unsub;
    });

    // If `settings` prop is passed, use it.
    let skin = $derived(settings?.skin || "ring"); // ring, vertical, horizontal
</script>

<div class="thermostat-widget skin-{skin}">
    {#if skin === "vertical"}
        <ThermostatVertical {entity} {controller} state={tsState} />
    {:else if skin === "horizontal"}
        <ThermostatHorizontal {entity} {controller} state={tsState} />
    {:else if skin === "ticks"}
        <ThermostatTicks {entity} {controller} state={tsState} />
    {:else if skin === "neon"}
        <ThermostatNeon {entity} {controller} state={tsState} />
    {:else if skin === "mushroom"}
        <ThermostatMushroom {entity} {controller} state={tsState} />
    {:else}
        <ThermostatRing {entity} {controller} state={tsState} />
    {/if}
</div>

<style>
    .thermostat-widget {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
