<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { GalleryTemplate } from '$lib/types';
	import { app } from '../../app/store.svelte.ts';
	import { nanoid } from 'nanoid';

	let { template } = $props<{ template: GalleryTemplate }>();

	function handleInstall() {
		// Deep clone the template structure to avoid mutations
		const newTemplate = JSON.parse(JSON.stringify(template.templateStructure));
		newTemplate.id = nanoid();
		newTemplate.name = `${template.name} (from Gallery)`;

		// Ensure each element has a unique ID for the new instance
		if (newTemplate.elements) {
			newTemplate.elements = newTemplate.elements.map((el: any) => ({
				...el,
				uniqueId: nanoid()
			}));
		}

		app.saveTemplate(newTemplate);
		alert(`Шаблон "${template.name}" успешно установлен в вашу библиотеку!`);
	}
</script>

<div
	class="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
>
	<div class="h-32 bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center relative">
		<Icon icon={template.previewIcon} class="w-16 h-16 text-gray-400 dark:text-gray-500" />
		<div
			class="absolute top-2 right-2 bg-black/20 dark:bg-black/40 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
		>
			{template.deviceType}
		</div>
	</div>
	<div class="p-4 flex flex-col flex-grow">
		<div class="flex items-start justify-between mb-2">
			<h3 class="font-bold text-gray-900 dark:text-white">{template.name}</h3>
		</div>
		<p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
			{template.description}
		</p>
		<div
			class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700"
		>
			<span class="text-[10px] text-gray-400">v{template.version} • {template.author}</span>
			<button
				onclick={handleInstall}
				class="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
			>
				<Icon icon="mdi:download" class="w-3 h-3" />
				Установить
			</button>
		</div>
	</div>
</div>
