
export type HarmonyRule =
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'splitComplementary'
  | 'monochromatic';

export type RadiusPreset = 'soft' | 'standard' | 'sharp';

export type ColorRole = 'accent' | 'background';

export interface BaseThemeSettings {
  themeId: string;      // required
  themeName: string;    // required
  primary: string;      // HEX #RRGGBB required
  colorRole: ColorRole; // New: determines if primary is Accent or BG
  harmony: HarmonyRule; // required
  radius: RadiusPreset; // required
  cardOpacity: number;  // 0.20..0.70 step 0.05
  panelOpacity: number; // 0.10..0.80 step 0.05
}
