<script lang="ts">
	import { onMount } from 'svelte';
	import { app } from '../../domains/app/store.svelte.ts';
	import TemplateFilter from '../../domains/ui/templateGallery/TemplateFilter.svelte';
	import TemplateCard from '../../domains/ui/templateGallery/TemplateCard.svelte';
	import { GALLERY_TEMPLATES } from '../../lib/galleryTemplates';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		app.setGalleryTemplates(GALLERY_TEMPLATES);
	});

	function handleBack() {
		goto('/');
	}
</script>

<div class="container mx-auto min-h-screen p-6">
	<div class="flex items-center gap-4 mb-8">
		<button
			onclick={handleBack}
			class="p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ring-1 ring-black/5 dark:ring-white/10"
			aria-label="Back to Dashboard"
		>
			<Icon icon="mdi:arrow-left" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
		</button>
		<div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Галерея шаблонов</h1>
			<p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
				Выберите готовый дизайн для ваших карточек
			</p>
		</div>
	</div>

	<TemplateFilter />

	{#if app.filteredGalleryTemplates.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each app.filteredGalleryTemplates as template (template.id)}
				<TemplateCard {template} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-20">
			<Icon
				icon="mdi:view-grid-off-outline"
				class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
			/>
			<p class="text-lg font-medium text-gray-600 dark:text-gray-400">Шаблоны не найдены</p>
			<p class="text-sm text-gray-400 dark:text-gray-500">Попробуйте изменить параметры поиска</p>
		</div>
	{/if}
</div>
