<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { HAEntity, AppState } from '$lib/types';
  import { get } from 'svelte/store';
  import { appState } from '../../app/store';
  import { getSignedPath } from '../../ha/store';
  import Hls from 'hls.js';
  import 'iconify-icon';

  let { entity }: { entity: HAEntity | undefined } = $props();

  let videoElement: HTMLVideoElement;
  let imgElement: HTMLImageElement;
  let hlsInstance: Hls | null = null;

  let streamUrl = $state<string | null>(null);
  let streamType = $state<'hls' | 'mjpeg' | null>(null);
  let error = $state<string | null>(null);
  let showUrl = $state(false);
  let isLoading = $state(false);

  // --- Effect 1: Determine streamType and handle initial URL for HLS ---
  $effect(() => {
    const currentEntity = entity;
    if (!currentEntity) {
      streamUrl = null;
      streamType = null;
      error = null;
      isLoading = false;
      return;
    }
    
    error = null;
    
    if (currentEntity.attributes.stream_source) {
      streamType = 'hls';
      streamUrl = currentEntity.attributes.stream_source;
    } else {
      streamType = 'mjpeg';
      streamUrl = ''; // Set to empty to trigger the refresh effect
    }
  });

  // --- Effect 2: Handle HLS player ---
  $effect(() => {
    if (streamType === 'hls' && videoElement && streamUrl) {
      if (hlsInstance) hlsInstance.destroy();
      
      if (Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(videoElement);
        hlsInstance.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) error = `HLS Error: ${data.details}`;
        });
      } else {
        videoElement.src = streamUrl;
      }
    }
    return () => {
      if (hlsInstance) hlsInstance.destroy();
    }
  });

  // --- Effect 3: Handle MJPEG snapshot refresh ---
  $effect(() => {
    if (streamType !== 'mjpeg' || !entity) {
      return;
    }

    let isActive = true;
    const currentEntityId = entity.entity_id;
    
    const updateMjpegUrl = async () => {
      if (!isActive) return;

      const config = get(appState).activeServer;
      if (config && entity && entity.entity_id === currentEntityId) {
        const relativePath = `/api/camera_proxy/${entity.entity_id}`;
        try {
          const signedPath = await getSignedPath(relativePath);
          const baseUrl = new URL(config.url);
          
          if (isActive && entity && entity.entity_id === currentEntityId) {
            streamUrl = `${baseUrl.origin}${signedPath}`;
          }
        } catch (e) {
          console.error("MJPEG refresh failed:", e);
          // Error will be caught by the img onerror handler
        }
      }
    };
    
    updateMjpegUrl(); // Initial fetch
    const interval = setInterval(updateMjpegUrl, 2000); // Refresh every 2 seconds
    
    return () => {
      isActive = false;
      clearInterval(interval);
    }
  });
  
  // --- Lifecycle Cleanup ---
  onDestroy(() => {
    if (hlsInstance) hlsInstance.destroy();
  });

  // --- Event Handlers ---
  function handleImageError() {
    error = 'Snapshot fetch failed. Check URL and HA logs.';
  }

  function handleImageLoad() {
    error = null;
  }
</script>

<div class="camera-widget-container">
  {#if entity}
    {#if error}
      <div class="error-state">
        <iconify-icon icon="mdi:alert-circle-outline" width="32" />
        <span>{error}</span>
      </div>
    {:else if isLoading}
       <div class="placeholder">
          <div class="spinner"></div>
          <span>Loading Stream...</span>
       </div>
    {:else if streamUrl}
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
    {:else}
      <div class="error-state">
        <iconify-icon icon="mdi:close-network-outline" width="32" />
        <span>Stream URL not found.</span>
      </div>
    {/if}
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
    background: #111;
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
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255,255,255,0.2);
    border-top-color: var(--text-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

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