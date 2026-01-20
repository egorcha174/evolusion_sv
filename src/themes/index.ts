import type { Theme, ThemeManifest } from './types';

// Define necessary types for Vite's import.meta.glob to avoid dependency on vite/client types
interface ViteImportMeta {
  glob<T>(pattern: string, options?: { eager: boolean }): Record<string, T>;
}

// Use Vite's glob import with type casting
const presetThemes = (import.meta as unknown as ViteImportMeta).glob<{ default: Theme }>('./presets/*.json', { eager: true });
const customThemes = (import.meta as unknown as ViteImportMeta).glob<{ default: Theme }>('./custom/*.json', { eager: true });

export function getAvailableThemes(): ThemeManifest[] {
  const themes: ThemeManifest[] = [];
  
  for (const path in presetThemes) {
    const theme = presetThemes[path].default;
    if (theme && theme.manifest) {
      themes.push({ ...theme.manifest, isCustom: false });
    }
  }
  
  for (const path in customThemes) {
    const theme = customThemes[path].default;
    if (theme && theme.manifest) {
      themes.push({ ...theme.manifest, isCustom: true });
    }
  }
  
  // Also check localStorage for user-saved custom themes that aren't files
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
  // 1. Presets
  for (const path in presetThemes) {
    const theme = presetThemes[path].default;
    if (theme.manifest.id === themeId) {
      return theme;
    }
  }
  
  // 2. Custom Files
  for (const path in customThemes) {
    const theme = customThemes[path].default;
    if (theme.manifest.id === themeId) {
      return theme;
    }
  }
  
  // 3. LocalStorage
  if (typeof localStorage !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('evolusion-custom-themes') || '{}');
        if (stored[themeId]) return stored[themeId];
      } catch (e) { /* ignore */ }
  }
  
  return null;
}

export async function saveCustomTheme(theme: Theme): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  const customThemesKey = 'evolusion-custom-themes';
  const existing = JSON.parse(localStorage.getItem(customThemesKey) || '{}');
  existing[theme.manifest.id] = theme;
  localStorage.setItem(customThemesKey, JSON.stringify(existing));
}

export async function deleteCustomTheme(themeId: string): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  const customThemesKey = 'evolusion-custom-themes';
  const existing = JSON.parse(localStorage.getItem(customThemesKey) || '{}');
  delete existing[themeId];
  localStorage.setItem(customThemesKey, JSON.stringify(existing));
}