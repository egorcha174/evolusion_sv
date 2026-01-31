<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { HAEntity, AppState } from "$lib/types";
  import { get } from "svelte/store";
  import { appState } from "../../app/store";
  import { getSignedPath } from "../../ha/store";
  import { t } from "svelte-i18n";
  import Hls from "hls.js";
  import "iconify-icon";

  let { entity }: { entity: HAEntity | undefined } = $props();

  let videoElement: HTMLVideoElement | undefined;
  let imgElement: HTMLImageElement | undefined;
  let hlsInstance: Hls | null = null;

  let streamUrl = $state<string | null>(null);
  let streamType = $state<"hls" | "mjpeg" | null>(null);
  let error = $state<string | null>(null);
  let isLoading = $state(true);
  let showUrl = $state(false);
  let retryCount = $state(0);
  let blobUrl = $state<string | null>(null); // For fetch-based MJPEG
  const MAX_RETRIES = 3;

  // --- Effect 1: Determine stream URL and type ---
  $effect(async () => {
    if (!entity) {
      streamUrl = null;
      streamType = null;
      error = null;
      isLoading = false;
      return;
    }

    isLoading = true;
    error = null;
    const config = get(appState).activeServer;
    if (!config) {
      error = "No active server config.";
      isLoading = false;
      return;
    }

    let newStreamUrl: string | null = null;
    let newStreamType: "hls" | "mjpeg" | null = null;

    // Check for HLS stream source (e.g., from RTSP to WebRTC integration)
    if (entity.attributes?.stream_source) {
      newStreamType = "hls";
      newStreamUrl = entity.attributes.stream_source;
    } else {
      // Fallback to MJPEG stream via Home Assistant API
      newStreamType = "mjpeg";
      const relativePath = `/api/camera_proxy_stream/${entity.entity_id}`;
      try {
        const signedPath = await getSignedPath(relativePath);
        const baseUrl = new URL(config.url);
        newStreamUrl = `${baseUrl.origin}${signedPath}`;
      } catch (e: any) {
        console.error("Failed to get signed path for camera", e);
        error = `Auth Error: ${e.message}`;
        newStreamUrl = null;
      }
    }

    streamUrl = newStreamUrl;
    streamType = newStreamType;

    if (!streamUrl && !error) {
      error = "Could not determine stream URL.";
    } else if (streamUrl) {
      error = null;
    }
    isLoading = false;
  });

  // --- Effect 2: Initialize HLS player (inspired by ha-fusion) ---
  $effect(() => {
    if (streamType === "hls" && videoElement && streamUrl) {
      // Destroy old instance if any
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (Hls.isSupported()) {
        // HLS.js configuration inspired by ha-fusion
        const config = {
          backBufferLength: 60,
          fragLoadingTimeOut: 30000,
          manifestLoadingTimeOut: 30000,
          levelLoadingTimeOut: 30000,
          maxLiveSyncPlaybackRate: 2,
          lowLatencyMode: true,
        };

        hlsInstance = new Hls(config);
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(videoElement);

        // Handle HLS events
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          console.debug("HLS manifest parsed:", entity?.entity_id);
          isLoading = false;
          videoElement?.play().catch(() => {
            // Autoplay might be prevented, user interaction required
          });
        });

        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Fatal media error, attempting recovery:", data);
                hlsInstance?.recoverMediaError();
                break;
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Fatal network error:", data);
                error = "Network error loading HLS stream";
                break;
              default:
                console.error("Unrecoverable HLS error:", data);
                error = `HLS Error: ${data.details}`;
                hlsInstance?.destroy();
                hlsInstance = null;
                break;
            }
          }
        });
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        console.debug("Using native HLS support:", entity?.entity_id);
        videoElement.src = streamUrl;
        videoElement.play().catch(() => {
          // Autoplay prevented
        });
      } else {
        error = "HLS is not supported in this browser.";
      }
    } else if (streamType !== "hls") {
      // Clean up HLS if switching stream types or no longer HLS
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      if (videoElement) {
        videoElement.src = "";
      }
    }
  });

  // --- Effect 3: Handle MJPEG stream with fetch-based approach ---
  $effect(() => {
    if (streamType === "mjpeg" && streamUrl) {
      loadMJPEGStream();
    } else if (streamType !== "mjpeg") {
      // Cleanup MJPEG resources
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrl = null;
      }
      if (imgElement) {
        imgElement.src = "";
      }
    }

    // Cleanup on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrl = null;
      }
    };
  });

  // --- MJPEG Loading with fetch and retry ---
  async function loadMJPEGStream() {
    if (!streamUrl || !imgElement) return;

    try {
      isLoading = true;
      error = null;

      // Try fetch-based approach first (more reliable for CORS)
      const response = await fetch(streamUrl, {
        method: "GET",
        mode: "cors",
        // DON'T use credentials: 'include' - authSig in URL handles auth
        // credentials: 'include' requires Access-Control-Allow-Credentials which HA doesn't send
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if it's an MJPEG stream
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("multipart")) {
        // Direct MJPEG stream - authSig in URL handles authentication
        imgElement.src = streamUrl;
        retryCount = 0;
      } else {
        // Single image or other format - create blob URL
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Revoke old blob URL
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }

        blobUrl = url;
        imgElement.src = url;
        retryCount = 0;
      }
    } catch (e: any) {
      console.error("MJPEG stream fetch failed:", e);

      retryCount++;

      if (retryCount <= MAX_RETRIES) {
        // Retry with exponential backoff
        const delay = 1000 * Math.pow(2, retryCount - 1);
        console.log(
          `Retrying MJPEG load in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})`,
        );

        setTimeout(() => {
          loadMJPEGStream();
        }, delay);
      } else {
        // Max retries reached
        error = get(t)("settings.widgets.cameraStreamFailed");
        isLoading = false;
      }
    }
  }

  // --- Lifecycle: Cleanup on destroy ---
  onDestroy(() => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrl = null;
    }
  });

  // --- Event handlers ---
  function handleImageError() {
    if (streamType === "mjpeg") {
      console.error("Image element error event fired");
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => loadMJPEGStream(), 1000 * retryCount);
      } else {
        error =
          get(t)("settings.widgets.cameraStreamFailed") +
          ". " +
          get(t)("settings.widgets.cameraCheckHA");
        isLoading = false;
      }
    }
  }

  function handleImageLoad() {
    if (streamType === "mjpeg") {
      error = null;
      isLoading = false;
      retryCount = 0;
    }
  }

  function handleRetry() {
    retryCount = 0;
    error = null;
    isLoading = true;
    if (streamType === "mjpeg") {
      loadMJPEGStream();
    }
  }
