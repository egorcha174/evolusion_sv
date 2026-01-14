<script lang="ts">
	import '../app.css';
	import Sidebar from '../domains/ui/Sidebar.svelte';
	import Header from '../domains/ui/Header.svelte';
	import BackgroundEffects from '../domains/ui/BackgroundEffects.svelte';
	import { onMount } from 'svelte';
	import { ha } from '../domains/ha/store.svelte.ts';
	import { app } from '../domains/app/store.svelte.ts';
	import type { Snippet } from 'svelte';

	onMount(() => {
		ha.initialize();
	});

	$effect(() => {
		const root = document.documentElement;
		const theme =
			app.state.themeMode === 'night' || app.state.themeMode === 'auto'
				? app.state.colorScheme.dark
				: app.state.colorScheme.light;

		// Apply basic colors for now. More comprehensive theme application can be done later.
		root.style.setProperty('--bg-dashboard-1', theme.dashboardBackgroundColor1);
		root.style.setProperty('--bg-card', theme.cardBackground);
		root.style.setProperty('--bg-card-on', theme.cardBackgroundOn || theme.cardBackground);
		root.style.setProperty('--text-name', theme.nameTextColor);
		root.style.setProperty('--text-name-on', theme.nameTextColorOn || theme.nameTextColor);
		root.style.setProperty('--text-status', theme.statusTextColor);
		root.style.setProperty('--text-status-on', theme.statusTextColorOn || theme.statusTextColor);
		root.style.setProperty('--text-value', theme.valueTextColor);
		root.style.setProperty('--text-value-on', theme.valueTextColorOn || theme.valueTextColor);
		root.style.setProperty('--text-unit', theme.unitTextColor);
		root.style.setProperty('--text-unit-on', theme.unitTextColorOn || theme.unitTextColor);
		root.style.setProperty('--radius-card', `${theme.cardBorderRadius || 12}px`);
		root.style.setProperty('--border-width-card', `${theme.cardBorderWidth || 0}px`);
		root.style.setProperty('--border-color-card', theme.cardBorderColor || 'transparent');
		root.style.setProperty('--border-color-card-on', theme.cardBorderColorOn || 'transparent');
	});

	let { children } = $props<{ children: Snippet }>();
</script>

<div class="flex flex-col h-screen overflow-hidden">
	<BackgroundEffects />
	<Header />
	<div class="flex flex-1 relative z-10">
		{#if app.state.isSidebarVisible}
			<Sidebar style="width: {app.state.sidebarWidth}px;" />
		{/if}
		<main class="flex-1 p-4 overflow-y-auto" style="background-color: var(--bg-dashboard-1);">
			{#if ha.state.isConnecting}
				<p>Connecting to Home Assistant...</p>
			{:else if ha.state.error}
				<p class="text-red-500">Connection Error: {ha.state.error}</p>
			{:else if ha.state.isConnected}
				{@render children()}
			{:else}
				<p>Not connected.</p>
			{/if}
		</main>
	</div>
</div>
