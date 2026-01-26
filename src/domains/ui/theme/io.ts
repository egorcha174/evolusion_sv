import type { ThemeFile } from '../../../themes/types';
import { ThemeFileSchema } from '../../../themes/schemas';

/**
 * Exports a single theme to a JSON file.
 */
export async function exportTheme(themeFile: ThemeFile): Promise<void> {
  // Lazy load file-saver
  const { saveAs } = await import('file-saver');

  const blob = new Blob([JSON.stringify(themeFile, null, 2)], {
    type: 'application/json;charset=utf-8',
  });

  // Sanitize filename
  const safeName = themeFile.manifest.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  saveAs(blob, `evolusion-theme-${safeName}.json`);
}

/**
 * Imports and validates a theme from a file.
 */
export async function importTheme(file: File): Promise<ThemeFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result?.toString();
        if (!text) throw new Error('File is empty');

        const json = JSON.parse(text);

        // Strict Validation via Zod
        const result = ThemeFileSchema.safeParse(json);

        if (!result.success) {
          console.error('Theme validation failed', result.error);
          throw new Error('Invalid theme format. Check console for details.');
        }

        // Ensure ID is unique/new for imports to avoid collision if user imports same theme
        // Actually, we should probably keep the ID if it's an update, but usually imports are "new" copies.
        // Let's generate a new ID to be safe, unless it's a direct backup restore intent.
        // For sharing, new ID is safer.
        const importedTheme = result.data;

        // Mark as custom regardless of source
        importedTheme.theme.isCustom = true;

        // Regenerate ID to prevent overwriting built-ins or existing customs accidentally
        // User can delete the old one if they want to replace.
        importedTheme.theme.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        resolve(importedTheme);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
