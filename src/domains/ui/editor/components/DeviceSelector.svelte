<script lang="ts">
    import { t } from "svelte-i18n";
    import { haStore } from "../../../ha/store";
    import { extractDomain } from "$lib/utils";
    import "iconify-icon";

    let {
        onSelect,
        activeTab = "entities",
        showTabs = true,
    } = $props<{
        onSelect: (type: "entity" | "camera" | "widget", id: string) => void;
        activeTab?: "entities" | "widgets";
        showTabs?: boolean;
    }>();

    let searchQuery = $state("");
    // Use local state initialized from prop, or just use the prop if it's meant to be static for this instance
    // Since the dialog tabs control the view, we can just treat internal activeTab as a local state initialized by prop
    // But if we want to change it dynamically, we might need an effect.
    // Creating a local reactive state that defaults to prop:
    let currentTab = $state(activeTab);

    // Sync if prop changes (optional, but good for reactivity if parent changes it)
    $effect(() => {
        currentTab = activeTab;
    });

    let inputElement: HTMLInputElement;

    // --- ENTITY FILTERING ---
    const COMMON_DOMAINS = [
        { id: "light", icon: "mdi:lightbulb" },
        { id: "switch", icon: "mdi:toggle-switch" },
        { id: "sensor", icon: "mdi:eye" },
        { id: "binary_sensor", icon: "mdi:circle-slice-8" },
        // { id: "climate", icon: "mdi:thermostat" },
        // { id: "cover", icon: "mdi:window-shutter" },
        // { id: "media_player", icon: "mdi:cast-connected" },
        // { id: "script", icon: "mdi:script-text" },
    ];

    let selectedDomain = $state<string | null>(null);

    let filteredDevices = $derived.by(() => {
        const all = Array.from($haStore.entities.values());

        const sorted = all.sort((a, b) => {
            // Online first
            if (a.state === "unavailable" && b.state !== "unavailable")
                return 1;
            if (a.state !== "unavailable" && b.state === "unavailable")
                return -1;
            // Name
            const nameA = a.attributes.friendly_name || a.entity_id;
            const nameB = b.attributes.friendly_name || b.entity_id;
            return nameA.localeCompare(nameB);
        });

        return sorted.filter((e) => {
            const d = extractDomain(e.entity_id);
            if (selectedDomain && d !== selectedDomain) return false;

            // Allowlist logic (hide internal/system entities unless searching)
            if (!selectedDomain && !searchQuery) {
                if (["zone", "sun", "person", "update"].includes(d))
                    return false;
            }

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchName = e.attributes.friendly_name
                    ?.toLowerCase()
                    .includes(q);
                const matchId = e.entity_id.toLowerCase().includes(q);
                return matchName || matchId;
            }
            return true;
        });
    });

    // --- ACTIONS ---

    function toggleDomain(d: string) {
        if (selectedDomain === d) selectedDomain = null;
        else selectedDomain = d;
    }

    function handleSelectEntity(id: string) {
        onSelect("entity", id);
    }

    function handleSelectCamera(id: string) {
        onSelect("camera", id);
    }
</script>

