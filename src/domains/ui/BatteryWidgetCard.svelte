<script lang="ts">
	import { ha } from '../ha/store.svelte.ts';
	import { app } from '../app/store.svelte.ts';
	import Icon from '@iconify/svelte';

	let { class: className = '' } = $props<{ class?: string }>();

	let isExpanded = $state(false);

	const batteryDevices = $derived(ha.state.batteryDevices);
	const lowBatteryThreshold = $derived(app.state.lowBatteryThreshold);

	const devicesToShow = $derived(isExpanded ? batteryDevices : batteryDevices.slice(0, 4));

	function getBatteryIcon(level: number) {
		if (level <= lowBatteryThreshold) return 'mdi:battery-alert-variant-outline';
		if (level <= 10) return 'mdi:battery-10';
		if (level <= 20) return 'mdi:battery-20';
		if (level <= 30) return 'mdi:battery-30';
		if (level <= 40) return 'mdi:battery-40';
		if (level <= 50) return 'mdi:battery-50';
		if (level <= 60) return 'mdi:battery-60';
		if (level <= 70) return 'mdi:battery-70';
		if (level <= 80) return 'mdi:battery-80';
		if (level <= 90) return 'mdi:battery-90';
		return 'mdi:battery';
	}
</script>

<div class="w-full h-full flex flex-col p-4 overflow-hidden {className}">
	{#if batteryDevices.length === 0}
		<div class="w-full h-full flex flex-col items-center justify-center p-4 text-center">
			<Icon icon="mdi:battery-off-outline" class="w-10 h-10 mb-2 text-gray-400" />
			<p class="font-semibold text-gray-700">No battery devices</p>
			<p class="text-sm text-gray-500">No devices with battery levels found.</p>
		</div>
	{:else}
		<div class="flex-shrink-0 flex items-center gap-3 mb-3">
			<Icon icon="mdi:battery-heart-variant-outline" class="w-6 h-6 text-gray-400" />
			<h3 class="font-semibold text-gray-700">Battery Levels</h3>
		</div>
		<div class="flex-grow space-y-2 overflow-y-auto no-scrollbar pr-1">
			{#each devicesToShow as { deviceId, deviceName, batteryLevel } (deviceId)}
				{@const isLow = batteryLevel <= lowBatteryThreshold}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2 overflow-hidden" class:text-red-500={isLow}>
						<Icon icon={getBatteryIcon(batteryLevel)} class="w-5 h-5 flex-shrink-0" />
						<span class="truncate" title={deviceName}>{deviceName}</span>
					</div>
					<span class="font-semibold" class:text-red-500={isLow}>{batteryLevel}%</span>
				</div>
			{/each}
		</div>
		{#if batteryDevices.length > 4}
		<button
			onclick={() => (isExpanded = !isExpanded)}
			class="w-full text-center text-xs font-semibold text-blue-600 hover:underline mt-2 pt-1 flex-shrink-0"
		>
				{isExpanded ? 'Show Less' : `Show More ${batteryDevices.length - 4}`}
			</button>
		{/if}
	{/if}
</div>
