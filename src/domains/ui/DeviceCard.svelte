<script lang="ts">
	import { ha } from '../ha/store.svelte.ts';
	import { entityToDevice } from '$lib/utils/ha-data-mapper';
	import type { Device, CardTemplate } from '$lib/types';
	import { DeviceType } from '$lib/types';
	import DeviceIcon from './DeviceIcon.svelte';
	import Icon from '@iconify/svelte';
	import SparklineChart from './SparklineChart.svelte';
	import ThermostatDial from './ThermostatDial.svelte';
	import EventTimerWidgetCard from './EventTimerWidgetCard.svelte';
	import BatteryWidgetCard from './BatteryWidgetCard.svelte';
	import { app } from '../app/store.svelte.ts';

	const {
		entityId,
		isEditMode = false,
		isPreview = false,
		template = null,
		onedit
	} = $props<{
		entityId: string;
		isEditMode?: boolean;
		isPreview?: boolean;
		template?: CardTemplate | null;
		onedit?: (id: string) => void;
	}>();

	let isLoading = $state(false);

	// Mock device for preview mode
	const previewDevice: Device = {
		id: 'preview',
		name: 'Preview Device',
		type: 1, // Light
		state: 'on',
		status: 'Active',
		haDomain: 'light',
		brightness: 75,
		temperature: 22,
		unit: '°C'
	};

	const entity = $derived(ha.state.entities.get(entityId));
	const device: Device | null = $derived(
		isPreview
			? previewDevice
			: entity
				? entityToDevice(entity, ha.state.customizations.get(entityId))
				: null
	);

	const isOn = $derived.by(() => {
		if (!device) return false;
		if (device.type === DeviceType.Climate)
			return device.hvacAction !== 'off' && device.hvacAction !== 'idle';
		return ['on', 'active', 'home', 'open', 'playing', 'streaming', 'recording'].includes(device.state);
	});

	const colorScheme = $derived(app.state.themeMode === 'night' ? app.state.colorScheme.dark : app.state.colorScheme.light);

	function handleToggle(e: MouseEvent) {
		if (isEditMode || isPreview) return;
		e.stopPropagation();

		if (!device || !ha.state.connection) return;
		if ([DeviceType.Sensor, DeviceType.Weather].includes(device.type)) return;

		isLoading = true;
		const domain = device.haDomain;
		let service = 'toggle';

		if (domain === 'scene') service = 'turn_on';
		if (domain === 'lock') service = isOn ? 'unlock' : 'lock';

		ha.state.connection.callService(domain, service, {
			entity_id: device.id
		});

		setTimeout(() => { isLoading = false; }, 2000);
	}

	function handleBrightnessChange(val: number) {
		if (device) ha.setBrightness(device.id, val);
	}

	function handleTemperatureChange(val: number) {
		if (device) ha.setTemperature(device.id, val);
	}

	const cardStyle = $derived.by(() => {
		if (!device) return '';
		
		let style = `border-radius: ${colorScheme.cardBorderRadius}px; transition: background-color 0.3s ease;`;
		
		if (device.type === DeviceType.MediaPlayer && (device.state === 'playing' || device.state === 'paused') && device.entityPictureUrl) {
			style += `background-size: cover; background-position: center; background-image: url(${device.entityPictureUrl});`;
		} else {
			style += `background-color: ${isOn ? colorScheme.cardBackgroundOn : colorScheme.cardBackground}; backdrop-filter: blur(16px);`;
		}
		
		return style;
	});

</script>

