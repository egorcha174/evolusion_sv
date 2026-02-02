# БЫСТРЫЙ СТАРТ: Copy-Paste готовый код

Если ты спешишь, вот готовые файлы для копипаста. **Копируй как есть, не модифицируй.**

---

## 📁 Файл 1: src/lib/types/camera.ts

```typescript
export interface CameraConfig {
  // Основные параметры (обязательные)
  name: string;
  source: string;
  mode: 'preview' | 'live';

  // go2rtc конфиг (обязательные)
  go2rtcHost: string;
  go2rtcProtocol?: 'http' | 'https';

  // Preview (MJPEG) параметры
  previewRefreshInterval?: number;
  previewObjectFit?: 'cover' | 'contain';
  previewWidth?: string | number;
  previewHeight?: string | number;

  // Live (WebRTC) параметры
  webrtcReconnectInterval?: number;
  webrtcTimeout?: number;
  webrtcMaxReconnectAttempts?: number;

  // UI параметры
  showTitle?: boolean;
  showLoadingSpinner?: boolean;
  aspectRatio?: string;

  // Callbacks
  onError?: (error: Error) => void;
  onReady?: () => void;
}

export interface CameraCardState {
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
}
```

---

## 📁 Файл 2: src/lib/components/CameraCard.svelte

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { CameraConfig, CameraCardState } from '$lib/types/camera';
  import CameraCardPreview from './CameraCardPreview.svelte';
  import CameraCardLive from './CameraCardLive.svelte';

  // Props
  export let config: CameraConfig;
  export let forceMode: 'preview' | 'live' | null = null;
  export let isVisible = true;

  // State
  let state = $state.raw<CameraCardState>({
    isLoading: false,
    isConnected: false,
    error: null
  });

  let currentMode = $state<'preview' | 'live'>(config.mode);

  // Вычисляемый режим
  let effectiveMode = $derived(forceMode ?? currentMode);

  // Обработчик ошибок
  function handleError(error: Error | string) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[CameraCard] Error for camera "${config.name}":`, errorMsg);
    
    state.error = errorMsg;
    state.isConnected = false;
    state.isLoading = false;

    if (config.onError) {
      config.onError(new Error(errorMsg));
    }
  }

  // Обработчик успеха
  function handleReady() {
    console.log(`[CameraCard] Camera "${config.name}" connected`);
    state.isConnected = true;
    state.isLoading = false;
    state.error = null;

    if (config.onReady) {
      config.onReady();
    }
  }

  onMount(() => {
    if (!isVisible) return;

    state.isLoading = true;
    state.error = null;

    console.log(`[CameraCard] Mounting camera "${config.name}" in mode: ${effectiveMode}`);

    return () => {
      console.log(`[CameraCard] Unmounting camera "${config.name}"`);
    };
  });

  $effect(() => {
    if (!isVisible) {
      state.isLoading = false;
    }
  });
</script>

<div class="camera-card" style="--aspect-ratio: {config.aspectRatio || '16 / 9'}">
  {#if config.showTitle}
    <div class="camera-card__header">
      <h3 class="camera-card__title">{config.name}</h3>
      {#if state.isConnected}
        <span class="camera-card__status camera-card__status--connected">Live</span>
      {/if}
    </div>
  {/if}

  <div class="camera-card__container">
    {#if !isVisible}
      <div class="camera-card__placeholder">
        <p>Camera hidden</p>
      </div>
    {:else if state.isLoading}
      <div class="camera-card__loader">
        {#if config.showLoadingSpinner}
          <div class="spinner"></div>
        {/if}
        <p>Connecting...</p>
      </div>
    {:else if state.error}
      <div class="camera-card__error">
        <p>Error: {state.error}</p>
        <button 
          class="btn btn--sm" 
          onclick={() => { state.error = null; state.isLoading = true; }}
        >
          Retry
        </button>
      </div>
    {:else if effectiveMode === 'preview'}
      <CameraCardPreview
        {config}
        on:error={(e) => handleError(e.detail)}
        on:ready={handleReady}
      />
    {:else if effectiveMode === 'live'}
      <CameraCardLive
        {config}
        on:error={(e) => handleError(e.detail)}
        on:ready={handleReady}
      />
    {/if}
  </div>
</div>

<style>
  .camera-card {
    --aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-card-border);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .camera-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-12) var(--space-16);
    border-bottom: 1px solid var(--color-card-border-inner);
    background: var(--color-background);
  }

  .camera-card__title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }

  .camera-card__status {
    display: inline-flex;
    align-items: center;
    padding: var(--space-4) var(--space-12);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .camera-card__status--connected {
    background: rgba(var(--color-success-rgb), 0.15);
    color: var(--color-success);
    border: 1px solid rgba(var(--color-success-rgb), 0.25);
  }

  .camera-card__container {
    position: relative;
    width: 100%;
    aspect-ratio: var(--aspect-ratio);
    background: var(--color-background);
    overflow: hidden;
  }

  .camera-card__placeholder,
  .camera-card__loader,
  .camera-card__error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-16);
    padding: var(--space-16);
    background: var(--color-background);
    color: var(--color-text-secondary);
  }

  .camera-card__error {
    color: var(--color-error);
  }

  .camera-card__error p {
    margin: 0;
    text-align: center;
    font-size: var(--font-size-sm);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(var(--color-primary-rgb), 0.2);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .btn {
    padding: var(--space-8) var(--space-16);
    border: none;
    border-radius: var(--radius-base);
    background: var(--color-primary);
    color: var(--color-btn-primary-text);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: background 0.2s;
  }

  .btn:hover {
    background: var(--color-primary-hover);
  }

  .btn--sm {
    padding: var(--space-4) var(--space-12);
    font-size: var(--font-size-xs);
  }
</style>
```

