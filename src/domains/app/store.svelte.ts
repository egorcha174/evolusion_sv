// C:/CODE/evolusion/src/domains/app/store.ts

import { nanoid } from 'nanoid';
import { browser } from '$app/environment';
import { 
    DEFAULT_THEMES, DEFAULT_COLOR_SCHEME, DEFAULT_AURORA_SETTINGS,
    DEFAULT_SENSOR_TEMPLATE_ID, DEFAULT_LIGHT_TEMPLATE_ID, DEFAULT_SWITCH_TEMPLATE_ID,
    DEFAULT_CLIMATE_TEMPLATE_ID, DEFAULT_HUMIDIFIER_TEMPLATE_ID
} from '$lib/defaults';
import { 
    type ColorScheme, 
    type ThemeDefinition, 
    type ThemePackage, 
    type BackgroundEffectType, 
    type AuroraSettings, 
    type WeatherSettings,
    type CardTemplate,
    type ClockSettings,
    type GalleryTemplate,
    type Tab,
    type Device,
    type PhysicalDevice,
    DeviceType, // Imported as value
    type GridLayoutItem,
    type CardElement,
    type DeviceCustomization,
    type EventTimerWidget,
    type CustomCardWidget,
    type ServerConfig
} from '$lib/types'; 
import { getIconForDeviceType } from '$lib/utils/ha-data-mapper'; 

interface AppState {
	currentPage: string; // Changed from Page to string, assuming Page was meant to be string
	isEditMode: boolean;
	editingDevice: Device | null;
	editingTab: Tab | null;
	editingTemplate: CardTemplate | 'new' | null;
	searchTerm: string;
	contextMenu: { x: number; y: number; deviceId: string; tabId: string } | null;
	historyModalEntityId: string | null;
	isSettingsOpen: boolean;

	lowBatteryThreshold: number;
	clockSettings: ClockSettings;
	themeMode: 'auto' | 'day' | 'night' | 'schedule';
	scheduleStartTime: string;
	scheduleEndTime: string;

	themes: ThemeDefinition[];
	activeThemeId: string;
	colorScheme: ColorScheme;

	sidebarWidth: number;
	isSidebarVisible: boolean;

	weatherProvider: 'openweathermap' | 'yandex' | 'foreca' | 'homeassistant';
	weatherEntityId: string;
	openWeatherMapKey: string;
	yandexWeatherKey: string;
	forecaApiKey: string;
	weatherSettings: WeatherSettings;
	weatherData: any; 

	backgroundEffect: BackgroundEffectType;
	auroraSettings: AuroraSettings;
	templates: Map<string, CardTemplate>;
    customizations: Map<string, DeviceCustomization>;
	galleryTemplates: GalleryTemplate[];
	gallerySearchQuery: string;
	galleryCategoryFilter: string | null;

    tabs: Tab[]; 
    activeTabId: string | null;

    eventTimerWidgets: EventTimerWidget[];
    customCardWidgets: CustomCardWidget[];
    editingEventTimerId: string | null;
    
    servers: ServerConfig[];
    activeServerId: string | null;
}

const LS_THEMES_KEY = 'appThemes';
const LS_ACTIVE_THEME_ID_KEY = 'appActiveThemeId';
const LS_THEME_MODE_KEY = 'appThemeMode';
const LS_SCHEDULE_START_TIME_KEY = 'appScheduleStartTime';
const LS_SCHEDULE_END_TIME_KEY = 'appScheduleEndTime';
const LS_LOW_BATTERY_THRESHOLD_KEY = 'appLowBatteryThreshold';
const LS_SIDEBAR_WIDTH_KEY = 'appSidebarWidth';
const LS_SIDEBAR_VISIBLE_KEY = 'appIsSidebarVisible';
const LS_WEATHER_PROVIDER_KEY = 'appWeatherProvider';
const LS_WEATHER_ENTITY_ID_KEY = 'appWeatherEntityId';
const LS_OPENWEATHERMAP_KEY = 'appOpenWeatherMapKey';
const LS_YANDEX_WEATHER_KEY = 'appYandexWeatherKey';
const LS_FORECA_KEY = 'appForecaKey';
const LS_WEATHER_SETTINGS_KEY = 'appWeatherSettings';
const LS_BACKGROUND_EFFECT_KEY = 'appBackgroundEffect';
const LS_AURORA_SETTINGS_KEY = 'appAuroraSettings';
const LS_CLOCK_SETTINGS_KEY = 'appClockSettings';
const LS_TABS_KEY = 'appTabs';
const LS_ACTIVE_TAB_ID_KEY = 'appActiveTabId';
const LS_CUSTOMIZATIONS_KEY = 'appCustomizations';
const LS_EVENT_TIMER_WIDGETS_KEY = 'appEventTimerWidgets';
const LS_CUSTOM_CARD_WIDGETS_KEY = 'appCustomCardWidgets';
const LS_SERVERS_KEY = 'appServers';
const LS_ACTIVE_SERVER_ID_KEY = 'appActiveServerId';
const LS_IS_EDIT_MODE_KEY = 'appIsEditMode';
const LS_SEARCH_TERM_KEY = 'appSearchTerm';
const LS_CURRENT_PAGE_KEY = 'appCurrentPage';
const LS_TEMPLATES_KEY = 'appTemplates';


