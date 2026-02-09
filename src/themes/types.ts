

export interface ThemeManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  generatedAt: string;
  tags?: string[];
  preview?: string;
}

export interface ThemeLayout {
  // Card
  cardBorderRadius: number;
  cardBorderWidth: number;

  // Icon
  iconBackgroundShape: 'circle' | 'rounded-square' | 'square';

  // Weather (Layout/Size)
  weatherIconSize?: number;
  weatherForecastIconSize?: number;
  weatherCurrentTempFontSize?: number;
  weatherCurrentDescFontSize?: number;
  weatherForecastDayFontSize?: number;
  weatherForecastMaxTempFontSize?: number;
  weatherForecastMinTempFontSize?: number;
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

  // Global UI
  bgSidebar: string;
  sidebarOpacity?: number;

  bgChip: string;
  bgCardHover: string;
  bgDropdown?: string;
  bgInput?: string;

  bgHeader?: string;
  headerOpacity?: number;

  // Borders & Inputs
  borderInput: string;
  borderFocus: string;
  borderDivider: string;
  borderPrimary?: string;

  // Text Global
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;

  // Scrollbars
  scrollbarThumb: string;
  scrollbarTrack: string;

  // Grid Editor
  gridCellBg?: string;
  gridCellBorder?: string;

  // Card
  cardOpacity: number;
  // REMOVED: cardBorderRadius, cardBorderWidth (moved to layout)
  cardBorderColor: string;
  cardBorderColorOn: string;
  cardBackground: string;
  cardBackgroundOn: string;
  shadowCard?: string;

  // Panel
  panelOpacity: number;
  bgPanel?: string;

  // Tabs
  tabTextColor: string;
  activeTabTextColor: string;
  tabIndicatorColor: string;

  // Icon
  // REMOVED: iconBackgroundShape (moved to layout)
  iconBackgroundColorOn: string;
  iconBackgroundColorOff: string;
  iconColorOn?: string;

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

  // REMOVED: Weather sizes (moved to layout)
}

export interface ThemeScheme {
  light: ColorScheme;
  dark: ColorScheme;
}

export interface Theme {
  id: string;
  name: string;
  isCustom: boolean;
  foundation?: Record<string, string>; // NEW: Raw values
  layout: ThemeLayout;
  scheme: ThemeScheme;
}

export interface ThemeFile {
  schemaVersion: number;
  manifest: ThemeManifest;
  theme: Theme;
}

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientConfig {
  angle: number;
  stops: GradientStop[];
}

export interface ImageConfig {
  url: string;
  size?: string;
  position?: string;
  repeat?: string;
  opacity?: number;
  blur?: number;
}

export interface AnimationConfig {
  effect: string;
  config?: Record<string, any>;
}
