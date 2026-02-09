<script lang="ts">
    import type { HAEntity } from "$lib/types";
    import { LOW_BATTERY_THRESHOLD } from "$domains/ha/virtual-devices";

    interface Props {
        entity: HAEntity;
    }

    let { entity }: Props = $props();

    interface BatteryDevice {
        id: string;
        name: string;
        level: number;
    }

    let devices = $derived(
        (entity?.attributes?.battery_devices as BatteryDevice[]) || [],
    );
    let isExpanded = $state(false);

    let devicesToShow = $derived(isExpanded ? devices : devices.slice(0, 4));

    function getBatteryIcon(level: number) {
        if (level <= LOW_BATTERY_THRESHOLD)
            return "mdi:battery-alert-variant-outline";
        if (level <= 10) return "mdi:battery-10";
        if (level <= 20) return "mdi:battery-20";
        if (level <= 30) return "mdi:battery-30";
        if (level <= 40) return "mdi:battery-40";
        if (level <= 50) return "mdi:battery-50";
        if (level <= 60) return "mdi:battery-60";
        if (level <= 70) return "mdi:battery-70";
        if (level <= 80) return "mdi:battery-80";
        if (level <= 90) return "mdi:battery-90";
        return "mdi:battery";
    }

    function toggleExpand(e: MouseEvent) {
        e.stopPropagation();
        isExpanded = !isExpanded;
    }
</script>

<div class="battery-widget">
    <div class="header">
        <iconify-icon
            icon="mdi:battery-heart-variant-outline"
            width="24"
            class="header-icon"
        ></iconify-icon>
        <h3>Уровень заряда</h3>
    </div>

    <div class="list">
        {#if devices.length === 0}
            <div class="empty">
                <iconify-icon
                    icon="mdi:battery-off-outline"
                    width="40"
                    style="color: var(--text-secondary);"
                ></iconify-icon>
                <p class="empty-title">Нет устройств с батареей</p>
                <p class="empty-subtitle">
                    Не найдено устройств с уровнем заряда.
                </p>
            </div>
        {/if}

        {#each devicesToShow as device (device.id)}
            {@const isLow = device.level <= LOW_BATTERY_THRESHOLD}
            <div class="device-row">
                <div
                    class="device-info"
                    style:color={isLow
                        ? "var(--accent-error, #ef4444)"
                        : "var(--text-primary)"}
                >
                    <iconify-icon icon={getBatteryIcon(device.level)} width="20"
                    ></iconify-icon>
                    <span class="name" title={device.name}>{device.name}</span>
                </div>
                <span
                    class="level"
                    style:color={isLow
                        ? "var(--accent-error, #ef4444)"
                        : "var(--text-secondary)"}>{device.level}%</span
                >
            </div>
        {/each}
    </div>

    {#if devices.length > 4}
        <button class="expand-btn" onclick={toggleExpand}>
            {isExpanded ? "Свернуть" : `Показать еще ${devices.length - 4}`}
        </button>
    {/if}
</div>

<style>
    .battery-widget {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        /* background-color: transparent via previous edit, ensuring it fills parent */
        color: var(--text-primary);
        overflow: hidden;
        border-radius: var(--card-border-radius, 16px);
    }

    .header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        flex-shrink: 0;
    }

    .header-icon {
        color: var(--text-secondary);
    }

    h3 {
        font-weight: 500;
        font-size: 0.95rem;
        margin: 0;
        color: var(--text-primary);
    }

    .list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-right: 0.25rem;
    }

    /* Hide scrollbars (Fusion behavior) */
    .list::-webkit-scrollbar {
        display: none;
    }
    .list {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .device-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
    }

    .device-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        overflow: hidden;
    }

    .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .level {
        font-weight: 600;
        flex-shrink: 0;
        margin-left: 0.5rem;
    }

    .expand-btn {
        margin-top: 0.5rem;
        background: none;
        border: none;
        color: var(--accent-info, #3b82f6);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0.25rem;
        width: 100%;
        text-align: center;
        flex-shrink: 0;
    }

    .expand-btn:hover {
        text-decoration: underline;
    }

    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-secondary);
        gap: 0.5rem;
        text-align: center;
    }

    .empty-title {
        margin: 0;
        font-weight: 600;
        color: var(--text-primary);
    }

    .empty-subtitle {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
</style>
