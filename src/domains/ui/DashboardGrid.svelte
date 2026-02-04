<script lang="ts">
    import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit-svelte/core';
    import { closestCenter, pointerWithin } from '@dnd-kit/core';
    import { PointerSensor } from '@dnd-kit/core';
    import DeviceCard from './DeviceCard.svelte';
    import DraggableDevice from './DraggableDevice.svelte'; // Import the new component
    import DroppableCell from './DroppableCell.svelte';     // Import the new component
    import { app } from '../app/store.svelte.ts';
    import type { Tab, Device, GridLayoutItem, ThemeColors } from '$lib/types';
    import { ha } from '../ha/store.svelte.ts';

    const {
        tab,
        isEditMode = false,
        searchTerm,
        onDeviceLayoutChange,
        onEditDevice,
    } = $props<{
        tab: Tab;
        isEditMode?: boolean;
        searchTerm: string;
        onDeviceLayoutChange: (tabId: string, newLayout: GridLayoutItem[]) => void;
        onEditDevice: (device: Device) => void;
    }>();

    const allKnownDevices = ha.allKnownDevices;
    const cols = $derived(tab.gridSettings.cols || 8);
    const rows = $derived(tab.gridSettings.rows || 5);

    let activeId: string | null = $state(null);

    const sensors = [
        {
            id: 'pointer',
            sensor: PointerSensor,
            options: {
                activationConstraint: {
                    distance: 8,
                },
            },
        },
    ];

    const handleDragStart = (event: DragStartEvent) => {
        activeId = event.active.id as string;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        activeId = null;

        if (!over) return;

        const overId = over.id as string;
        if (!overId.startsWith('cell-')) return;

        const parts = overId.split('-');
        const destCol = parseInt(parts[1]);
        const destRow = parseInt(parts[2]);

        const deviceId = active.id as string;
        const currentItem = tab.layout.find((item: GridLayoutItem) => item.deviceId === deviceId);

        if (!currentItem) return;
        
        const newLayoutItem = { ...currentItem, col: destCol, row: destRow };
        
        const itemToCheck = {
            ...newLayoutItem,
            width: newLayoutItem.width || 1,
            height: newLayoutItem.height || 1
        } as { col: number; row: number; width: number; height: number; };
        
        const hasCollision = app.checkCollision(tab.layout, itemToCheck, tab.gridSettings, deviceId);
        
        if (!hasCollision) {
            const newLayout = tab.layout.map((item: GridLayoutItem) =>
                item.deviceId === deviceId ? newLayoutItem : item
            );
            onDeviceLayoutChange(tab.id, newLayout);
        }
    };
    const activeDevice = $derived(activeId ? allKnownDevices.get(activeId) : null);

    // Filter layout based on searchTerm, similar to Fusion
    const filteredLayout: GridLayoutItem[] = $derived(
        searchTerm
            ? tab.layout.filter((item: GridLayoutItem) => {
                  const dev = allKnownDevices.get(item.deviceId);
                  return dev && dev.name.toLowerCase().includes(searchTerm.toLowerCase());
              })
            : tab.layout
    );

    let currentColorScheme: ThemeColors = $state(
        app.state.themeMode === 'night' || (app.state.themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? app.state.colorScheme.dark
            : app.state.colorScheme.light
    );

    $effect(() => {
        currentColorScheme = app.state.themeMode === 'night' || (app.state.themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? app.state.colorScheme.dark
            : app.state.colorScheme.light;
    });
</script>

<DndContext
    collisionDetection={pointerWithin}
>
    <div 
        class="w-full h-full overflow-hidden no-scrollbar dashboard-grid"
    >
        <div
          class="grid gap-3 h-full"
          style="
            grid-template-columns: repeat({cols}, minmax(0, 1fr));
            grid-template-rows: repeat({rows}, minmax(0, 1fr));
          "
        >
          {#if isEditMode}
            {#each Array(cols * rows) as _, index}
              {@const col = index % cols}
              {@const row = Math.floor(index / cols)}
              <div
                style="grid-column-start: {col + 1}; grid-row-start: {row + 1};"
                class="z-0 pointer-events-auto"
              >
                <DroppableCell {col} {row} {isEditMode}>
                  <div class="w-full h-full border border-dashed border-gray-300 dark:border-gray-700 rounded-xl opacity-50"></div>
                </DroppableCell>
              </div>
            {/each}
          {/if}

          {#each filteredLayout as item: GridLayoutItem (item.deviceId)}
            {@const device = allKnownDevices.get(item.deviceId)}
            {#if device}
              {@const template = app.getTemplateForDevice(device)}
              {@const width = item.width || template?.width || 1}
              {@const height = item.height || template?.height || 1}
              <div
                style="
                  grid-column: {item.col + 1} / span {width};
                  grid-row: {item.row + 1} / span {height};
                "
                class="z-10"
              >
                <DraggableDevice {device} {isEditMode}>
                  <DeviceCard
                    entityId={device.id}
                    cardWidth={width}
                    cardHeight={height}
                    template={template || undefined}
                    {isEditMode}
                    colorScheme={currentColorScheme}
                    onedit={() => onEditDevice(device)}
                  />
                </DraggableDevice>
              </div>
            {/if}
          {/each}
        </div>
    </div>
    <DragOverlay style="transform-origin: 0 0; z-index: 100;">
        {#if activeDevice}
            {@const template = app.getTemplateForDevice(activeDevice)}
            {@const item = tab.layout.find((i: GridLayoutItem) => i.deviceId === activeDevice.id)}
            {@const width = item?.width || template?.width || 1}
            {@const height = item?.height || template?.height || 1}
            <div class="w-full h-full opacity-90 shadow-2xl scale-105">
                <DeviceCard
                    entityId={activeDevice.id}
                    cardWidth={width}
                    cardHeight={height}
                    template={template || undefined}
                    isEditMode={false}
                    colorScheme={currentColorScheme}
                />
            </div>
        {/if}
    </DragOverlay>
</DndContext>
