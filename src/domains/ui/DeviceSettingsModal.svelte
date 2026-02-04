<script lang="ts">
	import { app } from '../app/store.svelte.ts';
	import { ha } from '../ha/store.svelte.ts';
	import type { Device, DeviceCustomization, DeviceBinding, ThresholdRule, CardTemplate } from '$lib/types';
	import { DeviceType } from '$lib/types';
	import { getIconForDeviceType, icons } from '$lib/utils/ha-data-mapper';
	import DeviceIcon from './DeviceIcon.svelte';
	import Icon from '@iconify/svelte';

	let { device, onClose }: { device: Device; onClose: () => void } = $props();

	// Reactive derived state for customization
	const customization = $derived(app.state.customizations.get(device.id) || {});

	// Use $state for editable values, initialized with defaults and updated via effect
	let name = $state('');
	let type = $state(DeviceType.Unknown);
	let icon = $state('');
	let isHidden = $state(false);
	let templateId = $state('');
	let iconAnimation = $state('none');
	let bindings = $state<DeviceBinding[]>([]);
	let thresholds = $state<ThresholdRule[]>([]);

	// Update local state when the 'device' prop changes
	$effect(() => {
		name = customization.name ?? device.name;
		type = customization.type ?? device.type;
		icon = customization.icon ?? getIconForDeviceType(type, undefined);
		isHidden = customization.isHidden ?? false;
		templateId = customization.templateId ?? '';
		iconAnimation = customization.iconAnimation ?? 'none';
		bindings = customization.deviceBindings ?? [];
		thresholds = customization.thresholds ?? [];
	});

	function handleTypeChange(newType: DeviceType) {
		type = newType;
		icon = getIconForDeviceType(newType, undefined);
	}

	function handleSave() {
		app.handleSaveCustomization(device, {
			name: name.trim(),
			type,
			icon,
			isHidden,
			templateId,
			iconAnimation,
			deviceBindings: bindings,
			thresholds: thresholds
		});
		onClose();
	}
</script>

<div
	class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
	onclick={onClose}
	onkeydown={(e) => { if (e.key === 'Escape') onClose(); }}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
			<div
				class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md ring-1 ring-black/5 dark:ring-white/10"
				onclick={(e) => e.stopPropagation()}
				role="document"
				tabindex="-1"
			>		<div class="p-6 border-b border-gray-200 dark:border-gray-700">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white">Настроить устройство</h2>
			<p class="text-sm text-gray-500 dark:text-gray-400">{device.name}</p>
		</div>

		<div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
			<div>
				<label for="deviceName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>Название</label
				>
				<input
					id="deviceName"
					type="text"
					bind:value={name}
					class="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<div>
				<label for="deviceType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>Тип устройства</label
				>
				<select
					id="deviceType"
					bind:value={type}
					onchange={(e) => handleTypeChange(Number(e.currentTarget.value))}
					class="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
				>
					{#each Object.keys(DeviceType).filter((key) => !isNaN(Number(key))) as key}
						<option value={key}>{DeviceType[key as any]}</option>
					{/each}
				</select>
			</div>
		</div>

		<div
			class="p-6 flex justify-end gap-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-b-2xl border-t border-gray-200 dark:border-gray-700"
		>
			<button
				onclick={onClose}
				class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
				>Отмена</button
			>
			<button
				onclick={handleSave}
				class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
				>Сохранить</button
			>
		</div>
	</div>
</div>