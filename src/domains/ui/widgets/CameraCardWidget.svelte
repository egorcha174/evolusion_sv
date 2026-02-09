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

    // Video/Image elements (reactive DOM refs for effects)
    let videoElement = $state<HTMLVideoElement>();
    let imgElement = $state<HTMLImageElement>();
    let hlsInstance: Hls | null = null;
    let hlsRetryTimer: any;
    let mjpegRefreshTimer: any;
    let mjpegUrl = $state<string | null>(null);
    let connectionTimeout: any;

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
            return;
        }
        // Update hash (non-reactive, won't trigger effect)
        lastConfigHash = configHash;

        if (!cameraSourceConfig) {
            error = null;
            isLoading = false;
            streamUrl = null;
            streamType = null;
            signalUrl = "";
            webrtc.disconnect();
            return;
        }

        // Cleanup previous connections
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }

        // Clear any pending WebRTC connection
        if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = undefined;
        }

        (async () => {
            isLoading = true;
            error = null;

            try {
                if (cameraSourceConfig.sourceType === "go2rtc") {
                    // Go2rtc WebRTC stream
                    const { go2rtcUrl, streamName } = cameraSourceConfig;
                    if (!go2rtcUrl || !streamName) {
                        // Don't show error immediately (might be fresh manual card)
                        // Just show "Not Configured" state via return
                        // Clear any previous error to show "Not Configured" state if relevant
                        // Actually, if we return here, we need to ensure 'error' is set if we want error state,
                        // or left null if we want "Not Configured" state.
                        // The template checks !cameraSourceConfig for "Not Configured".
                        // If we have an object but it's empty, we might want "Not Configured".
                        // Let's set error for now so user knows what's missing, OR better:
                        // Treat empty manual config as "Not Configured".
                        if (!go2rtcUrl && !streamName) {
                            // Treats as not configured
                            // cameraSourceConfig = undefined; // Prop is read-only
                            error = null; // Let template handle it via check
                        } else {
                            // If one is missing but not both, we might ideally show partial config error,
                            // BUT for "Manual" default case (defaults URL), streamName is missing.
                            // So effectively, if streamName is missing, we treat as not configured.
                            error = null; // Let template handle it
                        }
                        isLoading = false;
                        return;
                    }

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
                    connectionTimeout = setTimeout(() => {
                        webrtc.connect();
                    }, 100);
                } else if (cameraSourceConfig.sourceType === "url") {
                    // Direct URL
                    signalUrl = "";
                    webrtc.disconnect();
                    streamUrl = cameraSourceConfig.url || null;
                    streamType = cameraSourceConfig.streamType || "hls";
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
                        const baseUrl = new URL(config.url);
                        const rawSource = entity.attributes
                            .stream_source as string;
                        try {
                            if (rawSource.startsWith("http")) {
                                const parsed = new URL(rawSource);
                                const signedPath = await getSignedPath(
                                    `${parsed.pathname}${parsed.search}`,
                                );
                                streamUrl = `${baseUrl.origin}${signedPath}`;
                            } else if (rawSource.startsWith("/")) {
                                const signedPath =
                                    await getSignedPath(rawSource);
                                streamUrl = `${baseUrl.origin}${signedPath}`;
                            } else {
                                streamUrl = rawSource;
                            }
                        } catch (e) {
                            console.warn(
                                "[CameraCardWidget] Failed to sign HLS path, using raw source",
                                e,
                            );
                            streamUrl = rawSource;
                        }
                        streamType = "hls";
                    } else {
                        // Fallback to MJPEG
                        const relativePath = `/api/camera_proxy_stream/${entity.entity_id}`;
                        const signedPath = await getSignedPath(relativePath);
                        const baseUrl = new URL(config.url);
                        streamUrl = `${baseUrl.origin}${signedPath}`;
                        streamType = "mjpeg";
                    }

                    isLoading = false;
                }
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

    // Stream Watchdog
    $effect(() => {
        if (!streamUrl || isLoading || !videoElement || error) return;

        let lastTime = 0;
        let sameTimeCount = 0;
        const CHECK_INTERVAL = 1000;
        const MAX_STALL_SECONDS = 10;

        const interval = setInterval(() => {
            if (videoElement && !videoElement.paused && !videoElement.ended) {
                const currentTime = videoElement.currentTime;
                if (currentTime === lastTime) {
                    sameTimeCount++;
                    console.warn(
                        `[CameraCardWidget] Stream stalled for ${sameTimeCount}s`,
                    );
                } else {
                    sameTimeCount = 0;
                    lastTime = currentTime;
                }

                if (sameTimeCount >= MAX_STALL_SECONDS) {
                    console.error(
                        "[CameraCardWidget] Stream frozen, forcing reconnect...",
                    );
                    // Force reconnect by toggling streamUrl or calling a reconnect method
                    // For now, simple reload of the component state
                    const savedConfig = cameraSourceConfig;
                    // Trigger effect by clearing and resetting (hacky but effective for hls/webrtc teardown)
                    lastConfigHash = ""; // Reset hash to allow re-run
                    // We need to trigger the main effect.
                    // Since cameraSourceConfig is a prop, we can't change it.
                    // But we can reset internal state?
                    // Best way: Destroy and re-create player

                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        // Re-trigger HLS setup
                        // We can toggle streamType or similar
                        const currentType = streamType;
                        streamType = null;
                        setTimeout(() => {
                            streamType = currentType;
                        }, 100);
                    } else if (streamType === "webrtc") {
                        webrtc.disconnect();
                        setTimeout(() => {
                            webrtc.connect();
                        }, 500);
                    }

                    sameTimeCount = 0;
                }
            }
        }, CHECK_INTERVAL);

        return () => clearInterval(interval);
    });

    // HLS Setup / Teardown
    $effect(() => {
        if (streamType !== "hls" || !streamUrl || !videoElement || error)
            return;

        // Always clean old instance before re-creating
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                lowLatencyMode: true,
                backBufferLength: 30,
            });
            hlsInstance = hls;

            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                hls.loadSource(streamUrl);
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (!data?.fatal) return;

                console.warn("[CameraCardWidget] HLS fatal error:", data);
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    // Recreate instance on unrecoverable error
                    hls.destroy();
                    hlsInstance = null;
                    if (hlsRetryTimer) clearTimeout(hlsRetryTimer);
                    hlsRetryTimer = setTimeout(() => {
                        const currentType = streamType;
                        streamType = null;
                        setTimeout(() => {
                            streamType = currentType;
                        }, 100);
                    }, 500);
                }
            });
        } else if (
            streamUrl &&
            videoElement.canPlayType("application/vnd.apple.mpegurl")
        ) {
            // Native HLS (Safari)
            videoElement.src = streamUrl;
            videoElement.play().catch(() => {});
        }

        return () => {
            if (hlsRetryTimer) {
                clearTimeout(hlsRetryTimer);
                hlsRetryTimer = undefined;
            }
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        };
    });

    // MJPEG Refresh (prevents long-lived connection freeze)
    $effect(() => {
        if (streamType !== "mjpeg" || !streamUrl || error) {
            mjpegUrl = null;
            if (mjpegRefreshTimer) {
                clearInterval(mjpegRefreshTimer);
                mjpegRefreshTimer = undefined;
            }
            return;
        }

        const refresh = () => {
            if (!streamUrl) return;
            const separator = streamUrl.includes("?") ? "&" : "?";
            mjpegUrl = `${streamUrl}${separator}t=${Date.now()}`;
        };

        refresh();
        if (mjpegRefreshTimer) clearInterval(mjpegRefreshTimer);
        mjpegRefreshTimer = setInterval(refresh, 60000);

        return () => {
            if (mjpegRefreshTimer) {
                clearInterval(mjpegRefreshTimer);
                mjpegRefreshTimer = undefined;
            }
        };
    });

    // Cleanup on destroy
    onDestroy(() => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        if (hlsRetryTimer) clearTimeout(hlsRetryTimer);
        if (mjpegRefreshTimer) clearInterval(mjpegRefreshTimer);
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        webrtc.disconnect();
    });

    function handleClick(e: MouseEvent) {
        // Prevent default if necessary, though div onclick usually doesn't have default
        // e.preventDefault();

        if (error || !cameraSourceConfig) {
            // Maybe allow clicking to configure if in edit mode?
            // But edit mode handling is usually upstream (GridItem).
            return;
        }

        const mode = cameraSourceConfig.interactionMode ?? "modal";

        if (mode === "modal") {
            if (onFullscreen) onFullscreen();
        } else if (mode === "link") {
            if (cameraSourceConfig.interactionUrl) {
                window.location.href = cameraSourceConfig.interactionUrl;
            }
        }
        // mode === 'none' -> do nothing
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

    function refreshStream(e: MouseEvent) {
        e.stopPropagation();

        if (streamType === "mjpeg") {
            if (!streamUrl) return;
            const separator = streamUrl.includes("?") ? "&" : "?";
            mjpegUrl = `${streamUrl}${separator}t=${Date.now()}`;
            isLoading = true;
            return;
        }

        if (streamType === "hls") {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            if (videoElement) {
                videoElement.pause();
                videoElement.removeAttribute("src");
                videoElement.load();
            }
            const currentType = streamType;
            streamType = null;
            setTimeout(() => {
                streamType = currentType;
            }, 50);
            isLoading = true;
            return;
        }

        if (streamType === "webrtc") {
            webrtc.disconnect();
            setTimeout(() => {
                webrtc.connect();
            }, 100);
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="camera-card-widget" onclick={handleClick}>
    {#if cameraSourceConfig && !(error || webRTCError)}
        <button
            class="refresh-btn"
            title={$t("common.refresh", { default: "Refresh" })}
            aria-label={$t("common.refresh", { default: "Refresh" })}
            onclick={refreshStream}
        >
            <iconify-icon icon="mdi:refresh" width="16"></iconify-icon>
        </button>
    {/if}
    {#if !cameraSourceConfig || (cameraSourceConfig.sourceType === "go2rtc" && !cameraSourceConfig.streamName)}
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
                    oncanplay={() => (isLoading = false)}
                    onerror={(e) => {
                        console.error(
                            "[CameraCardWidget] Video element error",
                            e,
                        );
                        if (!hlsInstance) error = "Video error";
                        isLoading = false;
                    }}
                ></video>
            {:else if streamType === "mjpeg"}
                <img
                    bind:this={imgElement}
                    src={mjpegUrl || streamUrl}
                    alt="Camera Stream"
                    class="mjpeg-player"
                    onload={() => {
                        isLoading = false;
                    }}
                    onerror={() => {
                        console.error(
                            "[CameraCardWidget] MJPEG load error:",
                            streamUrl,
                        );
                        error = "Stream connection failed";
                        isLoading = false;
                    }}
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

        /* Glassmorphism & Theme Base */
        background: var(
            --card-background,
            var(--glass-surface, rgba(255, 255, 255, 0.6))
        );
        backdrop-filter: var(--glass-blur, blur(12px));
        -webkit-backdrop-filter: var(--glass-blur, blur(12px));
        border: 1px solid
            var(
                --card-border-color,
                var(--glass-border, rgba(255, 255, 255, 0.2))
            );
        box-shadow: var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.05));
        border-radius: var(--card-border-radius);

        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s
            var(--spring-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
        z-index: var(--z-card, 1);
    }

    .camera-card-widget:hover {
        transform: translateY(-6px) scale(1.03);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        background: var(--glass-surface-hover, rgba(255, 255, 255, 0.8));
        border-color: var(--accent-primary, #007aff);
        z-index: 10;
    }

    .stream-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: inherit;
        overflow: hidden;
    }

    .refresh-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 1px solid
            var(
                --card-border-color,
                var(--glass-border, rgba(255, 255, 255, 0.25))
            );
        background: rgba(0, 0, 0, 0.35);
        color: #fff;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        cursor: pointer;
        z-index: 2;
        opacity: 0.85;
        transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .refresh-btn:hover {
        opacity: 1;
        transform: scale(1.05);
    }

    .video-player,
    .mjpeg-player {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: inherit;
        /* Fix for video elements not respecting border-radius clipping */
        mask-image: radial-gradient(white, black);
        mask-mode: alpha;
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
        width: 100%;
        height: 100%;
        border-radius: inherit;
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