---

## 📁 Файл 3: src/lib/components/CameraCardPreview.svelte

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { CameraConfig } from '$lib/types/camera';

  export let config: CameraConfig;

  let imgElement: HTMLImageElement;
  let previewUrl = $state<string>('');
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  function buildMjpegUrl(): string {
    const protocol = config.go2rtcProtocol || 'http';
    const host = config.go2rtcHost || 'localhost:1984';
    const timestamp = Date.now();
    return `${protocol}://${host}/api/stream.mjpeg?src=${config.source}&t=${timestamp}`;
  }

  function refreshPreview() {
    previewUrl = buildMjpegUrl();
  }

  function handleImageError() {
    const error = new Error(`Failed to load MJPEG stream for camera "${config.name}"`);
    console.error('[CameraCardPreview]', error.message);
    dispatchEvent('error', error);
  }

  function handleImageLoad() {
    console.log(`[CameraCardPreview] Image loaded for camera "${config.name}"`);
    dispatchEvent('ready');
  }

  function dispatchEvent(eventName: string, detail?: any) {
    const event = new CustomEvent(eventName, { detail });
    imgElement?.dispatchEvent(event);
  }

  onMount(() => {
    refreshPreview();

    const interval = config.previewRefreshInterval || 500;
    refreshInterval = setInterval(refreshPreview, interval);

    console.log(`[CameraCardPreview] Started refresh interval (${interval}ms) for "${config.name}"`);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        console.log(`[CameraCardPreview] Cleared refresh interval for "${config.name}"`);
      }
    };
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<img
  bind:this={imgElement}
  src={previewUrl}
  alt={config.name}
  on:error={handleImageError}
  on:load={handleImageLoad}
  class="preview-image"
  style="width: 100%; height: 100%; object-fit: {config.previewObjectFit || 'cover'}; object-position: center;"
/>

<style>
  :global(.preview-image) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
