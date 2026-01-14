// C:/CODE/evolusion/src/domains/app/store.ts

import { nanoid } from 'nanoid';
import { browser } from '$app/environment';
import { getDecryptedItem, setEncryptedItem } from '../../domains/ha/storage';
import { DEFAULT_THEMES, DEFAULT_COLOR_SCHEME, DEFAULT_AURORA_SETTINGS } from '$lib/defaults';
import type { 
    ColorScheme, 
    ThemeDefinition, 
    ThemePackage, 
    BackgroundEffectType, 
    AuroraSettings, 
    WeatherSettings,
    CardTemplate,
    ClockSettings,
    GalleryTemplate,
    Tab,
    Device,
    PhysicalDevice,
    DeviceType,
    GridLayoutItem,
    CardElement,
    DeviceCustomization,
    EventTimerWidget,
    CustomCardWidget,
    ServerConfig
} from '$lib/types';
import { getIconForDeviceType } from '$lib/utils/ha-data-mapper'; // Corrected import
import { DEFAULT_SENSOR_TEMPLATE_ID, DEFAULT_LIGHT_TEMPLATE_ID, DEFAULT_SWITCH_TEMPLATE_ID, DEFAULT_CLIMATE_TEMPLATE_ID, DEFAULT_HUMIDIFIER_TEMPLATE_ID } from '$lib/defaults';


interface AppState {
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

	backgroundEffect: BackgroundEffectType;
	auroraSettings: AuroraSettings;
	templates: Map<string, CardTemplate>;
    customizations: Map<string, DeviceCustomization>;
	dashboardItems: string[];
	galleryTemplates: GalleryTemplate[];
	gallerySearchQuery: string;
	galleryCategoryFilter: string | null;

    tabs: Tab[];
    activeTabId: string | null;

    eventTimerWidgets: EventTimerWidget[];
    customCardWidgets: CustomCardWidget[];
    editingEventTimerId: string | null;
    editingTemplate: CardTemplate | 'new' | null;
    editingDevice: Device | null;

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
const LS_DASHBOARD_ITEMS_KEY = 'appDashboardItems';
const LS_CLOCK_SETTINGS_KEY = 'appClockSettings';
const LS_TABS_KEY = 'appTabs';
const LS_ACTIVE_TAB_ID_KEY = 'appActiveTabId';
const LS_CUSTOMIZATIONS_KEY = 'appCustomizations';
const LS_EVENT_TIMER_WIDGETS_KEY = 'appEventTimerWidgets';
const LS_CUSTOM_CARD_WIDGETS_KEY = 'appCustomCardWidgets';
const LS_SERVERS_KEY = 'appServers';
const LS_ACTIVE_SERVER_ID_KEY = 'appActiveServerId';

const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
	format: '24h',
	showSeconds: true,
	size: 'md'
};

let initialCustomThemes: ThemeDefinition[] = [];
if (browser) {
	try {
		const storedCustom = localStorage.getItem(LS_THEMES_KEY);
		if (storedCustom) {
			initialCustomThemes = JSON.parse(storedCustom);
		}
	} catch (e) {
		console.error('Error parsing stored custom themes:', e);
	}
}

