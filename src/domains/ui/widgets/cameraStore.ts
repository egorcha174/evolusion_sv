import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface CameraSettings {
  selectedEntityId: string | null;
}

const STORAGE_KEY = 'evolusion_camera_settings';

function createCameraSettingsStore() {
  const initial: CameraSettings = {
    selectedEntityId: null
  };

  const { subscribe, set, update } = writable<CameraSettings>(initial);

  function load() {
    if (!browser) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        set(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse camera settings", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  function save(settings: CameraSettings) {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  // Load initial settings on creation
  load();

  return {
    subscribe,
    set: (settings: CameraSettings) => {
      set(settings);
      save(settings);
    },
    update: (updater: (settings: CameraSettings) => CameraSettings) => {
      update(settings => {
        const newSettings = updater(settings);
        save(newSettings);
        return newSettings;
      });
    },
    selectCamera: (entityId: string | null) => {
      update(settings => ({ ...settings, selectedEntityId: entityId }));
    }
  };
}

export const cameraSettings = createCameraSettingsStore();
