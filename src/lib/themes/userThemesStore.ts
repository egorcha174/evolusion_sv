
import { browser } from '$app/environment';
import type { ThemeFile } from '../../themes/types';
import { defaultTheme } from '../../themes';

// Using ThemeFile (same as ThemePreset)
export type ThemePreset = ThemeFile;

const STORAGE_KEY = 'evolusion.user_themes.v1';

export function loadUserThemes(): ThemePreset[] {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // MIGRATION: Ensure 'layout' exists on all user themes
      return parsed.map((file: any) => {
        if (file && file.theme && !file.theme.layout) {
          // If layout missing, copy from default theme
          file.theme.layout = { ...defaultTheme.theme.layout };
          console.warn(`Migrated legacy theme '${file.theme.name}' (added default layout)`);
        }
        return file as ThemePreset;
      });
    }
    return [];
  } catch (e) {
    console.error('Failed to load user themes', e);
    return [];
  }
}

export function saveUserThemes(themes: ThemePreset[]): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch (e) {
    console.error('Failed to save user themes', e);
  }
}

export function upsertUserTheme(preset: ThemePreset): ThemePreset[] {
  const themes = loadUserThemes();
  const index = themes.findIndex(t => t.theme.id === preset.theme.id);

  if (index >= 0) {
    themes[index] = preset;
  } else {
    themes.push(preset);
  }

  saveUserThemes(themes);
  return themes;
}

export function deleteUserTheme(themeId: string): ThemePreset[] {
  let themes = loadUserThemes();
  themes = themes.filter(t => t.theme.id !== themeId);
  saveUserThemes(themes);
  return themes;
}
