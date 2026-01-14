<script lang="ts">
	import { app } from '../app/store.svelte.ts';
	import { onMount } from 'svelte';

	const auroraSettings = $derived(app.state.auroraSettings);

	const hexToRgba = (hex: string, alpha: number) => {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	};

	const containerStyle = $derived({
		'--c1-mid': hexToRgba(auroraSettings.color1, 0.12),
		'--c2-mid': hexToRgba(auroraSettings.color2, 0.18),
		'--c3-mid': hexToRgba(auroraSettings.color3, 0.1),
		'--c1-transparent': hexToRgba(auroraSettings.color1, 0.0),
		'--c3-transparent': hexToRgba(auroraSettings.color3, 0.0),
		'--global-blur': `${auroraSettings.blur}px`,
		'--global-saturate': `${auroraSettings.saturate}%`,
		'--speed-1': `${auroraSettings.speed}s`,
		'--speed-2': `${Math.round(auroraSettings.speed * 1.2)}s`,
		'--speed-3': `${Math.round(auroraSettings.speed * 1.4)}s`,
		'--speed-4': `${Math.round(auroraSettings.speed * 1.1)}s`,
		'--band-opacity': Math.max(0.3, Math.min(1.2, auroraSettings.intensity / 100)),
		'--stars-speed': `${auroraSettings.starsSpeed}s`,
		'--stars-opacity': auroraSettings.starsEnabled ? 0.9 : 0
	});
</script>

<div class="fixed inset-0 pointer-events-none -z-[5] overflow-hidden">
	{#if app.state.backgroundEffect === 'aurora'}
		<div class="fixed inset-0 overflow-hidden pointer-events-none -z-[5] aurora-scene" style:--c1-mid={containerStyle['--c1-mid']} style:--c2-mid={containerStyle['--c2-mid']} style:--c3-mid={containerStyle['--c3-mid']} style:--c1-transparent={containerStyle['--c1-transparent']} style:--c3-transparent={containerStyle['--c3-transparent']} style:--global-blur={containerStyle['--global-blur']} style:--global-saturate={containerStyle['--global-saturate']} style:--speed-1={containerStyle['--speed-1']} style:--speed-2={containerStyle['--speed-2']} style:--speed-3={containerStyle['--speed-3']} style:--speed-4={containerStyle['--speed-4']} style:--band-opacity={containerStyle['--band-opacity']} style:--stars-speed={containerStyle['--stars-speed']} style:--stars-opacity={containerStyle['--stars-opacity']}>
			<div class="absolute inset-0 aurora-stars"></div>
			
			<div class="absolute left-[-20%] right-[-20%] h-[60%] top-[10%] aurora-layer pointer-events-none">
				<div class="absolute left-0 right-0 h-full aurora-band b1"></div>
				<div class="absolute left-0 right-0 h-full aurora-band b2"></div>
				<div class="absolute left-0 right-0 h-full aurora-band b3"></div>
				<div class="absolute left-0 right-0 h-full aurora-band b4"></div>
				<div class="absolute inset-0 aurora-noise"></div>
			</div>
			
			<div class="absolute left-0 right-0 bottom-0 h-[22%] bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none"></div>
		</div>
	{/if}
</div>

<style>
	/* Note: These styles should ideally be in app.css or a global style file if they are complex and used multiple times, 
	   but for now we keep them here or assume they are in app.css as per Fusion's structure. 
	   Based on Fusion, it seems it relied on some global CSS for aurora. 
	*/
</style>
