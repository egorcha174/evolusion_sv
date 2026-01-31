# 🚀 Практический Гайд: Реализация камер в Svelte 5 (Phase 1: MVP)

> **Цель**: За 3-4 часа создать working MVP с WebRTC потоками от Go2rtc + camera grid

---

## ⚡ QUICK START (30 минут)

### Шаг 1: Инициализируйте SvelteKit проект

```bash
npm create svelte@latest camera-dashboard
cd camera-dashboard
npm install
npm install typescript @sveltejs/adapter-node

# Убедитесь что у вас Svelte 5:
npm list svelte
# должно быть: svelte@5.x.x
```

### Шаг 2: Проверьте Svelte 5 в svelte.config.js

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter()
  }
};
```

---

## 📁 СТРУКТУРА ПРОЕКТА

```
camera-dashboard/
├── src/
│   ├── lib/
│   │   ├── stores/
│   │   │   └── camera.store.svelte.ts      # Camera store with runes
│   │   ├── composables/
│   │   │   ├── useWebRTC.svelte.ts         # WebRTC логика
│   │   │   ├── useHLS.svelte.ts            # HLS логика
│   │   │   └── useSnapshot.svelte.ts       # Snapshots
│   │   ├── components/
│   │   │   ├── CameraCard.svelte           # Компонент камеры
│   │   │   ├── CameraGrid.svelte           # Сетка камер
│   │   │   ├── EventTimeline.svelte        # События Frigate
│   │   │   └── ErrorBoundary.svelte        # Error handling
│   │   ├── api/
│   │   │   ├── go2rtc.ts                   # Go2rtc client
│   │   │   ├── frigate.ts                  # Frigate client
│   │   │   └── camera.ts                   # Camera utils
│   │   └── config.ts                       # Configuration
│   │
│   ├── routes/
│   │   ├── +layout.svelte                  # Root layout
│   │   ├── +page.svelte                    # Home page
│   │   ├── cameras/
│   │   │   └── +page.svelte                # Cameras grid
│   │   └── api/
│   │       ├── cameras/
│   │       │   └── +server.ts              # GET /api/cameras
│   │       ├── streams/
│   │       │   └── +server.ts              # Stream URLs
│   │       └── events/
│   │           └── +server.ts              # Events from Frigate
```

---

## 🏗️ STEP 1: Camera Store с Svelte 5 Runes

```typescript
// src/lib/stores/camera.store.svelte.ts
import { $state, $derived, $effect } from 'svelte';

export interface Camera {
  id: string;
  name: string;
  source: 'go2rtc' | 'frigate' | 'direct';
  go2rtc_name?: string;
  streamUrl?: string;
  snapshotUrl?: string;
  enabled: boolean;
}

export class CameraStore {
  // === STATE (Reactive) ===
  cameras = $state<Camera[]>([]);
  selectedCameraId = $state<string | null>(null);
  isLoading = $state(false);
  error = $state<string | null>(null);

  // === DERIVED (Computed, auto-update) ===
  activeCameras = $derived.by(() => {
    return this.cameras.filter(c => c.enabled);
  });

  selectedCamera = $derived.by(() => {
    if (!this.selectedCameraId) return null;
    return this.cameras.find(c => c.id === this.selectedCameraId);
  });

  // === EFFECTS (Side effects) ===
  constructor() {
    // Load cameras on init
    $effect(() => {
      this.loadCameras();
    });
  }

  // === METHODS ===
  async loadCameras() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await fetch('/api/cameras');
      if (!response.ok) throw new Error('Failed to fetch cameras');
      this.cameras = await response.json();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Camera load error:', err);
    } finally {
      this.isLoading = false;
    }
  }
}

// Export singleton
export const cameraStore = new CameraStore();
```

---

## 🏗️ STEP 2: WebRTC Composable

```typescript
// src/lib/composables/useWebRTC.svelte.ts
import { $state, $effect } from 'svelte';

export interface UseWebRTCReturn {
  stream: MediaStream | null;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWebRTC(signalUrl: string): UseWebRTCReturn {
  let pc = $state<RTCPeerConnection | null>(null);
  let stream = $state<MediaStream | null>(null);
  let error = $state<string | null>(null);
  let status = $state<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  async function connect() {
    if (status === 'connecting' || status === 'connected') return;

    status = 'connecting';
    error = null;

    try {
      pc = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] }
        ]
      });

      const ws = new WebSocket(signalUrl);

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'webrtc/offer') {
            await pc!.setRemoteDescription(
              new RTCSessionDescription({
                type: 'offer',
                sdp: message.value
              })
            );

            const answer = await pc!.createAnswer();
            await pc!.setLocalDescription(answer);

            ws.send(JSON.stringify({
              type: 'webrtc/answer',
              value: answer.sdp
            }));
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      pc.ontrack = (event) => {
        stream = event.streams[0];
        status = 'connected';
      };

    } catch (err) {
      status = 'error';
      error = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  function disconnect() {
    if (pc) {
      pc.close();
      pc = null;
    }
    stream = null;
    status = 'idle';
  }

  $effect(() => {
    return () => disconnect();
  });

  return {
    get stream() { return stream; },
    get status() { return status; },
    get error() { return error; },
    connect,
    disconnect
  };
}
```

---

**ПОЛНЫЙ ГАЙД СОДЕРЖИТ 974 СТРОКИ. СКАЧАЙТЕ ПОЛНЫЙ ФАЙЛ ДЛЯ ВСЕХ ОСТАЛЬНЫХ ШАГОВ И КОМПОНЕНТОВ**

[Продолжение включает: STEP 3-6, Camera Card Component, Routes, API Endpoints, Configuration, Testing]
