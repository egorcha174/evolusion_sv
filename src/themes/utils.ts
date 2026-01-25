
import type { ColorScheme, Theme } from './types';
import { ThemeFileSchema } from './schemas';

export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// List of properties that require 'px' units in CSS
const PIXEL_PROPERTIES = new Set([
  'cardBorderRadius',
  'cardBorderWidth',
  'dashboardBackgroundImageBlur',
  'weatherIconSize',
  'weatherForecastIconSize',
  'weatherCurrentTempFontSize',
  'weatherCurrentDescFontSize',
  'weatherForecastDayFontSize',
  'weatherForecastMaxTempFontSize',
  'weatherForecastMinTempFontSize',
]);

export function generateCSSVariables(scheme: ColorScheme): Record<string, string> {
  const vars: Record<string, string> = {};

  // Helper to flatten the object
  for (const [key, value] of Object.entries(scheme)) {
    if (value !== undefined && value !== null) {
      const varName = `--${camelToKebab(key)}`;
      // Check if we need to append 'px'
      if (typeof value === 'number' && PIXEL_PROPERTIES.has(key)) {
        vars[varName] = `${value}px`;
      } else {
        vars[varName] = String(value);
      }
    }
  }

  // Derived variables for backward compatibility or ease of use
  if (scheme.dashboardBackgroundType === 'color') {
    vars['--dashboard-background'] = scheme.dashboardBackgroundColor1;
  } else if (scheme.dashboardBackgroundType === 'gradient') {
    vars['--dashboard-background'] = `linear-gradient(135deg, ${scheme.dashboardBackgroundColor1}, ${scheme.dashboardBackgroundColor2 || scheme.dashboardBackgroundColor1})`;
  } else if (scheme.dashboardBackgroundType === 'image') {
    // Basic image implementation
    const url = scheme.dashboardBackgroundImageUrl ? `url('${scheme.dashboardBackgroundImageUrl}')` : 'none';
    vars['--dashboard-background'] = url;
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
