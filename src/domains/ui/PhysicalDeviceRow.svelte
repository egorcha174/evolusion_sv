<script lang="ts">
	import { Icon } from 'iconify-svelte';
	import type { PhysicalDevice, Tab } from '$lib/types';
	import DeviceIcon from './DeviceIcon.svelte';
	import AddToTabButton from './AddToTabButton.svelte';
	import { app } from '$domains/app/store.svelte';
	import { ha } from '../../domains/ha/store.svelte.ts';

	let { physicalDevice }: { physicalDevice: PhysicalDevice } = $props();

	let isExpanded = $state(false);

	let customCardDeviceId = $derived(`internal::custom-card_physdev-${physicalDevice.id}`);

	const availableTabsForDevice = $derived(
		app.tabs.filter((tab) => !tab.layout.some((item) => item.deviceId === customCardDeviceId))
	);

	function handleAddPhysicalDeviceAsCustomCard(device: PhysicalDevice, tabId: string) {
		// This function will be fully implemented in the app store
		console.log('Adding physical device to tab:', device, tabId);
	}

	function handleDeviceAddToTab(entity: any, tabId: string) {
		// This function will be fully implemented in the app store
		console.log('Adding entity to tab:', entity, tabId);
	}
</script>

<div
	class="bg-white/80 dark:bg-gray-800/80 rounded-lg ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300"
>
	<div class="flex items-center justify-between p-4 text-left">
		<button
			onclick={() => (isExpanded = !isExpanded)}
			class="flex-1 flex items-center gap-4 overflow-hidden text-left"
		>
			<Icon icon="mdi:chip" class="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />
			<div class="flex-1 overflow-hidden">
				<p class="font-semibold text-gray-900 dark:text-gray-100">{physicalDevice.name}</p>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{physicalDevice.entities.length} сущ.
				</p>
			</div>
			<Icon
				icon="mdi:chevron-down"
				class={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
			/>
		</button>
		<div class="ml-4 flex-shrink-0">
			<AddToTabButton
				availableTabs={availableTabsForDevice}
				onAddToTab={(tabId) => handleAddPhysicalDeviceAsCustomCard(physicalDevice, tabId)}
				buttonText="Добавить целиком"
			/>
		</div>
	</div>

	{#if isExpanded}
		<div class="border-t border-gray-300/50 dark:border-gray-700/50 p-4 space-y-3">
			{#each physicalDevice.entities as entity}
				{@const isOn = entity.state === 'on'}
				{@const availableTabsForEntity = app.tabs.filter(
					(tab) => !tab.layout.some((item) => item.deviceId === entity.id)
				)}
				<div
					class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md flex items-center justify-between"
				>
					<div class="flex items-center gap-3 overflow-hidden">
						<div class={`w-8 h-8 flex-shrink-0 ${isOn ? 'text-blue-500' : 'text-gray-400'}`}>
							<DeviceIcon icon={entity.icon ?? entity.type} {isOn} class="!w-full !h-full !m-0" />
						</div>
						<div class="flex-1 overflow-hidden">
							<p class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
								{entity.name}
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{entity.status}</p>
						</div>
					</div>
					<div class="flex-shrink-0">
						<AddToTabButton
							availableTabs={availableTabsForEntity}
							onAddToTab={(tabId) => handleDeviceAddToTab(entity, tabId)}
							buttonText="Добавить сущность"
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