// --- Server migration ---
let initialServers: ServerConfig[] = [];
let initialActiveServerId = null;
if (browser) {
    try {
        const storedServers = localStorage.getItem(LS_SERVERS_KEY);
        if (storedServers) {
            initialServers = JSON.parse(storedServers);
        }
        const storedActiveId = localStorage.getItem(LS_ACTIVE_SERVER_ID_KEY);
        if (storedActiveId) {
            initialActiveServerId = JSON.parse(storedActiveId);
        }

        if (initialServers.length === 0) {
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
    } catch (e) {
        console.error('Error handling server migration:', e);
    }
}


const initialThemes = [...DEFAULT_THEMES, ...initialCustomThemes];
const defaultActiveThemeId = DEFAULT_THEMES[0].id;
const initialThemeId = (browser ? localStorage.getItem(LS_ACTIVE_THEME_ID_KEY) : null) || defaultActiveThemeId;
const activeTheme =
	initialThemes.find((t) => t.id === initialThemeId) ||
	initialThemes.find((t) => t.id === defaultActiveThemeId) ||
	DEFAULT_THEMES[0];

const DEFAULT_WEATHER_SETTINGS = {
	iconPack: 'default' as const,
	forecastDays: 5
};
const DEFAULT_WEATHER_PROVIDER = 'homeassistant';

const state = $state<AppState>({
	lowBatteryThreshold: 20,
	clockSettings: (browser && localStorage.getItem(LS_CLOCK_SETTINGS_KEY))
		? JSON.parse(localStorage.getItem(LS_CLOCK_SETTINGS_KEY)!)
		: DEFAULT_CLOCK_SETTINGS,
	themeMode: (browser ? (localStorage.getItem(LS_THEME_MODE_KEY) as AppState['themeMode']) : 'auto') || 'auto',
	scheduleStartTime: (browser ? localStorage.getItem(LS_SCHEDULE_START_TIME_KEY) : null) || '22:00',
	scheduleEndTime: (browser ? localStorage.getItem(LS_SCHEDULE_END_TIME_KEY) : null) || '07:00',

	themes: initialThemes,
	activeThemeId: activeTheme.id,
	colorScheme: activeTheme.scheme,

	sidebarWidth: parseInt((browser ? localStorage.getItem(LS_SIDEBAR_WIDTH_KEY) : null) || '256', 10),
	isSidebarVisible: (browser ? localStorage.getItem(LS_SIDEBAR_VISIBLE_KEY) : null) !== 'false',

	weatherProvider: (browser ? (localStorage.getItem(LS_WEATHER_PROVIDER_KEY) as AppState['weatherProvider']) : DEFAULT_WEATHER_PROVIDER) || DEFAULT_WEATHER_PROVIDER,
	weatherEntityId: (browser ? localStorage.getItem(LS_WEATHER_ENTITY_ID_KEY) : null) || '',
	openWeatherMapKey: (browser ? localStorage.getItem(LS_OPENWEATHERMAP_KEY) : null) || '',
	yandexWeatherKey: (browser ? localStorage.getItem(LS_YANDEX_WEATHER_KEY) : null) || '',
	forecaApiKey: (browser ? localStorage.getItem(LS_FORECA_KEY) : null) || '',
	weatherSettings: (browser && localStorage.getItem(LS_WEATHER_SETTINGS_KEY))
		? JSON.parse(localStorage.getItem(LS_WEATHER_SETTINGS_KEY)!)
		: DEFAULT_WEATHER_SETTINGS,

	backgroundEffect: (browser ? (localStorage.getItem(LS_BACKGROUND_EFFECT_KEY) as BackgroundEffectType) : 'none') || 'none',
	auroraSettings: (browser && localStorage.getItem(LS_AURORA_SETTINGS_KEY))
		? JSON.parse(localStorage.getItem(LS_AURORA_SETTINGS_KEY)!)
		: DEFAULT_AURORA_SETTINGS,
	templates: new Map(),
    customizations: new Map(),
	dashboardItems: (browser && localStorage.getItem(LS_DASHBOARD_ITEMS_KEY))
		? JSON.parse(localStorage.getItem(LS_DASHBOARD_ITEMS_KEY)!)
		: [],
	galleryTemplates: [],
	gallerySearchQuery: '',
	galleryCategoryFilter: null,
    tabs: (browser && localStorage.getItem(LS_TABS_KEY))
        ? JSON.parse(localStorage.getItem(LS_TABS_KEY)!)
        : [],
    activeTabId: (browser ? localStorage.getItem(LS_ACTIVE_TAB_ID_KEY) : null),
    eventTimerWidgets: (browser && localStorage.getItem(LS_EVENT_TIMER_WIDGETS_KEY))
        ? JSON.parse(localStorage.getItem(LS_EVENT_TIMER_WIDGETS_KEY)!)
        : [],
    customCardWidgets: (browser && localStorage.getItem(LS_CUSTOM_CARD_WIDGETS_KEY))
        ? JSON.parse(localStorage.getItem(LS_CUSTOM_CARD_WIDGETS_KEY)!)
        : [],
    editingEventTimerId: null,
    editingTemplate: null,
    editingDevice: null,
    servers: initialServers,
    activeServerId: initialActiveServerId
});

$effect(() => {
	if (!browser) return;
	localStorage.setItem(LS_THEME_MODE_KEY, state.themeMode);
	localStorage.setItem(LS_SCHEDULE_START_TIME_KEY, state.scheduleStartTime);
	localStorage.setItem(LS_SCHEDULE_END_TIME_KEY, state.scheduleEndTime);
	localStorage.setItem(LS_ACTIVE_THEME_ID_KEY, state.activeThemeId);
	localStorage.setItem(LS_LOW_BATTERY_THRESHOLD_KEY, state.lowBatteryThreshold.toString());
	localStorage.setItem(LS_SIDEBAR_WIDTH_KEY, state.sidebarWidth.toString());
	localStorage.setItem(LS_SIDEBAR_VISIBLE_KEY, state.isSidebarVisible.toString());
	localStorage.setItem(LS_WEATHER_PROVIDER_KEY, state.weatherProvider);
	localStorage.setItem(LS_WEATHER_ENTITY_ID_KEY, state.weatherEntityId);
	localStorage.setItem(LS_OPENWEATHERMAP_KEY, state.openWeatherMapKey);
	localStorage.setItem(LS_YANDEX_WEATHER_KEY, state.yandexWeatherKey);
	localStorage.setItem(LS_FORECA_KEY, state.forecaApiKey);
	localStorage.setItem(LS_WEATHER_SETTINGS_KEY, JSON.stringify(state.weatherSettings));
	localStorage.setItem(LS_BACKGROUND_EFFECT_KEY, state.backgroundEffect);
	localStorage.setItem(LS_AURORA_SETTINGS_KEY, JSON.stringify(state.auroraSettings));
	localStorage.setItem(LS_DASHBOARD_ITEMS_KEY, JSON.stringify(state.dashboardItems));
	localStorage.setItem(LS_CLOCK_SETTINGS_KEY, JSON.stringify(state.clockSettings));
    localStorage.setItem(LS_TABS_KEY, JSON.stringify(state.tabs));
    if (state.activeTabId) {
        localStorage.setItem(LS_ACTIVE_TAB_ID_KEY, state.activeTabId);
    }
    localStorage.setItem(LS_EVENT_TIMER_WIDGETS_KEY, JSON.stringify(state.eventTimerWidgets));
    localStorage.setItem(LS_CUSTOM_CARD_WIDGETS_KEY, JSON.stringify(state.customCardWidgets));
    localStorage.setItem(LS_SERVERS_KEY, JSON.stringify(state.servers));
    if (state.activeServerId) {
        localStorage.setItem(LS_ACTIVE_SERVER_ID_KEY, JSON.stringify(state.activeServerId));
    }
});

function setThemes(newThemes: ThemeDefinition[]) {
	state.themes = newThemes;
	if (browser) {
		const customOnly = newThemes.filter((t) => t.isCustom);
		localStorage.setItem(LS_THEMES_KEY, JSON.stringify(customOnly));
	}
}

export const app = {
	get state() {
		return state;
	},
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
	get dashboardItems() { return state.dashboardItems; },
    get tabs() { return state.tabs; },
    get activeTabId() { return state.activeTabId; },
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
	setDashboardItems(items: string[]) {
		state.dashboardItems = items;
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
                delete customization.templateId;
                newCustomizations.set(deviceId, customization);
            }
        }
        state.customizations = newCustomizations;
    },
    handleResetTemplates() {
        // This needs to be implemented properly with default templates
        console.log("Resetting templates is not fully implemented yet.");
        // state.templates = defaultTemplates;
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

        const newTemplate = this.createNewBlankTemplate('custom');
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

        const newTabs = state.tabs.map(tab => ({
            ...tab,
            layout: tab.layout.filter(item => item.deviceId !== deviceIdToDelete)
        }));
        this.setTabs(newTabs);

        state.templates.delete(templateIdToDelete);
        state.templates = new Map(state.templates);

        state.customizations.delete(deviceIdToDelete);
        state.customizations = new Map(state.customizations);
    },
    deleteCustomWidget(widgetId: string) {
        const deviceIdToDelete = `internal::event-timer_${widgetId}`;
        
        state.eventTimerWidgets = state.eventTimerWidgets.filter(w => w.id !== widgetId);
        
        const newTabs = state.tabs.map(tab => ({
            ...tab,
            layout: tab.layout.filter(item => item.deviceId !== deviceIdToDelete)
        }));
        this.setTabs(newTabs);
    },
        setEditingEventTimerId(id: string | null) {
            state.editingEventTimerId = id;
        },
        setEditingTemplate(template: CardTemplate | 'new' | null) {
            state.editingTemplate = template;
        },
        setEditingDevice(device: Device | null) {
            state.editingDevice = device;
        },
    	checkCollision(layout: GridLayoutItem[], itemToPlace: { col: number; row: number; width: number; height: number; }, gridSettings: { cols: number; rows: number; }, ignoreDeviceId: string) {
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

    createNewBlankTemplate(deviceType: DeviceType | 'custom'): CardTemplate {
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
                deviceType: 'custom',
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
        const baseMap = {
            [DeviceType.Sensor]: state.templates.get(DEFAULT_SENSOR_TEMPLATE_ID),
            [DeviceType.Light]: state.templates.get(DEFAULT_LIGHT_TEMPLATE_ID),
            [DeviceType.DimmableLight]: state.templates.get(DEFAULT_LIGHT_TEMPLATE_ID),
            [DeviceType.Switch]: state.templates.get(DEFAULT_SWITCH_TEMPLATE_ID),
            [DeviceType.Thermostat]: state.templates.get(DEFAULT_CLIMATE_TEMPLATE_ID),
            [DeviceType.Humidifier]: state.templates.get(DEFAULT_HUMIDIFIER_TEMPLATE_ID),
        };
        const typeNameMap = {
            [DeviceType.Sensor]: 'сенсор', [DeviceType.Light]: 'светильник', [DeviceType.DimmableLight]: 'светильник',
            [DeviceType.Switch]: 'переключатель', [DeviceType.Thermostat]: 'климат', [DeviceType.Humidifier]: 'увлажнитель',
        };
        const baseTemplate = (baseMap as any)[deviceType] || state.templates.get(DEFAULT_SENSOR_TEMPLATE_ID);
        const newTemplate = JSON.parse(JSON.stringify(baseTemplate));
        newTemplate.id = nanoid();
        newTemplate.name = `Новый ${typeNameMap[deviceType] || 'шаблон'}`;
        
        newTemplate.elements = createElementsWithDefaults(newTemplate.elements);
        return newTemplate;
    },

    handleAddPhysicalDeviceAsCustomCard(physicalDevice: PhysicalDevice, tabId: string) {
        const widgetId = `physdev-${physicalDevice.id}`;
        const deviceId = `internal::custom-card_${widgetId}`;
        const templateId = `custom-card-template-${widgetId}`;

        let template = state.templates.get(templateId);

        if (!template) {
            template = this.createNewBlankTemplate('custom');
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
            icon: newValues.icon !== getIconForDeviceType(newValues.type, false) ? newValues.icon : undefined,
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
	}
};