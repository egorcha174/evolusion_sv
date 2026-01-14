<script lang="ts">
	let {
		isOpen,
		title,
		message,
		onConfirm,
		onCancel,
		confirmText = 'Подтвердить',
		cancelText = 'Отмена',
		confirmButtonClass = 'bg-red-600 hover:bg-red-700'
	}: {
		isOpen: boolean;
		title: string;
		message: string | unknown; // Allow for slots
		onConfirm: () => void;
		onCancel: () => void;
		confirmText?: string;
		cancelText?: string;
		confirmButtonClass?: string;
	} = $props();
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
		onclick={onCancel}
        onkeydown={(e) => { if (e.key === 'Escape') onCancel(); }}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-labelledby="dialog-title"
	>
		<div
			class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-sm ring-1 ring-black/5 dark:ring-white/10"
			role="document"
		>
			<div class="p-6">
				<h2 id="dialog-title" class="text-xl font-bold text-gray-900 dark:text-white">
					{title}
				</h2>
				<div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
					{#if typeof message === 'string'}
						{@html message}
					{:else}
						{@html message}
					{/if}
				</div>
			</div>

			<div
				class="p-4 flex justify-end gap-4 bg-gray-100/50 dark:bg-gray-900/50 rounded-b-2xl"
			>
				<button
					onclick={onCancel}
					class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
				>
					{cancelText}
				</button>
				<button
					onclick={onConfirm}
					class={`px-4 py-2 text-sm font-medium text-white ${confirmButtonClass} rounded-lg transition-colors`}
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
