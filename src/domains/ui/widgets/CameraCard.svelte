<script lang="ts">
    /**
     * CameraCard - Single camera video stream component
     *
     * Displays WebRTC video stream from Go2rtc with loading/error states.
     * Uses useWebRTC composable for stream management.
     */
    import { onMount } from "svelte";
    import {
        useWebRTC,
        buildGo2rtcSignalUrl,
    } from "$lib/composables/useWebRTC.svelte";
    import type { Camera } from "$lib/stores/camera.store.svelte";
    import { _ } from "svelte-i18n";

    // Props
    interface Props {
        camera: Camera;
        go2rtcUrl?: string;
        autoConnect?: boolean;
        showControls?: boolean;
    }

    let {
        camera,
        go2rtcUrl = "http://192.168.0.98:1984",
        autoConnect = true,
        showControls = true,
    }: Props = $props();

    // Note: videoRef no longer needed - using Svelte Action for srcObject binding

    // Build signaling URL based on camera source
    const signalUrl = $derived(() => {
        if (camera.source === "go2rtc" && camera.go2rtc_name) {
            return buildGo2rtcSignalUrl(go2rtcUrl, camera.go2rtc_name);
        }
        if (camera.streamUrl) {
            // Direct RTSP/MJPEG URL - would need different handling
            return camera.streamUrl;
        }
        return "";
    });

    // WebRTC connection - pass the getter function, not its result
    const webrtc = useWebRTC(signalUrl);

    // Svelte Action for srcObject binding (avoids black screen issue)
    function srcObjectAction(
        node: HTMLVideoElement,
        stream: MediaStream | null,
    ) {
        if (stream) {
            node.srcObject = stream;
            node.play().catch(() => {});
        }
        return {
            update(newStream: MediaStream | null) {
                if (node.srcObject !== newStream) {
                    node.srcObject = newStream;
                    if (newStream) {
                        node.play().catch(() => {});
                    }
                }
            },
            destroy() {
                node.srcObject = null;
            },
        };
    }

    // Auto-connect on mount
    onMount(() => {
        if (autoConnect && camera.enabled && signalUrl()) {
            console.log(`[CameraCard] Auto-connecting: ${camera.name}`);
            webrtc.connect();
        }
    });

    // Connect handler
    function handleConnect() {
        webrtc.connect();
    }

    // Disconnect handler
    function handleDisconnect() {
        webrtc.disconnect();
    }

    // Retry handler
    function handleRetry() {
        webrtc.disconnect();
        setTimeout(() => webrtc.connect(), 500);
    }

    // Status text
    const statusText = $derived(() => {
        switch (webrtc.status) {
            case "idle":
                return $_("camera.status.idle", { default: "Отключено" });
            case "connecting":
                return $_("camera.status.connecting", {
                    default: "Подключение...",
                });
            case "connected":
                return $_("camera.status.connected", { default: "Подключено" });
            case "error":
                return (
                    webrtc.error ||
                    $_("camera.status.error", { default: "Ошибка" })
                );
            default:
                return "";
        }
    });

    // Status color
    const statusColor = $derived(() => {
        switch (webrtc.status) {
            case "connected":
                return "var(--color-success, #22c55e)";
            case "connecting":
                return "var(--color-warning, #f59e0b)";
            case "error":
                return "var(--color-error, #ef4444)";
            default:
                return "var(--text-secondary, #888)";
        }
    });
</script>

