<script lang="ts">
  import { useDraggable } from '@dnd-kit-svelte/core';
  import type { Device } from '$lib/types';
  import type { Snippet } from 'svelte';

  const { device, isEditMode, children } = $props<{
    device: Device;
    isEditMode: boolean;
    children: Snippet;
  }>();

  const draggable = useDraggable({
    id: () => device.id,
    disabled: () => !isEditMode,
    data: () => ({ device }),
  });

  const style = $derived(
    `
    opacity: ${draggable.isDragging.current ? 0.3 : 1};
    ${draggable.transform.current ? `transform: translate3d(${draggable.transform.current.x}px, ${draggable.transform.current.y}px, 0);` : ''}
    height: 100%;
    width: 100%;
    cursor: ${isEditMode ? 'grab' : 'default'};
    touch-action: none;
  `
  );
</script>

<div use:draggable.setNodeRef {...draggable.attributes.current} {...draggable.listeners.current} style={style}>
  {@render children()}
</div>
