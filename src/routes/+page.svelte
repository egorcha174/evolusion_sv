<script lang="ts">
	import DashboardGrid from '../domains/ui/DashboardGrid.svelte';
	import WeatherWidget from '../domains/ui/WeatherWidget.svelte';
	import BatteryWidgetCard from '../domains/ui/BatteryWidgetCard.svelte';
	import DeviceSettingsModal from '../domains/ui/DeviceSettingsModal.svelte'; // Import the modal
	import { ha } from '../domains/ha/store.svelte.ts';
	import { app } from '../domains/app/store.svelte.ts';
	import Icon from '@iconify/svelte';

	$effect(() => {
		// Initialize dashboard items if empty
		if (app.state.dashboardItems.length === 0 && ha.state.entities.size > 0) {
			app.setDashboardItems([...ha.state.entities.keys()]);
		}
	});

	let isEditMode = $state(false); 

	function handleEdit(entityId: string) {
        const device = ha.allKnownDevices.get(entityId);
        if (device) {
		    app.setEditingDevice(device);
        }
	}

	function handleCloseModal() {
		app.setEditingDevice(null);
	}
</script>

<div class="p-4">
	<div class="flex items-center justify-end mb-4">
		<button
			onclick={() => (isEditMode = !isEditMode)}
			class="flex items-center gap-1 px-3 py-1 rounded-md transition-colors {isEditMode
				? 'bg-red-500 text-white hover:bg-red-600'
				: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
		>
			<Icon icon="mdi:pencil" class="w-4 h-4" />
			{isEditMode ? 'Exit Edit Mode' : 'Edit Dashboard'}
		</button>
	</div>

	<div class="mb-4 flex gap-4">
		<WeatherWidget class="flex-1" />
		<BatteryWidgetCard class="flex-1" />
	</div>

	{#if app.state.dashboardItems.length > 0}
		<DashboardGrid {isEditMode} onedit={handleEdit} />
	{:else}
		<p class="text-center text-gray-500 mt-8">No items on dashboard. Connect to Home Assistant and add some devices.</p>
	{/if}
</div>

{#if app.state.editingDevice}
	<DeviceSettingsModal device={app.state.editingDevice} onClose={handleCloseModal} />
{/if}
