<script lang="ts">
	import { ha } from '../ha/store.svelte.ts';
	import { entityToDevice } from '$lib/utils/ha-data-mapper';
	import type { Device, CardTemplate, ThemeColors, CardElement } from '$lib/types';
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
		cardWidth = 1,
		cardHeight = 1,
		colorScheme,
		onedit
	} = $props<{
		entityId: string;
		isEditMode?: boolean;
		isPreview?: boolean;
		template?: CardTemplate | null;
		cardWidth?: number;
		cardHeight?: number;
		colorScheme: ThemeColors;
		onedit?: (id: string) => void;
	}>();

	let isLoading = $state(false);

	// Mock device for preview mode
	const previewDevice: Device = {
		id: 'preview',
		name: 'Preview Device',
		type: DeviceType.Light,
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
				? entityToDevice(entity, app.state.customizations.get(entityId))
				: null
	);

	$effect(() => {
		// Reset loading state when device state changes, but only if not in preview
		if (!isPreview) {
			isLoading = false;
		}
	});

	$effect(() => {
		let timeout: ReturnType<typeof setTimeout>;
		if (isLoading) {
			timeout = setTimeout(() => (isLoading = false), 2000); // Safety timeout
		}
		return () => clearTimeout(timeout);
	});


	const isOn = $derived.by(() => {
		if (!device) return false;
		if (device.type === DeviceType.Climate)
			return device.hvacAction !== 'off' && device.hvacAction !== 'idle';
		return ['on', 'active', 'home', 'open', 'playing', 'streaming', 'recording'].includes(device.state);
	});

	function handleToggle(e: MouseEvent) {
		if (isEditMode || isPreview || !device) return;
		e.stopPropagation();

		if ([DeviceType.Sensor, DeviceType.Weather].includes(device.type)) return;

		isLoading = true;
		ha.toggle(device.id);
	}

	function handleBrightnessChange(val: number) {
		if (device) ha.setBrightness(device.id, val);
	}

	function handleTemperatureChange(val: number) {
		if (device) ha.setTemperature(device.id, val);
	}

	function handleHvacModeChange(mode: string) {
		if (device) ha.setHvacMode(device.id, mode);
	}

	const cardStyle = $derived.by(() => {
		if (!device) return '';
		
		let style = `border-radius: ${colorScheme.cardBorderRadius}px; transition: background-color 0.3s ease, border-color 0.3s ease; border-width: 1px; border-style: solid; border-color: ${isOn ? 'var(--border-color-card-on)' : 'var(--border-color-card)'};`;
		
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
				{#each template.elements.sort((a: CardElement, b: CardElement) => a.zIndex - b.zIndex) as element (element.uniqueId)}
					{#if element.visible}
						{@const finalWidth = (element.sizeMode === 'cell' && cardWidth > 0 && cardHeight > 0) ? (element.size.width / cardWidth) : element.size.width}
						{@const finalHeight = (element.sizeMode === 'cell' && cardWidth > 0 && cardHeight > 0) ? (element.size.height / cardHeight) : element.size.height}
						<div
							class="absolute flex items-center overflow-hidden"
							class:justify-center={!['name', 'status', 'value', 'unit'].includes(element.id)}
							class:justify-start={['name', 'status', 'value', 'unit'].includes(element.id) && element.styles.textAlign === 'left'}
							class:justify-end={['name', 'status', 'value', 'unit'].includes(element.id) && element.styles.textAlign === 'right'}
							class:pointer-events-none={!['slider', 'target-temperature', 'temperature-slider', 'hvac-modes'].includes(element.id)}
							style="
								left: {element.position.x}%;
								top: {element.position.y}%;
								width: {finalWidth}%;
								height: {finalHeight}%;
								transform: translate(-50%, -50%);
								z-index: {element.zIndex + 10};
								font-size: {element.styles.fontSize}px;
								color: {isOn ? (element.styles.onColor || element.styles.color || 'inherit') : (element.styles.color || 'inherit')};
								text-align: {element.styles.textAlign || 'center'};
								font-family: {element.styles.fontFamily};
							"
						>
							{#if element.id === 'name'}
								<span class="truncate" style="color: {isOn ? (colorScheme.nameTextColorOn || 'var(--text-name-on)') : (colorScheme.nameTextColor || 'var(--text-name)')}">
									{device.name}
								</span>
							{:else if element.id === 'icon'}
								{@const iconBg = isOn ? (element.styles.iconBackgroundColorOn ?? colorScheme.iconBackgroundColorOn) : (element.styles.iconBackgroundColorOff ?? colorScheme.iconBackgroundColorOff)}
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
										<div style="width: {iconBg ? '60%' : '100%'}; height: {iconBg ? '60%' : '100%'}; color: {isOn ? element.styles.onColor : element.styles.offColor}">
											<DeviceIcon
												icon={device.icon || ''}
												class="!w-full !h-full !m-0"
											/>
										</div>
									{/if}
								</div>
							{:else if element.id === 'value'}
								<span class="truncate" style="color: {isOn ? (colorScheme.valueTextColorOn || 'var(--text-value-on)') : (colorScheme.valueTextColor || 'var(--text-value)')}">
									{device.state}
								</span>
							{:else if element.id === 'status'}
								<span class="truncate" style="color: {isOn ? (colorScheme.statusTextColorOn || 'var(--text-status-on)') : (colorScheme.statusTextColor || 'var(--text-status)')}">
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
									/>
								{/if}
							{:else if element.id === 'hvac-modes'}
								{#if device.type === DeviceType.Thermostat && device.hvacModes}
									{@const modesToShow = device.hvacModes.filter(m => ['heat', 'cool', 'auto', 'heat_cool', 'off'].includes(m))}
									{@const modeLabels: {[key: string]: string} = {
										'heat': 'Heat',
										'cool': 'Cool',
										'auto': 'Auto',
										'heat_cool': 'Auto',
										'off': 'Off'
									}}
									<div class="flex items-center justify-around gap-2 w-full h-full" onclick={(e) => e.stopPropagation()}>
										{#each modesToShow as mode (mode)}
											<button
												onclick={() => handleHvacModeChange(mode)}
												class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-all flex-1
													{device.state === mode
														? 'bg-white/90 text-slate-800 shadow-sm'
														: 'bg-white/10 text-white/80 hover:bg-white/20'}"
											>
												{modeLabels[mode] || mode}
											</button>
										{/each}
									</div>
								{/if}
							{:else if element.id === 'temperature-slider'}
								{#if device.type === DeviceType.Thermostat}
									{@const min = device.minTemp || 7}
									{@const max = device.maxTemp || 35}
									{@const value = device.targetTemperature || min}
									{@const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100}
									<div class="thermostat-slider-container w-full h-full" onclick={(e) => e.stopPropagation()}>
										<input
											type="range"
											min={min}
											max={max}
											step={0.5}
											value={value}
											oninput={(e) => handleTemperatureChange(parseFloat(e.currentTarget.value))}
											class="thermostat-slider"
											style="--track-percentage: {percentage}%;"
										/>
									</div>
								{/if}
							{/if}
						</div>
					{/if}
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