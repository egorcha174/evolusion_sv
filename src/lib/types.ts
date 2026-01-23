
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
	problemEntities: Set<string>; // Optimized index for unavailable/unknown
	latency?: number; // Connection latency in ms
}

// --- 2D Grid Types ---

export interface CardPosition {
  x: number;      // user units (0-based)
  y: number;      // user units (0-based)
  w: number;      // width in user units (e.g. 1, 0.5, 2)
  h: number;      // height in user units
}

export interface DashboardCardConfig {
  id: string;
  entityId: string;
  position: CardPosition;
  templateId?: string;
}

export interface TabGridConfig {
  id: string;
  title: string;
  icon?: string;
  gridColumns: number;
  gridRows: number;
  cards: DashboardCardConfig[];
  provisioned?: boolean; // If true, auto-layout will skip this tab
}

// --- Card Templates ---

export interface CardTemplateStyle {
  // Background
  backgroundType: 'color' | 'transparent';
  backgroundColor: string;
  
  // Border
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  
  // Effects
  shadow: 'none' | 'sm' | 'md' | 'lg';
  opacity: number;
  
  // Padding (internal spacing)
  padding: number;
}

export interface CardTemplate {
  id: string;
  name: string;
  description?: string;
  style: CardTemplateStyle;
  content?: Record<string, any>;
}

export interface DashboardConfig {
  version: number;
  tabOrder: string[];
  tabs: Record<string, TabGridConfig>;
  templates: Record<string, CardTemplate>;
}

export function createDefaultCardTemplate(): CardTemplate {
  return {
    id: crypto.randomUUID(),
    name: 'New Template',
    style: {
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      shadow: 'sm',
      opacity: 1,
      padding: 16
    }
  };
}
