
import type { BaseThemeSettings } from './types';
import type { ThemeFile, ColorScheme } from '../../../themes/types';
import { toRgba, adjustHsl } from './colorUtils';

function getRadius(preset: BaseThemeSettings['radius']): number {
  switch (preset) {
    case 'soft': return 24;
    case 'sharp': return 4;
    case 'standard': default: return 12;
  }
}

function getSecondaryColor(primary: string, rule: BaseThemeSettings['harmony']): string {
  switch (rule) {
    case 'complementary': return adjustHsl(primary, 180, null, null);
    case 'splitComplementary': return adjustHsl(primary, 150, null, null);
    case 'triadic': return adjustHsl(primary, 120, null, null);
    case 'analogous': return adjustHsl(primary, 30, null, null);
    case 'monochromatic': return adjustHsl(primary, 0, null, 80); // Lighter version
    default: return primary;
  }
}

// Fixed semantic colors as per fusion.json
const ACCENTS_LIGHT = {
  error: '#EF4444',
  success: '#34C759',
  warning: '#F59E0B'
};

const ACCENTS_DARK = {
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A'
};

export function generateThemePreset(s: BaseThemeSettings): ThemeFile {
  const secondary = getSecondaryColor(s.primary, s.harmony);
  const radius = getRadius(s.radius);
  
  // Calculate palette variants
  // Dark Scheme: Dark BG, Light Text
  const darkBg1 = adjustHsl(s.primary, 0, 30, 10); // Very dark version of primary
  const darkBg2 = adjustHsl(secondary, 0, 30, 15); // Very dark version of secondary
  const darkCardBg = adjustHsl(s.primary, 0, 20, 15); 
  const darkCardBgOn = adjustHsl(s.primary, 0, 25, 20);
  
  // Light Scheme: Light BG, Dark Text
  const lightBg1 = adjustHsl(s.primary, 0, 20, 95); // Very light version
  const lightBg2 = adjustHsl(secondary, 0, 20, 90);
  const lightCardBg = '#FFFFFF';
  const lightCardBgOn = adjustHsl(s.primary, 0, 10, 98);

  const darkScheme: ColorScheme = {
    dashboardBackgroundType: 'gradient',
    dashboardBackgroundColor1: darkBg1,
    dashboardBackgroundColor2: darkBg2,
    dashboardGradientAngle: 135,
    
    cardOpacity: s.cardOpacity,
    cardBorderRadius: radius,
    cardBorderWidth: 1,
    cardBorderColor: toRgba('#FFFFFF', 0.1),
    cardBorderColorOn: toRgba('#FFFFFF', 0.5),
    cardBackground: toRgba(darkCardBg, 0.4), 
    cardBackgroundOn: toRgba(darkCardBgOn, 0.6),
    shadowCard: '0 8px 32px rgba(0, 0, 0, 0.2)',
    
    panelOpacity: s.panelOpacity,
    bgPanel: toRgba('#000000', 0.3),
    bgInput: toRgba('#FFFFFF', 0.1),
    
    // UI Global - Separated Opacity for Controls
    bgHeader: '#000000',
    headerOpacity: 0.2,
    
    bgSidebar: darkBg1,
    sidebarOpacity: 1,

    bgChip: toRgba('#FFFFFF', 0.1),
    bgCardHover: toRgba('#FFFFFF', 0.05),
    borderInput: toRgba('#FFFFFF', 0.1),
    borderFocus: s.primary,
    borderDivider: toRgba('#FFFFFF', 0.1),
    scrollbarThumb: toRgba('#FFFFFF', 0.2),
    scrollbarTrack: 'transparent',

    tabTextColor: toRgba('#FFFFFF', 0.6),
    activeTabTextColor: '#FFFFFF',
    tabIndicatorColor: '#FFFFFF',
    
    iconBackgroundShape: 'circle',
    iconBackgroundColorOn: '#FFFFFF',
    iconBackgroundColorOff: toRgba('#000000', 0.2),
    iconColorOn: s.primary, // Contrast fix
    
    nameTextColor: '#FFFFFF',
    statusTextColor: toRgba('#FFFFFF', 0.7),
    valueTextColor: '#FFFFFF',
    unitTextColor: toRgba('#FFFFFF', 0.7),
    
    nameTextColorOn: '#FFFFFF',
    statusTextColorOn: '#FFFFFF',
    valueTextColorOn: '#FFFFFF',
    unitTextColorOn: '#FFFFFF',
    
    clockTextColor: '#FFFFFF',
    weatherPrimaryColor: '#FFFFFF',
    weatherSecondaryColor: toRgba('#FFFFFF', 0.7),
    
    thermostatHandleColor: '#FFFFFF',
    thermostatDialTextColor: '#FFFFFF',
    thermostatDialLabelColor: toRgba('#FFFFFF', 0.7),
    thermostatHeatingColor: '#FFFFFF',
    thermostatCoolingColor: '#FFFFFF',
    
    accentPrimary: '#FFFFFF',
    accentError: ACCENTS_DARK.error,
    accentSuccess: ACCENTS_DARK.success,
    accentWarning: ACCENTS_DARK.warning,
    accentInfo: '#FFFFFF',
    widgetSwitchOn: ACCENTS_DARK.success
  };

  const lightScheme: ColorScheme = {
    dashboardBackgroundType: 'gradient',
    dashboardBackgroundColor1: lightBg1,
    dashboardBackgroundColor2: lightBg2,
    dashboardGradientAngle: 135,
    
    cardOpacity: s.cardOpacity,
    cardBorderRadius: radius,
    cardBorderWidth: 0,
    cardBorderColor: 'transparent',
    cardBorderColorOn: s.primary,
    cardBackground: '#FFFFFF', // Clean white for light mode
    cardBackgroundOn: '#FFFFFF',
    shadowCard: `0 4px 16px ${toRgba(s.primary, 0.15)}`,
    
    panelOpacity: s.panelOpacity,
    bgPanel: toRgba('#FFFFFF', 0.6),
    bgInput: toRgba('#FFFFFF', 0.5),
    
    // UI Global
    bgHeader: '#FFFFFF',
    headerOpacity: 0.6,
    
    bgSidebar: lightBg1,
    sidebarOpacity: 1,
    
    bgChip: toRgba(s.primary, 0.1),
    bgCardHover: toRgba('#000000', 0.03),
    borderInput: toRgba('#000000', 0.1),
    borderFocus: s.primary,
    borderDivider: toRgba('#000000', 0.06),
    scrollbarThumb: toRgba('#000000', 0.2),
    scrollbarTrack: 'transparent',

    tabTextColor: '#6B7280',
    activeTabTextColor: s.primary,
    tabIndicatorColor: s.primary,
    
    iconBackgroundShape: 'circle',
    iconBackgroundColorOn: s.primary,
    iconBackgroundColorOff: toRgba('#FFFFFF', 0.5),
    iconColorOn: '#FFFFFF',
    
    nameTextColor: '#374151',
    statusTextColor: '#6B7280',
    valueTextColor: s.primary,
    unitTextColor: '#6B7280',
    
    nameTextColorOn: s.primary,
    statusTextColorOn: s.primary,
    valueTextColorOn: s.primary,
    unitTextColorOn: s.primary,
    
    clockTextColor: s.primary,
    weatherPrimaryColor: s.primary,
    weatherSecondaryColor: '#6B7280',
    
    thermostatHandleColor: '#FFFFFF',
    thermostatDialTextColor: s.primary,
    thermostatDialLabelColor: '#6B7280',
    thermostatHeatingColor: s.primary,
    thermostatCoolingColor: secondary,
    
    accentPrimary: s.primary,
    accentError: ACCENTS_LIGHT.error,
    accentSuccess: ACCENTS_LIGHT.success,
    accentWarning: ACCENTS_LIGHT.warning,
    accentInfo: secondary,
    widgetSwitchOn: ACCENTS_LIGHT.success
  };

  return {
    schemaVersion: 1,
    manifest: {
      name: s.themeName,
      version: '1.0.0',
      author: 'AutoGenerator',
      description: `Generated ${s.harmony} theme based on ${s.primary}`,
      generatedAt: new Date().toISOString()
    },
    theme: {
      id: s.themeId,
      name: s.themeName,
      isCustom: true,
      scheme: {
        light: lightScheme,
        dark: darkScheme
      }
    }
  };
}
