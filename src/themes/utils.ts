
import type { ColorScheme, Theme } from './types';
import { ThemeFileSchema } from './schemas';

export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Helper to convert HEX to RGBA
export function hexToRgba(hex: string, alpha: number): string {
  let c = hex.trim();
  // If already rgba, just return it (simplistic check)
  if (c.startsWith('rgb')) return c;
  
  if (c.startsWith('#')) {
    c = c.substring(1);
  }
  
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }
  
  if (c.length !== 6) return hex; // Invalid hex fallback

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

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
