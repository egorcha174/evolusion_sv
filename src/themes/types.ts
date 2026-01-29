

export interface ThemeManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  generatedAt: string;
  tags?: string[];
  preview?: string;
}

export interface ColorScheme {
  // Dashboard
  dashboardBackgroundType: 'color' | 'gradient' | 'image';
  dashboardBackgroundColor1: string;
  dashboardBackgroundColor2?: string;
  dashboardGradientAngle?: number;
  dashboardBackgroundImageUrl?: string;
  dashboardBackgroundImageBlur?: number;
  dashboardBackgroundImageBrightness?: number;

  // Global UI (New)
  bgSidebar: string;
  sidebarOpacity?: number; // New

  bgChip: string;
  bgCardHover: string;
  bgDropdown?: string; // Optional, falls back to panel
  bgInput?: string;

  bgHeader?: string;
  headerOpacity?: number; // New

  // Borders & Inputs (New)
  borderInput: string;
  borderFocus: string;
  borderDivider: string;
  borderPrimary?: string;

  // Text Global (New)
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;

  // Scrollbars (New)
  scrollbarThumb: string;
  scrollbarTrack: string;

  // Grid Editor (New)
  gridCellBg?: string;
  gridCellBorder?: string;

  // Card
  cardOpacity: number;
  cardBorderRadius: number;
  cardBorderWidth: number;
  cardBorderColor: string;
  cardBorderColorOn: string;
  cardBackground: string;
  cardBackgroundOn: string;
  shadowCard?: string;

  // Panel
  panelOpacity: number;
  bgPanel?: string; // Often derived, but explicit is better. Not strictly new but ensuring typing.

  // Tabs
  tabTextColor: string;
  activeTabTextColor: string;
  tabIndicatorColor: string;

  // Icon
  iconBackgroundShape: 'circle' | 'rounded-square' | 'square';
  iconBackgroundColorOn: string;
  iconBackgroundColorOff: string;
  iconColorOn?: string; // New: To fix contrast issues (e.g. black icon on yellow bg)

  // Thermostat
  thermostatHandleColor: string;
  thermostatDialTextColor: string;
  thermostatDialLabelColor: string;
  thermostatHeatingColor: string;
  thermostatCoolingColor: string;

  // Clock
  clockTextColor: string;

  // Weather (Colors)
  weatherPrimaryColor: string;
  weatherSecondaryColor: string;

  // Widget Text
  nameTextColor: string;
  statusTextColor: string;
  valueTextColor: string;
  unitTextColor: string;
  nameTextColorOn: string;
  statusTextColorOn: string;
  valueTextColorOn: string;
  unitTextColorOn: string;

  // Accents
  accentPrimary?: string;
  accentSecondary?: string;
  accentError?: string;
  accentSuccess?: string;
  accentWarning?: string;
  accentInfo?: string;

  // Specific Widgets
  widgetSwitchOn?: string;

  // Weather (Layout/Size - Optional)
  weatherIconSize?: number;
  weatherForecastIconSize?: number;
  weatherCurrentTempFontSize?: number;
  weatherCurrentDescFontSize?: number;
  weatherForecastDayFontSize?: number;
  weatherForecastMaxTempFontSize?: number;
  weatherForecastMinTempFontSize?: number;
}

export interface ThemeScheme {
  light: ColorScheme;
  dark: ColorScheme;
}

export interface Theme {
  id: string;
  name: string;
  isCustom: boolean;
  scheme: ThemeScheme;
}

export interface ThemeFile {
  schemaVersion: number;
  manifest: ThemeManifest;
  theme: Theme;
}

export type ThemeMode = 'auto' | 'light' | 'dark';