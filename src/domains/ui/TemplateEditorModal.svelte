<script lang="ts">
	import { app } from '../app/store.svelte';
	import type { CardTemplate, CardElement, CardElementId, ThemeColors } from '$lib/types';
	import { nanoid } from 'nanoid';
	import Icon from '@iconify/svelte';
	import DeviceCard from './DeviceCard.svelte';

	const {
		template: initialTemplate = null,
		onClose
	} = $props<{
		template: CardTemplate | null;
		onClose: () => void;
	}>();

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

	let template = $state<CardTemplate>({
		id: nanoid(),
		name: 'New Template',
		deviceType: 'light',
		width: 100,
		height: 100,
		elements: [],
		interactionType: 'passive'
	});

	$effect(() => {
		if (initialTemplate) {
			template = JSON.parse(JSON.stringify(initialTemplate));
		}
	});

	let selectedElementId = $state<string | null>(null);
	const selectedElement = $derived(template.elements.find((e) => e.uniqueId === selectedElementId));

	function handleSave() {
		app.saveTemplate(template);
		onClose();
	}

	function addElement(type: CardElementId) {
		const newElement: CardElement = {
			id: type,
			uniqueId: nanoid(),
			visible: true,
			position: { x: 50, y: 50 },
			size: { width: 20, height: 10 },
			zIndex: template.elements.length + 1,
			styles: {
				fontSize: 14,
				textAlign: 'center',
				color: '#000000'
			},
			sizeMode: 'card'
		};
		template.elements = [...template.elements, newElement];
		selectedElementId = newElement.uniqueId;
	}

	function removeElement(id: string) {
		template.elements = template.elements.filter((e) => e.uniqueId !== id);
		if (selectedElementId === id) selectedElementId = null;
	}

	function moveElement(direction: 'up' | 'down') {
		if (!selectedElementId) return;
		const index = template.elements.findIndex((e) => e.uniqueId === selectedElementId);
		if (direction === 'up' && index < template.elements.length - 1) {
			const temp = template.elements[index].zIndex;
			template.elements[index].zIndex = template.elements[index + 1].zIndex;
			template.elements[index + 1].zIndex = temp;
			[template.elements[index], template.elements[index + 1]] = [
				template.elements[index + 1],
				template.elements[index]
			];
		} else if (direction === 'down' && index > 0) {
			const temp = template.elements[index].zIndex;
			template.elements[index].zIndex = template.elements[index - 1].zIndex;
			template.elements[index - 1].zIndex = temp;
			[template.elements[index], template.elements[index - 1]] = [
				template.elements[index - 1],
				template.elements[index]
			];
		}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
		<!-- Header -->
		<div class="p-6 border-b dark:border-gray-700 flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Template Editor</h2>
				<p class="text-gray-500 dark:text-gray-400">Customize how your device cards look</p>
			</div>
			<div class="flex items-center gap-3">
				<button
					onclick={onClose}
					class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={handleSave}
					class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all"
				>
					Save Template
				</button>
			</div>
		</div>

		<!-- Main Content -->
		<div class="flex-1 flex overflow-hidden">
			<!-- Left: Elements Tree -->
			<div class="w-64 border-r dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900/50">
				<div class="p-4 border-b dark:border-gray-700">
					<h3 class="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Elements</h3>
					<div class="grid grid-cols-2 gap-2">
						{#each ['name', 'icon', 'value', 'status', 'unit', 'chart'] as type}
							<button
								onclick={() => addElement(type as CardElementId)}
								class="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded hover:border-blue-500 transition-colors text-xs"
							>
								<Icon icon="mdi:plus" />
								{type}
							</button>
						{/each}
					</div>
				</div>
				<div class="flex-1 overflow-y-auto p-2">
					{#each template.elements as element (element.uniqueId)}
						<button
							onclick={() => (selectedElementId = element.uniqueId)}
							class="w-full flex items-center justify-between p-2 rounded mb-1 text-sm {selectedElementId ===
							element.uniqueId
								? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
								: 'hover:bg-gray-200 dark:hover:bg-gray-800'}"
						>
							<div class="flex items-center gap-2">
								<Icon
									icon={element.visible ? 'mdi:eye' : 'mdi:eye-off'}
									class="w-4 h-4 cursor-pointer"
									onclick={(e) => {
										e.stopPropagation();
										element.visible = !element.visible;
									}}
								/>
								<span class="capitalize">{element.id}</span>
							</div>
							<Icon
								icon="mdi:delete"
								class="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
								onclick={(e) => {
									e.stopPropagation();
									removeElement(element.uniqueId);
								}}
							/>
						</button>
					{/each}
				</div>
			</div>

			<!-- Center: Canvas -->
			<div
				class="flex-1 bg-gray-200 dark:bg-gray-950 p-12 flex items-center justify-center overflow-auto"
			>
				<div class="relative w-80 h-40 shadow-2xl rounded-xl">
					<DeviceCard entityId="" isPreview={true} {template} colorScheme={currentColorScheme} />
				</div>
			</div>

			<!-- Right: Properties -->
			<div class="w-80 border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6 overflow-y-auto">
				<h3 class="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-6">Properties</h3>

				{#if selectedElement}
					<div class="space-y-6">
						<!-- Position -->
						<div class="space-y-3">
							<label for="prop-pos-x" class="text-xs font-bold text-gray-400 uppercase">Position (Center %)</label>
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-1">
									<span class="text-[10px] text-gray-500">X</span>
									<input
										id="prop-pos-x"
										type="number"
										bind:value={selectedElement.position.x}
										class="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-2 text-sm"
									/>
								</div>
								<div class="space-y-1">
									<span class="text-[10px] text-gray-500">Y</span>
									<input
										type="number"
										bind:value={selectedElement.position.y}
										class="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-2 text-sm"
									/>
								</div>
							</div>
						</div>

						<!-- Size -->
						<div class="space-y-3">
							<label for="prop-size-w" class="text-xs font-bold text-gray-400 uppercase">Size (%)</label>
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-1">
									<span class="text-[10px] text-gray-500">Width</span>
									<input
										id="prop-size-w"
										type="number"
										bind:value={selectedElement.size.width}
										class="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-2 text-sm"
									/>
								</div>
								<div class="space-y-1">
									<span class="text-[10px] text-gray-500">Height</span>
									<input
										type="number"
										bind:value={selectedElement.size.height}
										class="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-2 text-sm"
									/>
								</div>
							</div>
						</div>

						<!-- Styling -->
						<div class="space-y-3">
							<label for="prop-font-size" class="text-xs font-bold text-gray-400 uppercase">Style</label>
							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<span class="text-sm text-gray-600 dark:text-gray-400">Font Size</span>
									<input
										type="number"
										bind:value={selectedElement.styles.fontSize}
										class="w-16 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-1 text-sm text-right"
									/>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm text-gray-600 dark:text-gray-400">Color</span>
									<input type="color" bind:value={selectedElement.styles.color} class="w-8 h-8 p-0 border-0" />
								</div>
								<div class="space-y-1">
									<span class="text-sm text-gray-600 dark:text-gray-400">Alignment</span>
									<div class="flex gap-1">
										{#each ['left', 'center', 'right'] as align}
											<button
												onclick={() => (selectedElement.styles.textAlign = align as any)}
												class="flex-1 p-2 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 {selectedElement
													.styles.textAlign === align
													? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500'
													: ''}"
											>
												<Icon icon="mdi:format-align-{align}" />
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>

						<!-- Layering -->
						<div class="space-y-3">
							<span class="text-xs font-bold text-gray-400 uppercase">Layering</span>
							<div class="flex gap-2">
								<button
									onclick={() => moveElement('up')}
									class="flex-1 flex items-center justify-center gap-2 p-2 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<Icon icon="mdi:arrow-up" /> Bring Forward
								</button>
								<button
									onclick={() => moveElement('down')}
									class="flex-1 flex items-center justify-center gap-2 p-2 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<Icon icon="mdi:arrow-down" /> Send Backward
								</button>
							</div>
						</div>
					</div>
				{:else}
					<div class="h-64 flex flex-col items-center justify-center text-center px-4">
						<Icon icon="mdi:cursor-default-click-outline" class="w-12 h-12 text-gray-300 mb-4" />
						<p class="text-gray-400 text-sm">Select an element to edit its properties</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
