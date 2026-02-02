
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { BackgroundState, BackgroundEffectType, AuroraSettings, TronSettings } from './types';

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
    beamSpeed: 3
};

const STORAGE_KEY = 'evolusion_background_settings';

const initialState: BackgroundState = {
    effectType: 'none',
    settings: {
        aurora: DEFAULT_AURORA,
        tron: DEFAULT_TRON
    }
};

function createBackgroundStore() {
    const { subscribe, set, update } = writable<BackgroundState>(initialState);

    return {
        subscribe,

        init() {
            if (!browser) return;

            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored) as BackgroundState;
                    // Merge with defaults to ensure new settings exist
                    set({
                        ...initialState,
                        ...data,
                        settings: {
                            ...initialState.settings,
                            ...data.settings,
                            tron: { ...initialState.settings.tron, ...(data.settings?.tron || {}) }
                        }
                    });
                }
            } catch (e) {
                console.error('Failed to load background settings', e);
            }
        },

        setEffect(effectType: BackgroundEffectType) {
            update(state => {
                const newState = { ...state, effectType };
                if (browser) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
                }
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
                if (browser) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
                }
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
                if (browser) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
                }
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
