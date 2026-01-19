
// Re-export HA contracts
export * from '../domains/ha/contracts/messages';

export interface ServerConfig {
	url: string;
	token: string;
	name?: string;
}

export interface AppState {
	activeServer: ServerConfig | null;
}

export interface LayoutConfig {
	cardOrder: string[];
	timestamp: number;
}

export interface HAEntity {
	entity_id: string;
	state: string;
	attributes: Record<string, any>;
	last_changed?: string;
	last_updated?: string;
	context?: {
		id: string;
		user_id: string | null;
		parent_id: string | null;
	};
}

export interface HAStoreState {
	isConnected: boolean;
	isLoading: boolean;
	error: string | null;
	entities: Map<string, HAEntity>;
	latency?: number; // Connection latency in ms
}

// --- Theming System ---

export type ThemeMode = 'auto' | 'schedule' | 'day' | 'night';
export type ColorScheme = 'light' | 'dark';

export interface ThemeSchedule {
  darkStart: string; // HH:mm
  darkEnd: string;   // HH:mm
}

export interface ThemePalette {
  // Backgrounds
  bgPage: string;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgCardHover: string;
  bgHeader: string;
  bgSidebar: string;
  bgSidebarActiveItem: string;
  bgInput: string;
  bgChip: string;
  bgChipActive: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textName: string;
  textStatus: string;
  textOnPrimary: string;
  textOnAccent: string;
  textOnDanger: string;

  // Borders
  borderPrimary: string;
  borderSecondary: string;
  borderCard: string;
  borderInput: string;
  borderFocus: string;
  borderDivider: string;

  // Device States
  stateOn: string;
  stateOff: string;
  stateUnavailable: string;
  stateUnknown: string;

  // Accents / Status
  accentPrimary: string;
  accentSecondary: string;
  accentSuccess: string;
  accentWarning: string;
  accentError: string;
  accentInfo: string;

  // Navigation / Tabs
  tabActive: string;
  tabInactive: string;
  tabHover: string;
  tabBorderActive: string;

  // Widgets
  widgetThermostatCold: string;
  widgetThermostatWarm: string;
  widgetThermostatHot: string;
  widgetSliderTrack: string;
  widgetSliderThumb: string;
  widgetSliderFill: string;
  widgetSwitchOn: string;
  widgetSwitchOff: string;

  // Charts
  chartPrimary: string;
  chartSecondary: string;
  chartTertiary: string;
  chartGrid: string;
  chartAxis: string;

  // Shadows
  shadowCard: string;
  shadowModal: string;
  shadowDropdown: string;

  // Overlays
  overlayBg: string;
  modalBg: string;

  // Scrollbar
  scrollbarThumb: string;
  scrollbarTrack: string;

  // Tooltips
  tooltipBg: string;
  tooltipText: string;
}

export interface ThemeDefinition {
	id: string;
	name: string;
	description?: string;
	author?: string;
  version?: string;
	isBuiltIn: boolean;
	light: ThemePalette;
	dark: ThemePalette;
}

export interface ThemeSettings {
	mode: ThemeMode;
	activeThemeId: string;
	schedule: ThemeSchedule;
  customThemes: ThemeDefinition[];
}

export interface ThemeExport {
  meta: {
    exportedAt: string;
    exportedBy?: string;
    version: string;
  };
  themes: ThemeDefinition[];
}