const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
	format: '24h',
	showSeconds: true,
	size: 'md'
};

const DEFAULT_WEATHER_SETTINGS = {
	iconPack: 'default' as const,
	forecastDays: 5
};
const DEFAULT_WEATHER_PROVIDER = 'homeassistant';

function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    if (!browser) return defaultValue;
    try {
        const stored = localStorage.getItem(key);
        // Special handling for Maps
        if (key === LS_TEMPLATES_KEY || key === LS_CUSTOMIZATIONS_KEY) {
            return stored ? new Map(JSON.parse(stored)) as T : defaultValue;
        }
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.error(`Error loading ${key} from localStorage:`, e);
        return defaultValue;
    }
}

let initialCustomThemes: ThemeDefinition[] = loadFromLocalStorage(LS_THEMES_KEY, []);

// --- Server migration ---
let initialServers: ServerConfig[] = loadFromLocalStorage(LS_SERVERS_KEY, []);
let initialActiveServerId: string | null = loadFromLocalStorage(LS_ACTIVE_SERVER_ID_KEY, null);

if (browser && initialServers.length === 0) {
    const oldUrl = localStorage.getItem('ha-url');
    const oldToken = localStorage.getItem('ha-token');
    if (oldUrl && oldToken) {
        const migratedServer: ServerConfig = { id: nanoid(), name: 'Home Assistant', url: oldUrl, token: oldToken };
        initialServers.push(migratedServer);
        initialActiveServerId = migratedServer.id;
        
        localStorage.removeItem('ha-url');
        localStorage.removeItem('ha-token');
        
        localStorage.setItem(LS_SERVERS_KEY, JSON.stringify(initialServers));
        localStorage.setItem(LS_ACTIVE_SERVER_ID_KEY, JSON.stringify(initialActiveServerId));
    }
}

const initialThemes = [...DEFAULT_THEMES, ...initialCustomThemes];
const defaultActiveThemeId = DEFAULT_THEMES[0].id;
const initialThemeId = loadFromLocalStorage(LS_ACTIVE_THEME_ID_KEY, defaultActiveThemeId);
const activeTheme =
	initialThemes.find((t) => t.id === initialThemeId) ||
	initialThemes.find((t) => t.id === defaultActiveThemeId) ||
	DEFAULT_THEMES[0];

const state = $state<AppState>({
    currentPage: loadFromLocalStorage(LS_CURRENT_PAGE_KEY, 'dashboard'),
    isEditMode: loadFromLocalStorage(LS_IS_EDIT_MODE_KEY, false),
    editingDevice: null,
    editingTab: null,
    editingTemplate: null,
    searchTerm: loadFromLocalStorage(LS_SEARCH_TERM_KEY, ''),
    contextMenu: null,
    historyModalEntityId: null,
    isSettingsOpen: false,

	lowBatteryThreshold: loadFromLocalStorage(LS_LOW_BATTERY_THRESHOLD_KEY, 20),
	clockSettings: loadFromLocalStorage(LS_CLOCK_SETTINGS_KEY, DEFAULT_CLOCK_SETTINGS),
	themeMode: loadFromLocalStorage(LS_THEME_MODE_KEY, 'auto'),
	scheduleStartTime: loadFromLocalStorage(LS_SCHEDULE_START_TIME_KEY, '22:00'),
	scheduleEndTime: loadFromLocalStorage(LS_SCHEDULE_END_TIME_KEY, '07:00'),

	themes: initialThemes,
	activeThemeId: activeTheme.id,
	colorScheme: activeTheme.scheme,

	sidebarWidth: loadFromLocalStorage(LS_SIDEBAR_WIDTH_KEY, 256),
	isSidebarVisible: loadFromLocalStorage(LS_SIDEBAR_VISIBLE_KEY, true),

	weatherProvider: loadFromLocalStorage(LS_WEATHER_PROVIDER_KEY, DEFAULT_WEATHER_PROVIDER),
	weatherEntityId: loadFromLocalStorage(LS_WEATHER_ENTITY_ID_KEY, ''),
	openWeatherMapKey: loadFromLocalStorage(LS_OPENWEATHERMAP_KEY, ''),
	yandexWeatherKey: loadFromLocalStorage(LS_YANDEX_WEATHER_KEY, ''),
	forecaApiKey: loadFromLocalStorage(LS_FORECA_KEY, ''),
	weatherSettings: loadFromLocalStorage(LS_WEATHER_SETTINGS_KEY, DEFAULT_WEATHER_SETTINGS),
    weatherData: null, 

	backgroundEffect: loadFromLocalStorage(LS_BACKGROUND_EFFECT_KEY, 'none'),
	auroraSettings: loadFromLocalStorage(LS_AURORA_SETTINGS_KEY, DEFAULT_AURORA_SETTINGS),
	templates: loadFromLocalStorage(LS_TEMPLATES_KEY, new Map()),
    customizations: loadFromLocalStorage(LS_CUSTOMIZATIONS_KEY, new Map()),
    
	galleryTemplates: [],
	gallerySearchQuery: '',
	galleryCategoryFilter: null,

    tabs: loadFromLocalStorage(LS_TABS_KEY, []),
    activeTabId: loadFromLocalStorage(LS_ACTIVE_TAB_ID_KEY, null),

    eventTimerWidgets: loadFromLocalStorage(LS_EVENT_TIMER_WIDGETS_KEY, []),
    customCardWidgets: loadFromLocalStorage(LS_CUSTOM_CARD_WIDGETS_KEY, []),
    editingEventTimerId: null,
    
    servers: initialServers,
    activeServerId: initialActiveServerId
});

