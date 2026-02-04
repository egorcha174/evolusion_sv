<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { Tab } from '$lib/types';

	let {
		onAddToTab,
		availableTabs,
		buttonText = 'Добавить',
		disabledText = 'Добавлено'
	}: {
		onAddToTab: (tabId: string) => void;
		availableTabs: Tab[];
		buttonText?: string;
		disabledText?: string;
	} = $props();

	let isOpen = $state(false);

	function handleAdd(e: MouseEvent, tabId: string) {
		e.stopPropagation();
		onAddToTab(tabId);
		isOpen = false;
	}

	function toggleMenu(e: MouseEvent) {
		e.stopPropagation();
		isOpen = !isOpen;
	}

	function closeMenu() {
		// Delay closing to allow click event to register
		setTimeout(() => (isOpen = false), 200);
	}
</script>

{#if availableTabs.length === 0}
	<button disabled class="bg-gray-500 dark:bg-gray-600 text-white px-3 py-1 rounded-md text-sm font-medium cursor-not-allowed">
		{disabledText}
	</button>
{:else if availableTabs.length === 1}
	<button
		onclick={(e) => handleAdd(e, availableTabs[0].id)}
		class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
	>
		{buttonText}
	</button>
{:else}
	<div class="relative">
		<button
			onclick={toggleMenu}
			onblur={closeMenu}
			class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
		>
			{buttonText}
		</button>
		{#if isOpen}
			<div
				class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 ring-1 ring-black/5 dark:ring-white/10"
			>
				<div class="py-1">
					{#each availableTabs as tab}
						<button
							onclick={(e) => handleAdd(e, tab.id)}
							class="block w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
						>
							{tab.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
