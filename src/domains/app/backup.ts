
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { get } from 'svelte/store';
import { themeSettings } from '../ui/theme/store';
import { dashboardStore } from './dashboardStore';
import { weatherSettings } from '../../lib/weather/store';

// Storage Keys (Must match what is used in stores)
const KEYS = {
  server: 'app_server_config_encrypted',
  theme: 'evolusion_theme_settings',
  dashboard: 'evolusion_dashboard_v2_encrypted',
  weather: 'evolusion_weather_settings',
  ui: 'evolusion.sidebar.width'
};

export async function exportAllSettings() {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Collect data
  const data = {
    meta: {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'evolusion'
    },
    settings: {
      server: localStorage.getItem(KEYS.server),
      theme: localStorage.getItem(KEYS.theme),
      dashboard: localStorage.getItem(KEYS.dashboard),
      weather: localStorage.getItem(KEYS.weather),
      ui: localStorage.getItem(KEYS.ui)
    }
  };

  zip.file('evolusion-settings.json', JSON.stringify(data, null, 2));

  // Generate
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `evolusion-backup-${timestamp}.zip`);
}

export async function importAllSettings(file: File): Promise<boolean> {
  try {
    const zip = await JSZip.loadAsync(file);
    const configFile = zip.file('evolusion-settings.json');
    
    if (!configFile) {
      throw new Error('Invalid backup archive: missing configuration file');
    }

    const content = await configFile.async('string');
    const data = JSON.parse(content);

    if (data.meta?.app !== 'evolusion') {
      throw new Error('Invalid backup format');
    }

    // Restore to LocalStorage
    // We intentionally don't validate every field strictly, relying on stores to sanitize on load
    const s = data.settings;
    if (s.server) localStorage.setItem(KEYS.server, s.server);
    if (s.theme) localStorage.setItem(KEYS.theme, s.theme);
    if (s.dashboard) localStorage.setItem(KEYS.dashboard, s.dashboard);
    if (s.weather) localStorage.setItem(KEYS.weather, s.weather);
    if (s.ui) localStorage.setItem(KEYS.ui, s.ui);

    // Force reload to apply changes (simplest way to re-init all stores)
    window.location.reload();
    
    return true;
  } catch (e) {
    console.error('Import failed', e);
    throw e;
  }
}

export function clearAllData() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  window.location.reload();
}