$effect(() => {
	if (!browser) return;
	localStorage.setItem(LS_CURRENT_PAGE_KEY, JSON.stringify(state.currentPage));
	localStorage.setItem(LS_IS_EDIT_MODE_KEY, JSON.stringify(state.isEditMode));
	localStorage.setItem(LS_SEARCH_TERM_KEY, JSON.stringify(state.searchTerm));

	localStorage.setItem(LS_THEME_MODE_KEY, JSON.stringify(state.themeMode));
	localStorage.setItem(LS_SCHEDULE_START_TIME_KEY, JSON.stringify(state.scheduleStartTime));
	localStorage.setItem(LS_SCHEDULE_END_TIME_KEY, JSON.stringify(state.scheduleEndTime));
	localStorage.setItem(LS_ACTIVE_THEME_ID_KEY, JSON.stringify(state.activeThemeId));
	localStorage.setItem(LS_LOW_BATTERY_THRESHOLD_KEY, JSON.stringify(state.lowBatteryThreshold));
	localStorage.setItem(LS_SIDEBAR_WIDTH_KEY, JSON.stringify(state.sidebarWidth));
	localStorage.setItem(LS_SIDEBAR_VISIBLE_KEY, JSON.stringify(state.isSidebarVisible));
	localStorage.setItem(LS_WEATHER_PROVIDER_KEY, JSON.stringify(state.weatherProvider));
	localStorage.setItem(LS_WEATHER_ENTITY_ID_KEY, JSON.stringify(state.weatherEntityId));
	localStorage.setItem(LS_OPENWEATHERMAP_KEY, JSON.stringify(state.openWeatherMapKey));
	localStorage.setItem(LS_YANDEX_WEATHER_KEY, JSON.stringify(state.yandexWeatherKey));
	localStorage.setItem(LS_FORECA_KEY, JSON.stringify(state.forecaApiKey));
	localStorage.setItem(LS_WEATHER_SETTINGS_KEY, JSON.stringify(state.weatherSettings));
	localStorage.setItem(LS_BACKGROUND_EFFECT_KEY, JSON.stringify(state.backgroundEffect));
	localStorage.setItem(LS_AURORA_SETTINGS_KEY, JSON.stringify(state.auroraSettings));
	localStorage.setItem(LS_CLOCK_SETTINGS_KEY, JSON.stringify(state.clockSettings));
    localStorage.setItem(LS_TABS_KEY, JSON.stringify(state.tabs));
    if (state.activeTabId) {
        localStorage.setItem(LS_ACTIVE_TAB_ID_KEY, JSON.stringify(state.activeTabId));
    }
    localStorage.setItem(LS_EVENT_TIMER_WIDGETS_KEY, JSON.stringify(state.eventTimerWidgets));
    localStorage.setItem(LS_CUSTOM_CARD_WIDGETS_KEY, JSON.stringify(state.customCardWidgets));
    localStorage.setItem(LS_SERVERS_KEY, JSON.stringify(state.servers));
    if (state.activeServerId) {
        localStorage.setItem(LS_ACTIVE_SERVER_ID_KEY, JSON.stringify(state.activeServerId));
    }
    localStorage.setItem(LS_TEMPLATES_KEY, JSON.stringify(Array.from(state.templates.entries())));
    localStorage.setItem(LS_CUSTOMIZATIONS_KEY, JSON.stringify(Array.from(state.customizations.entries())));
});

