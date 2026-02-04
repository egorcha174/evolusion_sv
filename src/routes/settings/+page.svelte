<script lang="ts">
	import { ha } from '../../domains/ha/store.svelte.ts';
	import { app } from '../../domains/app/store.svelte.ts';
	import Section from '../../domains/ui/settings-controls/Section.svelte';
	import LabeledInput from '../../domains/ui/settings-controls/LabeledInput.svelte';
	import ColorInput from '../../domains/ui/settings-controls/ColorInput.svelte';
	import RangeInput from '../../domains/ui/settings-controls/RangeInput.svelte';
	import ThemeEditor from '../../domains/ui/settings-controls/ThemeEditor.svelte';
	import ConfirmDialog from '../../domains/ui/ConfirmDialog.svelte';
	import Icon from '@iconify/svelte';
	import type { ThemeDefinition, AuroraSettings, ServerConfig } from '$lib/types';
	import { nanoid } from 'nanoid';

	let editingTheme = $state<ThemeDefinition | null>(null);
	let confirmingDeleteTheme = $state<ThemeDefinition | null>(null);
	let activeEditorTab = $state<'light' | 'dark'>('light');
	let confirmingResetTemplates = $state(false);
	
	let selectedServerId = $state(app.state.activeServerId);
	let editingServer = $state<Partial<ServerConfig> | null>(null);
	let serverToDelete = $state<ServerConfig | null>(null);

	const weatherEntities = $derived.by(() => {
		return [...ha.allKnownDevices.values()].filter(
			(device) => device.haDomain === 'weather'
		);
	});
	
	function handleConnect() {
        const server = app.state.servers.find(s => s.id === selectedServerId);
        if (server) {
            ha.initialize();
            app.setActiveServerId(server.id);
        }
    }

	function handleSaveServer() {
		if (!editingServer || !editingServer.name || !editingServer.url || !editingServer.token) {
			alert('Пожалуйста, заполните все поля.');
			return;
		}

		if (editingServer.id) {
			app.updateServer(editingServer as ServerConfig);
		} else {
			const newServer = app.addServer({
				name: editingServer.name,
				url: editingServer.url,
				token: editingServer.token
			});
			selectedServerId = newServer.id;
		}
		editingServer = null;
	}

	function handleCreateNewTheme() {
		const baseTheme =
			app.themes.find((t) => t.id === 'apple-default') || app.themes[0];
		const newTheme: ThemeDefinition = {
			id: nanoid(),
			name: `Новая тема ${app.themes.filter((t) => t.isCustom).length + 1}`,
			isCustom: true,
			scheme: JSON.parse(JSON.stringify(baseTheme.scheme))
		};
		editingTheme = newTheme;
	}

	function handleEditTheme(theme: ThemeDefinition) {
		if (theme.isCustom) {
			editingTheme = JSON.parse(JSON.stringify(theme));
		}
	}

	function handleDuplicateTheme(theme: ThemeDefinition) {
		const newTheme: ThemeDefinition = {
			id: nanoid(),
			name: `${theme.name} (копия)`,
			isCustom: true,
			scheme: JSON.parse(JSON.stringify(theme.scheme))
		};
		editingTheme = newTheme;
	}

	function handleSaveTheme() {
		if (editingTheme) {
			app.saveTheme(editingTheme);
			editingTheme = null;
		}
	}
	
	function handleUpdateEditingThemeValue(path: string, value: any) {
		if (!editingTheme) return;
		
		const updatedScheme = { ...editingTheme.scheme };
		let target: any = updatedScheme; // Use any to allow dynamic property access
		const parts = path.split('.');
		
		for (let i = 0; i < parts.length - 1; i++) {
			target = target[parts[i]];
		}
		target[parts[parts.length - 1]] = value;

		editingTheme.scheme = updatedScheme;
	}

	function handleAuroraChange(key: keyof AuroraSettings, value: any) {
		app.setAuroraSettings({ ...app.auroraSettings, [key]: value });
	}

	const AURORA_PRESETS: Record<string, AuroraSettings> = {
		classic: {
			color1: '#00ffc8',
			color2: '#78c8ff',
			color3: '#00b4ff',
			speed: 22,
			intensity: 90,
			blur: 18,
			saturate: 140,
			starsEnabled: true,
			starsSpeed: 6
		},
		green: {
			color1: '#00ff9f',
			color2: '#00d68a',
			color3: '#00b36b',
			speed: 18,
			intensity: 100,
			blur: 14,
			saturate: 160,
			starsEnabled: true,
			starsSpeed: 5
		},
		violet: {
			color1: '#b28cff',
			color2: '#8f6bff',
			color3: '#5f3bff',
			speed: 26,
			intensity: 80,
			blur: 22,
			saturate: 180,
			starsEnabled: true,
			starsSpeed: 8
		}
	};
