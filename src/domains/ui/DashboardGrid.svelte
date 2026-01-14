<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import DeviceCard from './DeviceCard.svelte';
	import { app } from '../app/store.svelte.ts';

	const {
		isEditMode = false,
		onedit
	} = $props<{
		isEditMode?: boolean;
		onedit?: (entityId: string) => void;
	}>();

	const items = $derived(
		app.state.dashboardItems.map((id) => ({ id }))
	);

	function handleDndConsider(e: any) {
		app.setDashboardItems(e.detail.items.map((i: any) => i.id));
	}

	function handleDndFinalize(e: any) {
		app.setDashboardItems(e.detail.items.map((i: any) => i.id));
	}
</script>

<div
	class="grid gap-4"
	style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));"
	use:dndzone={{ items, flipDurationMs: 300, dragDisabled: !isEditMode }}
	onconsider={handleDndConsider}
	onfinalize={handleDndFinalize}
>
	{#each items as item (item.id)}
		<div animate:flip={{ duration: 300 }} class="w-full h-48">
			<DeviceCard entityId={item.id} {isEditMode} onedit={() => onedit?.(item.id)} />
		</div>
	{/each}
</div>
