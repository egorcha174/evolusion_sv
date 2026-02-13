<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import type { ThermostatController } from "./core/thermostat.svelte";
    import type { HAEntity } from "$lib/types";

    let { controller, entity, hvacMode, currentPresetMode } = $props<{
        controller: ThermostatController;
        entity: HAEntity;
        hvacMode: string;
        currentPresetMode?: string;
    }>();

    let hvacModes = $derived(entity.attributes.hvac_modes || []);
    let presetModes = $derived(entity.attributes.preset_modes || []);

    let showPresetMenu = $state(false);

    function togglePresetMenu() {
        showPresetMenu = !showPresetMenu;
    }

    function selectPreset(mode: string) {
        controller.setPresetMode(mode);
        showPresetMenu = false;
    }

    function closePresetMenu() {
        showPresetMenu = false;
    }

    // Handle click outside for preset menu
    function handleWindowClick(e: MouseEvent) {
        if (
            showPresetMenu &&
            !(e.target as Element).closest(".preset-wrapper")
        ) {
            closePresetMenu();
        }
    }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="controls">
    <!-- Mode Selector -->
    <div class="mode-row">
        {#if hvacModes.includes("off")}
            <button
                class="mode-btn"
                class:active={hvacMode === "off"}
                onclick={() => controller.setHvacMode("off")}
                aria-label={$t("common.off")}
                title={$t("common.off")}
            >
                <iconify-icon icon="mdi:power"></iconify-icon>
            </button>
        {/if}
        {#if hvacModes.includes("heat")}
            <button
                class="mode-btn"
                class:active={hvacMode === "heat"}
                class:action-heating={hvacMode === "heat" &&
                    entity.attributes.hvac_action === "heating"}
                onclick={() => controller.setHvacMode("heat")}
                aria-label={$t("widgets.thermostat.modes.heat", {
                    default: "Heat",
                })}
                title={$t("widgets.thermostat.modes.heat", { default: "Heat" })}
            >
                <iconify-icon icon="mdi:fire"></iconify-icon>
            </button>
        {/if}
        {#if hvacModes.includes("cool")}
            <button
                class="mode-btn"
                class:active={hvacMode === "cool"}
                class:action-cooling={hvacMode === "cool" &&
                    entity.attributes.hvac_action === "cooling"}
                onclick={() => controller.setHvacMode("cool")}
                aria-label={$t("widgets.thermostat.modes.cool", {
                    default: "Cool",
                })}
                title={$t("widgets.thermostat.modes.cool", { default: "Cool" })}
            >
                <iconify-icon icon="mdi:snowflake"></iconify-icon>
            </button>
        {/if}
        {#if hvacModes.includes("auto")}
            <button
                class="mode-btn"
                class:active={hvacMode === "auto"}
                onclick={() => controller.setHvacMode("auto")}
                aria-label={$t("widgets.thermostat.modes.auto", {
                    default: "Auto",
                })}
                title={$t("widgets.thermostat.modes.auto", { default: "Auto" })}
            >
                <iconify-icon icon="mdi:thermostat-auto"></iconify-icon>
            </button>
        {/if}

        <!-- Preset Button (if available) -->
        {#if presetModes.length > 0}
            <div class="preset-wrapper">
                <button
                    class="mode-btn preset-trigger"
                    class:active={currentPresetMode &&
                        currentPresetMode !== "none"}
                    onclick={togglePresetMenu}
                    aria-label={$t("widgets.thermostat.presets.title", {
                        default: "Presets",
                    })}
                    title={$t("widgets.thermostat.presets.title", {
                        default: "Presets",
                    })}
                >
                    <iconify-icon icon="mdi:tune-vertical"></iconify-icon>
                </button>

                {#if showPresetMenu}
                    <div class="preset-menu">
                        <div class="menu-header">
                            {$t("widgets.thermostat.presets.title", {
                                default: "Presets",
                            })}
                        </div>
                        {#each presetModes as mode}
                            <button
                                class="preset-item"
                                class:selected={currentPresetMode === mode}
                                onclick={() => selectPreset(mode)}
                            >
                                <span>{mode}</span>
                                {#if currentPresetMode === mode}
                                    <iconify-icon icon="mdi:check" width="16"
                                    ></iconify-icon>
                                {/if}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .controls {
        width: 100%;
        display: flex;
        justify-content: center;
        z-index: 5;
        pointer-events: auto;
    }

    .mode-row {
        display: flex;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px;
        border-radius: 16px;
        position: relative;
    }

    .mode-btn {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 1.4rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        position: relative;
    }

    .mode-btn:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
    }

    .mode-btn.active {
        background: var(--bg-card);
        color: var(--accent-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .mode-btn.action-heating {
        color: #ff3d00;
        filter: drop-shadow(0 0 8px rgba(255, 61, 0, 0.5));
    }

    .mode-btn.action-cooling {
        color: #00b0ff;
        filter: drop-shadow(0 0 8px rgba(0, 176, 255, 0.5));
    }

    /* Preset Menu */
    .preset-wrapper {
        position: relative;
    }

    .preset-menu {
        position: absolute;
        bottom: 100%; /* Show above */
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 8px;
        background: var(--bg-surface, #2c2c2e);
        min-width: 160px;
        border-radius: 12px;
        padding: 4px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 100;
        overflow: hidden;
        animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, 10px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }

    .menu-header {
        padding: 8px 12px;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid
            var(--border-divider, rgba(255, 255, 255, 0.05));
    }

    .preset-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: transparent;
        border: none;
        color: var(--text-primary);
        font-size: 0.9rem;
        cursor: pointer;
        border-radius: 8px;
        text-transform: capitalize;
        transition: background 0.2s;
        text-align: left;
    }

    .preset-item:hover {
        background: var(--bg-hover, rgba(255, 255, 255, 0.05));
    }

    .preset-item.selected {
        color: var(--accent-primary);
        font-weight: 500;
    }
</style>
