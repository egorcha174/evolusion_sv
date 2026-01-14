<script lang="ts">
	import { ha } from '../../domains/ha/store.svelte.ts';
	import PhysicalDeviceRow from '../../domains/ui/PhysicalDeviceRow.svelte';
	import type { RoomWithPhysicalDevices } from '$lib/types';

	let searchTerm = $state('');

	const filteredRooms = $derived.by(() => {
		if (!searchTerm) return ha.allRoomsWithPhysicalDevices;
		const lowercasedFilter = searchTerm.toLowerCase();

		const filtered: RoomWithPhysicalDevices[] = [];

		for (const room of ha.allRoomsWithPhysicalDevices) {
			const filteredDevices = room.devices.filter(
				(pDevice) =>
					pDevice.name.toLowerCase().includes(lowercasedFilter) ||
					pDevice.entities.some(
						(entity) =>
							entity.name.toLowerCase().includes(lowercasedFilter) ||
							entity.id.toLowerCase().includes(lowercasedFilter)
					)
			);

			if (filteredDevices.length > 0) {
				filtered.push({ ...room, devices: filteredDevices });
			}
		}

		return filtered;
	});
</script>

<div class="container mx-auto p-4">
	<h1 class="text-3xl font-bold mb-4">Все устройства</h1>
	<p class="text-gray-500 dark:text-gray-400 mb-6 max-w-2xl">
		Здесь показаны все физические устройства, обнаруженные в Home Assistant. Вы можете добавить
		устройство целиком (будет создана кастомная карточка) или добавить на дашборд любую из его
		сущностей по-отдельности.
	</p>

	<div class="mb-8">
		<input
			type="text"
			bind:value={searchTerm}
			placeholder="Поиск по устройствам и сущностям..."
			class="w-full max-w-lg p-2 rounded-md bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
		/>
	</div>

	<div class="space-y-10">
		{#if filteredRooms.length > 0}
			{#each filteredRooms as room (room.id)}
				<section>
					<h2
						class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-300 dark:border-gray-700 pb-2"
					>
						{room.name}
					</h2>
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{#each room.devices as physicalDevice (physicalDevice.id)}
							<PhysicalDeviceRow {physicalDevice} />
						{/each}
					</div>
				</section>
			{/each}
		{:else}
			<p class="text-gray-500 dark:text-gray-400">
				Устройства, соответствующие вашему запросу, не найдены.
			</p>
		{/if}
	</div>
</div>