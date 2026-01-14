<script lang="ts">
	import { ha } from '../../domains/ha/store.svelte.ts';
	import HistoryChart from '../../domains/ui/HistoryChart.svelte';
	import { subHours, subDays } from 'date-fns';
	import Icon from '@iconify/svelte';

	type TimeRange = '1h' | '6h' | '12h' | '24h' | '3d';

	const TIME_RANGES: { id: TimeRange; label: string }[] = [
		{ id: '1h', label: '1 час' },
		{ id: '6h', label: '6 часов' },
		{ id: '12h', label: '12 часов' },
		{ id: '24h', label: '24 часа' },
		{ id: '3d', label: '3 дня' }
	];

	let entityId = $state('');
	let timeRange = $state<TimeRange>('6h');
	let isSmoothed = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const device = $derived(ha.state.entities.get(entityId));

	// Функция для сглаживания данных методом скользящего среднего
	// Источник: fusion/components/HistoryModal.tsx
	function smoothData(data: { x: number; y: number }[], windowSize: number) {
		if (windowSize <= 1 || data.length < windowSize) {
			return data;
		}

		const smoothedData: { x: number; y: number }[] = [];
		const halfWindow = Math.floor(windowSize / 2);

		for (let i = 0; i < data.length; i++) {
			const start = Math.max(0, i - halfWindow);
			const end = Math.min(data.length, i + halfWindow + 1);
			const windowSlice = data.slice(start, end);
			const sum = windowSlice.reduce((acc, point) => acc + point.y, 0);
			const avg = sum / windowSlice.length;

			smoothedData.push({ x: data[i].x, y: avg });
		}

		return smoothedData;
	}

	const historyData = $derived.by(() => {
		const raw = ha.state.history.get(entityId);
		if (!raw) return null;

		const processed = raw
			.filter((point: any) => point && !isNaN(parseFloat(point.state)))
			.map((point: any) => ({
				x: new Date(point.last_updated).getTime(),
				y: parseFloat(point.state)
			}))
			.sort((a: any, b: any) => a.x - b.x);

		// Фильтрация дубликатов по времени (как в оригинале)
		const unique: { x: number; y: number }[] = [];
		if (processed.length > 0) {
			unique.push(processed[0]);
			for (let i = 1; i < processed.length; i++) {
				if (processed[i].x > unique[unique.length - 1].x) {
					unique.push(processed[i]);
				}
			}
		}

		return isSmoothed ? smoothData(unique, 5) : unique;
	});

	async function handleSubmit() {
		if (!entityId) return;

		loading = true;
		error = null;

		const now = new Date();
		let startDate: Date;

		switch (timeRange) {
			case '1h':
				startDate = subHours(now, 1);
				break;
			case '6h':
				startDate = subHours(now, 6);
				break;
			case '12h':
				startDate = subHours(now, 12);
				break;
			case '24h':
				startDate = subHours(now, 24);
				break;
			case '3d':
				startDate = subDays(now, 3);
				break;
			default:
				startDate = subHours(now, 24);
		}

		try {
			await ha.fetchHistory(entityId, startDate.toISOString(), now.toISOString());
		} catch (e: any) {
			error = e.message || 'Не удалось загрузить историю';
		} finally {
			loading = false;
		}
	}

	// Автоматическое обновление при смене диапазона, если ID выбран
	$effect(() => {
		if (entityId && timeRange) {
			handleSubmit();
		}
	});
</script>

<div class="p-6 max-w-6xl mx-auto">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">История</h1>
		<p class="text-gray-600 dark:text-gray-400">Просмотр графиков изменения состояния устройств</p>
	</header>

	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			class="grid gap-6 md:grid-cols-[1fr,auto,auto]"
		>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
					<Icon icon="mdi:magnify" class="w-5 h-5" />
				</div>
				<input
					type="text"
					bind:value={entityId}
					placeholder="Введите ID (например, sensor.temperature)"
					class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
				/>
			</div>

			<div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg self-center">
				{#each TIME_RANGES as { id, label }}
					<button
						type="button"
						onclick={() => (timeRange = id)}
						class="px-3 py-1.5 text-xs font-medium rounded-md transition-all {timeRange === id
							? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
							: 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
					>
						{label}
					</button>
				{/each}
			</div>

			<button
				type="submit"
				disabled={loading || !entityId}
				class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
			>
				{#if loading}
					<Icon icon="mdi:loading" class="w-5 h-5 animate-spin" />
				{/if}
				Обновить
			</button>
		</form>

		<div class="mt-4 flex items-center gap-4">
			<label class="inline-flex items-center cursor-pointer select-none">
				<input type="checkbox" bind:checked={isSmoothed} class="sr-only peer" />
				<div
					class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
				></div>
				<span class="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">Сглаживать данные</span>
			</label>
		</div>
	</div>

	{#if error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl text-red-700 dark:text-red-400 mb-6 flex items-center gap-3">
			<Icon icon="mdi:alert-circle" class="w-6 h-6 flex-shrink-0" />
			<p>{error}</p>
		</div>
	{/if}

	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[400px] flex flex-col">
		{#if loading && !historyData}
			<div class="flex-1 flex items-center justify-center">
				<Icon icon="mdi:loading" class="w-12 h-12 animate-spin text-blue-500" />
			</div>
		{:else}
			{#if historyData && historyData.length > 0}
				<div class="mb-4">
					<h3 class="text-xl font-semibold dark:text-white">{device?.attributes.friendly_name || entityId}</h3>
					{#if device?.attributes.unit_of_measurement}
						<p class="text-sm text-gray-500">Единицы: {device.attributes.unit_of_measurement}</p>
					{/if}
				</div>
				<div class="flex-1 min-h-[400px]">
					<HistoryChart
						data={historyData}
						unit={device?.attributes.unit_of_measurement || ''}
						deviceName={device?.attributes.friendly_name || entityId}
					/>
				</div>
			{:else if !entityId}
				<div class="flex-1 flex flex-col items-center justify-center text-gray-400 text-center py-20">
					<Icon icon="mdi:chart-line-variant" class="w-16 h-16 mb-4 opacity-20" />
					<p>Введите идентификатор устройства, чтобы увидеть историю его изменений</p>
				</div>
			{:else if !loading}
				<div class="flex-1 flex flex-col items-center justify-center text-gray-400 text-center py-20">
					<Icon icon="mdi:database-off" class="w-16 h-16 mb-4 opacity-20" />
					<p>Нет данных за выбранный период</p>
				</div>
			{/if}
		{/if}
	</div>
</div>