function setThemes(newThemes: ThemeDefinition[]) {
	state.themes = newThemes;
	if (browser) {
		const customOnly = newThemes.filter((t) => t.isCustom);
		localStorage.setItem(LS_THEMES_KEY, JSON.stringify(customOnly));
	}
}

function createNewBlankTemplate(deviceType: DeviceType | 'custom'): CardTemplate {
    const createElementsWithDefaults = (elements: CardElement[]): CardElement[] => {
        return elements.map(el => ({
            ...el,
            sizeMode: el.sizeMode || 'card',
            locked: el.locked || false,
            uniqueId: nanoid(),
        }));
    };

    if (deviceType === 'custom') {
        return {
            id: nanoid(),
            name: 'Новая кастомная карточка',
            deviceType: DeviceType.Custom as any,
            elements: createElementsWithDefaults([{
                id: 'name',
                uniqueId: nanoid(),
                visible: true,
                position: { x: 50, y: 15 },
                size: { width: 84, height: 15 },
                zIndex: 1,
                styles: { fontFamily: 'System', fontSize: 16, textAlign: 'center' },
                sizeMode: 'card',
                locked: false,
            }]),
            styles: {},
            width: 2,
            height: 2,
        };
    }
    const baseMap: Record<string, CardTemplate | undefined> = {
        [String(DeviceType.Sensor)]: state.templates.get(DEFAULT_SENSOR_TEMPLATE_ID),
        [String(DeviceType.Light)]: state.templates.get(DEFAULT_LIGHT_TEMPLATE_ID),
        [String(DeviceType.DimmableLight)]: state.templates.get(DEFAULT_LIGHT_TEMPLATE_ID),
        [String(DeviceType.Switch)]: state.templates.get(DEFAULT_SWITCH_TEMPLATE_ID),
        [String(DeviceType.Thermostat)]: state.templates.get(DEFAULT_CLIMATE_TEMPLATE_ID),
        [String(DeviceType.Humidifier)]: state.templates.get(DEFAULT_HUMIDIFIER_TEMPLATE_ID),
    };
    const typeNameMap: Record<string, string> = {
        [String(DeviceType.Sensor)]: 'сенсор', [String(DeviceType.Light)]: 'светильник', [String(DeviceType.DimmableLight)]: 'светильник',
        [String(DeviceType.Switch)]: 'переключатель', [String(DeviceType.Thermostat)]: 'климат', [String(DeviceType.Humidifier)]: 'увлажнитель',
    };
    const baseTemplate = baseMap[String(deviceType)] || state.templates.get(DEFAULT_SENSOR_TEMPLATE_ID);
    const newTemplate = JSON.parse(JSON.stringify(baseTemplate));
    newTemplate.id = nanoid();
    newTemplate.name = `Новый ${typeNameMap[String(deviceType)] || 'шаблон'}`;
    
    newTemplate.elements = createElementsWithDefaults(newTemplate.elements);
    return newTemplate;
}


