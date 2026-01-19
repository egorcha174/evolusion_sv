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