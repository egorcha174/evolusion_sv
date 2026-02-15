<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";

    let { config = $bindable({}) } = $props<{ config: any }>();

    // Available Skins
    const skins = [
        {
            id: "neon",
            icon: "mdi:blur",
            label: "widgets.thermostat.skins.neon",
        },
        {
            id: "main",
            icon: "mdi:thermostat",
            label: "widgets.thermostat.skins.main",
        },
        {
            id: "vertical",
            icon: "mdi:tune-vertical",
            label: "widgets.thermostat.skins.vertical",
        },
    ];

    function selectSkin(id: string) {
        config.skin = id;
    }
</script>

<div class="settings-group" role="group" aria-labelledby="skin-label">
    <span id="skin-label" class="label"
        >{$t("widgets.thermostat.settings.skinLabel", {
            default: "Skin",
        })}</span
    >
    <div class="skin-selector">
        {#each skins as skin}
            <button
                class="skin-option"
                class:selected={config.skin === skin.id ||
                    (!config.skin && skin.id === "main")}
                onclick={() => selectSkin(skin.id)}
                title={$t(skin.label)}
            >
                <iconify-icon icon={skin.icon} width="24"></iconify-icon>
                <span>{$t(skin.label)}</span>
            </button>
        {/each}
    </div>
</div>

<style>
    .settings-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .label {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-secondary);
    }

    .skin-selector {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
    }

    .skin-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: var(--bg-card);
        border: 1px solid var(--border-primary);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--text-secondary);
    }

    .skin-option:hover {
        background: var(--bg-card-hover);
        border-color: var(--border-hover);
    }

    .skin-option.selected {
        background: var(--accent-primary-dim, rgba(0, 122, 255, 0.1));
        border-color: var(--accent-primary);
        color: var(--accent-primary);
    }

    span {
        font-size: 0.8rem;
    }
</style>
