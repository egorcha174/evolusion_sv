<script lang="ts">
    import "iconify-icon";
    import { haStore } from "../../ha/store";

    interface Props {
        settings?: any;
    }

    let { settings = {} }: Props = $props();

    let entities = $derived(settings.entities || []);

    function getBatteryLevel(id: string): number | null {
        const entity = $haStore.entities.get(id);
        if (
            !entity ||
            entity.state === "unavailable" ||
            entity.state === "unknown"
        )
            return null;
        return parseInt(entity.state, 10);
    }

    function getName(id: string): string {
        const entity = $haStore.entities.get(id);
        return entity?.attributes.friendly_name || id;
    }

    function getIcon(level: number | null): string {
        if (level === null) return "mdi:battery-unknown";
        if (level >= 95) return "mdi:battery";
        if (level >= 90) return "mdi:battery-90";
        if (level >= 80) return "mdi:battery-80";
        if (level >= 70) return "mdi:battery-70";
        if (level >= 60) return "mdi:battery-60";
        if (level >= 50) return "mdi:battery-50";
        if (level >= 40) return "mdi:battery-40";
        if (level >= 30) return "mdi:battery-30";
        if (level >= 20) return "mdi:battery-20";
        if (level >= 10) return "mdi:battery-10";
        return "mdi:battery-alert";
    }

    function getColorClass(level: number | null): string {
        if (level === null) return "unknown";
        if (level <= 20) return "critical";
        if (level <= 40) return "low";
        return "good";
    }
</script>

<div class="battery-widget">
    <div class="header">
        <span class="title">Battery Levels</span>
        <iconify-icon icon="mdi:battery-charging-high" width="20"
        ></iconify-icon>
    </div>

    <div class="battery-list">
        {#if entities.length === 0}
            <div class="empty">No devices selected</div>
        {:else}
            {#each entities as id}
                {@const level = getBatteryLevel(id)}
                {@const colorClass = getColorClass(level)}
                <div class="battery-row">
                    <div class="name-col" title={getName(id)}>
                        {getName(id)}
                    </div>
                    <div class="val-col {colorClass}">
                        <span>{level !== null ? `${level}%` : "?"}</span>
                        <iconify-icon icon={getIcon(level)}></iconify-icon>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .battery-widget {
        width: 100%;
        height: 100%;
        background: var(--bg-card);
        border-radius: var(--radius-lg, 16px);
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.05));
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .header {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-divider, rgba(255, 255, 255, 0.1));
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-header, rgba(0, 0, 0, 0.02));
        color: var(--text-primary);
        font-weight: 600;
        font-size: 0.95rem;
    }

    .battery-list {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem 0;
    }

    .battery-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid
            var(--border-divider, rgba(255, 255, 255, 0.05));
    }

    .battery-row:last-child {
        border-bottom: none;
    }

    .name-col {
        font-size: 0.9rem;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        margin-right: 1rem;
    }

    .val-col {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .val-col.good {
        color: var(--color-success, #22c55e);
    }
    .val-col.low {
        color: var(--color-warning, #eab308);
    }
    .val-col.critical {
        color: var(--color-error, #ef4444);
    }
    .val-col.unknown {
        color: var(--text-muted);
    }

    .empty {
        padding: 2rem;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
    }
</style>
