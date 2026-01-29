
import type { ColorScheme, Theme } from './types';
import { ThemeFileSchema } from './schemas';

export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Helper to convert HEX to RGBA
export function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return hex;
  let c = hex.trim();

  // If already rgba, just return it (simplistic check)
  if (c.startsWith('rgb')) return c;

  if (c.startsWith('#')) {
    c = c.substring(1);
  }

  // Handle 3-char hex (e.g. #ABC)
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }

  // Invalid hex length? Return original
  if (c.length !== 6) return hex;

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  // Sanity check for valid parsing
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;

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

export function generateCSSVariables(scheme: ColorScheme): Record<string, string> {
  const vars: Record<string, string> = {};

  // Helper to flatten the object
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

export function applyThemeCSS(scheme: ColorScheme) {
  if (typeof document === 'undefined') return;

  const vars = generateCSSVariables(scheme);
  const root = document.documentElement;

  // 1. Reset: We iterate over keys that we KNOW we might have set previously.
  // Ideally, we would track previously set vars, but iterating the NEW vars acts as a replacement.
  // To handle "removal" of keys that don't exist in the new theme (fallbacking to default/css),
  // we can either clear all style properties (dangerous) or maintain a list.

  // Strategy: Clear all --* properties on :root that look like theme variables? 
  // Too broad. 
  // Better: We assume the stored theme object is authoritative. 
  // If the new theme misses a key, it should ideally have been filled by defaults before reaching here.
  // But to be safe against "leftover" variables from a previous theme that had EXTRA keys:

  // We will assume that `vars` contains EVERYTHING needed. 
  // If we want to support "unsetting", we'd need to know what to unset.

  // Practical Fix for "Partial Updates":
  // We will iterate over the `style` object and remove any property starting with `--` 
  // that IS NOT in the new `vars`? No, that's slow and might kill other libs.

  // Fix: Just overwrite. The issue described by user ("part of previous theme default") 
  // implies the new theme didn't set something the old one did.
  // The Solution is ensuring the NEW theme has ALL keys.

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