</script>

<div class="container mx-auto p-4 space-y-8">
	{#if !ha.state.isConnected}
		<!-- Connection Section (Login Mode) -->
	{:else}
		<Section title="Подключение" description="Управление соединением с Home Assistant.">
			<div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
				<div class="overflow-hidden mr-4">
					<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
						{app.state.servers.find((s) => s.id === app.state.activeServerId)?.name || 'Сервер'}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 truncate">
						{app.state.servers.find((s) => s.id === app.state.activeServerId)?.url}
					</p>
				</div>
				<button
					onclick={() => {
						ha.disconnect();
						app.setActiveServerId(null);
					}}
					class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
				>
					Отключиться
				</button>
			</div>
		</Section>

		<Section title="Внешний вид" description="Настройка режима темы и фоновой анимации.">
			<LabeledInput label="Режим темы" id="themeModeSelect">
				<select
					id="themeModeSelect"
					value={app.themeMode}
					onchange={(e) => app.setThemeMode(e.currentTarget.value as any)}
					class="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
				>
					<option value="auto">Системная</option>
					<option value="day">Светлая</option>
					<option value="night">Темная</option>
					<option value="schedule">По расписанию</option>
				</select>
			</LabeledInput>

			{#if app.themeMode === 'schedule'}
				<div class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg space-y-3 mt-2 mb-2">
					<LabeledInput label="Начало ночи" id="scheduleStartTimeInput">
						<input
							id="scheduleStartTimeInput"
							type="time"
							value={app.scheduleStartTime}
							onchange={(e) => app.setScheduleStartTime(e.currentTarget.value)}
							class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm"
						/>
					</LabeledInput>
					<LabeledInput label="Конец ночи" id="scheduleEndTimeInput">
						<input
							id="scheduleEndTimeInput"
							type="time"
							value={app.scheduleEndTime}
							onchange={(e) => app.setScheduleEndTime(e.currentTarget.value)}
							class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm"
						/>
					</LabeledInput>
				</div>
			{/if}

			<div class="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>

			<LabeledInput label="Анимация фона" id="backgroundEffectSelect">
				<select
					id="backgroundEffectSelect"
					value={app.backgroundEffect}
					onchange={(e) => app.setBackgroundEffect(e.currentTarget.value as any)}
					class="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
				>
					<option value="none">Нет</option>
					<option value="weather">По погоде</option>
					<option value="tron">Трон</option>
				</select>
			</LabeledInput>
		</Section>

		<Section title="Погода" description="Настройте источник данных о погоде.">
			<LabeledInput label="Провайдер погоды" id="weatherProviderSelect">
				<select
					id="weatherProviderSelect"
					value={app.weatherProvider}
					onchange={(e) => app.setWeatherProvider(e.currentTarget.value as any)}
					class="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
				>
					<option value="homeassistant">Home Assistant</option>
					<option value="openweathermap">OpenWeatherMap</option>
					<option value="yandex">Яндекс.Погода</option>
					<option value="foreca">Foreca</option>
				</select>
			</LabeledInput>

			{#if app.weatherProvider === 'homeassistant'}
				<LabeledInput
					label="Сущность погоды"
					description="Выберите вашу сущность weather из Home Assistant."
					id="weatherEntityIdSelect"
				>
					<select
						id="weatherEntityIdSelect"
						value={app.weatherEntityId}
						onchange={(e) => app.setWeatherEntityId(e.currentTarget.value)}
						class="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
					>
						<option value="">-- Выберите сущность --</option>
						{#each weatherEntities as entity}
							<option value={entity.id}>{entity.name}</option>
						{/each}
					</select>
				</LabeledInput>
			{/if}

			{#if app.weatherProvider === 'openweathermap'}
				<LabeledInput label="Ключ API OpenWeatherMap" description="Требуется для получения прогноза." id="openWeatherMapKeyInput">
					<input
						id="openWeatherMapKeyInput"
						type="password"
						value={app.openWeatherMapKey}
						onchange={(e) => app.setOpenWeatherMapKey(e.currentTarget.value)}
						placeholder="Вставьте ваш ключ API"
						class="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
					/>
				</LabeledInput>
			{/if}

			{#if app.weatherProvider === 'yandex'}
				<LabeledInput label="Ключ API Яндекс.Погоды" description="Тариф 'Прогноз по координатам'." id="yandexWeatherKeyInput">
					<input
						id="yandexWeatherKeyInput"
						type="password"
						value={app.yandexWeatherKey}
						onchange={(e) => app.setYandexWeatherKey(e.currentTarget.value)}
						placeholder="Вставьте ваш ключ API"
						class="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
					/>
				</LabeledInput>
			{/if}

			{#if app.weatherProvider === 'foreca'}
				<LabeledInput label="Ключ API Foreca" description="Требуется Basic/Pro подписка." id="forecaApiKeyInput">
					<input
						id="forecaApiKeyInput"
						type="password"
						value={app.forecaApiKey}
						onchange={(e) => app.setForecaApiKey(e.currentTarget.value)}
						placeholder="Вставьте ваш ключ API"
						class="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
					/>
				</LabeledInput>
			{/if}
		</Section>

		<Section title="Тема оформления" description="Выберите тему из списка.">
			<div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
				{#each app.themes as theme (theme.id)}
					<div class="text-center group relative">
						<button
							onclick={() => app.selectTheme(theme.id)}
							class="w-full aspect-video rounded-lg border-2 dark:border-gray-600 transition-all flex items-center justify-center text-xs font-semibold shadow-sm hover:shadow-md"
							style={`
								background-image: linear-gradient(135deg, ${theme.scheme.light.dashboardBackgroundColor1} 50%, ${theme.scheme.dark.dashboardBackgroundColor1} 50%);
								border-color: ${app.activeThemeId === theme.id ? '#3b82f6' : 'transparent'};
								transform: ${app.activeThemeId === theme.id ? 'scale(1.02)' : 'scale(1)'};
							`}
						>
							<span class="bg-white/50 dark:bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm"
								>{theme.name}</span
							>
						</button>
						<div
							class="absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
						>
							{#if theme.isCustom}
								<button
									onclick={(e) => {
										e.stopPropagation();
										handleEditTheme(theme);
									}}
									class="p-1.5 bg-gray-800/80 rounded-full text-white hover:bg-blue-600 transition-colors backdrop-blur-sm"
									title="Редактировать тему"
								>
									<Icon icon="mdi:pencil" class="w-3.5 h-3.5" />
								</button>
							{/if}
							<button
								onclick={(e) => {
									e.stopPropagation();
									handleDuplicateTheme(theme);
								}}
								class="p-1.5 bg-gray-800/80 rounded-full text-white hover:bg-green-600 transition-colors backdrop-blur-sm"
								title="Создать копию"
							>
								<Icon icon="mdi:content-copy" class="w-3.5 h-3.5" />
							</button>
							{#if theme.isCustom}
								<button
									onclick={(e) => {
										e.stopPropagation();
										confirmingDeleteTheme = theme;
									}}
									class="p-1.5 bg-gray-800/80 rounded-full text-white hover:bg-red-600 transition-colors backdrop-blur-sm"
									title="Удалить тему"
								>
									<Icon icon="mdi:trash-can-outline" class="w-3.5 h-3.5" />
								</button>
							{/if}
						</div>
					</div>
				{/each}
				<div class="text-center">
					<button
						onclick={handleCreateNewTheme}
						class="w-full aspect-video rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 transition-all flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-gray-500"
					>
						<div class="flex flex-col items-center text-gray-500 dark:text-gray-400">
							<Icon icon="mdi:plus" class="w-8 h-8 mb-1" />
							<span class="text-xs font-medium">Создать тему</span>
						</div>
					</button>
				</div>
			</div>
		</Section>

		{#if editingTheme}
			<Section
				title={app.themes.some((t) => t.id === editingTheme?.id)
					? `Редактирование "${editingTheme?.name}"`
					: `Создание копии "${editingTheme?.name}"`}
				description="Настройте цвета и сохраните тему."
				defaultOpen={true}
			>
				{#if editingTheme.isCustom}
					<LabeledInput label="Название темы" id="editingThemeNameInput">
						<input
							id="editingThemeNameInput"
							type="text"
							bind:value={editingTheme.name}
							class="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</LabeledInput>
				{/if}
				<div class="flex border-b border-gray-200 dark:border-gray-700 mt-4">
					<button
						onclick={() => (activeEditorTab = 'light')}
						class={`px-4 py-2 text-sm font-medium transition-colors ${
							activeEditorTab === 'light'
								? 'border-b-2 border-blue-500 text-gray-900 dark:text-white'
								: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
						}`}>Светлая</button
					>
					<button
						onclick={() => (activeEditorTab = 'dark')}
						class={`px-4 py-2 text-sm font-medium transition-colors ${
							activeEditorTab === 'dark'
								? 'border-b-2 border-blue-500 text-gray-900 dark:text-white'
								: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
						}`}>Темная</button
					>
				</div>
				<div class="pt-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-lg p-4">
					<ThemeEditor themeType={activeEditorTab} colorScheme={editingTheme.scheme} onUpdate={handleUpdateEditingThemeValue} />
				</div>
				<div class="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
					<button
						onclick={() => (editingTheme = null)}
						class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
						>Отмена</button
					>
					<button
						onclick={handleSaveTheme}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
					>
						{!app.themes.some((t) => t.id === editingTheme?.id) ? 'Сохранить копию' : 'Сохранить'}
					</button>
				</div>
			</Section>
		{/if}

		<Section title="Шаблоны карточек" description="Управление шаблонами для устройств." defaultOpen={false}>
			<div class="space-y-2 max-h-60 overflow-y-auto pr-2">
				{#each [...app.templates.values()] as template (template.id)}
					<div
						class="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md border border-gray-100 dark:border-gray-700"
					>
						<div>
							<p class="text-sm font-medium text-gray-800 dark:text-gray-200">{template.name}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								{template.deviceType}
							</p>
						</div>
						<div class="flex items-center gap-1">
							<button
								onclick={() => app.setEditingTemplate(template)}
								class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
								title="Редактировать шаблон"
							>
								<Icon icon="mdi:pencil" class="w-5 h-5" />
							</button>
							<button
								onclick={() => app.handleDeleteTemplate(template.id)}
								class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
								title="Удалить шаблон"
							>
								<Icon icon="mdi:trash-can-outline" class="w-5 h-5" />
							</button>
						</div>
					</div>
				{/each}
			</div>
			<div class="pt-2">
				<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
					<Icon icon="mdi:information-outline" class="w-4 h-4 inline mr-1" />
					Чтобы создать новый шаблон, используйте контекстное меню на карточке устройства.
				</p>
				<button
					onclick={() => (confirmingResetTemplates = true)}
					class="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 py-2.5 rounded-lg transition-colors border border-red-200 dark:border-red-900/30 mt-2"
				>
					Сбросить все шаблоны к стандартным
				</button>
			</div>
		</Section>

		<Section
			title="Резервное копирование"
			description="Сохраните все настройки в файл или восстановите их."
			defaultOpen={false}
		>
			<div class="flex flex-col sm:flex-row gap-4">
				<button class="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
					<Icon icon="mdi:download" class="w-5 h-5" />
					Экспорт настроек
				</button>
				<label
					class="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer shadow-sm"
				>
					<Icon icon="mdi:upload" class="w-5 h-5" />
					Импорт настроек
					<input type="file" accept=".zip,.json" class="hidden" />
				</label>
			</div>
			<div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
				<h4 class="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Опасная зона</h4>
				<button class="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 py-2.5 rounded-lg transition-colors border border-red-200 dark:border-red-900/30 mt-2"
				>
					Сбросить все настройки и данные
				</button>
			</div>
		</Section>

		<div class="pt-8 mt-4 text-center border-t border-gray-100 dark:border-gray-800">
			<button
				class="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors"
			>
				Сбросить настройки внешнего вида
			</button>
		</div>
	{/if}
</div>

<ConfirmDialog
	isOpen={confirmingDeleteTheme !== null}
	title="Удалить тему?"
	message={`Вы уверены, что хотите удалить тему <strong>"${confirmingDeleteTheme?.name}"</strong>?<br />Это действие нельзя отменить.`}
	onConfirm={() => {
		if (confirmingDeleteTheme) app.deleteTheme(confirmingDeleteTheme.id);
		confirmingDeleteTheme = null;
	}}
	onCancel={() => (confirmingDeleteTheme = null)}
	confirmText="Удалить"
/>

<ConfirmDialog
	isOpen={confirmingResetTemplates}
	title="Сбросить шаблоны?"
	message={`Вы уверены, что хотите сбросить все шаблоны карточек к стандартным?<br/>Все ваши пользовательские шаблоны и изменения будут утеряны.`}
	onConfirm={() => {
		app.handleResetTemplates();
		confirmingResetTemplates = false;
	}}
	onCancel={() => (confirmingResetTemplates = false)}
	confirmText="Сбросить"
/>