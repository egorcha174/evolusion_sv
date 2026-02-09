
import type { ColorScheme, Theme, ThemeLayout } from './types';
import { ThemeFileSchema, ColorSchemeSchema, ThemeLayoutSchema } from './schemas';

export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// ... existing helpers ...

// Helper to convert HEX to RGBA or use color-mix for vars
export function hexToRgba(value: string, alpha: number): string {
  if (!value) return value;
  let c = value.trim();

  // If already rgba, just return it (simplistic check)
  if (c.startsWith('rgb')) return c;

  // Handle CSS variables using color-mix (modern browser support required)
  if (c.startsWith('var(')) {
    // color-mix(in srgb, var(--color), 0% alpha) doesn't work directly like rgba.
    // Instead we use: color-mix(in srgb, var(--color), transparent (1-alpha)%)
    // But color-mix syntax is: color-mix(in srgb, color percentage, color percentage)
    // Actually standard way to opacity a variable without calc is complex.
    // The most robust way with modern CSS is `color-mix(in srgb, var(--color) <alpha>%, transparent)`
    // where alpha is 0-100%.
    const percentage = Math.round(alpha * 100);
    return `color-mix(in srgb, ${c} ${percentage}%, transparent)`;
  }

  if (c.startsWith('#')) {
    c = c.substring(1);
  }

  // Handle 3-char hex (e.g. #ABC)
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }

  // Invalid hex length? Return original
  if (c.length !== 6) return value;

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  // Sanity check for valid parsing
  if (isNaN(r) || isNaN(g) || isNaN(b)) return value;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

// Derived keys not in schema but used in CSS
const DERIVED_CSS_VARS = [
  '--dashboard-background',
  '--icon-border-radius'
];

export function generateCSSVariables(scheme: ColorScheme, layout?: ThemeLayout, foundation?: Record<string, string>): Record<string, string> {
  const vars: Record<string, string> = {};

  // 1. Foundation Tokens (Raw values)
  if (foundation) {
    for (const [key, value] of Object.entries(foundation)) {
      vars[`--${key}`] = String(value);
    }
  }

  // 2. Iterate over Scheme parameters
  for (const [key, value] of Object.entries(scheme)) {
    if (value !== undefined && value !== null) {
      const varName = `--${camelToKebab(key)}`;

      // Special handling for Card Backgrounds to support Opacity without affecting text
      if (key === 'cardBackground' || key === 'cardBackgroundOn') {
        const opacity = scheme.cardOpacity ?? 1;
        // Only convert if it's a color string
        if (typeof value === 'string') {
          vars[varName] = hexToRgba(value, opacity);
          continue; // Skip default processing
        }
      }

      // Special handling for Sidebar Background Opacity
      if (key === 'bgSidebar') {
        const opacity = scheme.sidebarOpacity ?? 1;
        if (typeof value === 'string') {
          vars[varName] = hexToRgba(value, opacity);
          continue;
        }
      }

      // Special handling for Header Background Opacity
      if (key === 'bgHeader') {
        const opacity = scheme.headerOpacity ?? 1;
        if (typeof value === 'string') {
          vars[varName] = hexToRgba(value, opacity);
          continue;
        }
      }

      vars[varName] = String(value);

    } else {
      // Do nothing for undefined/null
    }
  }

  // 3. Iterate over Layout parameters
  if (layout) {
    for (const [key, value] of Object.entries(layout)) {
      if (value !== undefined && value !== null) {
        const varName = `--${camelToKebab(key)}`;

        // Logic for Icon Shape
        if (key === 'iconBackgroundShape') {
          const shape = value as string;
          let radius = '50%';
          if (shape === 'rounded-square') radius = '8px';
          if (shape === 'square') radius = '0px';
          vars['--icon-border-radius'] = radius;
        }

        // Check if we need to append 'px'
        if (typeof value === 'number' && PIXEL_PROPERTIES.has(key)) {
          vars[varName] = `${value}px`;
        } else {
          vars[varName] = String(value);
        }
      }
    }
  }

  // Derived variables for backward compatibility or ease of use
  if (scheme.dashboardBackgroundType === 'color') {
    vars['--dashboard-background'] = scheme.dashboardBackgroundColor1;
  } else if (scheme.dashboardBackgroundType === 'gradient') {
    const angle = scheme.dashboardGradientAngle ?? 135;
    vars['--dashboard-background'] = `linear-gradient(${angle}deg, ${scheme.dashboardBackgroundColor1}, ${scheme.dashboardBackgroundColor2 || scheme.dashboardBackgroundColor1})`;
  } else if (scheme.dashboardBackgroundType === 'image') {
    // Basic image implementation
    const url = scheme.dashboardBackgroundImageUrl ? `url('${scheme.dashboardBackgroundImageUrl}')` : 'none';
    vars['--dashboard-background'] = url;
  }

  return vars;
}

export function applyThemeCSS(scheme: ColorScheme, layout?: ThemeLayout, foundation?: Record<string, string>) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // CLEANUP: Remove old theme variables to prevent state leak
  // We use the Schema keys to know what *could* have been set.

  // 1. Cleanup Scheme Keys
  const schemeKeys = Object.keys(ColorSchemeSchema.shape);
  for (const key of schemeKeys) {
    root.style.removeProperty(`--${camelToKebab(key)}`);
  }

  // 2. Cleanup Layout Keys
  const layoutKeys = Object.keys(ThemeLayoutSchema.shape);
  for (const key of layoutKeys) {
    root.style.removeProperty(`--${camelToKebab(key)}`);
  }

  // 3. Cleanup Derived Vars
  for (const v of DERIVED_CSS_VARS) {
    root.style.removeProperty(v);
  }

  // NOTE: Foundation keys are dynamic, so we cannot easily clean them up 
  // without tracking state or scanning all styles. 
  // Assuming foundation keys are additive or consistent for now.

  const vars = generateCSSVariables(scheme, layout, foundation);

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