<div class="device-selector">
    <!-- Tabs -->
    {#if showTabs}
        <div class="tabs">
            <button
                class="tab"
                class:active={currentTab === "entities"}
                onclick={() => (currentTab = "entities")}
            >
                <iconify-icon icon="mdi:devices"></iconify-icon>
                {$t("addDevice.entities", { default: "Devices" })}
            </button>
            <button
                class="tab"
                class:active={currentTab === "widgets"}
                onclick={() => (currentTab = "widgets")}
            >
                <iconify-icon icon="mdi:widgets"></iconify-icon>
                {$t("addDevice.widgets", { default: "Widgets" })}
            </button>
        </div>
    {/if}

    {#if currentTab === "entities"}
        <!-- Search -->
        <div class="search-section">
            <div class="search-box">
                <iconify-icon icon="mdi:magnify"></iconify-icon>
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder={$t("addDevice.search")}
                />
                {#if searchQuery}
                    <button
                        class="clear-btn"
                        onclick={() => (searchQuery = "")}
                    >
                        <iconify-icon icon="mdi:close-circle" width="16"
                        ></iconify-icon>
                    </button>
                {/if}
            </div>

            <div class="filters">
                <button
                    class="pill"
                    class:active={selectedDomain === null}
                    onclick={() => (selectedDomain = null)}
                >
                    {$t("addDevice.all")}
                </button>
                {#each COMMON_DOMAINS as d}
                    <button
                        class="pill"
                        class:active={selectedDomain === d.id}
                        onclick={() => toggleDomain(d.id)}
                        title={d.id}
                        aria-label={d.id}
                    >
                        <iconify-icon icon={d.icon}></iconify-icon>
                    </button>
                {/each}
            </div>
        </div>

        <!-- List -->
        <div class="list">
            {#each filteredDevices as device (device.entity_id)}
                <button
                    class="list-item"
                    onclick={() => handleSelectEntity(device.entity_id)}
                >
                    <div class="item-icon">
                        <iconify-icon
                            icon={extractDomain(device.entity_id) === "light"
                                ? "mdi:lightbulb"
                                : "mdi:circle"}
                        ></iconify-icon>
                    </div>
                    <div class="item-info">
                        <div class="item-name">
                            {device.attributes.friendly_name ||
                                device.entity_id}
                        </div>
                        <div class="item-sub">{device.entity_id}</div>
                    </div>
                    <iconify-icon icon="mdi:plus" class="add-icon"
                    ></iconify-icon>
                </button>
            {/each}
        </div>
    {:else}
        <!-- WIDGETS LIST -->
        <div class="list">
            <!-- Camera Widget -->
            <button
                class="list-item"
                onclick={() => onSelect("camera", "camera")}
            >
                <div class="item-icon">
                    <iconify-icon icon="mdi:cctv"></iconify-icon>
                </div>
                <div class="item-info">
                    <div class="item-name">
                        {$t("widget.camera", { default: "Camera" })}
                    </div>
                    <div class="item-sub">
                        {$t("widget.camera_desc", {
                            default: "Stream from Go2rtc, URL or Entity",
                        })}
                    </div>
                </div>
                <iconify-icon icon="mdi:chevron-right" class="add-icon"
                ></iconify-icon>
            </button>

            <!-- Event Timer Widget -->
            <button
                class="list-item"
                onclick={() => onSelect("widget", "event-timer")}
            >
                <div class="item-icon">
                    <iconify-icon icon="mdi:timer"></iconify-icon>
                </div>
                <div class="item-info">
                    <div class="item-name">
                        {$t("widget.timer", { default: "Event Timer" })}
                    </div>
                    <div class="item-sub">
                        {$t("widget.timer_desc", {
                            default: "Countdown or countup timer",
                        })}
                    </div>
                </div>
                <iconify-icon icon="mdi:chevron-right" class="add-icon"
                ></iconify-icon>
            </button>

            <!-- Battery Monitor Widget -->
            <button
                class="list-item"
                onclick={() => onSelect("widget", "battery-monitor")}
            >
                <div class="item-icon">
                    <iconify-icon icon="mdi:battery"></iconify-icon>
                </div>
                <div class="item-info">
                    <div class="item-name">
                        {$t("widget.battery", { default: "Battery Monitor" })}
                    </div>
                    <div class="item-sub">
                        {$t("widget.battery_desc", {
                            default: "Track device battery levels",
                        })}
                    </div>
                </div>
                <iconify-icon icon="mdi:chevron-right" class="add-icon"
                ></iconify-icon>
            </button>
        </div>
    {/if}
</div>

<style>
    .device-selector {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .tabs {
        display: flex;
        gap: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-divider);
        flex-shrink: 0;
    }

    .tab {
        flex: 1;
        padding: 0.5rem;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--text-secondary);
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    .tab.active {
        color: var(--accent-primary);
        border-bottom-color: var(--accent-primary);
    }

    .search-section {
        padding: 1rem 0;
        flex-shrink: 0;
    }

    .search-box {
        display: flex;
        align-items: center;
        background: var(--bg-input);
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }
    .search-box input {
        border: none;
        background: transparent;
        width: 100%;
        color: var(--text-primary);
        outline: none;
    }

    .filters {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 2px;
    }
    .filters::-webkit-scrollbar {
        display: none;
    }

    .pill {
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid var(--border-primary);
        background: var(--bg-card);
        color: var(--text-secondary);
        font-size: 0.85rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        white-space: nowrap;
    }
    .pill.active {
        background: var(--accent-primary);
        color: white;
        border-color: var(--accent-primary);
    }

    .list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
        /* Custom scrollbar */
        padding-right: 4px;
    }
    .list::-webkit-scrollbar {
        width: 4px;
    }
    .list::-webkit-scrollbar-thumb {
        background: var(--border-primary);
        border-radius: 4px;
    }

    .list-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: var(--bg-card);
        border: 1px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        transition: all 0.1s;
        width: 100%;
    }
    .list-item:hover {
        background: var(--bg-card-hover);
        border-color: var(--border-primary);
    }

    .item-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg-chip);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent-primary);
        flex-shrink: 0;
    }

    .item-info {
        flex: 1;
        min-width: 0;
    }

    .item-name {
        font-weight: 500;
        color: var(--text-primary);
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .item-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .add-icon {
        color: var(--text-secondary);
        opacity: 0;
        transition: opacity 0.2s;
    }
    .list-item:hover .add-icon {
        opacity: 1;
    }
</style>
