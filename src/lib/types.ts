
// Re-export domain types
export type {
  BackgroundEffectType,
  AuroraSettings,
  BackgroundSettings,
  BackgroundState
} from '../domains/ui/background/types';

export type {
  WeatherProvider,
  WeatherConfig,
  WeatherCondition,
  WeatherForecastDay,
  WeatherForecast,
  WeatherState
} from '../domains/weather/types';

// Re-export HA contracts
export * from '../domains/ha/contracts/messages';

export interface ServerConfig {
  id: string;
  url: string;
  token: string;
  name?: string;
}

export interface AppState {
  activeServer: ServerConfig | null;
  savedServers: ServerConfig[];
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

// Widget types for dashboard cards
export type WidgetType = 'entity' | 'camera' | 'event-timer' | 'battery-monitor';

// Camera source configuration for individual camera cards
export interface CameraSourceConfig {
  sourceType: "go2rtc" | "url" | "ha_entity";
  // For go2rtc
  go2rtcUrl?: string;
  streamName?: string;
  // For direct URL
  url?: string;
  streamType?: "hls" | "mjpeg" | "webrtc";
  // For HA entity
  entityId?: string;
}

export interface DashboardCardConfig {
  id: string;
  entityId?: string;  // For entity widgets (optional when widgetType is 'camera')
  cameraId?: string;  // @deprecated For camera widgets (go2rtc camera ID) - use cameraSourceConfig instead
  cameraSourceConfig?: CameraSourceConfig; // Individual camera source configuration
  widgetType?: WidgetType;  // Defaults to 'entity' if not specified
  settings?: Record<string, any>; // Widget-specific settings
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

// --- Card Templates (Visual Editor) ---

export type CardElementType = 'icon' | 'name' | 'state' | 'label' | 'shape';

export interface CardElementStyle {
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '500';
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  zIndex?: number;
}

export interface CardElement {
  id: string;
  type: CardElementType;

  // Position in Percent (0-100) relative to card
  x: number;
  y: number;

  // Dimensions (optional, some elements auto-size)
  w?: number; // Percent or null for auto
  h?: number; // Percent or null for auto

  // Content specific
  label?: string; // Fixed text for 'label' type

  style: CardElementStyle;
}

export interface CardTemplateStyle {
  // Background
  backgroundType: 'color' | 'transparent';
  backgroundColor: string;

  // Borders are now controlled by Global Theme
  // Removed: borderWidth, borderColor, borderRadius

  // Effects
  shadow: 'none' | 'sm' | 'md' | 'lg';
  opacity: number;

  // Padding (internal spacing) - Mostly for legacy layout, 
  // but acts as safe area for visual editor
  padding: number;
}

export interface CardTemplate {
  id: string;
  name: string;
  description?: string;
  style: CardTemplateStyle;

  // The visual elements (If empty, falls back to legacy layout)
  elements: CardElement[];
}

export interface DashboardConfig {
  version: number;
  tabOrder: string[];
  tabs: Record<string, TabGridConfig>;
  templates: Record<string, CardTemplate>;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails (e.g. insecure context)
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createDefaultCardTemplate(): CardTemplate {
  return {
    id: generateId(),
    name: 'New Template',
    style: {
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      shadow: 'sm',
      opacity: 1,
      padding: 16
    },
    elements: [] // Empty by default = Legacy Layout
  };
}