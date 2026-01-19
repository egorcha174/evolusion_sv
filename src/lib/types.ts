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
}

// --- Theming System ---

export type ThemeMode = 'auto' | 'schedule' | 'day' | 'night';

export interface ThemePalette {
	// Backgrounds
	bgPage: string;
	bgCard: string;
	bgHeader: string;
	bgSidebar: string;
	bgInput: string;
	bgDropdown: string;
	
	// Text
	textPrimary: string;
	textSecondary: string;
	textInverted: string;
	
	// Brand / Status
	primary: string;
	success: string;
	warning: string;
	error: string;
	
	// Borders & Dividers
	border: string;
	divider: string;
	
	// Effects
	shadowCard: string;
}

export interface ThemeDefinition {
	id: string;
	name: string;
	isBuiltIn: boolean;
	description?: string;
	author?: string;
	light: ThemePalette;
	dark: ThemePalette;
}

export interface ThemeSettings {
	mode: ThemeMode;
	activeThemeId: string;
	schedule: {
		darkStart: string; // HH:mm
		darkEnd: string;   // HH:mm
	};
}
