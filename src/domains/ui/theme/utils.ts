import type { ThemePalette } from '$lib/types';

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

export function generateCssVariables(palette: ThemePalette): string {
  const vars = Object.entries(palette)
    .map(([key, value]) => {
      const varName = `--${camelToKebab(key)}`;
      return `  ${varName}: ${value};`;
    })
    .join('\n');

  return `:root {\n${vars}\n}`;
}
