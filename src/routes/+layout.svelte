<script lang="ts">
	import { loadServerConfig, appState } from '../domains/app/store';
	import { initializeHAConnection, disconnectHA, haStore } from '../domains/ha/store';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		loadServerConfig();
	});

	// Reactive connection management
	$effect(() => {
		const active = $appState.activeServer;
		if (active?.url && active?.token) {
			// Initialize connection when config is available
			// Note: initializeHAConnection handles disconnect logic internally if already connected
			initializeHAConnection(active.url, active.token);
		} else {
			// Disconnect if no config
			disconnectHA();
		}
	});
</script>

<div class="app-layout">
	<header class="app-header">
		<div class="brand">Evolusion</div>
		<nav>
			<a href="/">Dashboard</a>
			<a href="/entities">All Entities</a>
			<a href="/settings">Settings</a>
		</nav>
		<div class="status-indicator">
			{#if $haStore.isLoading}
				<span class="badge loading">Connecting...</span>
			{:else if $haStore.isConnected}
				<span class="badge connected">Online</span>
			{:else if $haStore.error}
				<span class="badge error">Error</span>
			{:else}
				<span class="badge disconnected">Offline</span>
			{/if}
		</div>
	</header>

	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		background-color: #f5f5f5;
		color: #333;
	}

	.app-header {
		display: flex;
		align-items: center;
		padding: 0 1rem;
		height: 64px;
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.brand {
		font-weight: bold;
		font-size: 1.25rem;
		margin-right: 2rem;
		color: #03a9f4;
	}

	nav {
		flex: 1;
	}

	nav a {
		margin-right: 1.5rem;
		text-decoration: none;
		color: #555;
		font-weight: 500;
	}

	nav a:hover {
		color: #000;
	}

	.status-indicator {
		font-size: 0.85rem;
	}

	.badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		color: white;
		font-weight: 500;
	}
	
	.badge.loading { background-color: #ff9800; }
	.badge.connected { background-color: #4caf50; }
	.badge.error { background-color: #f44336; }
	.badge.disconnected { background-color: #9e9e9e; }

	main {
		padding: 1rem;
	}
</style>
