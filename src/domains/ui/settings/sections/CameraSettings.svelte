<script lang="ts">
    /**
     * Camera Settings Section
     *
     * Configuration for camera video streams including Go2rtc URL.
     */
    import { t } from "svelte-i18n";
    import { cameraStore } from "$lib/stores/camera.store.svelte";
    import "iconify-icon";

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
                testMessage = `Подключено! Найдено ${streamCount} камер.`;
            } else {
                testResult = "error";
                testMessage = `Ошибка: ${response.status} ${response.statusText}`;
            }
        } catch (error) {
            testResult = "error";
            testMessage =
                error instanceof Error ? error.message : "Ошибка подключения";
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
</script>

<section class="settings-section">
    <h3 class="section-title">
        <iconify-icon icon="mdi:cctv" width="22"></iconify-icon>
        {$t("settings.cameras.title", { default: "Камеры" })}
    </h3>

    <div class="settings-group">
        <!-- Go2rtc URL -->
        <div class="setting-row">
            <div class="setting-label">
                <span class="label-text"
                    >{$t("settings.cameras.go2rtc_url", {
                        default: "URL Go2rtc",
                    })}</span
                >
                <span class="label-hint"
                    >{$t("settings.cameras.go2rtc_hint", {
                        default: "Например: http://192.168.0.98:1984",
                    })}</span
                >
            </div>
            <div class="setting-control url-control">
                <input
                    type="text"
                    class="url-input"
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
                    {$t("settings.cameras.test", { default: "Тест" })}
                </button>
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
        <div class="setting-row">
            <div class="setting-label">
                <span class="label-text"
                    >{$t("settings.cameras.auto_connect", {
                        default: "Автоподключение",
                    })}</span
                >
                <span class="label-hint"
                    >{$t("settings.cameras.auto_connect_hint", {
                        default: "Подключаться к камерам автоматически",
                    })}</span
                >
            </div>
            <div class="setting-control">
                <label class="toggle-switch">
                    <input
                        type="checkbox"
                        bind:checked={autoConnect}
                        onchange={saveSettings}
                    />
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <!-- Grid Columns -->
        <div class="setting-row">
            <div class="setting-label">
                <span class="label-text"
                    >{$t("settings.cameras.grid_columns", {
                        default: "Колонки сетки",
                    })}</span
                >
                <span class="label-hint"
                    >{$t("settings.cameras.grid_columns_hint", {
                        default: "0 = авто",
                    })}</span
                >
            </div>
            <div class="setting-control">
                <select
                    class="select-input"
                    bind:value={gridColumns}
                    onchange={saveSettings}
                >
                    <option value={0}>Авто</option>
                    <option value={1}>1 колонка</option>
                    <option value={2}>2 колонки</option>
                    <option value={3}>3 колонки</option>
                    <option value={4}>4 колонки</option>
                </select>
            </div>
        </div>

        <!-- Camera List -->
        <div class="setting-row cameras-list">
            <div class="setting-label">
                <span class="label-text"
                    >{$t("settings.cameras.list", {
                        default: "Список камер",
                    })}</span
                >
                <span class="label-hint"
                    >{cameraStore.cameraCount} камер ({cameraStore.activeCameraCount}
                    активных)</span
                >
            </div>
            <button
                class="refresh-cameras-btn"
                onclick={() => cameraStore.loadCameras()}
            >
                <iconify-icon icon="mdi:refresh"></iconify-icon>
                {$t("settings.cameras.refresh", { default: "Обновить" })}
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
                        <span
                            class="camera-status"
                            class:active={camera.enabled}
                        >
                            {camera.enabled ? "Активна" : "Отключена"}
                        </span>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="empty-cameras">
                <iconify-icon icon="mdi:camera-off" width="32"></iconify-icon>
                <span
                    >{$t("settings.cameras.no_cameras", {
                        default: "Камеры не найдены",
                    })}</span
                >
            </div>
        {/if}
    </div>
</section>

<style>
    .settings-section {
        background: var(--bg-card, rgba(0, 0, 0, 0.03));
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.05));
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 1.25rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .section-title iconify-icon {
        color: var(--accent-primary);
    }

    .settings-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .setting-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .setting-label {
        flex: 1;
        min-width: 150px;
    }

    .label-text {
        display: block;
        font-weight: 500;
        color: var(--text-primary);
        font-size: 0.95rem;
    }

    .label-hint {
        display: block;
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 2px;
    }

    .setting-control {
        flex-shrink: 0;
    }

    .url-control {
        display: flex;
        gap: 8px;
        flex: 1;
        max-width: 350px;
    }

    .url-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--border-primary, #ddd);
        border-radius: 8px;
        font-size: 0.9rem;
        background: var(--bg-input, #fff);
        color: var(--text-primary);
    }

    .url-input:focus {
        outline: none;
        border-color: var(--accent-primary);
    }

    .test-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
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

    .select-input {
        padding: 8px 12px;
        border: 1px solid var(--border-primary, #ddd);
        border-radius: 8px;
        font-size: 0.9rem;
        background: var(--bg-input, #fff);
        color: var(--text-primary);
        min-width: 140px;
    }

    /* Toggle Switch */
    .toggle-switch {
        position: relative;
        width: 48px;
        height: 26px;
        display: inline-block;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background: var(--bg-chip, #ccc);
        border-radius: 26px;
        transition: 0.2s;
    }

    .toggle-slider::before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background: white;
        border-radius: 50%;
        transition: 0.2s;
    }

    .toggle-switch input:checked + .toggle-slider {
        background: var(--accent-primary);
    }

    .toggle-switch input:checked + .toggle-slider::before {
        transform: translateX(22px);
    }

    /* Camera List */
    .cameras-list {
        margin-top: 0.5rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-divider, rgba(0, 0, 0, 0.05));
    }

    .refresh-cameras-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--bg-chip, rgba(0, 0, 0, 0.05));
        border: none;
        border-radius: 8px;
        font-size: 0.85rem;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
    }

    .refresh-cameras-btn:hover {
        background: var(--bg-chip-active, rgba(0, 0, 0, 0.1));
        color: var(--text-primary);
    }

    .camera-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
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
        font-size: 0.75rem;
        padding: 3px 8px;
        border-radius: 12px;
        background: var(--bg-chip, rgba(0, 0, 0, 0.05));
        color: var(--text-muted);
    }

    .camera-status.active {
        background: rgba(34, 197, 94, 0.15);
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
    }
</style>
