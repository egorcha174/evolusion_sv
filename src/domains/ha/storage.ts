import { browser } from '$app/environment';

/**
 * Registry of all LocalStorage keys used in the application.
 * Centralizing them here prevents collisions and magic strings.
 */
export const STORAGE_KEYS = {
  // --- Security & Session ---
  AUTH_SALT: 'auth_salt',
  AUTH_VERIFIER: 'auth_verifier',
  
  // --- Core App Data ---
  SERVER_CONFIG: 'app_server_config_encrypted',
  SERVER_LIST: 'app_servers_list_encrypted',
  DASHBOARD_LAYOUT: 'evolusion_dashboard_v2_encrypted',
  
  // --- UI Persistence ---
  SIDEBAR_WIDTH: 'evolusion.sidebar.width',
  SETTINGS_WIDTH: 'evolusion_settings_width',
  
  // --- Theming ---
  THEME_ACTIVE_ID: 'evolusion_active_theme_id',
  THEME_MODE: 'evolusion_theme_mode',
  USER_THEMES: 'evolusion.user_themes.v1',
  
  // --- Widgets ---
  WEATHER_SETTINGS: 'evolusion_weather_settings',
  CLOCK_SETTINGS: 'evolusion_clock_settings',
  
  // --- Internationalization ---
  LOCALE: 'evolusion_locale',
  CUSTOM_LANGS: 'evolusion_custom_langs',
  
  // --- Legacy / Deprecated (Keep for migrations) ---
  LEGACY_CUSTOM_THEMES: 'evolusion-custom-themes'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Safely reads and parses a JSON value from LocalStorage.
 * Returns defaultValue if key missing or parse error.
 */
export function readItem<T>(key: string, defaultValue: T): T {
  if (!browser) return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[Storage] Failed to read/parse key "${key}":`, e);
    return defaultValue;
  }
}

/**
 * Safely writes a value as JSON to LocalStorage.
 */
export function writeItem<T>(key: string, value: T): void {
  if (!browser) return;
  try {
    const str = JSON.stringify(value);
    localStorage.setItem(key, str);
  } catch (e) {
    console.error(`[Storage] Failed to write key "${key}":`, e);
  }
}

/**
 * Reads a raw string from LocalStorage (for non-JSON data like Salts/Base64).
 */
export function readString(key: string): string | null {
  if (!browser) return null;
  return localStorage.getItem(key);
}

/**
 * Writes a raw string to LocalStorage.
 */
export function writeString(key: string, value: string): void {
  if (!browser) return;
  localStorage.setItem(key, value);
}

/**
 * Removes an item from LocalStorage.
 */
export function removeItem(key: string): void {
  if (!browser) return;
  localStorage.removeItem(key);
}

/**
 * Clears all Evolusion-related keys from storage.
 * Useful for factory reset.
 */
export function clearAllAppStorage(): void {
  if (!browser) return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
