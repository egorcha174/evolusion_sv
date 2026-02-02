<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import { haStore } from "../../../ha/store";
    import { extractDomain } from "$lib/utils";

    let { settings = $bindable({}) } = $props<{
        settings: Record<string, any>;
    }>();

    // Default settings
    if (!settings.entities) settings.entities = []; // Array of entity_ids

    // Get all battery entities
    let batteryEntities = $derived(
        Array.from($haStore.entities.values()).filter((e) => {
            const isBattery =
                e.attributes.device_class === "battery" ||
                e.entity_id.includes("battery");
            const domain = extractDomain(e.entity_id);
            return domain === "sensor" && isBattery;
        }),
    );

    function toggleEntity(id: string) {
        if (settings.entities.includes(id)) {
            settings.entities = settings.entities.filter(
                (e: string) => e !== id,
            );
        } else {
            settings.entities = [...settings.entities, id];
        }
    }
</script>

<div class="settings-group">
    <div class="field">
        <label
            >{$t("widgets.batteryMonitor.selectDevices", {
                default: "Select Devices",
            })}</label
        >

        <div class="list-container">
            {#if batteryEntities.length === 0}
                <div class="empty">No battery sensors found</div>
            {:else}
                {#each batteryEntities as entity (entity.entity_id)}
                    {@const isSelected = settings.entities.includes(
                        entity.entity_id,
                    )}
                    <button
                        class="entity-item"
                        class:selected={isSelected}
                        onclick={() => toggleEntity(entity.entity_id)}
                        type="button"
                    >
                        <div class="info">
                            <span class="name"
                                >{entity.attributes.friendly_name ||
                                    entity.entity_id}</span
                            >
                            <span class="id">{entity.entity_id}</span>
                        </div>
                        <div class="status">
                            {#if isSelected}
                                <iconify-icon
                                    icon="mdi:check-circle"
                                    class="check"
                                ></iconify-icon>
                            {:else}
                                <iconify-icon
                                    icon="mdi:circle-outline"
                                    class="uncheck"
                                ></iconify-icon>
                            {/if}
                        </div>
                    </button>
                {/each}
            {/if}
        </div>
        <p class="hint">Selected: {settings.entities.length}</p>
    </div>
</div>

<style>
    .settings-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        max-height: 400px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
        min-height: 0;
    }

    label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 500;
    }

    .list-container {
        flex: 1;
        overflow-y: auto;
        border: 1px solid var(--border-input, #e0e0e0);
        border-radius: 8px;
        background: var(--bg-input, #f5f5f5);
        display: flex;
        flex-direction: column;
        padding: 4px;
    }

    :global(body.dark) .list-container {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .entity-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
    }

    .entity-item:hover {
        background: var(--bg-card-hover, rgba(0, 0, 0, 0.05));
    }

    .entity-item.selected {
        background: var(--accent-primary-op, rgba(33, 150, 243, 0.1));
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
    }

    .name {
        font-size: 0.9rem;
        color: var(--text-primary);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .id {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }

    .status iconify-icon {
        font-size: 1.2rem;
    }

    .check {
        color: var(--accent-primary);
    }

    .uncheck {
        color: var(--text-muted);
    }

    .empty {
        padding: 2rem;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.9rem;
    }

    .hint {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-align: right;
        margin: 0;
    }
</style>