export const app = {
	get state() {
		return state;
	},
	get currentPage() { return state.currentPage; },
	get isEditMode() { return state.isEditMode; },
	get editingDevice() { return state.editingDevice; },
	get editingTab() { return state.editingTab; },
	get editingTemplate() { return state.editingTemplate; },
	get searchTerm() { return state.searchTerm; },
	get contextMenu() { return state.contextMenu; },
	get historyModalEntityId() { return state.historyModalEntityId; },
	get isSettingsOpen() { return state.isSettingsOpen; },
	get weatherData() { return state.weatherData; },

	get lowBatteryThreshold() { return state.lowBatteryThreshold; },
	get themeMode() { return state.themeMode; },
	get scheduleStartTime() { return state.scheduleStartTime; },
	get scheduleEndTime() { return state.scheduleEndTime; },
	get themes() { return state.themes; },
	get activeThemeId() { return state.activeThemeId; },
	get colorScheme() { return state.colorScheme; },
	get sidebarWidth() { return state.sidebarWidth; },
	set sidebarWidth(v: number) { state.sidebarWidth = v; },
	get isSidebarVisible() { return state.isSidebarVisible; },
	get weatherProvider() { return state.weatherProvider; },
	get weatherEntityId() { return state.weatherEntityId; },
	get openWeatherMapKey() { return state.openWeatherMapKey; },
	get yandexWeatherKey() { return state.yandexWeatherKey; },
	get forecaApiKey() { return state.forecaApiKey; },
	get weatherSettings() { return state.weatherSettings; },
	get clockSettings() { return state.clockSettings; },
	get backgroundEffect() { return state.backgroundEffect; },
	get auroraSettings() { return state.auroraSettings; },
	get templates() { return state.templates; },
    get customizations() { return state.customizations; },
    get activeTab() {
        if (!state.activeTabId) return null;
        return state.tabs.find(tab => tab.id === state.activeTabId) || null;
    },
    get tabs() { return state.tabs; },
    get activeTabId() { return state.activeTabId; },

    // Actions
    setCurrentPage(page: string) { state.currentPage = page; },
    setIsEditMode(isEdit: boolean) { state.isEditMode = isEdit; },
    setEditingDevice(device: Device | null) { state.editingDevice = device; },
    setEditingTab(tab: Tab | null) { state.editingTab = tab; },
    setEditingTemplate(template: CardTemplate | 'new' | null) { state.editingTemplate = template; },
    setSearchTerm(term: string) { state.searchTerm = term; },
    setContextMenu(menu: { x: number; y: number; deviceId: string; tabId: string } | null) { state.contextMenu = menu; },
    setHistoryModalEntityId(id: string | null) { state.historyModalEntityId = id; },
    setSettingsOpen(isOpen: boolean) { state.isSettingsOpen = isOpen; },
    setWeatherData(data: any) { state.weatherData = data; }, 

    setTabs(tabs: Tab[]) {
        state.tabs = tabs;
    },
    setActiveTabId(id: string | null) {
        state.activeTabId = id;
    },
	setThemeMode(mode: AppState['themeMode']) {
		state.themeMode = mode;
	},
	setScheduleStartTime(time: string) {
		state.scheduleStartTime = time;
	},
	setScheduleEndTime(time: string) {
		state.scheduleEndTime = time;
	},
	setLowBatteryThreshold(threshold: number) {
		state.lowBatteryThreshold = threshold;
	},
	setSidebarWidth(width: number) {
		state.sidebarWidth = width;
	},
	setIsSidebarVisible(isVisible: boolean) {
		state.isSidebarVisible = isVisible;
	},
	setWeatherProvider(provider: AppState['weatherProvider']) {
		state.weatherProvider = provider;
	},
	setWeatherEntityId(entityId: string) {
		state.weatherEntityId = entityId;
	},
	setOpenWeatherMapKey(key: string) {
		state.openWeatherMapKey = key;
	},
	setYandexWeatherKey(key: string) {
		state.yandexWeatherKey = key;
	},
	setForecaApiKey(key: string) {
		state.forecaApiKey = key;
	},
	setWeatherSettings(settings: WeatherSettings) {
		state.weatherSettings = settings;
	},
	setBackgroundEffect(effect: BackgroundEffectType) {
		state.backgroundEffect = effect;
	},
	setAuroraSettings(settings: AuroraSettings) {
		state.auroraSettings = settings;
	},
	selectTheme(themeId: string) {
		const theme = state.themes.find((t) => t.id === themeId);
		if (theme) {
			state.activeThemeId = themeId;
			state.colorScheme = theme.scheme;
		}
	},
	saveTheme(themeToSave: ThemeDefinition) {
		const themeWithFlag = { ...themeToSave, isCustom: true };
		const themeExists = state.themes.some((t) => t.id === themeWithFlag.id);
		const newThemes = themeExists
			? state.themes.map((t) => (t.id === themeWithFlag.id ? themeWithFlag : t))
			: [...state.themes, themeWithFlag];
		setThemes(newThemes);
		if (state.activeThemeId === themeWithFlag.id) {
			state.colorScheme = themeWithFlag.scheme;
		}
	},
	deleteTheme(themeId: string) {
		const themeToDelete = state.themes.find((t) => t.id === themeId);
		if (!themeToDelete || !themeToDelete.isCustom) return;
		const newThemes = state.themes.filter((t) => t.id !== themeId);
		setThemes(newThemes);
		if (state.activeThemeId === themeId) {
			this.selectTheme(DEFAULT_THEMES[0].id);
		}
	},
	onResetColorScheme() {
		const activeTheme = state.themes.find((t) => t.id === state.activeThemeId);
		if (activeTheme) {
			this.saveTheme({ ...activeTheme, scheme: DEFAULT_COLOR_SCHEME });
		}
	},
	importThemePackage(pkg: ThemePackage) {
		let themeToImport = { ...pkg.theme, isCustom: true };
		if (state.themes.some((t) => t.id === themeToImport.id)) {
			themeToImport.id = nanoid();
			themeToImport.name = `${themeToImport.name} (Imported)`;
		}
		const newThemes = [...state.themes, themeToImport];
		setThemes(newThemes);
		this.selectTheme(themeToImport.id);
	},
	saveTemplate(template: CardTemplate) {
		state.templates.set(template.id, template);
		state.templates = new Map(state.templates);
	},

	setGalleryTemplates(templates: GalleryTemplate[]) {
		state.galleryTemplates = templates;
	},
	setGallerySearchQuery(query: string) {
		state.gallerySearchQuery = query;
	},
	setGalleryCategoryFilter(category: string | null) {
		state.galleryCategoryFilter = category === 'all' ? null : category;
	},
    handleDeleteTemplate(templateId: string) {
        state.templates.delete(templateId);
        state.templates = new Map(state.templates);

        const newCustomizations = new Map(state.customizations);
        for (const [deviceId, customization] of newCustomizations.entries()) {
            if (customization.templateId === templateId) {
                newCustomizations.delete(deviceId);
            }
        }
        state.customizations = newCustomizations;
    },
    handleResetTemplates() {
        console.log("Resetting templates is not fully implemented yet.");
    },
    setServers(servers: ServerConfig[]) {
        state.servers = servers;
    },
    setActiveServerId(id: string | null) {
        state.activeServerId = id;
    },
    addServer(serverData: Omit<ServerConfig, 'id'>) {
        const newServer = { ...serverData, id: nanoid() };
        state.servers = [...state.servers, newServer];
        return newServer;
    },
    updateServer(serverData: ServerConfig) {
        state.servers = state.servers.map(s => s.id === serverData.id ? serverData : s);
    },
    deleteServer(serverId: string) {
        state.servers = state.servers.filter(s => s.id !== serverId);
        if (state.activeServerId === serverId) {
            state.activeServerId = state.servers[0]?.id || null;
        }
    },
    addCustomCard() {
        const newWidget: CustomCardWidget = {
            id: nanoid(),
            name: `Кастомная карточка ${state.customCardWidgets.length + 1}`,
        };

        const newTemplate = createNewBlankTemplate('custom');
        newTemplate.id = `custom-card-template-${newWidget.id}`;
        newTemplate.name = newWidget.name;
        this.saveTemplate(newTemplate);
        
        const deviceId = `internal::custom-card_${newWidget.id}`;
        const newCustomization: DeviceCustomization = {
            ...(state.customizations.get(deviceId) || {}),
            templateId: newTemplate.id,
        };
        state.customizations.set(deviceId, newCustomization);
        state.customizations = new Map(state.customizations);

        state.customCardWidgets = [...state.customCardWidgets, newWidget];
    },
    addCustomWidget() {
        const newWidget: EventTimerWidget = {
            id: nanoid(),
            name: `Таймер ${state.eventTimerWidgets.length + 1}`,
            cycleDays: 14,
            lastResetDate: null,
            animation: 'smooth',
            fillDirection: 'bottom-to-top',
        };
        state.eventTimerWidgets = [...state.eventTimerWidgets, newWidget];
    },
    deleteCustomCard(widgetId: string) {
        const deviceIdToDelete = `internal::custom-card_${widgetId}`;
        const templateIdToDelete = `custom-card-template-${widgetId}`;

        state.customCardWidgets = state.customCardWidgets.filter(w => w.id !== widgetId);

        state.tabs = state.tabs.map(tab => ({
            ...tab,
            layout: tab.layout.filter(item => item.deviceId !== deviceIdToDelete)
        }));
        this.setTabs(state.tabs); // Use state.tabs directly as it's modified in the map

        state.templates.delete(templateIdToDelete);
        state.templates = new Map(state.templates);

        state.customizations.delete(deviceIdToDelete);
        state.customizations = new Map(state.customizations);
    },
    deleteCustomWidget(widgetId: string) {
        const deviceIdToDelete = `internal::event-timer_${widgetId}`;
        
        state.eventTimerWidgets = state.eventTimerWidgets.filter(w => w.id !== widgetId);
        
        state.tabs = state.tabs.map(tab => ({
            ...tab,
            layout: tab.layout.filter(item => item.deviceId !== deviceIdToDelete)
        }));
        this.setTabs(state.tabs); // Use state.tabs directly
    },
    setEditingEventTimerId(id: string | null) {
        state.editingEventTimerId = id;
    },
    checkCollision(layout: GridLayoutItem[], itemToPlace: { col: number; row: number; width: number; height: number; }, gridSettings: { cols: number; rows: number; }, ignoreDeviceId: string): boolean {
        const { col, row, width, height } = itemToPlace;
    
        if (col < 0 || row < 0 || col + Math.ceil(width) > gridSettings.cols || row + Math.ceil(height) > gridSettings.rows) {
            return true;
        }
    
        for (const existingItem of layout) {
            if (existingItem.deviceId === ignoreDeviceId) {
                continue;
            }
    
            const existingWidth = existingItem.width || 1;
            const existingHeight = existingItem.height || 1;
    
            const isOverlapping = (
                col < existingItem.col + existingWidth &&
                col + width > existingItem.col &&
                row < existingItem.row + existingHeight &&
                row + height > existingItem.row
            );
    
            if (isOverlapping) {
                return true;
            }
        }
        return false;
    },

    getTemplateForDevice(device: Device | null): CardTemplate | null {
        if (!device) return null;
        const custom = state.customizations.get(device.id);
        let templateId = custom?.templateId;

        if (templateId === '') return null; // Explicitly no template

        if (!templateId) {
            const defaultMap: { [key in DeviceType]?: string } = {
                [DeviceType.Sensor]: DEFAULT_SENSOR_TEMPLATE_ID,
                [DeviceType.Light]: DEFAULT_LIGHT_TEMPLATE_ID,
                [DeviceType.DimmableLight]: DEFAULT_LIGHT_TEMPLATE_ID,
                [DeviceType.Switch]: DEFAULT_SWITCH_TEMPLATE_ID,
                [DeviceType.Thermostat]: DEFAULT_CLIMATE_TEMPLATE_ID,
                [DeviceType.Humidifier]: DEFAULT_HUMIDIFIER_TEMPLATE_ID,
            };
            templateId = defaultMap[device.type];
        }
        return templateId ? state.templates.get(templateId) ?? null : null;
    },

    handleDeviceAddToTab(device: Device, tabId: string) {
        const newTabs = state.tabs.map(tab => {
            if (tab.id !== tabId) return tab;

            const template = this.getTemplateForDevice(device);
            const templateWidth = template?.width || 1;
            const templateHeight = template?.height || 1;

            const { cols, rows } = tab.gridSettings;
            let placeAt: { col: number; row: number } | null = null;

            const requiredWidth = Math.ceil(templateWidth);

            for (let r = 0; r <= rows - templateHeight; r += 0.5) {
                if (templateHeight % 1 === 0 && r % 1 !== 0) {
                    continue;
                }

                for (let c = 0; c <= cols - requiredWidth; c++) {
                    const itemToPlace = { col: c, row: r, width: templateWidth, height: templateHeight };
                    if (!this.checkCollision(tab.layout, itemToPlace, tab.gridSettings, '')) { 
                        placeAt = { col: c, row: r };
                        break;
                    }
                }
                if (placeAt) break;
            }

            if (placeAt) {
                const newLayoutItem: GridLayoutItem = { deviceId: device.id, col: placeAt.col, row: placeAt.row, width: templateWidth, height: templateHeight };
                return { ...tab, layout: [...tab.layout, newLayoutItem] };
            }
            return tab; 
        });
        this.setTabs(newTabs);
    },

    handleDeviceRemoveFromTab(deviceId: string, tabId: string) {
        state.tabs = state.tabs.map(tab => 
            tab.id === tabId 
                ? { ...tab, layout: tab.layout.filter(item => item.deviceId !== deviceId) } 
                : tab
        );
    },

    handleDeviceMoveToTab(device: Device, fromTabId: string, toTabId: string) {
        if (fromTabId === toTabId) return;
        this.handleDeviceAddToTab(device, toTabId);
        this.handleDeviceRemoveFromTab(device.id, fromTabId);
    },

    handleDeviceCopyToTab(device: Device, toTabId: string) {
        this.handleDeviceAddToTab(device, toTabId);
    },

    handleDeviceLayoutChange(tabId: string, newLayout: GridLayoutItem[]) {
        state.tabs = state.tabs.map(tab => 
            tab.id === tabId 
                ? { ...tab, layout: newLayout } 
                : tab
        );
    },

    handleDeviceResizeOnTab(tabId: string, deviceId: string, newWidth: number, newHeight: number) {
        const tabIndex = state.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tab = state.tabs[tabIndex];
        const itemIndex = tab.layout.findIndex(item => item.deviceId === deviceId);
        if (itemIndex === -1) return;

        const itemToResize = tab.layout[itemIndex];
        const newItem = { ...itemToResize, width: newWidth, height: newHeight };

        if (this.checkCollision(tab.layout, newItem, tab.gridSettings, deviceId)) {
            return;
        }

        const newLayout = [...tab.layout];
        newLayout[itemIndex] = newItem;
        const newTabs = [...state.tabs];
        newTabs[tabIndex] = { ...tab, layout: newLayout };
        
        state.tabs = newTabs; 
    },

    handleAddTab() {
        const newTabName = `Вкладка ${state.tabs.length + 1}`;
        const newTab: Tab = { id: nanoid(), name: newTabName, layout: [], gridSettings: { cols: 8, rows: 5 } };
        state.tabs = [...state.tabs, newTab];
        this.setActiveTabId(newTab.id);
    },

    handleUpdateTabSettings(tabId: string, settings: { name: string; gridSettings: { cols: number; rows: number } }) {
        state.tabs = state.tabs.map(tab => 
            (tab.id === tabId) 
                ? { ...tab, ...settings } 
                : tab
        );
    },

    handleDeleteTab(tabId: string) {
        const newTabs = state.tabs.filter(t => t.id !== tabId);
        if (state.activeTabId === tabId) {
            this.setActiveTabId(newTabs.length > 0 ? newTabs[0].id : null);
        }
        state.tabs = newTabs;
    },

    handleTabOrderChange(newTabs: Tab[]) {
        state.tabs = newTabs;
    },

    handleAddPhysicalDeviceAsCustomCard(physicalDevice: PhysicalDevice, tabId: string) {
        const widgetId = `physdev-${physicalDevice.id}`;
        const deviceId = `internal::custom-card_${widgetId}`;
        const templateId = `custom-card-template-${widgetId}`;

        let template = state.templates.get(templateId);

        if (!template) {
            template = createNewBlankTemplate('custom');
            template.id = templateId;
            template.name = physicalDevice.name;

            template.width = 2;
            const entityRows = Math.ceil(physicalDevice.entities.length / 2);
            template.height = Math.max(2, 1 + entityRows);

            const nameElementHeight = 15;
            template.elements = [
                { id: 'name', uniqueId: nanoid(), visible: true, position: { x: 50, y: 7.5 }, size: { width: 90, height: 10 }, zIndex: 1, styles: { fontSize: 16, textAlign: 'center' }, sizeMode: 'card', locked: false },
            ];

            const entitiesPerRow = 2;
            const startY = nameElementHeight;
            const availableHeight = 100 - startY - 5;
            const rowHeight = availableHeight / entityRows;
            const colWidth = 45;
            const startX = 27.5; 
            const colGap = 50;

            physicalDevice.entities.forEach((entity, index) => {
                const row = Math.floor(index / entitiesPerRow);
                const col = index % entitiesPerRow;

                template!.elements.push({
                    id: 'linked-entity',
                    uniqueId: nanoid(),
                    visible: true,
                    position: {
                        x: startX + col * colGap,
                        y: startY + row * rowHeight + (rowHeight / 2),
                    },
                    size: {
                        width: colWidth,
                        height: rowHeight * 0.9,
                    },
                    zIndex: 2,
                    styles: {
                        linkedEntityId: entity.id,
                        showValue: true,
                    },
                    sizeMode: 'card',
                    locked: false,
                });
            });

            this.saveTemplate(template);

            const newCustomization: DeviceCustomization = {
                ...(state.customizations.get(deviceId) || {}),
                templateId: templateId,
            };
            state.customizations.set(deviceId, newCustomization);
            state.customizations = new Map(state.customizations);
        }

        const deviceToAdd: Device = {
            id: deviceId,
            name: physicalDevice.name,
            status: `${physicalDevice.entities.length} сущ.`,
            type: DeviceType.Custom,
            haDomain: 'internal',
            state: 'active',
        };
        this.handleDeviceAddToTab(deviceToAdd, tabId);
    },

    handleSaveCustomization(originalDevice: Device, newValues: any) {
        const deviceId = originalDevice.id;
        const oldCustomization = state.customizations.get(deviceId) || {};

        // Use the globally imported getIconForDeviceType
        const newCustoms: DeviceCustomization = {
            ...oldCustomization,
            name: newValues.name !== originalDevice.name ? newValues.name : undefined,
            type: newValues.type !== originalDevice.type ? newValues.type : undefined,
            icon: newValues.icon !== getIconForDeviceType(newValues.type as any, undefined) ? newValues.icon : undefined,
            isHidden: newValues.isHidden ? true : undefined,
            templateId: newValues.templateId || undefined,
            iconAnimation: newValues.iconAnimation !== 'none' ? newValues.iconAnimation : undefined,
            deviceBindings: newValues.deviceBindings?.length ? newValues.deviceBindings : undefined,
            thresholds: newValues.thresholds?.length ? newValues.thresholds : undefined,
        };
        state.customizations.set(deviceId, newCustoms);
        state.customizations = new Map(state.customizations);

        if (newValues.templateId !== oldCustomization.templateId) {
            const template = state.templates.get(newValues.templateId || '');
            if (template && (template.width !== undefined || template.height !== undefined)) {
                // handleDeviceResizeOnTab is not implemented yet
                console.log('handleDeviceResizeOnTab needs to be implemented');
            }
        }
    },

	get filteredGalleryTemplates() {
		return state.galleryTemplates.filter((t) => {
			const matchesSearch =
				t.name.toLowerCase().includes(state.gallerySearchQuery.toLowerCase()) ||
				t.description.toLowerCase().includes(state.gallerySearchQuery.toLowerCase());
			const matchesCategory = state.galleryCategoryFilter ? t.deviceType === state.galleryCategoryFilter : true;
			return matchesSearch && matchesCategory;
		});
	},
};