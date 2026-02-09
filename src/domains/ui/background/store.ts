
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type {
    BackgroundState,
    BackgroundEffectType,
    AuroraSettings,
    TronSettings,
    LifeSettings,
    MatrixSettings,
    HyperspaceSettings
} from './types';

const DEFAULT_AURORA: AuroraSettings = {
    color1: '#00ffc8',
    color2: '#78c8ff',
    color3: '#00b4ff',
    speed: 18,
    intensity: 0.9,
    blur: 18,
    saturate: 140,
    stars: true,
    starSpeed: 6
};

const DEFAULT_TRON: TronSettings = {
    backgroundColor: '#000000',
    maxBeams: 8,
    beamSpeed: 3,
    beamColors: [
        "#00ffff", // Cyan
        "#ff00ff", // Magenta
        "#ffff00", // Yellow
        "#00ff00", // Green
        "#ff0000", // Red
        "#0088ff", // Blue
    ]
};

const DEFAULT_LIFE: LifeSettings = {
    backgroundColor: '#000000',
    cellColor: '#00ff00',
    cellSize: 15,
    updateInterval: 100
};

const DEFAULT_MATRIX: MatrixSettings = {
    backgroundColor: '#030703',
    glyphColor: '#00ff66',
    glowColor: '#66ff99',
    fontSize: 16,
    speed: 1.2,
    fadeStrength: 0.08,
    density: 0.95
};

const DEFAULT_HYPERSPACE: HyperspaceSettings = {
    backgroundColor: '#000000',
    starColor: '#ffffff',
    starSpeed: 25,
    starDensity: 300,
    starTrailLength: 0.92,
    fov: 200
};

const STORAGE_KEY = 'evolusion_background_settings';

const initialState: BackgroundState = {
    effectType: 'none',
    userSelectedEffect: 'none',
    settings: {
        aurora: DEFAULT_AURORA,
        tron: DEFAULT_TRON,
        life: DEFAULT_LIFE,
        matrix: DEFAULT_MATRIX,
        hyperspace: DEFAULT_HYPERSPACE
    }
};

function createBackgroundStore() {
    const { subscribe, set, update } = writable<BackgroundState>(initialState);

    function saveState(state: BackgroundState) {
        if (browser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }

    return {
        subscribe,

        init() {
            if (!browser) return;

            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored) as Partial<BackgroundState>;
                    // Merge with defaults to ensure new settings exist
                    set({
                        ...initialState,
                        ...data,
                        userSelectedEffect: data.userSelectedEffect || data.effectType || 'none',
                        settings: {
                            ...initialState.settings,
                            aurora: { ...initialState.settings.aurora, ...(data.settings?.aurora || {}) },
                            tron: { ...initialState.settings.tron, ...(data.settings?.tron || {}) },
                            life: { ...initialState.settings.life, ...(data.settings?.life || {}) },
                            matrix: { ...initialState.settings.matrix, ...(data.settings?.matrix || {}) },
                            hyperspace: { ...initialState.settings.hyperspace, ...(data.settings?.hyperspace || {}) }
                        }
                    });
                }
            } catch (e) {
                console.error('Failed to load background settings', e);
            }
        },

        setUserSelectedEffect(effectType: BackgroundEffectType) {
            update(state => {
                const newState = { ...state, userSelectedEffect: effectType, effectType: effectType };
                saveState(newState);
                return newState;
            });
        },

        setEffect(effectType: BackgroundEffectType) {
            update(state => {
                if (state.effectType === effectType) return state;
                const newState = { ...state, effectType };
                // We don't save here, because this is a transient effect
                return newState;
            });
        },

        updateAuroraSettings(settings: Partial<AuroraSettings>) {
            update(state => {
                const newState = {
                    ...state,
                    settings: {
                        ...state.settings,
                        aurora: { ...state.settings.aurora, ...settings }
                    }
                };
                saveState(newState);
                return newState;
            });
        },

        updateTronSettings(settings: Partial<TronSettings>) {
            update(state => {
                const newState = {
                    ...state,
                    settings: {
                        ...state.settings,
                        tron: { ...state.settings.tron, ...settings }
                    }
                };
                saveState(newState);
                return newState;
            });
        },

        updateLifeSettings(settings: Partial<LifeSettings>) {
            update(state => {
                const newState = {
                    ...state,
                    settings: {
                        ...state.settings,
                        life: { ...state.settings.life, ...settings }
                    }
                };
                saveState(newState);
                return newState;
            });
        },

        updateMatrixSettings(settings: Partial<MatrixSettings>) {
            update(state => {
                const newState = {
                    ...state,
                    settings: {
                        ...state.settings,
                        matrix: { ...state.settings.matrix, ...settings }
                    }
                };
                saveState(newState);
                return newState;
            });
        },

        updateHyperspaceSettings(settings: Partial<HyperspaceSettings>) {
            update(state => {
                const newState = {
                    ...state,
                    settings: {
                        ...state.settings,
                        hyperspace: { ...state.settings.hyperspace, ...settings }
                    }
                };
                saveState(newState);
                return newState;
            });
        },

        reset() {
            set(initialState);
            if (browser) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    };
}

export const backgroundStore = createBackgroundStore();
