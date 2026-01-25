
import type { ColorScheme, Theme } from './types';
import { ThemeFileSchema } from './schemas';

export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function generateCSSVariables(scheme: ColorScheme): Record<string, string> {
  const vars: Record<string, string> = {};

  // Helper to flatten the object
  for (const [key, value] of Object.entries(scheme)) {
    if (value !== undefined && value !== null) {
      vars[`--${camelToKebab(key)}`] = String(value);
    }
  }

  // Derived variables for backward compatibility or ease of use
  if (scheme.dashboardBackgroundType === 'color') {
    vars['--dashboard-background'] = scheme.dashboardBackgroundColor1;
  } else if (scheme.dashboardBackgroundType === 'gradient') {
    vars['--dashboard-background'] = `linear-gradient(135deg, ${scheme.dashboardBackgroundColor1}, ${scheme.dashboardBackgroundColor2 || scheme.dashboardBackgroundColor1})`;
  } else if (scheme.dashboardBackgroundType === 'image') {
    // Note: Image URL handling usually requires more logic (url())
    // We'll set a base color just in case
    vars['--dashboard-background'] = scheme.dashboardBackgroundColor1;
  }

  return vars;
}

export function applyThemeCSS(scheme: ColorScheme) {
  if (typeof document === 'undefined') return;
  
  const vars = generateCSSVariables(scheme);
  const root = document.documentElement;

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function validateThemeImport(json: any) {
  return ThemeFileSchema.parse(json);
}

export function getSystemColorMode(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}
