<script lang="ts">
    /**
     * CameraGrid - Grid layout for multiple camera streams
     *
     * Displays all active cameras in a responsive grid layout.
     * Integrates with cameraStore for camera data.
     * Reads settings from localStorage (saved by CameraSettings)
     */
    import CameraCard from "./CameraCard.svelte";
    import { cameraStore } from "$lib/stores/camera.store.svelte";
    import { onMount } from "svelte";
    import { _ } from "svelte-i18n";

    interface Props {
        go2rtcUrl?: string;
        autoConnect?: boolean;
    }

    let {
        go2rtcUrl: initialUrl = "http://192.168.0.97:1984",
        autoConnect: initialAutoConnect = true,
    }: Props = $props();

    // Settings loaded from localStorage
    let go2rtcUrl = $state(initialUrl);
    let columns = $state(0); // 0 = auto
    let autoConnect = $state(initialAutoConnect);

    // Load settings from localStorage
    function loadSettings() {
        const saved = localStorage.getItem("evolusion_camera_settings");
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                go2rtcUrl = settings.go2rtcUrl || go2rtcUrl;
                autoConnect = settings.autoConnect ?? autoConnect;
                columns = settings.gridColumns ?? columns;
                console.log("[CameraGrid] Loaded settings:", {
                    go2rtcUrl,
                    autoConnect,
                    columns,
                });
            } catch (e) {
                console.error("[CameraGrid] Failed to load settings:", e);
            }
        }
    }

    // Grid columns style
    const gridStyle = $derived(() => {
        if (columns > 0) {
            return `grid-template-columns: repeat(${columns}, 1fr)`;
        }
        // Auto columns based on viewport
        return "grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))";
    });

    // Load cameras and settings on mount
    onMount(() => {
        loadSettings();
        if (cameraStore.cameras.length === 0) {
            cameraStore.loadCameras();
        }
    });

    // Handle camera selection
    function handleCameraClick(cameraId: string) {
        cameraStore.selectCamera(cameraId);
    }

    // Refresh cameras
    function handleRefresh() {
        loadSettings(); // Reload settings too
        cameraStore.refresh();
    }
</script>

<div class="camera-grid-container">
    <!-- Header -->
    <div class="grid-header">
        <h2 class="grid-title">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                width="24"
                height="24"
            >
                <path
                    d="M23 7l-7 5 7 5V7z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <rect
                    x="1"
                    y="5"
                    width="15"
                    height="14"
                    rx="2"
                    stroke-width="2"
                />
            </svg>
            {$_("cameras.title", { default: "Камеры" })}
        </h2>

        <div class="grid-actions">
            <span class="camera-count">
                {cameraStore.activeCameraCount} / {cameraStore.cameraCount}
            </span>

            <button
                class="refresh-btn"
                onclick={handleRefresh}
                disabled={cameraStore.isLoading}
                title={$_("cameras.refresh", { default: "Обновить" })}
            >
                <svg
                    class:spinning={cameraStore.isLoading}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    width="18"
                    height="18"
                >
                    <path
                        d="M23 4v6h-6M1 20v-6h6"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
        </div>
    </div>

    <!-- Error Message -->
    {#if cameraStore.error}
        <div class="error-banner">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                width="20"
                height="20"
            >
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" />
            </svg>
            <span>{cameraStore.error}</span>
            <button class="dismiss-btn" onclick={() => cameraStore.clearError()}
                >×</button
            >
        </div>
    {/if}

    <!-- Loading State -->
    {#if cameraStore.isLoading && cameraStore.cameras.length === 0}
        <div class="loading-state">
            <div class="spinner large"></div>
            <span
                >{$_("cameras.loading", { default: "Загрузка камер..." })}</span
            >
        </div>
    {:else if cameraStore.activeCameras.length === 0}
        <!-- Empty State -->
        <div class="empty-state">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                width="64"
                height="64"
            >
                <path
                    d="M23 7l-7 5 7 5V7z"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <rect
                    x="1"
                    y="5"
                    width="15"
                    height="14"
                    rx="2"
                    stroke-width="1.5"
                />
                <line x1="1" y1="1" x2="23" y2="23" stroke-width="1.5" />
            </svg>
            <h3>{$_("cameras.empty.title", { default: "Нет камер" })}</h3>
            <p>
                {$_("cameras.empty.description", {
                    default: "Добавьте камеры в конфигурацию",
                })}
            </p>
        </div>
    {:else}
        <!-- Camera Grid -->
        <div class="camera-grid" style={gridStyle()}>
            {#each cameraStore.activeCameras as camera (camera.id)}
                <div
                    class="grid-item"
                    class:selected={cameraStore.selectedCameraId === camera.id}
                    onclick={() => handleCameraClick(camera.id)}
                >
                    <CameraCard
                        {camera}
                        {go2rtcUrl}
                        {autoConnect}
                        showControls={true}
                    />
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .camera-grid-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px;
        min-height: 100%;
    }

    /* Header */
    .grid-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .grid-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary, #fff);
    }

    .grid-title svg {
        color: var(--color-primary, #3b82f6);
    }

    .grid-actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .camera-count {
        color: var(--text-secondary, #888);
        font-size: 13px;
        padding: 4px 10px;
        background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
        border-radius: 12px;
    }

    .refresh-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        border-radius: 8px;
        color: var(--text-secondary, #888);
        cursor: pointer;
        transition: all 0.2s;
    }

    .refresh-btn:hover:not(:disabled) {
        background: var(--bg-hover, rgba(255, 255, 255, 0.1));
        color: var(--text-primary, #fff);
    }

    .refresh-btn:disabled {
        opacity: 0.5;
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

    /* Error Banner */
    .error-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        color: var(--color-error, #ef4444);
        font-size: 13px;
    }

    .dismiss-btn {
        margin-left: auto;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .dismiss-btn:hover {
        opacity: 1;
    }

    /* Loading State */
    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 60px 20px;
        color: var(--text-secondary, #888);
    }

    .spinner {
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--color-primary, #3b82f6);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .spinner.large {
        width: 40px;
        height: 40px;
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 80px 20px;
        text-align: center;
    }

    .empty-state svg {
        color: var(--text-muted, #555);
    }

    .empty-state h3 {
        margin: 0;
        font-size: 18px;
        color: var(--text-primary, #fff);
    }

    .empty-state p {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary, #888);
    }

    /* Camera Grid */
    .camera-grid {
        display: grid;
        gap: 20px;
    }

    .grid-item {
        transition: transform 0.2s;
    }

    .grid-item.selected {
        outline: 2px solid var(--color-primary, #3b82f6);
        outline-offset: 2px;
        border-radius: 14px;
    }

    /* Responsive */
    @media (max-width: 640px) {
        .camera-grid-container {
            padding: 12px;
        }

        .grid-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .camera-grid {
            grid-template-columns: 1fr !important;
        }
    }
</style>
