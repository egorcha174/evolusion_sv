
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
  // === BACKGROUND (Renderer) ===
  dashboardBackgroundType: BackgroundType;
  dashboardBackgroundColor?: string;
  dashboardGradient?: GradientConfig;
  dashboardBackgroundImage?: ImageConfig;
  dashboardBackgroundAnimation?: AnimationConfig;
  
  // === CSS VARS (Component Mappings) ===
  // These keys map to --kebab-case CSS vars (e.g. bgCard -> --bg-card)
  
  // Backgrounds
  bgPage: string;       // Fallback background
  bgCard: string;       // Card background
  bgCardHover: string;
  bgSidebar: string;
  bgHeader: string;
  bgInput: string;
  bgChip: string;
  bgChipActive: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textName: string;
  textStatus: string;
  textOnAccent: string;

  // Borders
  borderCard: string;
  borderPrimary: string;
  borderInput: string;
  borderFocus: string;
  borderDivider: string;
  
  // States & Accents
  stateOn: string;
  accentPrimary: string;
  accentError: string;
  accentSuccess: string;
  accentWarning: string;
  accentInfo: string;

  // Shadows
  shadowCard: string;

  // === WIDGET SPECIFIC ===
  widgetSwitchOn: string;
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
