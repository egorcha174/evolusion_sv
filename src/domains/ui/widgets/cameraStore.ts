import { writable } from 'svelte/store';
import { browser } from '$app/environment';

import type { CameraSourceConfig } from '$lib/types';

export interface CameraSettings {
  selectedEntityId: string | null;
  cameraSourceConfig?: CameraSourceConfig;
}

const STORAGE_KEY = 'evolusion_camera_settings';

function createCameraSettingsStore() {
  const initial: CameraSettings = {
    selectedEntityId: null
  };

  const { subscribe, set, update: writable_update } = writable<CameraSettings>(initial);

  function load() {
    if (!browser) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        set(parsed);
      } catch (e) {
        console.error("[cameraStore] Failed to parse camera settings", e);
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

  // Custom update that auto-saves
  function updateAndSave(updater: (settings: CameraSettings) => CameraSettings) {
    writable_update(settings => {
      const newSettings = updater(settings);
      save(newSettings);
      return newSettings;
    });
  }

  return {
    subscribe,
    set: (settings: CameraSettings) => {
      set(settings);
      save(settings);
    },
    update: updateAndSave,
    selectCamera: (entityId: string | null) => {
      updateAndSave(settings => ({ ...settings, selectedEntityId: entityId }));
    },
    updateSourceConfig: (config: CameraSourceConfig) => {
      updateAndSave(settings => ({ ...settings, cameraSourceConfig: config }));
    }
  };
}

export const cameraSettings = createCameraSettingsStore();
