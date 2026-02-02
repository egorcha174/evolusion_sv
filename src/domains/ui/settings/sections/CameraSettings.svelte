<script lang="ts">
    /**
     * Camera Settings Section
     *
     * Configuration for camera video streams including Go2rtc URL.
     */
    import { t } from "svelte-i18n";
    import { cameraStore } from "$lib/stores/camera.store.svelte";
    import "iconify-icon";

    import Section from "../Section.svelte";
    import Switch from "../controls/Switch.svelte";
    import Select from "../controls/Select.svelte";
    import LabeledInput from "../controls/LabeledInput.svelte";

    // Settings state
    let go2rtcUrl = $state("http://192.168.0.98:1984");
    let autoConnect = $state(true);
    let gridColumns = $state(0); // 0 = auto
    let showDisabled = $state(false);

    // Status
    let isTesting = $state(false);
    let testResult = $state<"success" | "error" | null>(null);
    let testMessage = $state("");

    // Load saved settings on mount
    $effect(() => {
        const saved = localStorage.getItem("evolusion_camera_settings");
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                go2rtcUrl = settings.go2rtcUrl || go2rtcUrl;
                autoConnect = settings.autoConnect ?? autoConnect;
                gridColumns = settings.gridColumns ?? gridColumns;
                showDisabled = settings.showDisabled ?? showDisabled;
            } catch (e) {
                console.error("[CameraSettings] Failed to load settings:", e);
            }
        }
    });

    // Save settings on change
    function saveSettings() {
        const settings = {
            go2rtcUrl,
            autoConnect,
            gridColumns,
            showDisabled,
        };
        localStorage.setItem(
            "evolusion_camera_settings",
            JSON.stringify(settings),
        );
        console.log("[CameraSettings] Settings saved:", settings);
    }

    // Test Go2rtc connection
    async function testConnection() {
        isTesting = true;
        testResult = null;
        testMessage = "";

        try {
            // Try to fetch Go2rtc API
            const response = await fetch(`${go2rtcUrl}/api/streams`, {
                method: "GET",
                mode: "cors",
            });

            if (response.ok) {
                const data = await response.json();
                const streamCount = Object.keys(data).length;
                testResult = "success";
                testMessage = `Connected! Found ${streamCount} streams.`;
            } else {
                testResult = "error";
                testMessage = `Error: ${response.status} ${response.statusText}`;
            }
        } catch (error) {
            testResult = "error";
            testMessage =
                error instanceof Error ? error.message : "Connection failed";
        } finally {
            isTesting = false;
        }
    }

    // Handle input change
    function handleUrlChange(e: Event) {
        const target = e.target as HTMLInputElement;
        go2rtcUrl = target.value;
        testResult = null;
    }

    // Select options
    const gridOptions = [
        { label: "Auto", value: 0 },
        { label: "1 Column", value: 1 },
        { label: "2 Columns", value: 2 },
        { label: "3 Columns", value: 3 },
        { label: "4 Columns", value: 4 },
    ];
</script>

<Section
    title={$t("settings.cameras.title", { default: "Cameras" })}
    description={$t("settings.cameras.description", {
        default: "Manage camera streams and Go2rtc connection",
    })}
    initiallyOpen={false}