</script>

<div class="camera-widget-container">
  {#if entity && streamUrl && !error}
    <div class="stream-wrapper">
      {#if streamType === "hls"}
        <video
          bind:this={videoElement}
          autoplay
          muted
          playsinline
          controls={false}
          class="video-player"
        />
      {:else if streamType === "mjpeg"}
        <img
          bind:this={imgElement}
          src={streamUrl}
          alt={entity.attributes?.friendly_name || "Camera Stream"}
          class="mjpeg-player"
          onerror={handleImageError}
          onload={handleImageLoad}
        />
      {/if}

      {#if isLoading}
        <div class="loader">
          <iconify-icon icon="mdi:loading" width="32" class="spinning" />
          <span class="loading-text">
            {$t("settings.widgets.cameraLoading")}
            {#if retryCount > 0}
              (Retry {retryCount}/{MAX_RETRIES})
            {/if}
          </span>
        </div>
      {/if}

      <div class="info-overlay" onclick={() => (showUrl = !showUrl)}>
        <iconify-icon icon="mdi:camera" />
        <span>{entity.attributes?.friendly_name || "Camera"}</span>
      </div>

      {#if showUrl}
        <div class="url-debug">{streamUrl}</div>
      {/if}
    </div>
  {:else if error}
    <div class="error-state">
      <iconify-icon icon="mdi:alert-circle-outline" width="32" />
      <span class="error-title">{$t("settings.widgets.cameraError")}</span>
      <span class="error-message">{error}</span>
      <button class="retry-btn" onclick={handleRetry}>
        <iconify-icon icon="mdi:refresh" />
        {$t("settings.widgets.cameraRetry")}
      </button>
    </div>
  {:else if !entity}
    <div class="placeholder">
      <iconify-icon icon="mdi:camera-off-outline" width="32" />
      <span>{$t("settings.widgets.cameraNoSelection")}</span>
    </div>
  {:else}
    <div class="placeholder">
      <iconify-icon icon="mdi:loading" width="32" class="spinning" />
      <span>{$t("common.loading")}</span>
    </div>
  {/if}
</div>

<style>
  .camera-widget-container {
    width: 100%;
    height: 100%;
    background: var(--bg-input, #000);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  .stream-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    background: #000;
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
    z-index: 2;
    pointer-events: none;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 6px 8px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
    z-index: 3;
  }

  .stream-wrapper:hover .info-overlay {
    opacity: 1;
  }

  .placeholder,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 12px;
    padding: 1rem;
    height: 100%;
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
    max-width: 90%;
  }

  .retry-btn {
    margin-top: 8px;
    padding: 8px 16px;
    background: var(--bg-chip);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .retry-btn:hover {
    background: var(--bg-chip-active);
    transform: translateY(-1px);
  }

  .loading-text {
    margin-top: 8px;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .url-debug {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    font-size: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #0f0;
    padding: 4px;
    word-break: break-all;
    z-index: 10;
    max-height: 60px;
    overflow: auto;
  }
</style>
