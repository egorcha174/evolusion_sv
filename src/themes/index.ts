import type { Theme, ThemeManifest, ThemeFile } from './types';

// Define necessary types for Vite's import.meta.glob to avoid dependency on vite/client types
interface ViteImportMeta {
  glob<T>(pattern: string, options?: { eager: boolean }): Record<string, T>;
}

// Use Vite's glob import with type casting
const presetThemes = (import.meta as unknown as ViteImportMeta).glob<{ default: ThemeFile }>('./presets/*.json', { eager: true });
const customThemes = (import.meta as unknown as ViteImportMeta).glob<{ default: ThemeFile }>('./custom/*.json', { eager: true });

// Expose all built-in themes
export const builtInThemes: ThemeFile[] = Object.values(presetThemes).map(m => m.default);

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