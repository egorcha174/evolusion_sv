
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
}

export interface TabGridConfig {
  id: string;
  gridColumns: number;
  gridRows: number;
  cards: DashboardCardConfig[];
}

export interface DashboardConfig {
  version: number;
  tabs: Record<string, TabGridConfig>;
}
