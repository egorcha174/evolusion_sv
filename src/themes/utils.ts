
import type { Theme, SchemeSettings, ColorScheme, ThemeMode, ThemeSchedule } from './types';

export function validateTheme(data: any): data is Theme {
  return (
    typeof data === 'object' &&
    data !== null &&
    'manifest' in data &&
    'light' in data &&
    'dark' in data
  );
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

export function generateCSSVariables(scheme: SchemeSettings): string {
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(scheme)) {
    // Skip complex objects, we handle them via specific components
    if (typeof value === 'object') continue;
    
    // Convert generic props to CSS vars
    const cssVar = `--${camelToKebab(key)}`;
    
    // Handle numeric values that imply pixels
    let cssValue = String(value);
    if (typeof value === 'number' && (key.includes('Width') || key.includes('Radius') || key.includes('Size'))) {
       cssValue = `${value}px`;
    }
    
    lines.push(`  ${cssVar}: ${cssValue};`);
  }

  return `:root {\n${lines.join('\n')}\n}`;
}

export function generateBackgroundCSS(scheme: SchemeSettings): string {
  // We handle background rendering via BackgroundRenderer.svelte, 
  // but we can set a fallback background color for the body
  if (scheme.dashboardBackgroundType === 'color' && scheme.dashboardBackgroundColor) {
    return `body { background-color: ${scheme.dashboardBackgroundColor}; }`;
  }
  return '';
}

export function determineScheme(
  mode: ThemeMode,
  schedule?: ThemeSchedule,
  _currentTime?: Date // kept for interface signature, derived usually handles time
): ColorScheme {
  if (mode === 'day') return 'light';
  if (mode === 'night') return 'dark';
  
  if (mode === 'schedule' && schedule?.mode === 'time' && schedule.dayStart && schedule.nightStart) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [dH, dM] = schedule.dayStart.split(':').map(Number);
    const dayMinutes = dH * 60 + dM;
    
    const [nH, nM] = schedule.nightStart.split(':').map(Number);
    const nightMinutes = nH * 60 + nM;
    
    if (dayMinutes < nightMinutes) {
      return (currentMinutes >= dayMinutes && currentMinutes < nightMinutes) ? 'light' : 'dark';
    } else {
      // Night schedule spans midnight
      return (currentMinutes >= dayMinutes || currentMinutes < nightMinutes) ? 'light' : 'dark';
    }
  }

  // mode === 'auto' or fallback
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return 'light';
}

export function exportTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}

export async function importTheme(json: string): Promise<Theme> {
  const data = JSON.parse(json);
  if (!validateTheme(data)) {
    throw new Error('Invalid theme format');
  }
  return data;
}
