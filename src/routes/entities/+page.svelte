<script lang="ts">
	import { ha } from '../../domains/ha/store.svelte.ts';
	import type { Device, HassEntity, Tab } from '$lib/types';
	import AddToTabButton from '../../domains/ui/AddToTabButton.svelte';
	import DeviceIcon from '../../domains/ui/DeviceIcon.svelte';
	import { app } from '../../domains/app/store.svelte.ts';

	let searchTerm = $state('');

	const allEntitiesAsDevices = $derived.by(() => {
		const devices: Device[] = [];
		for (const entity of ha.state.entities.values()) {
			const device = ha.allKnownDevices.get(entity.entity_id);
			if (device) {
				devices.push(device);
			}
		}
		return devices.sort((a, b) => a.name.localeCompare(b.name));
	});

	const filteredEntities = $derived.by(() => {
		if (!searchTerm) return allEntitiesAsDevices;
		const lowercasedFilter = searchTerm.toLowerCase();
		return allEntitiesAsDevices.filter(
			(device) =>
				device.name.toLowerCase().includes(lowercasedFilter) ||
				device.id.toLowerCase().includes(lowercasedFilter) ||
				device.status.toLowerCase().includes(lowercasedFilter)
		);
	});

	function handleDeviceAddToTab(entity: Device, tabId: string) {
		app.handleDeviceAddToTab(entity, tabId);
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="text-3xl font-bold mb-4">Все сущности Home Assistant</h1>
	<p class="text-gray-500 dark:text-gray-400 mb-6 max-w-2xl">
		Здесь показаны все сущности, обнаруженные в Home Assistant. Вы можете добавить любую из них
		на дашборд.
	</p>

	<div class="mb-8">
		<input
			type="text"
			bind:value={searchTerm}
			placeholder="Поиск по сущностям..."
			class="w-full max-w-lg p-2 rounded-md bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
		/>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#if filteredEntities.length > 0}
			{#each filteredEntities as device (device.id)}
				{@const availableTabsForEntity = app.tabs.filter(
					(tab) => !tab.layout.some((item) => item.deviceId === device.id)
				)}
				<div
					class="bg-white/80 dark:bg-gray-800/80 rounded-lg ring-1 ring-black/5 dark:ring-white/5 p-4 flex items-center justify-between"
				>
					<div class="flex items-center gap-4 overflow-hidden">
						<div class={`w-8 h-8 flex-shrink-0 ${device.state === 'on' ? 'text-blue-500' : 'text-gray-400'}`}>
							<DeviceIcon icon={device.icon ?? String(device.type)} class="!w-full !h-full !m-0" />
						</div>
						<div class="flex-1 overflow-hidden">
							<p class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{device.name}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{device.status}</p>
						</div>
					</div>
					<div class="flex-shrink-0">
						<AddToTabButton
							availableTabs={availableTabsForEntity}
							onAddToTab={(tabId) => handleDeviceAddToTab(device, tabId)}
							buttonText="Добавить"
						/>
					</div>
				</div>
			{/each}
		{:else}
			<p class="text-gray-500 dark:text-gray-400 col-span-full">
				Сущности, соответствующие вашему запросу, не найдены.
			</p>
		{/if}
	</div>
</div>