import { writable } from 'svelte/store';
import type { CardTemplate, CardElement } from '$lib/types';

export interface TemplateEditorState {
  isDirty: boolean;
  selectedElementId: string | null;
  // Dragging state
  draggingId: string | null;
  dragStartX: number;
  dragStartY: number;
  elementStartX: number;
  elementStartY: number;
}

function createTemplateEditorStore() {
  const { subscribe, set, update } = writable<TemplateEditorState>({
    isDirty: false,
    selectedElementId: null,
    draggingId: null,
    dragStartX: 0,
    dragStartY: 0,
    elementStartX: 0,
    elementStartY: 0,
  });

  return {
    subscribe,

    reset() {
      set({
        isDirty: false,
        selectedElementId: null,
        draggingId: null,
        dragStartX: 0,
        dragStartY: 0,
        elementStartX: 0,
        elementStartY: 0,
      });
    },

    selectElement(id: string | null) {
      update((s) => ({ ...s, selectedElementId: id }));
    },

    startDrag(id: string, clientX: number, clientY: number, currentX: number, currentY: number) {
      update((s) => ({
        ...s,
        draggingId: id,
        selectedElementId: id, // Auto select on drag
        dragStartX: clientX,
        dragStartY: clientY,
        elementStartX: currentX,
        elementStartY: currentY,
      }));
    },

    // Returns the new position delta to apply (does not mutate store state itself, UI handles it)
    getDragDelta(clientX: number, clientY: number) {
      // Calculation usually happens in the component to update the template object directly
      return { x: clientX, y: clientY };
    },

    stopDrag() {
      update((s) => ({ ...s, draggingId: null }));
    },
  };
}

export const templateEditorState = createTemplateEditorStore();