>
    <!-- Go2rtc URL -->
    <!-- Custom layout for input + button -->
    <div class="control-group">
        <label class="label-block" for="go2rtc-url">
            {$t("settings.cameras.go2rtc_url", { default: "URL Go2rtc" })}
        </label>
        <div class="url-control">
            <input
                id="go2rtc-url"
                type="text"
                class="input"
                value={go2rtcUrl}
                oninput={handleUrlChange}
                onblur={saveSettings}
                placeholder="http://192.168.0.98:1984"
            />
            <button
                class="test-btn"
                onclick={testConnection}
                disabled={isTesting}
            >
                {#if isTesting}
                    <iconify-icon icon="mdi:loading" class="spinning"
                    ></iconify-icon>
                {:else}
                    <iconify-icon icon="mdi:connection"></iconify-icon>
                {/if}
                {$t("settings.cameras.test", { default: "Test" })}
            </button>
        </div>
        <div class="hint">
            {$t("settings.cameras.go2rtc_hint", {
                default: "Example: http://192.168.0.98:1984",
            })}
        </div>

        {#if testResult}
            <div
                class="test-result"
                class:success={testResult === "success"}
                class:error={testResult === "error"}
            >
                <iconify-icon
                    icon={testResult === "success"
                        ? "mdi:check-circle"
                        : "mdi:alert-circle"}
                ></iconify-icon>
                {testMessage}
            </div>
        {/if}
    </div>

    <!-- Auto Connect Toggle -->
    <Switch
        label={$t("settings.cameras.auto_connect", { default: "Auto Connect" })}
        bind:checked={autoConnect}
        onchange={saveSettings}
    />

    <!-- Grid Columns -->
    <Select
        label={$t("settings.cameras.grid_columns", { default: "Grid Columns" })}
        bind:value={gridColumns}
        options={gridOptions}
        onchange={saveSettings}
    />

    <div class="divider"></div>

    <!-- Camera List -->
    <div class="list-header">
        <div class="label-block">
            {$t("settings.cameras.list", { default: "Camera List" })}
            <span class="count">({cameraStore.cameraCount})</span>
        </div>
        <button
            class="refresh-btn"
            onclick={() => cameraStore.loadCameras()}
            title="Refresh list"
        >
            <iconify-icon icon="mdi:refresh"></iconify-icon>
            {$t("settings.cameras.refresh", { default: "Refresh" })}
        </button>
    </div>

    {#if cameraStore.cameras.length > 0}
        <div class="camera-list">
            {#each cameraStore.cameras as camera (camera.id)}
                <div class="camera-item" class:disabled={!camera.enabled}>
                    <iconify-icon icon="mdi:cctv" class="camera-icon"
                    ></iconify-icon>
                    <div class="camera-details">
                        <span class="camera-name">{camera.name}</span>
                        <span class="camera-source">{camera.source}</span>
                    </div>
                    <span class="camera-status" class:active={camera.enabled}>
                        {camera.enabled ? "Active" : "Disabled"}
                    </span>
                </div>
            {/each}
        </div>
    {:else}
        <div class="empty-cameras">
            <iconify-icon icon="mdi:camera-off" width="32"></iconify-icon>
            <span
                >{$t("settings.cameras.no_cameras", {
                    default: "No cameras found",
                })}</span
            >
        </div>
    {/if}
</Section>

<style>
    .control-group {
        margin-bottom: 1rem;
    }

    .label-block {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-size: 0.95rem;
        color: var(--text-primary);
    }

    .hint {
        margin-top: 0.25rem;
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .url-control {
        display: flex;
        gap: 8px;
        width: 100%;
    }

    .input {
        flex: 1;
        padding: 0.6rem;
        border: 1px solid var(--border-input);
        border-radius: 8px;
        font-size: 0.9rem;
        background: var(--bg-input);
        color: var(--text-primary);
    }
    .input:focus {
        outline: none;
        border-color: var(--accent-primary);
    }

    .test-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 14px;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .test-btn:hover:not(:disabled) {
        background: var(--accent-primary-hover, #2563eb);
    }

    .test-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .test-result {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 0.85rem;
        width: 100%;
        margin-top: 8px;
    }

    .test-result.success {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
    }

    .test-result.error {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
    }

    .divider {
        height: 1px;
        background: var(--border-divider);
        margin: 1.5rem 0;
    }

    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .count {
        color: var(--text-muted);
        font-size: 0.85rem;
        font-weight: normal;
        margin-left: 4px;
    }

    .refresh-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: var(--bg-chip, rgba(0, 0, 0, 0.05));
        border: 1px solid var(--border-primary);
        border-radius: 6px;
        font-size: 0.8rem;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
    }

    .refresh-btn:hover {
        background: var(--bg-chip-active, rgba(0, 0, 0, 0.1));
        color: var(--text-primary);
    }

    .camera-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .camera-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: var(--bg-input, rgba(255, 255, 255, 0.5));
        border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.05));
        border-radius: 10px;
        transition: opacity 0.2s;
    }

    .camera-item.disabled {
        opacity: 0.5;
    }

    .camera-icon {
        font-size: 1.25rem;
        color: var(--text-secondary);
    }

    .camera-details {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .camera-name {
        font-weight: 500;
        color: var(--text-primary);
        font-size: 0.9rem;
    }

    .camera-source {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
    }

    .camera-status {
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--bg-chip, rgba(0, 0, 0, 0.05));
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.5px;
    }

    .camera-status.active {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
    }

    .empty-cameras {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 24px;
        color: var(--text-muted);
        text-align: center;
        background: var(--bg-secondary);
        border-radius: 8px;
    }
</style>