```

---

## 📁 Файл 4: src/lib/components/CameraCardLive.svelte

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { CameraConfig } from '$lib/types/camera';

  export let config: CameraConfig;

  let videoElement: HTMLVideoElement;
  let mediaStream = $state<MediaStream | null>(null);
  let connectionAttempts = $state(0);
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let rtcConnection: RTCPeerConnection | null = null;

  function buildWebRtcUrl(): string {
    const protocol = config.go2rtcProtocol === 'https' ? 'wss' : 'ws';
    const host = config.go2rtcHost || 'localhost:1984';
    return `${protocol}://${host}/api/webrtc?src=${config.source}`;
  }

  async function initWebRTC() {
    try {
      console.log(`[CameraCardLive] Attempting WebRTC connection (attempt ${connectionAttempts + 1})`);

      const wsUrl = buildWebRtcUrl();
      const timeout = config.webrtcTimeout || 5000;

      rtcConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      rtcConnection.ontrack = (event) => {
        console.log('[CameraCardLive] Received media stream track');
        if (event.streams && event.streams.length > 0) {
          mediaStream = event.streams[0];
          connectionAttempts = 0;
          dispatchEvent('ready');
        }
      };

      rtcConnection.oniceerror = (error) => {
        console.error('[CameraCardLive] ICE error:', error);
      };

      rtcConnection.onconnectionstatechange = () => {
        console.log(`[CameraCardLive] Connection state: ${rtcConnection?.connectionState}`);
        if (rtcConnection?.connectionState === 'failed' || rtcConnection?.connectionState === 'disconnected') {
          scheduleReconnect();
        }
      };

      const ws = new WebSocket(wsUrl);

      ws.onopen = async () => {
        console.log('[CameraCardLive] WebSocket connected');

        try {
          const offerMessage = await new Promise<string>((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error('Offer timeout')), timeout);

            ws.onmessage = (event) => {
              clearTimeout(timeoutId);
              resolve(event.data);
            };
          });

          await rtcConnection!.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(offerMessage))
          );

          const answer = await rtcConnection!.createAnswer();
          await rtcConnection!.setLocalDescription(answer);

          ws.send(JSON.stringify(rtcConnection!.localDescription));

          ws.close();
        } catch (error) {
          console.error('[CameraCardLive] Error during SDP exchange:', error);
          ws.close();
          throw error;
        }
      };

      ws.onerror = (error) => {
        console.error('[CameraCardLive] WebSocket error:', error);
        throw new Error('WebSocket connection failed');
      };

      ws.onclose = () => {
        console.log('[CameraCardLive] WebSocket closed');
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[CameraCardLive] WebRTC initialization failed:`, errorMsg);

      connectionAttempts++;

      if (connectionAttempts < (config.webrtcMaxReconnectAttempts || 5)) {
        scheduleReconnect();
      } else {
        const finalError = new Error(
          `WebRTC connection failed after ${connectionAttempts} attempts: ${errorMsg}`
        );
        dispatchEvent('error', finalError);
      }
    }
  }

  function scheduleReconnect() {
    const interval = config.webrtcReconnectInterval || 3000;
    console.log(`[CameraCardLive] Scheduling reconnect in ${interval}ms`);

    reconnectTimeout = setTimeout(() => {
      cleanup();
      initWebRTC();
    }, interval);
  }

  function cleanup() {
    console.log('[CameraCardLive] Cleaning up resources');

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        console.log(`[CameraCardLive] Stopping track: ${track.kind}`);
        track.stop();
      });
      mediaStream = null;
    }

    if (rtcConnection) {
      rtcConnection.close();
      rtcConnection = null;
    }
  }

  function dispatchEvent(eventName: string, detail?: any) {
    const event = new CustomEvent(eventName, { detail });
    videoElement?.dispatchEvent(event);
  }

  function srcObjectAction(node: HTMLVideoElement, stream: MediaStream | null) {
    node.srcObject = stream;

    return {
      update(newStream: MediaStream | null) {
        if (node.srcObject !== newStream) {
          node.srcObject = newStream;
        }
      },
      destroy() {
        if (node.srcObject) {
          const s = node.srcObject as MediaStream;
          s.getTracks().forEach((track) => track.stop());
        }
        node.srcObject = null;
      }
    };
  }

  onMount(async () => {
    console.log(`[CameraCardLive] Mounting for camera "${config.name}"`);
    await initWebRTC();

    return () => {
      cleanup();
    };
  });

  onDestroy(() => {
    console.log(`[CameraCardLive] Destroying for camera "${config.name}"`);
    cleanup();
  });
</script>

<video
  bind:this={videoElement}
  use:srcObjectAction={mediaStream}
  autoplay
  playsinline
  muted
  class="live-video"
/>

<style>
  :global(.live-video) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: var(--color-background);
  }
</style>
```

---

## ✅ БЫСТРАЯ ПРОВЕРКА

После копипаста, запусти:

```bash
npm run build
npm run dev
# Открой http://localhost:5173
# В консоли смотри логи [CameraCard], [CameraCardLive]
# Видео должно показаться через 1-3 секунды
```