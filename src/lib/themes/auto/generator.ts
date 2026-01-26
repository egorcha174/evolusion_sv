
import type { BaseThemeSettings } from './types';
import type { ThemeFile, ColorScheme } from '../../../themes/types';
import { toRgba, adjustHsl, getLuminance, getContrastText } from './colorUtils';

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

// Fixed semantic colors
const ACCENTS_LIGHT = { error: '#EF4444', success: '#34C759', warning: '#F59E0B' };
const ACCENTS_DARK = { error: '#FF453A', success: '#30D158', warning: '#FF9F0A' };

export function generateThemePreset(s: BaseThemeSettings): ThemeFile {
  const radius = getRadius(s.radius);
  
  // Logic Branch based on Color Role
  let accentColor: string;
  let darkBg: string;
  let lightBg: string;
  
  if (s.colorRole === 'background') {
    // 60% Rule: User input IS the background (for Dark Mode usually, as dashboards are dark-first)
    // If input is dark, use it as Dark BG. If light, use it as Light BG? 
    // To stay consistent with "One Theme, Two Modes", we will derive based on input luminance.
    
    if (getLuminance(s.primary) < 0.5) {
       // User picked a DARK color -> Set as Dark Mode BG
       darkBg = s.primary;
       lightBg = adjustHsl(s.primary, 0, 10, 95); // Derived light version
    } else {
       // User picked a LIGHT color -> Set as Light Mode BG
       lightBg = s.primary;
       darkBg = adjustHsl(s.primary, 0, 20, 10); // Derived dark version
    }
    
    // 10% Rule: Calculate Accent from Harmony relative to the Background
    accentColor = getSecondaryColor(s.primary, s.harmony);
    
  } else {
    // Role = 'accent' (Standard 10% Rule)
    // User input IS the Accent.
    accentColor = s.primary;
    
    // 60% Rule: Background is derived neutral/tinted
    const secondary = getSecondaryColor(s.primary, s.harmony);
    darkBg = adjustHsl(secondary, 0, 30, 10); // Very dark tint of secondary
    lightBg = adjustHsl(secondary, 0, 20, 95); // Very light tint
  }

  // Secondary/Tertiary for gradients
  const darkBg2 = adjustHsl(darkBg, 10, null, null);
  const lightBg2 = adjustHsl(lightBg, 10, null, null);

  // Cards
  const darkCardBg = adjustHsl(darkBg, 0, null, (getLuminance(darkBg) * 100) + 5); 
  const lightCardBg = '#FFFFFF';

  // Text Contrast Check
  const darkText = getContrastText(darkBg);
  const lightText = getContrastText(lightBg);

  const darkScheme: ColorScheme = {
    dashboardBackgroundType: 'gradient',
    dashboardBackgroundColor1: darkBg,
    dashboardBackgroundColor2: darkBg2,
    dashboardGradientAngle: 135,
    
    cardOpacity: s.cardOpacity,
    cardBorderRadius: radius,
    cardBorderWidth: 1,
    cardBorderColor: toRgba(darkText, 0.1),
    cardBorderColorOn: toRgba(accentColor, 0.5),
    cardBackground: toRgba(darkCardBg, 0.4), 
    cardBackgroundOn: toRgba(darkCardBg, 0.6),
    shadowCard: '0 8px 32px rgba(0, 0, 0, 0.2)',
    
    panelOpacity: s.panelOpacity,
    bgPanel: toRgba(darkBg, 0.9),
    bgInput: toRgba(darkText, 0.1),
    
    bgHeader: darkBg,
    headerOpacity: 0.8,
    bgSidebar: darkBg,
    sidebarOpacity: 1,

    bgChip: toRgba(darkText, 0.1),
    bgCardHover: toRgba(darkText, 0.05),
    borderInput: toRgba(darkText, 0.1),
    borderFocus: accentColor,
    borderDivider: toRgba(darkText, 0.1),
    scrollbarThumb: toRgba(darkText, 0.2),
    scrollbarTrack: 'transparent',

    tabTextColor: toRgba(darkText, 0.6),
    activeTabTextColor: accentColor,
    tabIndicatorColor: accentColor,
    
    iconBackgroundShape: 'circle',
    iconBackgroundColorOn: accentColor,
    iconBackgroundColorOff: toRgba(darkText, 0.1),
    iconColorOn: getContrastText(accentColor),
    
    nameTextColor: darkText,
    statusTextColor: toRgba(darkText, 0.7),
    valueTextColor: accentColor,
    unitTextColor: toRgba(darkText, 0.7),
    
    nameTextColorOn: darkText,
    statusTextColorOn: accentColor,
    valueTextColorOn: accentColor,
    unitTextColorOn: accentColor,
    
    clockTextColor: darkText,
    weatherPrimaryColor: darkText,
    weatherSecondaryColor: toRgba(darkText, 0.7),
    
    thermostatHandleColor: darkText,
    thermostatDialTextColor: darkText,
    thermostatDialLabelColor: toRgba(darkText, 0.7),
    thermostatHeatingColor: accentColor,
    thermostatCoolingColor: accentColor,
    
    accentPrimary: accentColor,
    accentError: ACCENTS_DARK.error,
    accentSuccess: ACCENTS_DARK.success,
    accentWarning: ACCENTS_DARK.warning,
    accentInfo: accentColor,
    widgetSwitchOn: ACCENTS_DARK.success
  };

  const lightScheme: ColorScheme = {
    dashboardBackgroundType: 'gradient',
    dashboardBackgroundColor1: lightBg,
    dashboardBackgroundColor2: lightBg2,
    dashboardGradientAngle: 135,
    
    cardOpacity: s.cardOpacity,
    cardBorderRadius: radius,
    cardBorderWidth: 0,
    cardBorderColor: 'transparent',
    cardBorderColorOn: accentColor,
    cardBackground: lightCardBg,
    cardBackgroundOn: lightCardBg,
    shadowCard: `0 4px 16px ${toRgba(accentColor, 0.15)}`,
    
    panelOpacity: s.panelOpacity,
    bgPanel: toRgba(lightBg, 0.9),
    bgInput: toRgba(lightText, 0.05),
    
    bgHeader: lightBg,
    headerOpacity: 0.8,
    bgSidebar: lightBg,
    sidebarOpacity: 1,
    
    bgChip: toRgba(accentColor, 0.1),
    bgCardHover: toRgba(lightText, 0.03),
    borderInput: toRgba(lightText, 0.1),
    borderFocus: accentColor,
    borderDivider: toRgba(lightText, 0.06),
    scrollbarThumb: toRgba(lightText, 0.2),
    scrollbarTrack: 'transparent',

    tabTextColor: toRgba(lightText, 0.6),
    activeTabTextColor: accentColor,
    tabIndicatorColor: accentColor,
    
    iconBackgroundShape: 'circle',
    iconBackgroundColorOn: accentColor,
    iconBackgroundColorOff: toRgba(lightText, 0.1),
    iconColorOn: getContrastText(accentColor),
    
    nameTextColor: lightText,
    statusTextColor: toRgba(lightText, 0.6),
    valueTextColor: accentColor,
    unitTextColor: toRgba(lightText, 0.6),
    
    nameTextColorOn: accentColor,
    statusTextColorOn: accentColor,
    valueTextColorOn: accentColor,
    unitTextColorOn: accentColor,
    
    clockTextColor: accentColor,
    weatherPrimaryColor: accentColor,
    weatherSecondaryColor: toRgba(lightText, 0.6),
    
    thermostatHandleColor: lightText,
    thermostatDialTextColor: accentColor,
    thermostatDialLabelColor: toRgba(lightText, 0.6),
    thermostatHeatingColor: accentColor,
    thermostatCoolingColor: accentColor,
    
    accentPrimary: accentColor,
    accentError: ACCENTS_LIGHT.error,
    accentSuccess: ACCENTS_LIGHT.success,
    accentWarning: ACCENTS_LIGHT.warning,
    accentInfo: accentColor,
    widgetSwitchOn: ACCENTS_LIGHT.success
  };

  return {
    schemaVersion: 1,
    manifest: {
      name: s.themeName,
      version: '1.0.0',
      author: 'AutoGenerator',
      description: `Generated (${s.colorRole}) ${s.harmony}`,
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