<div class="camera-card">
    <!-- Video Container -->
    <div class="video-container">
        <!-- Always render video element for srcObject binding -->
        <video
            autoplay
            playsinline
            muted
            class="video-stream"
            class:hidden={webrtc.status !== "connected"}
            use:srcObjectAction={webrtc.stream}
        ></video>
        {#if webrtc.status === "connecting"}
            <div class="loading-overlay">
                <div class="spinner"></div>
                <span class="loading-text">{statusText()}</span>
            </div>
        {:else if webrtc.status === "error"}
            <div class="error-overlay">
                <svg
                    class="error-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                >
                    <circle cx="12" cy="12" r="10" stroke-width="2" />
                    <line x1="15" y1="9" x2="9" y2="15" stroke-width="2" />
                    <line x1="9" y1="9" x2="15" y2="15" stroke-width="2" />
                </svg>
                <span class="error-text">{webrtc.error}</span>
                <button class="retry-btn" onclick={handleRetry}>
                    {$_("camera.retry", { default: "Повторить" })}
                </button>
            </div>
        {:else if webrtc.status === "idle"}
            <div class="idle-overlay">
                <svg
                    class="camera-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
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
                {#if showControls}
                    <button class="connect-btn" onclick={handleConnect}>
                        {$_("camera.connect", { default: "Подключить" })}
                    </button>
                {/if}
            </div>
        {/if}

        <!-- Camera snapshot as background (if available) -->
        {#if camera.snapshotUrl && webrtc.status !== "connected"}
            <img
                src={camera.snapshotUrl}
                alt={camera.name}
                class="snapshot-bg"
            />
        {/if}
    </div>

    <!-- Camera Info Bar -->
    <div class="info-bar">
        <div class="camera-info">
            <span class="camera-name">{camera.name}</span>
            <span class="camera-status" style="color: {statusColor()}">
                <span class="status-dot" style="background: {statusColor()}"
                ></span>
                {statusText()}
            </span>
        </div>

        {#if showControls && webrtc.status === "connected"}
            <button
                class="disconnect-btn"
                onclick={handleDisconnect}
                title="Отключить"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    width="16"
                    height="16"
                >
                    <rect
                        x="6"
                        y="6"
                        width="12"
                        height="12"
                        rx="1"
                        stroke-width="2"
                    />
                </svg>
            </button>
        {/if}
    </div>
</div>

<style>
    .camera-card {
        display: flex;
        flex-direction: column;
        background: var(--card-background, rgba(30, 30, 30, 0.8));
        border: 1px solid var(--card-border, rgba(255, 255, 255, 0.1));
        border-radius: var(--card-border-radius, 12px);
        overflow: hidden;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
    }

    .camera-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .video-container {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #0a0a0a;
        overflow: hidden;
    }

    .video-stream {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .snapshot-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.3;
        z-index: 0;
    }

    /* Loading State */
    .loading-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1;
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.2);
        border-top-color: var(--color-primary, #3b82f6);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .loading-text {
        color: rgba(255, 255, 255, 0.8);
        font-size: 13px;
    }

    /* Error State */
    .error-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1;
        padding: 16px;
    }

    .error-icon {
        width: 40px;
        height: 40px;
        color: var(--color-error, #ef4444);
    }

    .error-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        text-align: center;
        max-width: 80%;
    }

    .retry-btn {
        padding: 8px 16px;
        background: var(--color-primary, #3b82f6);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .retry-btn:hover {
        background: var(--color-primary-hover, #2563eb);
    }

    /* Idle State */
    .idle-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 1;
    }

    .camera-icon {
        width: 48px;
        height: 48px;
        color: rgba(255, 255, 255, 0.4);
    }

    .connect-btn {
        padding: 10px 20px;
        background: var(--color-primary, #3b82f6);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition:
            background 0.2s,
            transform 0.1s;
    }

    .connect-btn:hover {
        background: var(--color-primary-hover, #2563eb);
        transform: scale(1.02);
    }

    /* Info Bar */
    .info-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        background: var(--card-background-secondary, rgba(40, 40, 40, 0.9));
        border-top: 1px solid var(--card-border, rgba(255, 255, 255, 0.05));
    }

    .camera-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .camera-name {
        color: var(--text-primary, #fff);
        font-size: 14px;
        font-weight: 500;
    }

    .camera-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
    }

    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }

    .disconnect-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition:
            background 0.2s,
            color 0.2s;
    }

    .disconnect-btn:hover {
        background: var(--color-error, #ef4444);
        color: white;
    }

    .hidden {
        visibility: hidden;
        position: absolute;
    }
</style>
