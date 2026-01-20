
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

export function generateCSSVariables(scheme: SchemeSettings): Record<string, string> {
  return {
    // === CARDS ===
    '--card-opacity': String(scheme.cardOpacity),
    '--card-border-radius': `${scheme.cardBorderRadius}px`,
    '--card-border-width': `${scheme.cardBorderWidth}px`,
    '--card-border-color': scheme.cardBorderColor,
    '--card-border-color-on': scheme.cardBorderColorOn,
    '--card-background': scheme.cardBackground,
    '--card-background-on': scheme.cardBackgroundOn,
    '--shadow-card': scheme.shadowCard,
    
    // === PANELS ===
    '--panel-opacity': String(scheme.panelOpacity),
    '--bg-panel': scheme.bgPanel,
    
    // === PAGE & UI ===
    '--bg-page': scheme.bgPage,
    '--bg-input': scheme.bgInput,
    '--bg-header': scheme.bgHeader,
    
    // === TEXT ===
    '--text-primary': scheme.textPrimary,
    '--text-secondary': scheme.textSecondary,
    '--text-muted': scheme.textMuted,
    
    // === WIDGET TEXT (Normal) ===
    '--name-text-color': scheme.nameTextColor,
    '--status-text-color': scheme.statusTextColor,
    '--value-text-color': scheme.valueTextColor,
    '--unit-text-color': scheme.unitTextColor,
    
    // === WIDGET TEXT (Active) ===
    '--name-text-color-on': scheme.nameTextColorOn,
    '--status-text-color-on': scheme.statusTextColorOn,
    '--value-text-color-on': scheme.valueTextColorOn,
    '--unit-text-color-on': scheme.unitTextColorOn,
    
    // === ACCENTS ===
    '--accent-primary': scheme.accentPrimary,
    '--accent-error': scheme.accentError,
    '--accent-success': scheme.accentSuccess,
    '--accent-warning': scheme.accentWarning,
    '--accent-info': scheme.accentInfo,
    '--widget-switch-on': scheme.widgetSwitchOn
  };
}

export function generateBackgroundCSS(scheme: SchemeSettings): string {
  if (scheme.dashboardBackgroundType === 'color' && scheme.dashboardBackgroundColor) {
    return `body { background-color: ${scheme.dashboardBackgroundColor}; }`;
  }
  return '';
}

export function determineScheme(
  mode: ThemeMode,
  schedule?: ThemeSchedule,
  _currentTime?: Date
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
      return (currentMinutes >= dayMinutes || currentMinutes < nightMinutes) ? 'light' : 'dark';
    }
  }

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
