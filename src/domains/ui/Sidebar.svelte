<script lang="ts">
	import { onMount } from 'svelte';
	import { app } from '../app/store.svelte.ts';
	import { ha } from '../ha/store.svelte.ts';
	import WeatherWidget from './WeatherWidget.svelte';

	let { style = '' } = $props<{ style?: string }>();
	let time = $state(new Date());
	let isResizing = $state(false);

	onMount(() => {
		const timerId = setInterval(() => (time = new Date()), 1000);
		return () => clearInterval(timerId);
	});

	const options = $derived({
		hour: '2-digit' as const,
		minute: '2-digit' as const,
		hour12: app.state.clockSettings.format === '12h',
		second: app.state.clockSettings.showSeconds ? ('2-digit' as const) : undefined
	});

	const fontSize = $derived(() => {
		const sizeMultiplier = { sm: 0.85, md: 1.0, lg: 1.15 };
		const characterCount = app.state.clockSettings.showSeconds ? 8 : 5;
		const baseFontSize = (app.state.sidebarWidth / characterCount) * 1.7;
		const finalSize = baseFontSize * sizeMultiplier[app.state.clockSettings.size as keyof typeof sizeMultiplier];
		return Math.max(24, Math.min(finalSize, 128));
	});

	function handleMouseDown(e: MouseEvent) {
		e.preventDefault();
		isResizing = true;
	}

	function handleMouseMove(e: MouseEvent) {
		if (isResizing) {
			app.setSidebarWidth(Math.max(280, Math.min(e.clientX, 500)));
		}
	}

	function handleMouseUp() {
		isResizing = false;
	}

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	});

	const isDark = $derived(app.state.themeMode === 'night'); // Simplified for now
	const sidebarBackgroundColor = $derived(
		isDark ? `rgba(28, 28, 30, 0.8)` : `rgba(240, 245, 255, 0.8)`
	);
</script>

<aside
	class="fixed top-0 left-0 flex h-full flex-col p-8 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5 max-lg:hidden"
	style="{style} background-color: {sidebarBackgroundColor};"
>
	<div class="flex flex-shrink-0 justify-center">
		<div
			class="font-mono font-bold tracking-tighter whitespace-nowrap"
			style="font-size: {fontSize()}px; color: var(--text-clock, currentColor);"
		>
			{time.toLocaleTimeString('ru-RU', options)}
		</div>
	</div>

	<div class="no-scrollbar mt-4 flex-1 space-y-4 overflow-y-auto min-h-0">
		<WeatherWidget />
	</div>

	<!-- Resizer -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onmousedown={handleMouseDown}
		class="absolute top-0 right-0 z-50 h-full w-2 cursor-col-resize select-none"
	></div>
</aside>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
