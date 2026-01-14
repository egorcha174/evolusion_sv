<script lang="ts">
	import Icon from '@iconify/svelte';
	import { app } from '../../app/store.svelte.ts';

	const categories = [
		{ id: 'all', label: 'Все' },
		{ id: 'light', label: 'Свет' },
		{ id: 'sensor', label: 'Сенсоры' },
		{ id: 'climate', label: 'Климат' },
		{ id: 'switch', label: 'Переключатели' },
		{ id: 'custom', label: 'Кастомные' }
	];
</script>

<div class="flex flex-col md:flex-row gap-4 mb-6">
	<div class="relative flex-grow">
		<Icon
			icon="mdi:magnify"
			class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
		/>
		<input
			type="text"
			placeholder="Поиск шаблонов..."
			value={app.state.gallerySearchQuery}
			oninput={(e) => app.setGallerySearchQuery(e.currentTarget.value)}
			class="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>
	<div class="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
		{#each categories as cat (cat.id)}
			<button
				onclick={() => app.setGalleryCategoryFilter(cat.id)}
				class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors {app.state
					.galleryCategoryFilter === cat.id ||
				(cat.id === 'all' && !app.state.galleryCategoryFilter)
					? 'bg-blue-600 text-white'
					: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700'}"
			>
				{cat.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
