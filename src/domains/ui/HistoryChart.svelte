<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-date-fns';
	import { ru } from 'date-fns/locale/ru';
	import type { ChartConfiguration } from 'chart.js';

	interface DataPoint {
		x: number;
		y: number;
	}

	const {
		data,
		unit,
		decimalPlaces = 1,
		deviceName
	} = $props<{
		data: DataPoint[];
		unit: string;
		decimalPlaces?: number;
		deviceName: string;
	}>();

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	// Источник: fusion/components/HistoryChart.tsx
	const isDark = $derived(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
	const gridColor = $derived(isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
	const textColor = $derived(isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)');

	function createChart() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const gradient = ctx.createLinearGradient(0, 0, 0, 400);
		gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
		gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

		const config: ChartConfiguration = {
			type: 'line',
			data: {
				datasets: [
					{
						label: deviceName,
						data: data,
						borderColor: 'rgb(59, 130, 246)',
						backgroundColor: gradient,
						fill: true,
						tension: 0.4,
						pointRadius: 0,
						borderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						backgroundColor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
						titleColor: textColor,
						bodyColor: textColor,
						borderColor: gridColor,
						borderWidth: 1,
						padding: 10,
						displayColors: false,
						callbacks: {
							label: (context) => {
								const value = context.parsed.y;
								if (value === null || value === undefined) return '';
								return `${value.toFixed(decimalPlaces)} ${unit}`;
							}
						}
					}
				},
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'hour',
							displayFormats: {
								hour: 'HH:mm'
							}
						},
						adapters: {
							date: {
								locale: ru
							}
						},
						grid: {
							display: false
						},
						ticks: {
							color: textColor,
							font: {
								size: 12
							}
						}
					},
					y: {
						grid: {
							color: gridColor
						},
						ticks: {
							color: textColor,
							font: {
								size: 12
							},
					callback: (value) => {
						const num = typeof value === 'string' ? parseFloat(value) : value;
						return num !== null && num !== undefined ? num.toFixed(decimalPlaces) : '';
					}
				}
			}
		},
				interaction: {
					intersect: false,
					mode: 'index'
				}
			}
		};

		chart = new Chart(canvas, config);
	}

	onMount(() => {
		createChart();
		return () => {
			if (chart) chart.destroy();
		};
	});

	$effect(() => {
		if (chart) {
			chart.data.datasets[0].data = data;
			chart.data.datasets[0].label = deviceName;
			
			if (chart.options.scales?.x?.ticks) {
				chart.options.scales.x.ticks.color = textColor;
			}
			if (chart.options.scales?.y?.grid) {
				chart.options.scales.y.grid.color = gridColor;
			}
			if (chart.options.scales?.y?.ticks) {
				chart.options.scales.y.ticks.color = textColor;
			}
			
			chart.update();
		}
	});
</script>

<div class="w-full h-full">
	<canvas bind:this={canvas}></canvas>
</div>
