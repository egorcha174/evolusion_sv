
import { writable } from 'svelte/store';
import type { ThemeFile } from '../../../themes/types';

interface ThemeEditorState {
    isOpen: boolean;
    draft: ThemeFile | null;
    onSave: ((theme: ThemeFile) => void) | null;
}

const initialState: ThemeEditorState = {
    isOpen: false,
    draft: null,
    onSave: null
};

function createEditorStore() {
    const { subscribe, set, update } = writable<ThemeEditorState>(initialState);

    return {
        subscribe,
        open: (theme: ThemeFile, onSave: (theme: ThemeFile) => void) => {
            // Create a deep copy to ensure we don't mutate original state until save
            const draft = JSON.parse(JSON.stringify(theme));

            // Ensure layout exists if missing (migration safety)
            if (draft.theme && !draft.theme.layout) {
                draft.theme.layout = {
                    cardBorderRadius: 12,
                    cardBorderWidth: 0,
                    iconBackgroundShape: 'circle'
                };
            }

            set({
                isOpen: true,
                draft,
                onSave
            });
        },
        close: () => {
            set(initialState);
        },
        save: () => {
            update(s => {
                if (s.draft && s.onSave) {
                    s.onSave(s.draft);
                }
                return initialState; // Close after save
            });
        }
    };
}

export const themeEditorStore = createEditorStore();
