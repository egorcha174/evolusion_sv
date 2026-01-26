import type { Theme, ThemeManifest, ThemeFile } from './types';

// Define necessary types for Vite's import.meta.glob to avoid dependency on vite/client types
interface ViteImportMeta {
  glob<T>(pattern: string, options?: { eager: boolean }): Record<string, T>;
}

// Fallback theme to prevent crash if file loading fails
const FALLBACK_THEME: ThemeFile = {
  schemaVersion: 1,
  manifest: {
    name: "Fallback",
    version: "0.0.0",
    author: "System",
    description: "Emergency fallback theme",
    generatedAt: new Date().toISOString()
  },
  theme: {
    id: "default",
    name: "Default",
    isCustom: false,
    scheme: {
      light: {
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#f0f2f5",
        cardOpacity: 1,
        cardBorderRadius: 12,
        cardBorderWidth: 0,
        cardBorderColor: "transparent",
        cardBorderColorOn: "#2196f3",
        cardBackground: "#ffffff",
        cardBackgroundOn: "#ffffff",
        panelOpacity: 1,
        tabTextColor: "#65676b",
        activeTabTextColor: "#2196f3",
        tabIndicatorColor: "#2196f3",
        iconBackgroundShape: "circle",
        iconBackgroundColorOn: "#2196f3",
        iconBackgroundColorOff: "#e4e6eb",
        nameTextColor: "#1a1d21",
        statusTextColor: "#65676b",
        valueTextColor: "#2196f3",
        unitTextColor: "#65676b",
        nameTextColorOn: "#1a1d21",
        statusTextColorOn: "#2196f3",
        valueTextColorOn: "#2196f3",
        unitTextColorOn: "#2196f3",
        thermostatHandleColor: "#ffffff",
        thermostatDialTextColor: "#1a1d21",
        thermostatDialLabelColor: "#65676b",
        thermostatHeatingColor: "#f44336",
        thermostatCoolingColor: "#2196f3",
        clockTextColor: "#1a1d21",
        weatherPrimaryColor: "#1a1d21",
        weatherSecondaryColor: "#65676b",
        accentPrimary: "#2196f3",
        accentError: "#f44336",
        accentSuccess: "#4caf50",
        accentWarning: "#ff9800",
        accentInfo: "#03a9f4",
        widgetSwitchOn: "#4caf50"
      },
      dark: {
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#111315",
        cardOpacity: 1,
        cardBorderRadius: 12,
        cardBorderWidth: 0,
        cardBorderColor: "transparent",
        cardBorderColorOn: "#64b5f6",
        cardBackground: "#1e2023",
        cardBackgroundOn: "#1e2023",
        panelOpacity: 1,
        tabTextColor: "#b0b3b8",
        activeTabTextColor: "#64b5f6",
        tabIndicatorColor: "#64b5f6",
        iconBackgroundShape: "circle",
        iconBackgroundColorOn: "#64b5f6",
        iconBackgroundColorOff: "#2d3035",
        nameTextColor: "#e4e6eb",
        statusTextColor: "#b0b3b8",
        valueTextColor: "#64b5f6",
        unitTextColor: "#b0b3b8",
        nameTextColorOn: "#e4e6eb",
        statusTextColorOn: "#64b5f6",
        valueTextColorOn: "#64b5f6",
        unitTextColorOn: "#64b5f6",
        thermostatHandleColor: "#e4e6eb",
        thermostatDialTextColor: "#e4e6eb",
        thermostatDialLabelColor: "#b0b3b8",
        thermostatHeatingColor: "#e57373",
        thermostatCoolingColor: "#64b5f6",
        clockTextColor: "#e4e6eb",
        weatherPrimaryColor: "#e4e6eb",
        weatherSecondaryColor: "#b0b3b8",
        accentPrimary: "#64b5f6",
        accentError: "#e57373",
        accentSuccess: "#81c784",
        accentWarning: "#ffb74d",
        accentInfo: "#4fc3f7",
        widgetSwitchOn: "#81c784"
      }
    }
  }
};

// Use Vite's glob import with type casting
const presetThemes = (import.meta as unknown as ViteImportMeta).glob<{ default: ThemeFile }>('./presets/*.json', { eager: true });
const customThemes = (import.meta as unknown as ViteImportMeta).glob<{ default: ThemeFile }>('./custom/*.json', { eager: true });

// Expose all built-in themes
let loadedThemes: ThemeFile[] = Object.values(presetThemes).map(m => m.default);

if (loadedThemes.length === 0) {
  console.warn('No theme presets found in src/themes/presets/*.json. Using fallback theme.');
  loadedThemes = [FALLBACK_THEME];
}

export const builtInThemes = loadedThemes;

// Expose default theme (fallback)
export const defaultTheme: ThemeFile = builtInThemes.find(t => t.theme.id === 'default') || builtInThemes[0];

export type AvailableTheme = ThemeManifest & { isCustom: boolean };

export function getAvailableThemes(): AvailableTheme[] {
  const themes: AvailableTheme[] = [];
  
  // 1. Built-in (Presets)
  for (const file of builtInThemes) {
    if (file && file.manifest) {
      themes.push({ ...file.manifest, isCustom: false });
    }
  }
  
  // 2. Custom Files
  for (const path in customThemes) {
    const file = customThemes[path].default;
    if (file && file.manifest) {
      // @ts-ignore
      themes.push({ ...file.manifest, isCustom: true });
    }
  }
  
  // 3. LocalStorage
  if (typeof localStorage !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('evolusion-custom-themes') || '{}');
        Object.values(stored).forEach((t: any) => {
            if (t.manifest) themes.push({ ...t.manifest, isCustom: true });
        });
      } catch (e) { /* ignore */ }
  }
  
  return themes;
}

export async function loadTheme(themeId: string): Promise<Theme | null> {
  // 1. Built-ins
  const builtIn = builtInThemes.find(t => t.theme.id === themeId);
  if (builtIn) return builtIn.theme;
  
  // 2. Custom Files
  for (const path in customThemes) {
    const file = customThemes[path].default;
    if (file.theme.id === themeId) {
      return file.theme;
    }
  }
  
  // 3. LocalStorage
  if (typeof localStorage !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('evolusion-custom-themes') || '{}');
        if (stored[themeId]) return stored[themeId].theme;
      } catch (e) { /* ignore */ }
  }
  
  return null;
}

export async function saveCustomTheme(file: ThemeFile): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  const customThemesKey = 'evolusion-custom-themes';
  const existing = JSON.parse(localStorage.getItem(customThemesKey) || '{}');
  existing[file.theme.id] = file;
  localStorage.setItem(customThemesKey, JSON.stringify(existing));
}

export async function deleteCustomTheme(themeId: string): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  const customThemesKey = 'evolusion-custom-themes';
  const existing = JSON.parse(localStorage.getItem(customThemesKey) || '{}');
  delete existing[themeId];
  localStorage.setItem(customThemesKey, JSON.stringify(existing));
}