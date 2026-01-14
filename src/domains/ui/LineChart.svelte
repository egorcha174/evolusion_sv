<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartConfiguration, ChartData } from 'chart.js';

	const { data, options } = $props<{ data: ChartData; options?: ChartConfiguration['options'] }>();

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		const config: ChartConfiguration = {
			type: 'line',
			data,
			options
		};
		chart = new Chart(canvas, config);
		
		return () => {
			chart.destroy();
		}
	});

	$effect(() => {
		if (chart) {
			chart.data = data;
			if (options) {
				chart.options = options;
			}
			chart.update();
		}
	});
</script>

<canvas bind:this={canvas}></canvas>