{#if device}
	{#if device.type === DeviceType.EventTimer}
		<EventTimerWidgetCard {device} {colorScheme} />
	{:else if device.type === DeviceType.BatteryWidget}
		<div style={cardStyle} class="w-full h-full select-none">
			<BatteryWidgetCard {colorScheme} />
		</div>
	{:else}
		<div
			class="w-full h-full p-4 rounded-lg shadow flex flex-col justify-between relative overflow-hidden select-none"
			style={cardStyle}
			role="button"
			tabindex="0"
			onclick={handleToggle}
			onkeydown={(e) => e.key === 'Enter' && handleToggle(e as any)}
		>
			{#if template}
				{#each template.elements.sort((a, b) => a.zIndex - b.zIndex) as element (element.uniqueId)}
					{#if element.visible}
												<div
													class="absolute flex items-center justify-center overflow-hidden"
													class:pointer-events-none={!['slider', 'target-temperature'].includes(element.id)}
													style="
														left: {element.position.x}%;
														top: {element.position.y}%;
														width: {element.size.width}%;
														height: {element.size.height}%;
														transform: translate(-50%, -50%);
														z-index: {element.zIndex + 10};
														font-size: {element.styles.fontSize}px;
														color: {isOn ? (element.styles.onColor || element.styles.color || '') : (element.styles.color || '')};
														text-align: {element.styles.textAlign || 'center'};
														font-family: {element.styles.fontFamily};
													"
												>
													{#if element.id === 'name'}
														<span style="color: {isOn ? (colorScheme.nameTextColorOn || 'var(--text-name-on)') : (colorScheme.nameTextColor || 'var(--text-name)')}">
															{device.name}
														</span>
													{:else if element.id === 'icon'}
														{@const iconBg = isOn ? element.styles.iconBackgroundColorOn : element.styles.iconBackgroundColorOff}
														<div
															style="
																background-color: {iconBg || 'transparent'};
																border-radius: {iconBg ? '50%' : '0'};
																width: 100%;
																height: 100%;
																display: flex;
																align-items: center;
																justify-content: center;
																transition: background-color 0.3s ease;
															"
														>
															{#if isLoading}
																<Icon icon="mdi:loading" class="animate-spin" style="width: 60%; height: 60%;" />
															{:else}
																<div style="width: {iconBg ? '60%' : '100%'}; height: {iconBg ? '60%' : '100%'};">
																	<DeviceIcon
																		icon={device.icon}
																		{isOn}
																		class="!w-full !h-full !m-0"
																		iconAnimation={device.iconAnimation}
																	/>
																</div>
															{/if}
														</div>
													{:else if element.id === 'value'}
														<span style="color: {isOn ? (colorScheme.valueTextColorOn || 'var(--text-value-on)') : (colorScheme.valueTextColor || 'var(--text-value)')}">
															{device.state}
														</span>
													{:else if element.id === 'status'}
														<span style="color: {isOn ? (colorScheme.statusTextColorOn || 'var(--text-status-on)') : (colorScheme.statusTextColor || 'var(--text-status)')}">
															{device.status}
														</span>
													{:else if element.id === 'unit'}
														<span style="color: {isOn ? (colorScheme.unitTextColorOn || 'var(--text-unit-on)') : (colorScheme.unitTextColor || 'var(--text-unit)')}">
															{device.unit || ''}
														</span>
													{:else if element.id === 'slider'}
														{#if device.type === DeviceType.Light || device.type === DeviceType.DimmableLight}
															<input
																type="range"
																min="0"
																max="100"
																value={device.brightness || 0}
																oninput={(e) => handleBrightnessChange(parseInt(e.currentTarget.value))}
						                                        onclick={(e) => e.stopPropagation()}
																class="w-full h-full accent-blue-500 cursor-pointer"
															/>
														{/if}
													{:else if element.id === 'chart'}
														<SparklineChart
															data={device.history || []}
															width={100}
															height={30}
															strokeColor={isOn ? (colorScheme.valueTextColorOn || 'var(--text-value-on)') : (colorScheme.valueTextColor || 'var(--text-value)')}
														/>
													{:else if element.id === 'target-temperature'}
														{#if device.type === DeviceType.Thermostat}
															<ThermostatDial
																min={device.minTemp || 7}
																max={device.maxTemp || 35}
																value={device.targetTemperature || 20}
																current={device.temperature || 0}
																onChange={handleTemperatureChange}
																hvacAction={device.hvacAction || 'off'}
																colorScheme={colorScheme}
																idleLabelColor={element.styles.idleLabelColor}
																heatingLabelColor={element.styles.heatingLabelColor}
																coolingLabelColor={element.styles.coolingLabelColor}
						                                        onclick={(e) => e.stopPropagation()}
															/>
														{/if}
													{/if}
												</div>					{/if}
				{/each}
			{:else}
			<!-- Default Layout -->
			<div class="flex items-center justify-between">
				<h3 class="font-bold">{device.name}</h3>
				{#if device.icon}
					<DeviceIcon
						icon={device.icon}
						class="w-8 h-8 {isOn ? 'text-yellow-500' : 'text-gray-400'}"
					/>
				{/if}
			</div>
			<div>
				<p class="text-sm text-gray-600">{device.status}</p>
				<div class="text-xs text-gray-400">
					{device.id}
				</div>
			</div>
		{/if}

		{#if isEditMode}
			<button
				onclick={(e) => {
					e.stopPropagation();
					if (onedit) onedit(entityId);
				}}
				class="absolute top-2 right-2 p-1 bg-gray-200/80 dark:bg-gray-700/80 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 z-10"
			>
				<Icon icon="mdi:pencil" class="w-4 h-4" />
			</button>
		{/if}
	</div>
	{/if}
{/if}
