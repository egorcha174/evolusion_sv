<script lang="ts">
    /**
     * CameraCardWidget - Camera card for dashboard grid
     *
     * Supports multiple source types via cameraSourceConfig:
     * - go2rtc (WebRTC via go2rtc)
     * - url (direct HLS/MJPEG/WebRTC URL)
     * - ha_entity (Home Assistant camera entity)
     */
    import { onMount, onDestroy } from "svelte";
    import type { CameraSourceConfig } from "$lib/types";
    import { t } from "svelte-i18n";
    import { haStore, getSignedPath } from "../../ha/store";
    import { appState } from "../../app/store";
    import { get } from "svelte/store";
    import {
        useWebRTC,
        buildGo2rtcSignalUrl,
    } from "$lib/composables/useWebRTC.svelte";
    import Hls from "hls.js";
    import "iconify-icon";

    interface Props {
        cameraSourceConfig?: CameraSourceConfig;
        onFullscreen?: () => void;
    }

    let { cameraSourceConfig, onFullscreen }: Props = $props();

    // Stream state
    let streamUrl = $state<string | null>(null);
    let streamType = $state<"hls" | "mjpeg" | "webrtc" | null>(null);
    let error = $state<string | null>(null);
    let isLoading = $state(true);

    // Video/Image elements (non-reactive DOM refs)
    let videoElement: HTMLVideoElement | undefined;
    let imgElement: HTMLImageElement | undefined;
    let hlsInstance: Hls | null = null;

    // WebRTC signal URL - derived from config
    let signalUrl = $state<string>("");

    // Guard against effect re-triggering (non-reactive to avoid cycles)
    let lastConfigHash = "";

    // Create WebRTC instance once with getter for reactive signalUrl
    const webrtc = useWebRTC(() => signalUrl);

    // Update signal URL and reconnect when config changes
    $effect(() => {
        // Create a hash of current config for comparison
        const configHash = cameraSourceConfig
            ? JSON.stringify(cameraSourceConfig)
            : "";

        // Skip if config hasn't actually changed (using untrack to avoid reactivity)
        if (configHash === lastConfigHash) {
            console.log("[CameraCardWidget] Config unchanged, skipping");
            return;
        }
        // Update hash (non-reactive, won't trigger effect)
        lastConfigHash = configHash;

        if (!cameraSourceConfig) {
            console.log("[CameraCardWidget] No config");
            error = null;
            isLoading = false;
            streamUrl = null;
            streamType = null;
            signalUrl = "";
            webrtc.disconnect();
            return;
        }

        console.log("[CameraCardWidget] Config changed:", cameraSourceConfig);

        // Cleanup previous connections
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }

        (async () => {
            isLoading = true;
            error = null;

            try {
                if (cameraSourceConfig.sourceType === "go2rtc") {
                    // Go2rtc WebRTC stream
                    const { go2rtcUrl, streamName } = cameraSourceConfig;
                    if (!go2rtcUrl || !streamName) {
                        error = "Go2rtc URL or stream name missing";
                        isLoading = false;
                        return;
                    }

                    console.log(
                        "[CameraCardWidget] Setting up WebRTC for go2rtc",
                    );

                    // Update signal URL (will trigger webrtc reconnect)
                    const newSignalUrl = buildGo2rtcSignalUrl(
                        go2rtcUrl,
                        streamName,
                    );
                    signalUrl = newSignalUrl;
                    streamType = "webrtc";
                    streamUrl = null;
                    isLoading = false;

                    // Connect after signal URL is set
                    setTimeout(() => {
                        console.log(
                            "[CameraCardWidget] Connecting to:",
                            signalUrl,
                        );
                        webrtc.connect();
                    }, 100);
                } else if (cameraSourceConfig.sourceType === "url") {
                    // Direct URL
                    signalUrl = "";
                    webrtc.disconnect();
                    streamUrl = cameraSourceConfig.url || null;
                    streamType = cameraSourceConfig.streamType || "hls";
                    console.log(
                        "[CameraCardWidget] Using direct URL:",
                        streamUrl,
                    );
                    isLoading = false;
                } else if (cameraSourceConfig.sourceType === "ha_entity") {
                    // Home Assistant entity
                    signalUrl = "";
                    webrtc.disconnect();

                    const config = get(appState).activeServer;
                    if (!config) {
                        error = "No active Home Assistant server";
                        isLoading = false;
                        return;
                    }

                    const entity = $haStore.entities.get(
                        cameraSourceConfig.entityId || "",
                    );
                    if (!entity) {
                        error = "Camera entity not found";
                        isLoading = false;
                        return;
                    }

                    // Check for HLS stream
                    if (entity.attributes?.stream_source) {
                        streamUrl = entity.attributes.stream_source;
                        streamType = "hls";
                    } else {
                        // Fallback to MJPEG
                        const relativePath = `/api/camera_proxy_stream/${entity.entity_id}`;
                        const signedPath = await getSignedPath(relativePath);
                        const baseUrl = new URL(config.url);
                        streamUrl = `${baseUrl.origin}${signedPath}`;
                        streamType = "mjpeg";
                    }
                    console.log(
                        "[CameraCardWidget] Resolved HA entity stream URL:",
                        streamUrl,
                    );
                    isLoading = false;
                }

                console.log("[CameraCardWidget] Stream configured:", {
                    streamType,
                    streamUrl,
                    signalUrl,
                });
            } catch (e: any) {
                console.error(
                    "[CameraCardWidget] Failed to configure stream:",
                    e,
                );
                error = e.message || "Failed to load camera";
                streamUrl = null;
                isLoading = false;
            }
        })();
    });

    // Removed: srcObject binding moved to Svelte Action in template

    // HLS player setup
    $effect(() => {
        if (streamType === "hls" && streamUrl && videoElement) {
            // Cleanup old instance
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }

            console.log(
                "[CameraCardWidget] Setting up HLS player for:",
                streamUrl,
            );

            if (Hls.isSupported()) {
                hlsInstance = new Hls({
                    lowLatencyMode: true,
                    backBufferLength: 60,
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(videoElement);

                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log("[CameraCardWidget] HLS manifest parsed");
                    videoElement?.play().catch(() => {
                        // Autoplay blocked
                    });
                });

                hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
                    if (data.fatal) {
                        console.error("[CameraCardWidget] HLS error:", data);
                        error = "Stream error";
                        hlsInstance?.destroy();
                        hlsInstance = null;
                    }
                });
            } else if (
                videoElement.canPlayType("application/vnd.apple.mpegurl")
            ) {
                // Native HLS (Safari)
                videoElement.src = streamUrl;
                videoElement.play().catch(() => {});
            } else {
                error = "HLS not supported";
            }
        }
    });

    // Cleanup on destroy
    onDestroy(() => {
        console.log("[CameraCardWidget] Destroying");
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        webrtc.disconnect();
    });

    function handleClick() {
        if (onFullscreen && !error) {
            onFullscreen();
        }
    }

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

    // Computed status for WebRTC
    const isWebRTCConnected = $derived(webrtc.status === "connected");
    const isWebRTCConnecting = $derived(webrtc.status === "connecting");
    const webRTCError = $derived(webrtc.error);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="camera-card-widget" onclick={handleClick}>
    {#if !cameraSourceConfig}
        <div class="no-config">
            <iconify-icon icon="mdi:cctv" width="32"></iconify-icon>
            <span
                >{$t("camera.not_configured", {
                    default: "Not Configured",
                })}</span
            >
            <span class="hint"
                >{$t("camera.configure_hint", {
                    default: "Right-click to configure source",
                })}</span
            >
        </div>
    {:else if error || webRTCError}
        <div class="error-state">
            <iconify-icon icon="mdi:alert-circle-outline" width="32"
            ></iconify-icon>
            <span class="error-title"
                >{$t("camera.error", { default: "Error" })}</span
            >
            <span class="error-message">{error || webRTCError}</span>
        </div>
    {:else if streamType === "webrtc"}
        <!-- WebRTC Video - always render video element for srcObject binding -->
        <div class="stream-wrapper">
            <video
                autoplay
                muted
                playsinline
                controls={false}
                class="video-player"
                class:hidden={!isWebRTCConnected}
                use:srcObjectAction={webrtc.stream}
            ></video>
            {#if isWebRTCConnecting}
                <div class="loader">
                    <iconify-icon icon="mdi:loading" width="24" class="spinning"
                    ></iconify-icon>
                    <span>Connecting...</span>
                </div>
            {:else if !isWebRTCConnected && !webRTCError}
                <div class="loader">
                    <iconify-icon icon="mdi:video-off" width="32"
                    ></iconify-icon>
                    <span>Idle</span>
                </div>
            {/if}
        </div>
    {:else if streamUrl}
        <div class="stream-wrapper">
            {#if streamType === "hls"}
                <video
                    bind:this={videoElement}
                    autoplay
                    muted
                    playsinline
                    controls={false}
                    class="video-player"
                ></video>
            {:else if streamType === "mjpeg"}
                <img
                    bind:this={imgElement}
                    src={streamUrl}
                    alt="Camera Stream"
                    class="mjpeg-player"
                />
            {/if}

            {#if isLoading}
                <div class="loader">
                    <iconify-icon icon="mdi:loading" width="24" class="spinning"
                    ></iconify-icon>
                </div>
            {/if}
        </div>
    {:else}
        <div class="placeholder">
            <iconify-icon icon="mdi:loading" width="32" class="spinning"
            ></iconify-icon>
            <span>{$t("common.loading", { default: "Loading..." })}</span>
        </div>
    {/if}
</div>

<style>
    .camera-card-widget {
        width: 100%;
        height: 100%;
        cursor: pointer;
        border-radius: var(--card-border-radius, 12px);
        overflow: hidden;
        background: var(--bg-input, #000);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
    }

    .camera-card-widget:hover {
        transform: scale(1.01);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .stream-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .video-player,
    .mjpeg-player {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .loader {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--text-secondary);
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .no-config,
    .error-state,
    .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 1rem;
        text-align: center;
        color: var(--text-muted);
    }

    .no-config {
        background: var(--bg-card, rgba(255, 255, 255, 0.05));
    }

    .hint {
        font-size: 0.75rem;
        opacity: 0.7;
    }

    .error-state {
        color: var(--accent-error, #f44336);
    }

    .error-title {
        font-weight: 600;
        font-size: 0.95rem;
    }

    .error-message {
        font-size: 0.8rem;
        opacity: 0.9;
    }

    .hidden {
        visibility: hidden;
        position: absolute;
    }
</style>
