<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { HAEntity, AppState } from '$lib/types';
  import { get } from 'svelte/store';
  import { appState } from '../../app/store';
  import { getSignedPath } from '../../ha/store';
  import Hls from 'hls.js';
  import 'iconify-icon';

  let { entity }: { entity: HAEntity | undefined } = $props();

  let videoElement: HTMLVideoElement;
  let imgElement: HTMLImageElement;
  let hlsInstance: Hls | null = null; // Renamed to avoid clash with local 'hls'

  let streamUrl = $state<string | null>(null);
  let streamType = $state<'hls' | 'mjpeg' | null>(null);
  let error = $state<string | null>(null);
  let showUrl = $state(false);

  // --- Effect 1: Determine streamUrl and streamType ---
  // This runs whenever 'entity' or 'appState.activeServer' changes
  $effect(async () => {
    if (!entity) {
      streamUrl = null;
      streamType = null;
      error = null;
      return;
    }
    
    error = null; // Clear previous error
    const config = get(appState).activeServer;
    if (!config) {
      error = 'No active server config.';
      return;
    }

    let newStreamUrl: string | null = null;
    let newStreamType: 'hls' | 'mjpeg' | null = null;

    if (entity.attributes.stream_source) {
      newStreamType = 'hls';
      newStreamUrl = entity.attributes.stream_source;
    } else {
      newStreamType = 'mjpeg';
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

    if (!streamUrl && !error) { // Only set error if no streamUrl and no auth error
      error = 'Could not determine stream URL.';
    } else if (streamUrl) {
      error = null; // Clear error if streamUrl is valid
    }
  });

  // --- Effect 2: Initialize HLS player ---
  // This runs when HLS streamType, videoElement, or streamUrl become available/change
  $effect(() => {
    if (streamType === 'hls' && videoElement && streamUrl) {
      if (hlsInstance) { // Destroy old instance if any
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(videoElement);
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS Error:', data);
            error = `HLS Error: ${data.details}`;
            hlsInstance?.destroy();
          }
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoElement.src = streamUrl;
      } else {
        error = 'HLS is not supported in this browser.';
      }
    } else { // Clean up if no longer HLS or elements/URL missing
      if (hlsInstance) { // Clean up if streamType changes or no longer HLS
        hlsInstance.destroy();
        hlsInstance = null;
      }
      if (videoElement) {
        videoElement.src = ''; // Clear video src
      }
    }
  });

  // --- Effect 3: Initialize MJPEG player ---
  // This runs when MJPEG streamType, imgElement, or streamUrl become available/change
  $effect(() => {
    if (streamType === 'mjpeg' && imgElement && streamUrl) {
      imgElement.src = streamUrl;
    } else { // Clean up if no longer MJPEG or elements/URL missing
      if (imgElement) {
        imgElement.src = ''; // Clear image src
      }
    }
  });

  // --- Lifecycle Cleanup ---
  onDestroy(() => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });

  // --- Event Handlers (for HTML attributes) ---
  function handleImageError() {
    error = 'MJPEG stream failed to load. Check camera status in HA.';
  }

  function handleImageLoad() {
    error = null; // Clear previous errors if image loads
  }
</script>

<div class="camera-widget-container">
  {#if entity && streamUrl}
    <div class="stream-wrapper">
      {#if streamType === 'hls'}
        <video
          bind:this={videoElement}
          autoplay
          muted
          playsinline
          controls={false}
          class="video-player"
        ></video>
      {:else if streamType === 'mjpeg'}
        <img
          bind:this={imgElement}
          src={streamUrl}
          alt="{entity.attributes.friendly_name || 'Camera Stream'}"
          class="mjpeg-player"
          onerror={handleImageError}
          onload={handleImageLoad}
        />
      {/if}
      <div class="info-overlay" onclick={() => showUrl = !showUrl}>
        <iconify-icon icon="mdi:camera" />
        <span>{entity.attributes.friendly_name}</span>
      </div>
      {#if showUrl}
        <div class="url-debug">{streamUrl}</div>
      {/if}
    </div>
  {:else if error}
    <div class="error-state">
      <iconify-icon icon="mdi:alert-circle-outline" width="32" />
      <span>{error}</span>
    </div>
  {:else}
    <div class="placeholder">
      <iconify-icon icon="mdi:camera-off-outline" width="32" />
      <span>No Camera Selected</span>
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
  }

  .video-player, .mjpeg-player {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 6px 8px;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
  }

  .stream-wrapper:hover .info-overlay {
    opacity: 1;
  }

  .placeholder, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 8px;
    padding: 1rem;
  }

  .error-state {
    color: var(--accent-error);
  }

  .url-debug {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    font-size: 10px;
    background: rgba(0,0,0,0.8);
    color: #0f0;
    padding: 4px;
    word-break: break-all;
    z-index: 10;
  }
</style>