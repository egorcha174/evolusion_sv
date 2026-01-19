import type { ThemePalette } from '$lib/types';

export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function generateThemeCss(palette: ThemePalette): string {
  const lines: string[] = [];

  Object.entries(palette).forEach(([key, value]) => {
    // bgPage -> --bg-page, textPrimary -> --text-primary
    const varName = `--${camelToKebab(key)}`;
    lines.push(`  ${varName}: ${value};`);
  });

  return `:root {\n${lines.join('\n')}\n}`;
}
