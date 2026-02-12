import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'evolusion_onboarding_completed';

export interface OnboardingState {
    completed: boolean;
    currentStep: number;
    skipped: boolean;
}

function createOnboardingStore() {
    const initial: OnboardingState = {
        completed: false,
        currentStep: 0,
        skipped: false
    };

    const { subscribe, set, update } = writable<OnboardingState>(initial);

    return {
        subscribe,

        init: () => {
            if (!browser) return;

            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'true') {
                set({ ...initial, completed: true });
            }
        },

        nextStep: () => {
            update(s => ({ ...s, currentStep: s.currentStep + 1 }));
        },

        prevStep: () => {
            update(s => ({ ...s, currentStep: Math.max(0, s.currentStep - 1) }));
        },

        goToStep: (step: number) => {
            update(s => ({ ...s, currentStep: step }));
        },

        skip: () => {
            update(s => ({ ...s, skipped: true }));
        },

        complete: () => {
            if (browser) {
                localStorage.setItem(STORAGE_KEY, 'true');
            }
            set({ completed: true, currentStep: 0, skipped: false });
        },

        reset: () => {
            if (browser) {
                localStorage.removeItem(STORAGE_KEY);
            }
            set(initial);
        }
    };
}

export const onboardingStore = createOnboardingStore();
