import type { ThemeDefinition, ThemeExport } from '$lib/types';
import packageJson from '../../../../package.json';

export function exportThemes(themes: ThemeDefinition[]): string {
  const exportData: ThemeExport = {
    meta: {
      exportedAt: new Date().toISOString(),
      version: packageJson.version
    },
    themes: themes
  };
  return JSON.stringify(exportData, null, 2);
}

export function validateImport(json: string): ThemeDefinition[] {
  try {
    const data = JSON.parse(json) as ThemeExport;
    if (!data.meta || !Array.isArray(data.themes)) {
      throw new Error('Invalid theme file format');
    }
    // Basic validation of required fields could go here
    return data.themes;
  } catch (e) {
    console.error('Theme import failed', e);
    throw new Error('Failed to parse theme file');
  }
}
