
export type ThemeMode = 'auto' | 'schedule' | 'day' | 'night';
export type ColorScheme = 'light' | 'dark';
export type BackgroundType = 'color' | 'gradient' | 'image' | 'animation';

export interface GradientConfig {
  angle: number;
  stops: Array<{
    color: string;
    position: number;
  }>;
}

export interface ImageConfig {
  url: string;
  size: 'cover' | 'contain' | 'auto' | string;
  position: string;
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  opacity?: number;
  blur?: number;
}

export interface AnimationConfig {
  type: 'particles' | 'waves' | 'gradient-shift' | 'custom';
  config: Record<string, any>;
}

export interface SchemeSettings {
  // === BACKGROUND ===
  dashboardBackgroundType: BackgroundType;
  dashboardBackgroundColor?: string;
  dashboardGradient?: GradientConfig;
  dashboardBackgroundImage?: ImageConfig;
  dashboardBackgroundAnimation?: AnimationConfig;
  
  // === CARDS ===
  cardOpacity: number;
  cardBorderRadius: number;
  cardBorderWidth: number;
  cardBorderColor: string;
  cardBorderColorOn: string;
  cardBackground: string;
  cardBackgroundOn: string;
  
  // === PANELS ===
  panelOpacity: number;
  
  // === TABS ===
  tabTextColor: string;
  activeTabTextColor: string;
  tabIndicatorColor: string;
  
  // === THERMOSTAT ===
  thermostatHandleColor: string;
  thermostatDialTextColor: string;
  thermostatDialLabelColor: string;
  thermostatHeatingColor: string;
  thermostatCoolingColor: string;
  
  // === CLOCK ===
  clockTextColor: string;
  
  // === TEXT ===
  nameTextColor: string;
  statusTextColor: string;
  valueTextColor: string;
  unitTextColor: string;
  
  // === TEXT ACTIVE ===
  nameTextColorOn: string;
  statusTextColorOn: string;
  valueTextColorOn: string;
  unitTextColorOn: string;

  // === UI ACCENTS (Additional standard vars) ===
  accentPrimary?: string;
  accentError?: string;
  accentSuccess?: string;
  bgInput?: string;
  textPrimary?: string;
}

export interface ThemeManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  preview?: string;
  isCustom: boolean;
  generatedAt?: string;
}

export interface Theme {
  schemaVersion: number;
  manifest: ThemeManifest;
  light: SchemeSettings;
  dark: SchemeSettings;
}

export interface ThemeSchedule {
  mode: 'time' | 'sunriseSunset';
  dayStart?: string;
  nightStart?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ThemeState {
  currentThemeId: string;
  currentScheme: ColorScheme;
  mode: ThemeMode;
  schedule?: ThemeSchedule;
  availableThemes: ThemeManifest[];
  loadedTheme: Theme | null;
}
