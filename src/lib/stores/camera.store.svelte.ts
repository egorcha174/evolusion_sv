/**
 * Camera Store - Svelte 5 reactive store with runes
 * 
 * Manages camera list, active selection, and loading states.
 * Used by CameraGrid and CameraCard components.
 */

// Camera source types
export type CameraSource = 'go2rtc' | 'frigate' | 'direct';

// Camera interface matching API response
export interface Camera {
    id: string;
    name: string;
    source: CameraSource;
    go2rtc_name?: string;      // Go2rtc stream name
    frigate_name?: string;     // Frigate camera name
    streamUrl?: string;        // Direct RTSP/MJPEG URL
    snapshotUrl?: string;      // Snapshot URL
    enabled: boolean;
}

// Stream status type
export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'error';

// Camera store state
interface CameraStoreState {
    cameras: Camera[];
    selectedCameraId: string | null;
    isLoading: boolean;
    error: string | null;
}

// Create reactive camera store using Svelte 5 runes
function createCameraStore() {
    // === STATE (Reactive with $state) ===
    let cameras = $state<Camera[]>([]);
    let selectedCameraId = $state<string | null>(null);
    let isLoading = $state(false);
    let error = $state<string | null>(null);

    // === DERIVED (Auto-computed values) ===
    const activeCameras = $derived(cameras.filter(c => c.enabled));
    const selectedCamera = $derived(
        selectedCameraId ? cameras.find(c => c.id === selectedCameraId) ?? null : null
    );
    const cameraCount = $derived(cameras.length);
    const activeCameraCount = $derived(activeCameras.length);

    // === METHODS ===

    /**
     * Load cameras from API
     */
    async function loadCameras(): Promise<void> {
        isLoading = true;
        error = null;

        try {
            const response = await fetch('/api/cameras');

            if (!response.ok) {
                throw new Error(`Failed to fetch cameras: ${response.status}`);
            }

            const data = await response.json();
            cameras = data.cameras ?? data;

            console.log(`[CameraStore] Loaded ${cameras.length} cameras`);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error loading cameras';
            console.error('[CameraStore] Load error:', err);
        } finally {
            isLoading = false;
        }
    }

    /**
     * Select a camera by ID
     */
    function selectCamera(id: string | null): void {
        selectedCameraId = id;
        console.log(`[CameraStore] Selected camera: ${id}`);
    }

    /**
     * Get camera by ID
     */
    function getCameraById(id: string): Camera | undefined {
        return cameras.find(c => c.id === id);
    }

    /**
     * Update camera enabled state
     */
    function setCameraEnabled(id: string, enabled: boolean): void {
        const index = cameras.findIndex(c => c.id === id);
        if (index !== -1) {
            cameras[index] = { ...cameras[index], enabled };
        }
    }

    /**
     * Add a new camera (for manual configuration)
     */
    function addCamera(camera: Camera): void {
        cameras = [...cameras, camera];
    }

    /**
     * Remove camera by ID
     */
    function removeCamera(id: string): void {
        cameras = cameras.filter(c => c.id !== id);
        if (selectedCameraId === id) {
            selectedCameraId = null;
        }
    }

    /**
     * Clear error state
     */
    function clearError(): void {
        error = null;
    }

    /**
     * Refresh cameras (reload from API)
     */
    async function refresh(): Promise<void> {
        await loadCameras();
    }

    // Return public API with getters for reactive values
    return {
        // Reactive state (getters)
        get cameras() { return cameras; },
        get selectedCameraId() { return selectedCameraId; },
        get isLoading() { return isLoading; },
        get error() { return error; },

        // Derived values (getters)
        get activeCameras() { return activeCameras; },
        get selectedCamera() { return selectedCamera; },
        get cameraCount() { return cameraCount; },
        get activeCameraCount() { return activeCameraCount; },

        // Methods
        loadCameras,
        selectCamera,
        getCameraById,
        setCameraEnabled,
        addCamera,
        removeCamera,
        clearError,
        refresh
    };
}

// Export singleton instance
export const cameraStore = createCameraStore();

// Export type for TypeScript
export type CameraStore = ReturnType<typeof createCameraStore>;
